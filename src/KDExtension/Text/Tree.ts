/**
 * The text tree: what one layer of text data is, how layers merge, and how a path resolves
 * through the result.
 *
 * A tree is a plain nested object whose **keys are path segments** and whose **leaves are
 * slot values**:
 *
 * ```json
 * { "FactionMachine": { "Futuristic": { "Cuff": { "Collar": {
 *     "Name": "Drone Collar",
 *     "Heavy": { "Flavor": "Heavy" }
 * } } } } }
 * ```
 *
 * That is what a flat `key,value` list cannot say. `Heavy` declares only what differs from
 * the collar it sits under, and the lookup finds the rest by walking up — which is the
 * morphable-variant case this mod is built on, where one family shares a name across forty
 * registered restraints and each overrides one line.
 *
 * The lookup is a **dependency-property pass, most specific first**: for the path
 * `[…, 'Collar', 'Heavy']` and the slot `Name`, it tries the full path, then `…Collar`, then
 * `…Cuff`, and so on to the root, taking the first node that carries the slot. A missing
 * specific value therefore falls back to the general one with no case-by-case code.
 *
 * Merging two layers is the repository's documented merge — template preservation,
 * last-writer-wins at a leaf, deterministic key order — the same contract
 * `test/variant-map.property.test.ts` pins for the variant builders. It cannot reuse
 * `VariantMapBuilder` itself: that is built for variant parts over Immutable, and this is
 * plain JSON.
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
 * `resolveJsonModule` types an import from the properties it happens to have, and a type with
 * known properties is not assignable to one with an index signature — so an imported tree has
 * to be declared as a tree once, here, rather than at every `Data` module. **The cast checks
 * nothing**: `test/text-tree.test.ts` is what holds a tree to its shape, and it is the reason
 * this can be a cast rather than a parser.
 */
export const AsTextTree = (json: unknown): TextTree => json as TextTree

/** Template parameters, shaped as the engine's own `TextProvider.applyTemplate` takes them. */
export type TextParams = Readonly<Record<string, string | number | boolean>>

/**
 * `base` with `override` written over it. A node merges into a node; anything else is a
 * last-writer-wins leaf, so an override may replace a subtree with a value, or a value with
 * a subtree, without a special case.
 */
export const DeepMerge = (base: TextTree, override: TextTree): TextTree => {
    // Built in two passes rather than spread, so a key the base carries keeps its position
    // and only genuinely new keys are appended — the merge is order-deterministic for the
    // generated reference to be reproducible.
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

/** Whatever a path names: a string leaf, a node, or `undefined`. */
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

/** The node a path names, or `undefined` when it names a string or nothing at all. */
const NodeAt = (tree: TextTree, path: readonly string[]): TextTree | undefined => {
    const value = ValueAt(tree, path)
    return typeof value === 'object' && value != null ? value : undefined
}

/**
 * The most specific value for `slot` along `path`: the full path first, then each shorter
 * prefix, the root last.
 *
 * `undefined` means no node on the way carries that slot, which is what lets a caller fall
 * through to the next layer rather than inventing an empty value here.
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
 * The most specific **string** at `path`: the full path first, then each shorter prefix.
 *
 * This is the lookup for a key the mod composes for itself, where the value *is* the node
 * rather than one of the engine's three slots. The two leaf kinds never collide: a node
 * holding slots is an object and is skipped here, and a string leaf is skipped by
 * {@link ResolveSlot}.
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
 * `text` with its `${Param}` placeholders filled from `params`.
 *
 * Identical in behaviour to the engine's own `TextProvider.applyTemplate`
 * (`Scripts/Text.ts:646-651`), **including leaving an unresolved placeholder in place**.
 * The substitution has to happen here rather than in the engine: the engine calls
 * `TextGet(tag, params)` for its own generated text, but it reaches `Restraint<name>Desc`
 * with no params at all, so a parameterised value has to be baked once, at registration.
 *
 * The unresolved case is not silently tolerated — a gate asserts that no value the mod
 * registers still contains `${`, so a misspelled parameter fails the suite rather than
 * reaching a player.
 */
export const ApplyTemplate = (text: string, params?: TextParams): string =>
    params == null
        ? text
        : text.replace(/\$\{(\w+)\}/g, (placeholder, key) =>
            params[key] === undefined ? placeholder : String(params[key])
        )
