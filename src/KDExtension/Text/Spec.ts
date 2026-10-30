/**
 * The one authoring shape, and the resolution that turns it into the three values the engine reads.
 *
 * Each slot resolves independently and the first hit wins: the active language's tree, the English
 * tree, the value the call site declares, the source item's engine text, then the empty string. The two
 * trees are one cascade, so a translator's general value can shadow a more specific English one.
 * @module KDExtension/Text/Spec
 */

import { TreesForResolution } from './Data'
import { RestraintKeys } from './Slot'
import { RegisterEngineText, RegisterModText } from './Sink'
import type { SlotResolution, TextSlot, TextSource } from './Sink'
import { ApplyTemplate, ResolveSlot, ResolveValue, SlotName, SlotNames, TextParams } from './Tree'

/**
 * What an entity declares about its text: every field is optional, and the cascade supplies whatever
 * the trees hold.
 */
export interface TextSpec {
    /** The entity's path in the text trees; absent means the trees cannot serve this entity at all. */
    readonly Path?: readonly string[]
    readonly Name?: string
    readonly Flavor?: string
    readonly Function?: string
    /** The item whose composed text supplies the slots this spec does not set, by name. */
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

/** A resolved value, carrying `Path` only when the spec has one. */
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
        // The engine fetches its own text at load, so it is normally there already: try it first,
        // and deferring stays the fallback.
        if (HasText(sourceKey)) {
            return Resolved(path, ApplyTemplate(TextGet(sourceKey), spec.Params), 'engine')
        }
        return { kind: 'deferred', Key: sourceKey, ...(path != null ? { Path: path } : {}) }
    }

    return Resolved(path, '', 'blank')
}

/** The three slots as the engine reads them. */
export type ResolvedText = Readonly<Record<SlotName, SlotResolution>>

export const ResolveText = (spec: TextSpec): ResolvedText =>
    Object.fromEntries(
        SlotNames.map(slot => [slot, ResolveSlotValue(spec, slot)])
    ) as ResolvedText

/**
 * Resolves a plain string — dialog wording, a status line, a message — through the same cascade, with
 * the caller's value beneath the trees.
 *
 * Its tree leaf is the node itself rather than a slot node, which is what {@link ResolveValue} looks
 * for.
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
 * Registers an engine-half string at a composed key whose value is not one of the three item slots — a
 * start perk's name, a start category's label — through the same cascade.
 *
 * Only the node shape differs from {@link RegisterEngineSlot}.
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
 * The engine only displays these, so they belong to the mod's own group.
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
