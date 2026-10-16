/**
 * The load gate: whether a save may be read, and what a refusal leaves behind.
 *
 * Every case here drives the module's **real** wrapped loader
 * (`globalThis.KinkyDungeonLoadGame`, installed when the module graph was evaluated),
 * against saves built the way the game builds them. Two consequences are deliberate:
 *
 *  - the harness's `KinkyDungeonLoadGame` is the captured original, so a test can tell that
 *    an accepted save reached the game and a refused one did not;
 *  - the prompt's buttons are the elements the mod actually created, pressed through
 *    `test/harness/fake-dom.ts`. A test that called the callback directly would pass even if
 *    the prompt never rendered a button.
 *
 * The migration chain's own refusals are covered in `migration-refusal.test.ts`, and the
 * prompts' wording in `save-prompts.test.ts`; this file is about which branch a save takes.
 */

import assert from 'node:assert/strict'
import { Map as IMMap, Set as IMSet } from 'immutable'
import { describe, it } from 'node:test'

import { Entry, Gag, ItemRegistry, SensoryLimiter, State as StateRecord, Visor } from '../src/Boids/MachinePrime/Coordinator/Internal/State'
import { GetState, SetState } from '../src/Boids/MachinePrime/Coordinator/Internal/StateStorage'
import { ItemArchetype } from '../src/Boids/MachinePrime/Constant'
import { Release, RootUuidKey } from '../src/KDExtension/Release'
import { GetRecorder } from './harness/recorder'
import { PromptButtons, WithFakeDocument } from './harness/fake-dom'

//#region Driving the gate

/** The id the unversioned-save prompt renders under; a copy, so a rename fails loudly. */
const UnversionedPromptId = 'unversioned-save'

/** A save string as the harness's decode stub expects it: ordinary JSON, unencoded. */
const Save = (gameData: Record<string, unknown>): string =>
    JSON.stringify({ KDGameData: gameData })

/** The loader the game would call, read through the global the mod installed. */
const LoadGame = (save: string): boolean =>
    (globalThis as unknown as { KinkyDungeonLoadGame: (_: string, __?: boolean) => boolean }).KinkyDungeonLoadGame(save)

/** The recorded status-line messages, which is where a decision is acknowledged. */
const Messages = () =>
    GetRecorder().sentTextMessages.map(message => String((message as { text?: unknown }).text)).join('\n')

/**
 * The cases below drive one loader and one recorder, so they run one at a time.
 *
 * Node's test runner runs a suite's sibling cases concurrently by default, and these have always
 * shared `KDGameData`, the recorder and the gate's pending-load state. Serialising them is the
 * honest expression of that: they were never independent, and a race between them would look like
 * a flaky gate rather than a flaky test.
 */
const describeSerial = { concurrency: 1 } as const

/** A coordinator state worth telling apart from a default one: one registered item per slot. */
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

//#endregion

describe('the load gate: a save from this release', describeSerial, () => {
    it('loads it, and reaches the game\'s own loader', () => {
        SetState(MarkerState())
        const recorder = GetRecorder()
        const before = recorder.loads.length

        const save = Save({ [RootUuidKey]: Release.Root, someGameState: 1 })
        assert.equal(LoadGame(save), true)
        assert.equal(recorder.loads.length, before + 1, 'an accepted save did not reach the game')
    })

    it('installs exactly one wrapper, so an accepted save is not loaded twice', () => {
        // The gate replaces a global, and the one way that goes wrong is a wrapper capturing
        // itself: every accepted save would recurse, or load twice. The module evaluates once,
        // so one accepted save must reach the game exactly once.
        SetState(MarkerState())
        const recorder = GetRecorder()
        const before = recorder.loads.length

        assert.equal(LoadGame(Save({ [RootUuidKey]: Release.Root })), true)
        assert.equal(recorder.loads.length, before + 1, 'one load reached the game more than once')
    })

    it('hands an unreadable save to the game rather than judging it', () => {
        // The gate has nothing to read, so it has nothing to refuse: the game reports its own
        // unloadable save, and a second message from the mod would only add noise.
        assert.equal(LoadGame('not-a-save'), false, 'the harness original refuses a save with no KDGameData')
    })
})

