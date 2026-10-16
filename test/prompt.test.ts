/**
 * The reusable dialog's own contract.
 *
 * `docs/spec.md` §4.4 requires that a refusal "returns cleanly with a message" and never
 * throws, and the load gate relies on the dialog to keep that promise: it is called from
 * inside `KinkyDungeonLoadGame`, where an exception lands in the game's own crash-report
 * path. So the two ways the dialog can fail — no document, and a prompt of this kind already
 * up — are contract, not incident, and both are asserted here.
 *
 * The rendering properties a *reader* depends on are asserted too: the buttons are the
 * caller's, the affirmative one is last, and the callbacks fire in the order the player
 * pressed them.
 */

import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { IsPromptShowing, ShowPrompt, type PromptSpec } from '../src/Common/CommonUI/Prompt'
import { PromptButtons, PromptText, WithoutDocument, WithFakeDocument } from './harness/fake-dom'

const PromptId = 'test-prompt'

const MakeSpec = (onPressed: (label: string) => void): PromptSpec => ({
    Id: PromptId,
    Title: 'A title',
    Body: ['First paragraph', 'Second paragraph'],
    Buttons: [
        { Label: 'Cancel', OnPress: () => onPressed('cancel') },
        { Label: 'Act', Emphasised: true, OnPress: () => onPressed('act') },
    ],
})

describe('the reusable prompt', () => {
    it('reports that nothing was asked when there is no document', () => {
        const shown = WithoutDocument(() => ShowPrompt(MakeSpec(() => void 0)))
        assert.equal(shown, false, 'a dialog with nowhere to draw must say so, not pretend it asked')
    })

    it('shows the caller\'s title, paragraphs and labels, in that order', () => {
        const { document, result } = WithFakeDocument(() => ShowPrompt(MakeSpec(() => void 0)))
        assert.equal(result, true)

        const text = PromptText(document, PromptId)
        const titleAt = text.indexOf('A title')
        const firstAt = text.indexOf('First paragraph')
        const secondAt = text.indexOf('Second paragraph')
        const cancelAt = text.indexOf('Cancel')

        assert.ok(titleAt >= 0, 'the title is missing')
        assert.ok(firstAt > titleAt, 'the first paragraph is not below the title')
        assert.ok(secondAt > firstAt, 'the paragraphs are not in the order they were given')
        assert.ok(cancelAt > secondAt, 'the buttons are not below the body')
    })

    it('draws the affirmative button last, so a stray click lands on the harmless choice', () => {
        const { document } = WithFakeDocument(() => ShowPrompt(MakeSpec(() => void 0)))
        const buttons = PromptButtons(document, PromptId)
        // The object preserves insertion order, and insertion follows document order.
        assert.deepEqual(Object.keys(buttons), ['Cancel', 'Act'])
        assert.equal(document.all.filter(element => element.tagName === 'button').length, 2)
    })

    it('fires the pressed button\'s callback, after removing itself', () => {
        const pressed: string[] = []
        const { document } = WithFakeDocument(() => ShowPrompt(MakeSpec(label => {
            // The prompt must be gone by the time the action runs: an action that moves the
            // game elsewhere must not leave an overlay covering where it is moving to.
            assert.equal(IsPromptShowing(PromptId), false, 'the prompt was still up when its action ran')
            pressed.push(label)
        })))

        PromptButtons(document, PromptId)['Act'].handlers[0]()
        assert.deepEqual(pressed, ['act'])
        assert.equal(IsPromptShowing(PromptId), false)
    })

    it('does not fire the callback of a button that was not pressed', () => {
        const pressed: string[] = []
        const { document } = WithFakeDocument(() => ShowPrompt(MakeSpec(label => pressed.push(label))))
        PromptButtons(document, PromptId)['Cancel'].handlers[0]()
        assert.deepEqual(pressed, ['cancel'])
    })

    it('does not stack a second prompt of the same kind', () => {
        // The game keeps drawing and keeps processing its own buttons while a prompt is up,
        // so the player can legitimately ask twice. Two prompts would present one decision as
        // two, and the second one's callbacks would be the live ones.
        const { document, result } = WithFakeDocument(() => {
            const first = ShowPrompt(MakeSpec(() => void 0))
            const second = ShowPrompt(MakeSpec(() => void 0))
            return { first, second }
        })

        assert.equal(result.first, true, 'the first request was refused')
        assert.equal(result.second, false, 'a second prompt of the same kind was stacked')
        assert.equal(
            document.all.filter(element => element.tagName === 'button').length,
            2,
            'the document should carry one prompt\'s buttons, not two'
        )
    })

    it('lets a different prompt kind show while another is up', () => {
        // The guard is per id, not global: an id is the caller's statement about *which*
        // decision this is, and two unrelated decisions are two prompts.
        const { document } = WithFakeDocument(() => {
            ShowPrompt(MakeSpec(() => void 0))
            ShowPrompt({ ...MakeSpec(() => void 0), Id: 'another-prompt' })
        })
        assert.notEqual(
            document.all.find(element => element.id === 'boids-prompt-another-prompt'),
            undefined
        )
    })
})
