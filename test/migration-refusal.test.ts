/**
 * A migration slot that refuses: what the player is told, and what is left behind.
 *
 * The refusal path is the one place the mod knows for certain that a save cannot be read, and
 * `docs/spec.md` §4.4 puts two requirements on it — it must **report**, and it must not hang or
 * crash. This suite adds the third that matters just as much: it must not **corrupt**.
 *
 * "Corrupt" has a precise meaning here and it is asserted rather than assumed. The gate decides
 * before the game adopts anything and writes nothing at all, so a refused save is byte for byte
 * the save that was offered. That is what makes refusing *graceful*: the player can reinstate the
 * release that understands it, or update the mod, and the character is still there.
 *
 * ## Why the chain is extended, and the shape it is extended in
 *
 * A migration only has work when a save comes from an *older versioned* release, and this is the
 * first release with a root — so the shipped chain has nothing to walk. `WithReleasesForTesting`
 * adds past releases in the shape a real one is added, which is the honest way to reach the code
 * rather than inventing a refusing slot in production.
 *
 * **Two releases, not one, and the reason is the chain's own rule:** a save from a release runs
 * the slots *after* that release. So to exercise a slot, the save has to come from a release
 * *before* the one whose slot decides. `BootstrapRelease` is where the save comes from, and
 * `DecidingRelease` is the slot that decides — the bootstrap's own slot accepts, which is what
 * any release that carries a save forward without changing its shape does.
 */

import assert from 'node:assert/strict'
import { Map as IMMap, Set as IMSet } from 'immutable'
import { describe, it } from 'node:test'

import { Entry, Gag, ItemRegistry, SensoryLimiter, State as StateRecord, Visor } from '../src/FactionMachine/MachinePrime/Coordinator/Internal/State'
import { SetState } from '../src/FactionMachine/MachinePrime/Coordinator/Internal/StateStorage'
import { ItemArchetype } from '../src/FactionMachine/MachinePrime/Constant'
import {
    GetCurrentReleaseIndex,
    MigrationOutcome,
    RefusedOutcome,
    Release,
    RootedReleaseRecord,
    WithReleasesForTesting,
} from '../src/KDExtension/Release'
import { GetRecorder } from './harness/recorder'
import { PromptButtons, PromptText, WithFakeDocument, WithoutDocument } from './harness/fake-dom'

/**
 * The release the test saves are written by: the oldest one with a root.
 *
 * Its root is a distinct value, so a test's save cannot be mistaken for one written by this
 * build.
 */
const BootstrapRelease: RootedReleaseRecord = {
    Version: '0.4.8',
    Root: '3f0fdd62-dbc6-4089-b31d-843e79fb8381',
}

/**
 * The release whose slot decides: the one between the bootstrap and this build.
 *
 * A save from {@link BootstrapRelease} runs this slot, which is what makes a refusing case
 * reachable at all.
 */
const DecidingRelease: RootedReleaseRecord = {
    Version: '0.4.9',
    Root: '74668098-8709-4c77-82be-5fe53d109d54',
}

/** The bootstrap's own slot, which carries a save forward without changing its shape. */
const Accepting = (): MigrationOutcome => ({ kind: 'accept' })

/** The prompt id the migration refusal renders under; a copy, so a rename fails loudly. */
const RefusedPromptId = 'migration-refused'

/** A state worth telling apart from a default one, so "nothing was loaded" is observable. */
const MarkerState = () =>
    StateRecord({
        ActivePC: Entry({
            ID: 'existing-character',
            Items: ItemRegistry({
                [ItemArchetype.Blinder]: Visor({ TargetStrength: 1, RegisteredItems: IMSet(['visor']) }),
                [ItemArchetype.Deafener]: SensoryLimiter({ TargetStrength: 1, RegisteredItems: IMSet(['phones']) }),
                [ItemArchetype.Gag]: Gag({ TargetStrength: 1, RegisteredItems: IMSet(['gag']) }),
            }),
        }),
        ActiveNPC: IMMap(),
    })

/** The loader the game would call, read through the global the mod installed. */
const LoadGame = (save: string): boolean =>
    (globalThis as unknown as { KinkyDungeonLoadGame: (_: string, __?: boolean) => boolean }).KinkyDungeonLoadGame(save)

/** The game's menu state, which the "return to main menu" answer is allowed to touch. */
const GameState = (): string =>
    (globalThis as unknown as { KinkyDungeonState?: string }).KinkyDungeonState as string

