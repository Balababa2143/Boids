/**
 * The one authoring shape, and the resolution that turns it into the three values the engine
 * reads.
 *
 * ## The precedence list
 *
 * Each slot is resolved independently, first hit wins, which is what makes a partial
 * declaration the normal case rather than a special one:
 *
 * 1. **the active language's merged tree**, fullest path first and then each shorter prefix;
 * 2. **the English merged tree**, the same walk;
 * 3. **the value the call site declares** — the local override;
 * 4. **the engine's own text for the source item**, for a slot that declares a
 *    {@link TextSpec.Source} and sets no value of its own. This layer is *deferred*: see
 *    `Sink.DeferEngineText`;
 * 5. **the empty string**, a deliberate blank, so the engine never renders a key.
 *
 * Layers 1 and 2 are one cascade across two trees rather than two cascades: a translator's
 * general value can therefore shadow a more specific English one, which is the power they
 * are being given — and the generated reference lists the paths so it stays legible.
 *
 * ## Why a slot and not a key
 *
 * A spec answers "what does this entity's name, flavour and function say?" — it does not
 * know which keys carry the answer, because that is {@link ../Slot}'s job and depends on
 * whether the entity is a restraint, a model or a start perk. Keeping the two apart is what
 * lets one spec serve every registration helper.
 * @module KDExtension/Text/Spec
 */

import { TreesForResolution } from './Data'
import { RestraintKeys } from './Slot'
import { RegisterEngineText, RegisterModText } from './Sink'
import type { SlotResolution, TextSlot, TextSource } from './Sink'
import { ApplyTemplate, ResolveSlot, ResolveValue, SlotName, SlotNames, TextParams } from './Tree'

/**
 * What an entity declares about its text. Every field is optional: an entity with nothing to
 * say declares nothing, and the cascade supplies whatever the trees hold.
 */
export interface TextSpec {
    /**
     * The entity's path in the text trees, e.g.
     * `['FactionMachine','Futuristic','Cuff','Collar','Heavy']`.
     *
     * Absent means the trees cannot serve this entity at all — which is the honest state for
     * a value that is computed rather than authored, such as the visor family's function line
     * built from a variant's own fields.
     */
    readonly Path?: readonly string[]
    readonly Name?: string
    readonly Flavor?: string
    readonly Function?: string
    /**
     * The item whose **composed** text supplies the slots this spec does not set, by name —
     * a base-game restraint for an item derived from it.
     *
     * This is the declared form of what four call sites used to do by hand, reading
     * `TextProvider.instance.getText('Restraint…Desc2')` at module evaluation and hoping the
     * engine's text file had already parsed.
     */
    readonly Source?: string
    /** Values for a tree entry's `${Param}` placeholders. */
    readonly Params?: TextParams
}

const LocalFor = (spec: TextSpec, slot: SlotName): string | undefined => {
    switch (slot) {
        case 'Name': return spec.Name
        case 'Flavor': return spec.Flavor
        case 'Function': return spec.Function
    }
}

/**
 * Resolves one slot through the precedence list in the module header.
 *
 * A tree hit is reported as source `tree` whether it came from the active language or from
 * English: which of the two answered is a translation detail, and the generated reference
 * reports the *value*, which is what a reader needs.
 */
/**
 * A resolved value, with the address it can be overridden at only when it has one.
 *
 * The conditional spread is deliberate: an absent `Path` and a `Path` that happens to be
 * `undefined` are different objects to a structural comparison, and a test asserting "this
 * resolves to that value and nothing else" should not have to spell out a property that is not
 * there.
 */
const Resolved = (
    path: readonly string[] | undefined,
    value: string,
    source: TextSource
): SlotResolution => ({
    kind: 'value',
    Value: value,
    Source: source,
    ...(path != null ? { Path: path } : {}),
})

