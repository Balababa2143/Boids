/**
 * The text tree: a plain nested object whose keys are path segments and whose leaves are slot values,
 * with the merge and the specific-to-general lookup that resolve a path through it.
 * @module KDExtension/Text/Tree
 */

/** The slots the engine reads, and the only keys a tree leaf may be. */
export const SlotNames = ['Name', 'Flavor', 'Function'] as const

/** One of the engine's three text slots; {@link ../Slot} turns each into a key. */
export type SlotName = typeof SlotNames[number]

/** One node of a tree: path segments to nodes, or slot names to values. */
export type TextTree = { readonly [segment: string]: string | TextTree | undefined }

/**
 * A JSON module as a text tree.
 *
 * `resolveJsonModule` types an import from the properties it happens to have, which is not assignable
 * to an index signature. The cast checks nothing; the suite holds a tree to its shape.
 */
export const AsTextTree = (json: unknown): TextTree => json as TextTree

/** Template parameters, shaped as the engine's own `TextProvider.applyTemplate` takes them. */
export type TextParams = Readonly<Record<string, string | number | boolean>>

/**
 * `base` with `override` written over it: a node merges into a node, and anything else is a
 * last-writer-wins leaf.
 */
export const DeepMerge = (base: TextTree, override: TextTree): TextTree => {
    // Built in two passes rather than spread, so a base key keeps its position and only genuinely
    // new keys are appended.
    const merged: Record<string, string | TextTree | undefined> = {}
    for (const [segment, value] of Object.entries(base)) {
        if (value !== undefined) {
            merged[segment] = value
        }
    }
    for (const [segment, value] of Object.entries(override)) {
        if (value === undefined) {
            continue
        }
        const existing = merged[segment]
        merged[segment] =
            typeof value === 'string' || typeof existing === 'string' || existing === undefined
                ? value
                : DeepMerge(existing, value)
    }
    return merged
}

const ValueAt = (tree: TextTree, path: readonly string[]): string | TextTree | undefined => {
    let value: string | TextTree | undefined = tree
    for (const segment of path) {
        if (typeof value !== 'object' || value == null) {
            return undefined
        }
        value = value[segment]
    }
    return value
}

const NodeAt = (tree: TextTree, path: readonly string[]): TextTree | undefined => {
    const value = ValueAt(tree, path)
    return typeof value === 'object' && value != null ? value : undefined
}

/**
 * The most specific value for `slot` along `path`: the full path first, then each shorter prefix, the
 * root last.
 *
 * `undefined` means no node on the way carries that slot, which lets the caller fall through to the
 * next layer.
 */
export const ResolveSlot = (tree: TextTree, path: readonly string[], slot: SlotName): string | undefined => {
    for (let depth = path.length; depth >= 0; depth--) {
        const value = NodeAt(tree, path.slice(0, depth))?.[slot]
        if (typeof value === 'string') {
            return value
        }
    }
    return undefined
}

/**
 * The most specific string at `path`: the full path first, then each shorter prefix.
 *
 * The lookup for a key the mod composes for itself, where the leaf is the node rather than a slot;
 * the two leaf kinds never collide.
 */
export const ResolveValue = (tree: TextTree, path: readonly string[]): string | undefined => {
    for (let depth = path.length; depth >= 1; depth--) {
        const value = ValueAt(tree, path.slice(0, depth))
        if (typeof value === 'string') {
            return value
        }
    }
    return undefined
}

/**
 * `text` with its `${Param}` placeholders filled from `params`, leaving an unresolved placeholder in
 * place.
 *
 * The substitution happens here because the engine reaches `Restraint<name>Desc` with no params at all,
 * so a parameterised value is baked at registration.
 */
export const ApplyTemplate = (text: string, params?: TextParams): string =>
    params == null
        ? text
        : text.replace(/\$\{(\w+)\}/g, (placeholder, key) =>
            params[key] === undefined ? placeholder : String(params[key])
        )