describe('the load gate: a save from before versioning', describeSerial, () => {
    it('refuses the first attempt and shows a warning with two choices', () => {
        SetState(MarkerState())
        const recorder = GetRecorder()
        const before = recorder.loads.length

        const { document, result } = WithFakeDocument(() => LoadGame(Save({ someGameState: 1 })))

        assert.equal(result, false, 'an unversioned save must not load unconfirmed')
        assert.equal(recorder.loads.length, before, 'the save reached the game before confirmation')
        assert.deepEqual(Object.keys(PromptButtons(document, UnversionedPromptId)), ['Cancel', 'Load anyway'])
    })

    it('loads it once the player chooses "Load anyway", and resets the coordinator', () => {
        // The one thing the acceptance promises: the character survives and the mod's record
        // of it does not. The registry is the observable half of that.
        SetState(MarkerState())
        const recorder = GetRecorder()
        const loadsBefore = recorder.loads.length

        // The string is held, not rebuilt: the approval is keyed on what the gate was handed,
        // so re-stringifying a copy would be a different save and would prompt again.
        const save = Save({ someGameState: 1 })
        const { document } = WithFakeDocument(() => LoadGame(save))

        // The retry re-enters the game's own load button, which the game redraws every frame.
        let retries = 0
        ;(globalThis as unknown as { KDButtonsCache: Record<string, unknown> }).KDButtonsCache = {
            KDLoadGame: {
                name: 'KDLoadGame',
                func: () => {
                    retries++
                    LoadGame(save)
                    return true
                },
            },
        }

        PromptButtons(document, UnversionedPromptId)['Load anyway'].handlers[0]()

        assert.equal(retries, 1, 'the retry did not go through the game\'s own load button')
        assert.equal(
            recorder.loads.length,
            loadsBefore + 1,
            'the accepted legacy save did not reach the game exactly once'
        )
        assert.deepEqual(
            [...GetState().ActivePC.Items[ItemArchetype.Blinder].RegisteredItems],
            [],
            'the accepted legacy save kept a dossier it cannot read'
        )
        assert.match(Messages(), /loaded as though it had never/)
    })

    it('loads nothing when the player cancels', () => {
        SetState(MarkerState())
        const recorder = GetRecorder()
        const loadsBefore = recorder.loads.length

        const { document } = WithFakeDocument(() => LoadGame(Save({ someGameState: 1 })))
        PromptButtons(document, UnversionedPromptId)['Cancel'].handlers[0]()

        assert.equal(recorder.loads.length, loadsBefore, 'a cancelled prompt still loaded the save')
        assert.match(Messages(), /left unloaded/)
    })

    it('does not let an approval for one save load a different one', () => {
        // The anti-bleed rule, and the reason the approval names a save instead of being a
        // flag: in a save list, confirming one character and then clicking another must
        // prompt again rather than silently load the second.
        SetState(MarkerState())

        const first = WithFakeDocument(() => LoadGame(Save({ someGameState: 'A' })))
        PromptButtons(first.document, UnversionedPromptId)['Load anyway'].handlers[0]()

        // A different save arrives — a different paste-code, or another slot's text.
        const other = WithFakeDocument(() => LoadGame(Save({ someGameState: 'B' })))
        assert.equal(other.result, false, 'an approval for one save loaded a different one')

        const prompt = PromptButtons(other.document, UnversionedPromptId)
        assert.notEqual(prompt['Load anyway'], undefined)

        // And the second question's own cancel forgets it, so nothing is left approved.
        prompt['Cancel'].handlers[0]()
        const third = WithFakeDocument(() => LoadGame(Save({ someGameState: 'B' })))
        assert.equal(third.result, false, 'a cancelled approval was still honoured')
        PromptButtons(third.document, UnversionedPromptId)['Cancel'].handlers[0]()
    })

    it('declines rather than guessing when there is no prompt to ask in', () => {
        // The gate's `false` means "the player was not asked", and it must not mean "the player
        // was asked and said nothing". With no document there is no question, so the load is
        // discarded and the status line says why.
        SetState(MarkerState())
        const recorder = GetRecorder()
        const loadsBefore = recorder.loads.length
        recorder.sentTextMessages.length = 0

        const globals = globalThis as unknown as { document?: unknown }
        const previous = globals.document
        delete globals.document
        try {
            assert.equal(LoadGame(Save({ someGameState: 1 })), false)
        }
        finally {
            globals.document = previous
        }

        assert.equal(recorder.loads.length, loadsBefore)
        assert.match(Messages(), /left unloaded/)
    })
})