const SetGameState = (state: string) => {
    ;(globalThis as unknown as { KinkyDungeonState?: string }).KinkyDungeonState = state
}

const GameData = (): Record<string, unknown> =>
    (globalThis as unknown as { KDGameData: Record<string, unknown> }).KDGameData

/** A save written by the bootstrap release, in the shape the game writes one. */
const SaveFromBootstrap = (): string =>
    JSON.stringify({
        KDGameData: {
            BoidsRootUUID: BootstrapRelease.Root,
            character: 'kept',
        },
    })

const ARefusal = (reason: string, ReturnToMenu: boolean): RefusedOutcome => ({ kind: 'refuse', reason, ReturnToMenu })

/**
 * Runs `body` with the two test releases installed and a fake document up.
 *
 * The installation is per-case rather than per-suite because it edits the shared `ReleaseTable`
 * and `MigrationChain`: that is what makes it a seam rather than a mock, and it is why the cases
 * below are serialised.
 */
const WithTestReleases = <T>(Decide: () => MigrationOutcome, body: () => T): T =>
    WithReleasesForTesting([BootstrapRelease, DecidingRelease], [Accepting, Decide], body)

/**
 * This suite's cases **must not run concurrently**.
 *
 * `WithReleasesForTesting` edits the shared `ReleaseTable` and `MigrationChain`, and every case
 * shares the global `document`, the recorder and `KDGameData`. Node runs a suite's sibling cases
 * concurrently by default, and the symptom of that race is genuinely misleading — a case sees a
 * prompt whose document another case tore down, so a refusal appears to have loaded.
 */
const describeSerial = { concurrency: 1 } as const

