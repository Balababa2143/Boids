/**
 * The coordinator's save round-trip through `KinkyDungeonGenerateSaveData()`
 * and `KinkyDungeonLoadGame`, serialised the way the game serialises it.
 */

import assert from 'node:assert/strict'
import fc from 'fast-check'
import { describe, it } from 'node:test'

import { GetState, SetState } from '../src/FactionMachine/MachinePrime/Coordinator/Internal/StateStorage'
import { RootUuidKey, Release } from '../src/KDExtension/Release'
import { ArbitraryIntentState, MarkerState } from './harness/dossier'
import { GetRecorder } from './harness/recorder'
import { ResetGameData } from './harness/kd-globals'

/**
 * The state out of the game's save path: generate, then serialise the way the game's saver does.
 */
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
            fc.property(ArbitraryIntentState, state => {
                SetState(state)

                const save = Save(GenerateSave())
                assert.equal(LoadGame(save), true, 'the game\'s loader refused a save it wrote')

                assert.ok(
                    GetState().equals(state),
                    `round-trip changed the state for id=${state.ActivePC.ID}: ` +
                    `${JSON.stringify(GetState().ActivePC.Control.toJS())} came back instead of ` +
                    `${JSON.stringify(state.ActivePC.Control.toJS())}`
                )
            })
        )
    })

    it('writes the state where the save actually carries it', () => {
        // The write must land on `KDGameData`, not on the defaults literal a save never carries.
        const state = MarkerState('written-where')
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
        // A save without the root is read as pre-versioning, silently and looking like a feature.
        SetState(MarkerState('root-stamped'))

        const first = JSON.parse(GenerateSave()) as { KDGameData: Record<string, unknown> }
        assert.equal(first.KDGameData[RootUuidKey], Release.Root, 'the first save carries no root')

        const second = JSON.parse(GenerateSave()) as { KDGameData: Record<string, unknown> }
        assert.equal(second.KDGameData[RootUuidKey], Release.Root, 'the second save carries no root')
    })

    it('leaves the live state alone when a save carries none', () => {
        // The `null !=` guard: a save with no coordinator state keeps the live
        // one rather than installing a default. `ResetGameData` makes the case
        // mean what it says, because the harness is one long-lived process.
        const state = MarkerState('kept')
        SetState(state)
        ResetGameData()

        const save = Save(JSON.stringify({ KDGameData: { [RootUuidKey]: Release.Root } }))
        assert.equal(LoadGame(save), true)
        assert.ok(GetState().equals(state), 'a save with no coordinator state clobbered the live one')
    })

    it('does not reach the game\'s save generator through a stale reference', () => {
        // The wrapper must call through to the function it
        // captured; a stale reference would stop `saveGenerations`.
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
