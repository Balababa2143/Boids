/**
 * The two save prompts' wording and choices, separately from the load gate: the labels, the
 * two answers, and that every string is registered rather than falling through to its key.
 */

import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { ShowPrompt } from '../src/Common/CommonUI/Prompt'
import { MigrationRefusedPrompt, QuietRefusal, UnversionedSavePrompt } from '../src/FactionMachine/MachinePrime/Coordinator/Internal/SavePrompts'
import { PromptButtons, PromptText, WithFakeDocument } from './harness/fake-dom'

/** The ids the save prompts render under; copies, so renaming one fails loudly here. */
const UnversionedId = 'unversioned-save'
const RefusedId = 'migration-refused'

describe('the unversioned save prompt', () => {
    it('offers exactly two answers, and names them', () => {
        const { document } = WithFakeDocument(() => ShowPrompt(UnversionedSavePrompt(() => void 0, () => void 0)))
        assert.deepEqual(Object.keys(PromptButtons(document, UnversionedId)), ['Cancel', 'Load anyway'])
    })

    it('says what loading anyway will do', () => {
        const { document } = WithFakeDocument(() => ShowPrompt(UnversionedSavePrompt(() => void 0, () => void 0)))
        const text = PromptText(document, UnversionedId)
        assert.match(text, /cannot determine mod version/)
        assert.match(text, /initialization as if no version/)
    })

    it('calls the answer that was pressed, and only that one', () => {
        const pressed: string[] = []
        const { document } = WithFakeDocument(() => ShowPrompt(UnversionedSavePrompt(
            () => pressed.push('load'),
            () => pressed.push('cancel')
        )))

        PromptButtons(document, UnversionedId)['Load anyway'].handlers[0]()
        assert.deepEqual(pressed, ['load'])
    })
})

describe('the refused migration prompt', () => {
    const LeavingRefusal = { ...QuietRefusal('The old belt shape cannot be read.'), ReturnToMenu: true }

    it('repeats the slot\'s own reason verbatim', () => {
        // The reason is the one part of the message the mod
        // did not author, so it reaches the player unmerged.
        const { document } = WithFakeDocument(() => ShowPrompt(MigrationRefusedPrompt(
            LeavingRefusal,
            () => void 0,
            () => void 0
        )))
        assert.match(PromptText(document, RefusedId), /The old belt shape cannot be read\./)
    })

    it('says the save has not been touched, because that is the promise being kept', () => {
        const { document } = WithFakeDocument(() => ShowPrompt(MigrationRefusedPrompt(
            LeavingRefusal,
            () => void 0,
            () => void 0
        )))
        assert.match(PromptText(document, RefusedId), /has not been loaded and has not been modified/)
    })

    it('offers returning to the menu as the way out', () => {
        const { document } = WithFakeDocument(() => ShowPrompt(MigrationRefusedPrompt(
            LeavingRefusal,
            () => void 0,
            () => void 0
        )))
        assert.deepEqual(Object.keys(PromptButtons(document, RefusedId)), ['Stay here', 'Return to main menu'])
    })

    it('returns to the menu when the slot asked for it', () => {        const actions: string[] = []
        const { document } = WithFakeDocument(() => ShowPrompt(MigrationRefusedPrompt(
            LeavingRefusal,
            () => actions.push('menu'),
            () => actions.push('stay')
        )))

        PromptButtons(document, RefusedId)['Return to main menu'].handlers[0]()
        assert.deepEqual(actions, ['menu'])
    })

    it('stays put when the slot did not ask to leave', () => {
        // A refusal about this save among others: staying lets the player pick a different one.
        const actions: string[] = []
        const { document } = WithFakeDocument(() => ShowPrompt(MigrationRefusedPrompt(
            QuietRefusal('This slot is corrupt.'),
            () => actions.push('menu'),
            () => actions.push('stay')
        )))

        PromptButtons(document, RefusedId)['Return to main menu'].handlers[0]()
        assert.deepEqual(actions, ['stay'])
    })
})