describe('migration refusals', describeSerial, () => {
    it('reports the slot\'s reason and offers the way out, and loads nothing', () => {
        SetState(MarkerState())
        const recorder = GetRecorder()
        const loadsBefore = recorder.loads.length
        const savesBefore = recorder.saveGenerations
        const gameDataBefore = JSON.stringify(GameData())

        const reason = 'The belt shape changed in a way this build cannot read.'
        const { document, result } = WithFakeDocument(() =>
            WithTestReleases(() => ARefusal(reason, true), () => LoadGame(SaveFromBootstrap()))
        )

        assert.equal(result, false, 'a refused save must not load')
        assert.equal(recorder.loads.length, loadsBefore, 'a refused save reached the game')
        assert.equal(recorder.saveGenerations, savesBefore, 'a refused save reached the save path')
        assert.equal(JSON.stringify(GameData()), gameDataBefore, 'a refusal wrote to the game data')

        assert.match(PromptText(document, RefusedPromptId), new RegExp(reason.replace('.', '\\.')))
        assert.deepEqual(
            Object.keys(PromptButtons(document, RefusedPromptId)),
            ['Stay here', 'Return to main menu']
        )
    })

    it('returns to the main menu, and the save is left exactly as it was', () => {
        // The whole of the graceful exit. "Untouched" is asserted on both halves: the game data
        // was not adopted, and nothing was written — so a release that understands the save can
        // still read it afterwards.
        SetState(MarkerState())
        const recorder = GetRecorder()
        const gameDataBefore = JSON.stringify(GameData())
        const savesBefore = recorder.saveGenerations
        const loadsBefore = recorder.loads.length

        SetGameState('LoadSlots')
        const { document } = WithFakeDocument(() =>
            WithTestReleases(() => ARefusal('The old shape cannot be read.', true), () => LoadGame(SaveFromBootstrap()))
        )

        PromptButtons(document, RefusedPromptId)['Return to main menu'].handlers[0]()

        assert.equal(GameState(), 'Menu', 'the escape did not reach the game\'s own menu state')
        assert.equal(JSON.stringify(GameData()), gameDataBefore, 'the refused save was adopted after all')
        assert.equal(recorder.saveGenerations, savesBefore, 'a refused load reached the save path')
        assert.equal(recorder.loads.length, loadsBefore, 'a refused load reached the game')
    })

    it('leaves the player in the load menu when the slot did not ask to leave', () => {
        // A refusal about *this* save among others: staying lets the player choose a different
        // one, so the affirmative button must not throw them out of the menu.
        SetState(MarkerState())
        SetGameState('LoadSlots')

        const { document } = WithFakeDocument(() =>
            WithTestReleases(() => ARefusal('This slot is corrupt.', false), () => LoadGame(SaveFromBootstrap()))
        )

        PromptButtons(document, RefusedPromptId)['Return to main menu'].handlers[0]()
        assert.equal(GameState(), 'LoadSlots', 'a save-specific refusal threw the player out of the menu')
    })

    it('reports a refusal on the status line when there is no prompt to show', () => {
        // A refusal the player is never told about is indistinguishable from a bug, so the status
        // line is the fallback whenever the dialog cannot be shown.
        SetState(MarkerState())
        const recorder = GetRecorder()
        recorder.sentTextMessages.length = 0

        const reason = 'The old shape cannot be read.'
        const result = WithoutDocument(() =>
            WithTestReleases(() => ARefusal(reason, true), () => LoadGame(SaveFromBootstrap()))
        )

        assert.equal(result, false)
        const messages = recorder.sentTextMessages
            .map(message => String((message as { text?: unknown }).text))
            .join('\n')
        assert.match(messages, /cannot be loaded by this release/)
        assert.match(messages, /The old shape cannot be read\./)
    })

    it('defers an accepted slot\'s work to the load, not to the gate', () => {
        // The split the contract rests on: a slot's *decision* is made in the gate, and its *work*
        // runs once the game has adopted the save — because the work edits the live `KDGameData`,
        // which the gate does not own at decision time.
        SetState(MarkerState())
        const applyCalls: unknown[] = []

        const { result } = WithFakeDocument(() =>
            WithTestReleases(() => ({
                kind: 'accept-and-apply',
                apply: gameData => {
                    applyCalls.push(gameData)
                    ;(gameData as Record<string, unknown>)['migrated-by'] = 'test'
                },
            }), () => LoadGame(SaveFromBootstrap()))
        )

        assert.equal(result, true, 'an accepted save should reach the game')
        assert.equal(applyCalls.length, 1, 'the slot\'s work should have run exactly once')
        assert.equal(applyCalls[0], GameData(), 'the work should receive the live game data')
        assert.equal(GameData()['migrated-by'], 'test')
    })

    it('does not run a refused migration\'s own work', () => {
        // A refusal stops the walk. The case above proves the work runs when it is accepted; this
        // pins that a slot which refuses cannot leave work behind for `afterLoadGame`.
        SetState(MarkerState())
        const recorder = GetRecorder()
        const gameDataBefore = JSON.stringify(GameData())
        const afterLoadBefore = recorder.sentEvents.filter(event => event.Event === 'afterLoadGame').length

        const { result } = WithFakeDocument(() =>
            WithTestReleases(() => ARefusal('Refused, so nothing else may run.', true), () =>
                LoadGame(SaveFromBootstrap()))
        )

        assert.equal(result, false)
        assert.equal(JSON.stringify(GameData()), gameDataBefore)
        assert.equal(
            recorder.sentEvents.filter(event => event.Event === 'afterLoadGame').length,
            afterLoadBefore,
            'a refused load must not dispatch the after-load handlers'
        )
    })

    it('is refused the same way for an unknown root, because updating is the way to read it', () => {
        // An unknown root is a *newer* release's save: a refusal of this build rather than of the
        // save. It takes the same path, and returning to the menu is the same honest answer, since
        // trying again cannot help.
        SetState(MarkerState())
        const recorder = GetRecorder()
        const loadsBefore = recorder.loads.length

        const { document, result } = WithFakeDocument(() => LoadGame(JSON.stringify({
            KDGameData: { BoidsRootUUID: '11111111-1111-4111-8111-111111111111' },
        })))

        assert.equal(result, false)
        assert.equal(recorder.loads.length, loadsBefore)
        assert.match(PromptText(document, RefusedPromptId), /newer release/)

        SetGameState('LoadSlots')
        PromptButtons(document, RefusedPromptId)['Return to main menu'].handlers[0]()
        assert.equal(GameState(), 'Menu')
    })

    it('is not the same finding as the current release, and the table keeps them apart', () => {
        // The distinction the gate rests on: a known root is localised to a release and an unknown
        // one is not, so two rows must never claim one root.
        const roots = [BootstrapRelease.Root, DecidingRelease.Root, Release.Root]
        assert.deepEqual(roots, [...new Set(roots)], 'two releases claim the same root')
        assert.equal(GetCurrentReleaseIndex(), 1, 'the shipped table is the pre-versioning release and this one')
    })
})
