/**
 * The load gate: which branch a save takes, and what a refusal leaves behind.
 * The cases drive the real wrapped loader and press the buttons the mod created.
 */

import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { GetState, SetState } from '../src/FactionMachine/MachinePrime/Coordinator/Internal/StateStorage'
import { Release, RootUuidKey } from '../src/KDExtension/Release'
import { MarkerState } from './harness/dossier'
import { GetRecorder } from './harness/recorder'
import { PromptButtons, WithFakeDocument } from './harness/fake-dom'

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
 * They share `KDGameData` and the gate's pending-load state; serialising makes the race explicit.
 */
const describeSerial = { concurrency: 1 } as const

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
        // A wrapper that captured itself would load an accepted save twice.
        SetState(MarkerState())
        const recorder = GetRecorder()
        const before = recorder.loads.length

        assert.equal(LoadGame(Save({ [RootUuidKey]: Release.Root })), true)
        assert.equal(recorder.loads.length, before + 1, 'one load reached the game more than once')
    })

    it('hands an unreadable save to the game rather than judging it', () => {
        // Nothing to read means nothing to refuse; the game reports its own unloadable save.
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
        // The character survives and the mod's record of it does not.
        SetState(MarkerState())
        const recorder = GetRecorder()
        const loadsBefore = recorder.loads.length

        // Held, not rebuilt: the approval is keyed on the exact string the gate was handed.
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
            GetState().ActivePC.Control.intent.toJS(),
            {},
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
        // An approval names a save rather than being a flag, so confirming one cannot load another.
        SetState(MarkerState())

        const first = WithFakeDocument(() => LoadGame(Save({ someGameState: 'A' })))
        PromptButtons(first.document, UnversionedPromptId)['Load anyway'].handlers[0]()

        const other = WithFakeDocument(() => LoadGame(Save({ someGameState: 'B' })))
        assert.equal(other.result, false, 'an approval for one save loaded a different one')

        const prompt = PromptButtons(other.document, UnversionedPromptId)
        assert.notEqual(prompt['Load anyway'], undefined)

        prompt['Cancel'].handlers[0]()
        const third = WithFakeDocument(() => LoadGame(Save({ someGameState: 'B' })))
        assert.equal(third.result, false, 'a cancelled approval was still honoured')
        PromptButtons(third.document, UnversionedPromptId)['Cancel'].handlers[0]()
    })

    it('declines rather than guessing when there is no prompt to ask in', () => {
        // `false` means the player was not asked, not that the player was asked and said nothing.
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
