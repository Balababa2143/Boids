/**
 * A reusable DOM warning dialog: a backdrop, a centred panel, and the buttons its caller asks for.
 * It holds no text of its own — every string is the caller's, so this module registers nothing.
 * @module Common/CommonUI/Prompt
 */

/** How much weight a button carries, which is all the renderer needs to know about intent. */
export interface PromptButton {
    /** The label the player reads, already translated by the caller. */
    readonly Label: string
    /** Whether this is the affirmative choice; affirmative buttons are drawn last. */
    readonly Emphasised?: boolean
    /**
     * Called after the prompt has removed itself, so an action that moves the game elsewhere is not
     * left with an overlay in front of it.
     */
    readonly OnPress: () => void
}

/** Everything a prompt displays. */
export interface PromptSpec {
    /**
     * A stable id, unique per prompt kind: a request for a prompt whose kind is already on screen
     * is refused rather than stacked.
     */
    readonly Id: string
    /** The heading. */
    readonly Title: string
    /** The body, one entry per paragraph. */
    readonly Body: readonly string[]
    /** The choices, in the order they are drawn. */
    readonly Buttons: readonly PromptButton[]
}

const elementIdFor = (promptId: string) => `boids-prompt-${promptId}`

/** Whether a prompt of this kind is currently on screen. */
export const IsPromptShowing = (promptId: string): boolean =>
    typeof document !== 'undefined' && document.getElementById(elementIdFor(promptId)) != null

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
 * Shows the prompt, or reports that it could not be shown. At most one prompt of a kind is on
 * screen: the game keeps running and keeps taking its own clicks while a prompt is up, so a player
 * who asks the same question twice arrives here twice.
 * @param spec - What to display, in already-translated strings.
 * @returns Whether a prompt was created. `false` means one of this kind was already up, or there is
 *   no document to put it in — in both cases nothing was asked, which a caller must not read as an
 *   answer.
 */
export const ShowPrompt = (spec: PromptSpec): boolean => {
    // This runs inside the game's load path, which must not throw.
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

    // Cancel first, act last: a stray click is more likely to land on the harmless choice.
    const ordered = [...spec.Buttons].sort((left, right) =>
        Number(left.Emphasised ?? false) - Number(right.Emphasised ?? false)
    )
    for (const button of ordered) {
        const element = MakeButton(button)
        element.addEventListener('click', () => {
            // Removed before the action runs, so a navigation is not left with this overlay on top.
            backdrop.remove()
            button.OnPress()
        })
        row.appendChild(element)
    }

    document.body.appendChild(backdrop)
    return true
}
