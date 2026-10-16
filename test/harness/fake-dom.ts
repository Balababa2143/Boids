/**
 * A DOM small enough to be honest, for the tests that drive the mod's warning prompts.
 *
 * The prompts are DOM, and the game runs in a browser on a canvas, so a test has to supply
 * one. The fake keeps only what the renderer uses, and keeps it faithful in the two places a
 * lazy fake would have passed a broken test:
 *
 *  - `appendChild` records the child **on its parent**, so a test that walks the tree reads
 *    the structure the renderer built rather than a flat list of everything created;
 *  - `remove` takes the element out of the document, so the prompt's reuse guard — which asks
 *    `getElementById` whether it is still up — expires at the right moment.
 *
 * It is shared because three suites need it: the renderer's own, the save prompts built on top
 * of it, and the migration refusal that shows one. A second copy would be a second chance to
 * get one of those two points wrong.
 */

export interface FakeElement {
    readonly tagName: string
    id: string
    textContent: string
    style: Record<string, string>
    readonly children: FakeElement[]
    readonly handlers: (() => void)[]
    appendChild: (_: FakeElement) => FakeElement
    addEventListener: (_: string, __: () => void) => void
    remove: () => void
}

/** The document the fake represents: every element ever created and not yet removed. */
export interface FakeDocument {
    readonly all: FakeElement[]
}

const CreateFakeElement = (tagName: string, owner: FakeDocument): FakeElement => {
    const element: FakeElement = {
        tagName,
        id: '',
        textContent: '',
        style: {},
        children: [],
        handlers: [],
        appendChild(child) {
            element.children.push(child)
            owner.all.push(child)
            return child
        },
        addEventListener(_type, handler) {
            element.handlers.push(handler)
        },
        remove() {
            const index = owner.all.indexOf(element)
            if (index >= 0) {
                owner.all.splice(index, 1)
            }
        },
    }
    return element
}

/**
 * Installs a fake `document` for the duration of one call and hands back what it built.
 *
 * The previous value is restored in a `finally`, so a test that fails part way still leaves
 * the global as it found it — otherwise one failure would cascade into every later suite that
 * has to survive without a document.
 *
 * @param body - Runs with the fake installed; its return value is passed through.
 */
export const WithFakeDocument = <T>(body: (document: FakeDocument) => T): { document: FakeDocument, result: T } => {
    const owner: FakeDocument = { all: [] }
    const stub = {
        createElement: (tagName: string) => CreateFakeElement(tagName, owner),
        getElementById: (id: string) => owner.all.find(element => element.id === id) ?? null,
        body: {
            appendChild: (element: FakeElement) => owner.all.push(element),
        },
    }

    const globals = globalThis as unknown as { document?: unknown }
    const previous = globals.document
    globals.document = stub
    try {
        return { document: owner, result: body(owner) }
    }
    finally {
        globals.document = previous
    }
}

/** Runs a call with **no** document installed, restoring whatever was there afterwards. */
export const WithoutDocument = <T>(body: () => T): T => {
    const globals = globalThis as unknown as { document?: unknown }
    const previous = globals.document
    delete globals.document
    try {
        return body()
    }
    finally {
        globals.document = previous
    }
}

/** The text a node carries, including everything beneath it. */
export const TextOf = (element: FakeElement): string =>
    element.textContent + element.children.map(TextOf).join('')

/**
 * Every descendant matching a tag, in document order.
 *
 * Recursive and by tag, the way a document query behaves, rather than a hand-counted path down
 * the tree: an assertion that encodes the markup's depth breaks the day the markup gains a
 * wrapper, and that is a false alarm about healthy code.
 */
export const DescendantsByTag = (root: FakeElement, tagName: string): FakeElement[] =>
    root.children.flatMap(child => [
        ...(child.tagName === tagName ? [child] : []),
        ...DescendantsByTag(child, tagName),
    ])

/** The element carrying an id, or `undefined` if it is not in the document. */
export const FindById = (document: FakeDocument, id: string): FakeElement | undefined =>
    document.all.find(element => element.id === id)

/**
 * A prompt's buttons keyed by the labels the player reads, so a test presses what the renderer
 * built rather than a function it hoped was wired.
 *
 * @param promptId - The **caller's** prompt id. The `boids-prompt-` prefix is the renderer's,
 *   and keeping it here rather than at every call site is what makes a test fail with the id
 *   it asked for when the renderer changes how it spells one.
 */
export const PromptButtons = (document: FakeDocument, promptId: string): Record<string, FakeElement> => {
    const backdrop = FindById(document, `boids-prompt-${promptId}`)
    if (backdrop == null) {
        throw new Error(`no prompt with id "${promptId}" was created`)
    }
    return Object.fromEntries(
        DescendantsByTag(backdrop, 'button').map(button => [button.textContent, button])
    )
}

/** The backdrop element of a prompt, so a test can read its whole text. */
export const PromptText = (document: FakeDocument, promptId: string): string => {
    const backdrop = FindById(document, `boids-prompt-${promptId}`)
    if (backdrop == null) {
        throw new Error(`no prompt with id "${promptId}" was created`)
    }
    return TextOf(backdrop)
}
