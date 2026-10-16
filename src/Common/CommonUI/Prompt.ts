/**
 * A reusable DOM warning dialog: a backdrop, a centred panel, and the buttons its caller
 * asks for.
 *
 * It exists because the mod has more than one decision to put to the player, and they
 * differ only in wording: an unversioned save is the first, a refused migration is the
 * second. Everything else — the layout, the reuse guard, the no-DOM fallback, the button
 * styling — is the same problem, and duplicating it per message is how two prompts come to
 * behave differently for no reason.
 *
 * ## Why DOM, and why that is mechanical rather than stylistic
 *
 * The load gate has to answer the game with a **synchronous boolean**, so it cannot block
 * on a game-drawn panel: the game's own buttons are only reachable through its canvas,
 * which a DOM overlay covers, and the canvas keeps drawing underneath. A DOM modal can
 * appear, return control to the gate immediately, and settle the decision from its own
 * click handler. The crash-report modal (`base/KinkyDungeonErrors.ts:168-281`) is the
 * pattern this follows, so a player meets a shape the game has already taught them.
 *
 * ## What this module deliberately does not do
 *
 * It has **no text of its own**. Every string is supplied by the caller, which buys two
 * things: this module registers nothing, so it cannot move the registration manifest, and
 * a message's wording lives with the decision it belongs to rather than in the renderer.
 *
 * It is a folder of its own rather than a member of `CommonEvent` because it is **not an
 * event**: nothing here subscribes to anything, and filing a dialog under the event helpers
 * would send a reader looking for the seam it hooks. It is on the mod's published surface
 * for the same reason — another mod's compatibility warning has the same problem this one
 * does, and reimplementing this layout is how two dialogs come to behave differently.
 *
 * @module Common/CommonUI/Prompt
 */

/** How much weight a button carries, which is all the renderer needs to know about intent. */
export interface PromptButton {
    /** The label the player reads. Already translated by the caller. */
    readonly Label: string
    /**
     * Whether this is the affirmative choice. Affirmative buttons are drawn in the game's
     * button colour and placed last, so the layout reads left-to-right as *cancel, act*.
     */
    readonly Emphasised?: boolean
    /**
     * Called when the button is pressed, **after** the prompt has removed itself — so an
     * action that moves the game elsewhere is not left with an overlay in front of it.
     */
    readonly OnPress: () => void
}

/** Everything a prompt displays. */
export interface PromptSpec {
    /**
     * A stable id, unique per prompt kind. It is what makes the reuse guard work: a request
     * for a prompt whose kind is already on screen is refused rather than stacked.
     */
    readonly Id: string
    /** The heading. */
    readonly Title: string
    /** The body, one entry per paragraph. */
    readonly Body: readonly string[]
    /** The choices, in the order they are drawn. */
    readonly Buttons: readonly PromptButton[]
}

/**
 * The element id the backdrop carries, so the reuse guard can find an open prompt.
 *
 * A prompt is shown at most once per id, and the id is the caller's, so two different
 * prompts are two different elements.
 */
const elementIdFor = (promptId: string) => `boids-prompt-${promptId}`

/**
 * Whether any prompt is currently on screen.
 *
 * The game keeps running while a prompt is up, so a caller may legitimately ask twice. This
 * lets a caller tell "your prompt is already showing" from "your prompt could not be
 * shown", which are different situations: the first means the player is already being
 * asked, the second means nobody is.
 */
export const IsPromptShowing = (promptId: string): boolean =>
    typeof document !== 'undefined' && document.getElementById(elementIdFor(promptId)) != null

/**
 * Builds a button. Both choices share one builder, so they cannot drift apart in size or
 * weight.
 */
const MakeButton = (button: PromptButton): HTMLButtonElement => {
    const element = document.createElement('button')
    element.textContent = button.Label
    Object.assign(element.style, {
        fontSize: '1.25em',
        padding: '0.5em 1.1em',
        backgroundColor: button.Emphasised ? KDButtonColor : KDBaseDarkGrey,
        border: `2px solid ${KDBorderColor}`,
        color: KDBaseWhite,
        cursor: 'pointer',
    })
    return element
}

