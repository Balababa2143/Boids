/**
 * The coordinator's save round-trip, through the game's own two seams.
 *
 * Issue **#48** was that the coordinator wrote its state to `KDGameDataBase` and read it
 * back from `KDGameData` — separate objects in the base game (`base/KinkyDungeon.ts:595`
 * vs `:893`), so the round-trip never closed. The tests here close it explicitly:
 *
 *   `SetState` → `KinkyDungeonGenerateSaveData()` → serialise → serialise again
 *             → `KinkyDungeonLoadGame(...)` → `GetState()`
 *
 * **Why \"serialise again\" is load-bearing.** The game reaches its save file through
 * `JSON.parse(JSON.stringify(KinkyDungeonGenerateSaveData()))`
 * (`base/KinkyDungeon.ts:7325-7327`). A round-trip in memory would pass even if the write
 * landed somewhere only the same object could see — which is exactly the bug being tested
 * for. So the wrapper is exercised through `GenerateSave`, and the load is handed a
 * genuine string, decoded by the harness the way the game decodes one.
 *
 * The module graph is already evaluated by the time any test file runs
 * (`test/setup/install.ts` installs the globals first), so the wrappers are in place and
 * these tests drive them rather than re-importing them.
 */

import assert from 'node:assert/strict'
import fc from 'fast-check'
import { Map as IMMap, Set as IMSet } from 'immutable'
import { describe, it } from 'node:test'

import { Entry, Gag, ItemRegistry, SensoryLimiter, State as StateRecord, Visor } from '../src/FactionMachine/MachinePrime/Coordinator/Internal/State'
import { GetState, SetState } from '../src/FactionMachine/MachinePrime/Coordinator/Internal/StateStorage'
import { ItemArchetype } from '../src/FactionMachine/MachinePrime/Constant'
import { RootUuidKey, Release } from '../src/KDExtension/Release'
import { GetRecorder } from './harness/recorder'
import { ResetGameData } from './harness/kd-globals'

const StrengthArbitrary = fc.float({ min: 0, max: 1, noNaN: true })

const NamesArbitrary = fc.array(fc.string({ minLength: 1, maxLength: 8 }), { maxLength: 3 })

/** A coordinator state with every slot given arbitrary but valid contents. */
const ArbitraryState = (id: string, strength: number, names: readonly string[]) =>
    StateRecord({
        ActivePC: Entry({
            ID: id,
            Items: ItemRegistry({
                [ItemArchetype.Blinder]: Visor({ TargetStrength: strength, RegisteredItems: IMSet(names) }),
                [ItemArchetype.Deafener]: SensoryLimiter({ TargetStrength: strength, RegisteredItems: IMSet(names) }),
                [ItemArchetype.Gag]: Gag({ TargetStrength: strength, RegisteredItems: IMSet(names) }),
            }),
        }),
        ActiveNPC: IMMap(),
    })

/** The state out of the game's save path: generate, then serialise the way the game's saver does. */
const GenerateSave = (): string => {
    const save = (globalThis as unknown as {
        KinkyDungeonGenerateSaveData: () => unknown
    }).KinkyDungeonGenerateSaveData()
    return JSON.stringify(save)
}

/** Hand a save string to the loader, exactly as the game's saver produced it. */
const LoadGame = (save: string): boolean =>
    (globalThis as unknown as {
        KinkyDungeonLoadGame: (_: string, __?: boolean) => boolean
    }).KinkyDungeonLoadGame(save)

/** A save string as the harness's decode stub expects it: ordinary JSON, unencoded. */
const Save = (saveAsJson: string): string => saveAsJson

describe('coordinator save round-trip', () => {
    it('carries an arbitrary state through the game\'s save and load unchanged', () => {
        fc.assert(
            fc.property(
                fc.string({ minLength: 1 }),
                StrengthArbitrary,
                NamesArbitrary,
                (id, strength, names) => {
                    const state = ArbitraryState(id, strength, names)
                    SetState(state)

                    const save = Save(GenerateSave())
                    assert.equal(LoadGame(save), true, 'the game\'s loader refused a save it wrote')

                    assert.ok(
                        GetState().equals(state),
                        `round-trip changed the state for id=${id} strength=${strength} names=${names.length}`
                    )
                }
            )
        )
    })

    it('writes the state where the save actually carries it', () => {
        // The specific defect, asserted directly: the write has to land on `KDGameData`,
        // which is what `KinkyDungeonGenerateSaveData` serialises, and *not* on the
        // defaults literal, which a save never carries.
        const state = ArbitraryState('written-where', 0.25, ['a'])
        SetState(state)

        const serialised = GenerateSave()
        const parsed = JSON.parse(serialised) as { KDGameData?: Record<string, unknown> }

        assert.equal(parsed.KDGameData?.[RootUuidKey], Release.Root, 'the save carries no release root')
        assert.deepEqual(
            parsed.KDGameData?.['68C84945-3A9A-4024-8CC6-E3CE092E9154'],
            state.toJS(),
            'the coordinator state is not on the object the game saves'
        )
    })

    it('stamps the release root on every save, not only the first', () => {
        // The root is what localises the release for the gate, so a save that lost it would
        // be read as a pre-versioning character. Worst possible failure mode, because it is
        // silent and looks like a feature.
        SetState(ArbitraryState('root-stamped', 0, []))

        const first = JSON.parse(GenerateSave()) as { KDGameData: Record<string, unknown> }
        assert.equal(first.KDGameData[RootUuidKey], Release.Root, 'the first save carries no root')

        const second = JSON.parse(GenerateSave()) as { KDGameData: Record<string, unknown> }
        assert.equal(second.KDGameData[RootUuidKey], Release.Root, 'the second save carries no root')
    })

    it('leaves the live state alone when a save carries none', () => {
        // The `null !=` guard on the load path. A save with no coordinator state means a character
        // that never had any, and the mod's answer is to keep what it has rather than to install a
        // default over it.
        //
        // The save carries the release root so it takes the *accepted* path. Without one it would
        // be an unversioned save and the gate would ask before loading at all — a different
        // behaviour, tested in `save-version.test.ts`.
        //
        // `ResetGameData` is what makes the case mean what it says: the guard reads whatever is
        // already on `KDGameData`, and the harness is one long-lived process, so an earlier test's
        // load would otherwise still be sitting there.
        const state = ArbitraryState('kept', 0.5, ['kept'])
        SetState(state)
        ResetGameData()

        const save = Save(JSON.stringify({ KDGameData: { [RootUuidKey]: Release.Root } }))
        assert.equal(LoadGame(save), true)
        assert.ok(GetState().equals(state), 'a save with no coordinator state clobbered the live one')
    })

    it('does not reach the game\'s save generator through a stale reference', () => {
        // The wrapper calls through to the function it captured at module evaluation. If it
        // ever stopped, `saveGenerations` would stop moving and the save would be empty —
        // the same class of bug as #48, one indirection further out.
        const recorder = GetRecorder()
        const before = recorder.saveGenerations
        GenerateSave()
        assert.equal(recorder.saveGenerations, before + 1)
    })

    it('records the save it decoded, so the gate is observed reading the real thing', () => {
        const recorder = GetRecorder()
        recorder.decompressions.length = 0
        LoadGame(Save(GenerateSave()))
        assert.ok(recorder.decompressions.length > 0, 'the load gate never decoded the save')
    })
})
