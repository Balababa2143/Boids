/**
 * A DOM small enough to be honest, for the tests that drive the mod's
 * warning prompts: `appendChild` records the child on its parent, and
 * `remove` takes it out of the document so a reuse guard expires.
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
 * The previous global is restored in a `finally`, so one failure cannot cascade into later suites.
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

/** Runs a call with no document installed, restoring the previous global afterwards. */
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

/** Every descendant matching a tag, in document order. */
export const DescendantsByTag = (root: FakeElement, tagName: string): FakeElement[] =>
    root.children.flatMap(child => [
        ...(child.tagName === tagName ? [child] : []),
        ...DescendantsByTag(child, tagName),
    ])

/** The element carrying an id, or `undefined` if it is not in the document. */
export const FindById = (document: FakeDocument, id: string): FakeElement | undefined =>
    document.all.find(element => element.id === id)

/**
 * A prompt's buttons keyed by the label the player reads.
 *
 * @param promptId - The caller's id; the renderer owns the `boids-prompt-` prefix.
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