const MakeParagraph = (content: string): HTMLParagraphElement => {
    const paragraph = document.createElement('p')
    paragraph.textContent = content
    Object.assign(paragraph.style, { margin: '0 0 0.75em', fontSize: '1.05em' })
    return paragraph
}

/**
 * Shows the prompt, or reports that it could not be shown.
 *
 * Reuse rather than stacking matters: the game keeps drawing and keeps processing its own
 * buttons while a prompt is open, so a player who clicks the same save twice arrives here
 * twice. Two stacked prompts would present one decision as two, and the second one's
 * callbacks would be the live ones.
 *
 * @param spec - What to display, in already-translated strings.
 * @returns Whether a prompt was created. `false` means one of this kind was already up, or
 *   there is no document to put it in — in both cases **nothing was asked**, which a caller
 *   must not mistake for an answer.
 */
export const ShowPrompt = (spec: PromptSpec): boolean => {
    // The prompt is DOM, and one caller is the game's own loader. In a host with no document
    // there is nothing to show and nowhere to ask, so the caller is told that rather than
    // left with a thrown error from a load path — a throw in `KinkyDungeonLoadGame` is
    // exactly what `docs/spec.md` §4.4 forbids.
    if (typeof document === 'undefined') {
        console.warn(
            `Boids: the "${spec.Id}" prompt could not be shown because there is no document, ` +
            'so nothing has been asked and nothing has been decided.'
        )
        return false
    }

    const elementId = elementIdFor(spec.Id)
    if (document.getElementById(elementId) != null) {
        return false
    }

    const backdrop = document.createElement('div')
    backdrop.id = elementId
    Object.assign(backdrop.style, {
        position: 'fixed',
        inset: '0',
        backgroundColor: '#000000c0',
        fontFamily: "'Arial', sans-serif",
        fontSize: '1.6vmin',
        lineHeight: '1.6',
        zIndex: '10000',
    })

    const panel = document.createElement('div')
    Object.assign(panel.style, {
        position: 'absolute',
        display: 'flex',
        flexFlow: 'column nowrap',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        width: '70vw',
        maxWidth: '1100px',
        maxHeight: '80vh',
        overflowY: 'auto',
        backgroundColor: '#282828',
        color: '#fafafa',
        padding: '1.25rem',
        borderRadius: '2px',
        boxShadow: '1px 1px 40px -8px #ffffff80',
    })
    backdrop.appendChild(panel)

    const heading = document.createElement('h1')
    heading.textContent = spec.Title
    Object.assign(heading.style, { margin: '0 0 0.75em', fontSize: '1.35em', textAlign: 'center' })
    panel.appendChild(heading)

    for (const paragraph of spec.Body) {
        panel.appendChild(MakeParagraph(paragraph))
    }

    const row = document.createElement('div')
    Object.assign(row.style, {
        display: 'flex',
        flexFlow: 'row wrap',
        justifyContent: 'flex-end',
        gap: '1em',
        marginTop: '0.5em',
    })
    panel.appendChild(row)

    // Cancel first, act last: the affirmative button sits where a reader's eye finishes, and
    // a stray click is more likely to land on the harmless choice.
    const ordered = [...spec.Buttons].sort((left, right) =>
        Number(left.Emphasised ?? false) - Number(right.Emphasised ?? false)
    )
    for (const button of ordered) {
        const element = MakeButton(button)
        element.addEventListener('click', () => {
            // Removed before the action runs: an action that moves the game elsewhere must
            // not leave this overlay covering the screen it is moving the player to.
            backdrop.remove()
            button.OnPress()
        })
        row.appendChild(element)
    }

    document.body.appendChild(backdrop)
    return true
}