export const ResolveSlotValue = (spec: TextSpec, slot: SlotName): SlotResolution => {
    const path = spec.Path
    if (path != null) {
        for (const tree of TreesForResolution()) {
            const value = ResolveSlot(tree, path, slot)
            if (value != null) {
                return Resolved(path, ApplyTemplate(value, spec.Params), 'tree')
            }
        }
    }

    const local = LocalFor(spec, slot)
    if (local != null) {
        return Resolved(path, local, local === '' ? 'blank' : 'local')
    }

    const source = spec.Source
    if (source != null) {
        const sourceKey = RestraintKeys(source)[slot]
        // The engine fetches its own text at page load, long before any mod runs, so it is
        // normally there already and the source can be read now. Deferring is the *fallback* for
        // when it genuinely is not (see `Sink.DeferEngineText`), not the rule — a deferred slot
        // stays blank until the flush runs, and trying first is what makes the settling point
        // invisible in every case where it does not matter.
        if (HasText(sourceKey)) {
            return Resolved(path, ApplyTemplate(TextGet(sourceKey), spec.Params), 'engine')
        }
        return { kind: 'deferred', Key: sourceKey, ...(path != null ? { Path: path } : {}) }
    }

    return Resolved(path, '', 'blank')
}

/** The three slots as the engine reads them. */
export type ResolvedText = Readonly<Record<SlotName, SlotResolution>>

/** Resolves every slot of a spec. */
export const ResolveText = (spec: TextSpec): ResolvedText =>
    Object.fromEntries(
        SlotNames.map(slot => [slot, ResolveSlotValue(spec, slot)])
    ) as ResolvedText

/**
 * Resolves a plain string through the same cascade, with the caller's value as the layer
 * beneath the trees.
 *
 * A "plain string" is one that is not an item slot: dialog wording, a status line, a
 * message, a start category's label. Its tree leaf is the node itself rather than a slot
 * node, which is what {@link ResolveValue} looks for.
 */
export const ResolveString = (
    path: readonly string[] | undefined,
    local: string,
    params?: TextParams
): { readonly Value: string, readonly Source: TextSource, readonly Path?: readonly string[] } => {
    if (path != null) {
        for (const tree of TreesForResolution()) {
            const value = ResolveValue(tree, path)
            if (value != null) {
                return { Value: ApplyTemplate(value, params), Source: 'tree', Path: path }
            }
        }
    }
    return {
        Value: local,
        Source: local === '' ? 'blank' : 'local',
        ...(path != null ? { Path: path } : {}),
    }
}

/**
 * Registers an engine-half string at a composed key whose value is not one of the three item
 * slots — a start perk's name, a start category's label — through the same cascade.
 *
 * The engine resolves these keys for itself, so they belong to the shared group; what makes
 * them different from {@link RegisterEngineSlot} is only that their value is the node rather
 * than a slot node.
 */
export const RegisterEngineString = (args: {
    Key: string
    Local: string
    Slot: TextSlot
    Path?: readonly string[]
    Params?: TextParams
}): void => {
    const resolved = ResolveString(args.Path, args.Local, args.Params)
    RegisterEngineText({
        Key: args.Key,
        Value: resolved.Value,
        Slot: args.Slot,
        Source: resolved.Source,
        Path: resolved.Path,
    })
}

/**
 * Registers a mod-half string: dialog wording, a status line, or a message.
 *
 * These are the strings the engine only ever *displays*: it is handed a value the mod has
 * already resolved, and it never looks the key up. That is why they belong to the mod's own
 * group rather than to `default`, and why a player's language is settled here rather than by
 * the engine's translation service.
 */
export const RegisterModString = (args: {
    Path: readonly string[]
    Local: string
    Slot: TextSlot
    Params?: TextParams
}): void => {
    const resolved = ResolveString(args.Path, args.Local, args.Params)
    RegisterModText({
        Path: args.Path,
        Value: resolved.Value,
        Slot: args.Slot,
        Source: resolved.Source,
    })
}
