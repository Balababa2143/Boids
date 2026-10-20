/**
 * What an item declares about itself, and whether a value off an item is a declaration this build can
 * use.
 *
 * ## Why this is its own module
 *
 * Two readers need it that must not need each other:
 *
 * - the **item-facing facade** (`Public/Control`), which is where a console reader looks for the shape;
 * - the **membership walk** (`Membership`), which reads `item.data` off whatever is on the body.
 *
 * `Membership` is inside the coordinator, so by the barrel rule it would import `Public`'s index —
 * which would make the membership walk depend on the state accessors, the write validators and the
 * selection helper as well, and would put the two modules in an import cycle. The shared shape lives
 * here instead, so each reader depends on exactly one thing.
 * @module FactionMachine/MachinePrime/Coordinator/Provider
 */

import {
    CapabilityKey,
    CapabilityKeys,
    IsPoseKey,
    IsStackMode,
    PoseKey,
    StackMode,
} from '../../../KDExtension/Control'

/**
 * One item's declaration that it can move a dimension.
 *
 * This is the shape an item writes onto its own `item.data` when the game applies it — the "which
 * items are providers" half of §6.7's first rule, through the same stamped-event pattern items already
 * use to reach the coordinator. `Membership.FindProviders` reads it back off the worn set.
 *
 * `Power` is a bid and nothing else: it is only ever compared with another bid, so a family's number
 * means what that family decided it means. **Higher is harder**, because the dimension being moved is
 * how much *restriction* applies.
 *
 * **An item's appearance is a mapping from the intent, not a field of this record** (§6.12 clause 2,
 * §6.1). It is not a bid: a look moves no dimension, and a declaration that carried it would make it
 * look like one. The families still render a declared `AppearanceKey`; moving that mapping onto the
 * intent is the injector's slice (2.1/3.1).
 */
export interface ProviderDeclaration {
    readonly Dimension: string
    readonly Power: number
    /**
     * How this bid stacks with the others, when this bid is the one that wins.
     *
     * The base game's own aggregates do not agree with one another — a `gag` is a sum, a blind
     * level a count and a maximum at once, a deaf level a weighted maximum plus a weighted sum —
     * so the combining rule cannot be a property of the dimension (§6.7).
     */
    readonly Stack: StackMode
    /**
     * The body configurations this item can deliver, when it speaks to a posture dimension.
     *
     * A second axis rather than a second power, because a posture dimension has no numeric
     * aggregate: its providers combine by **intersection**, so what a bid says here is what the
     * item can *draw* rather than how hard it insists (§6.7). An omission says nothing about body
     * configurations, which is a different statement from *"none are permitted"*.
     */
    readonly Allowed?: readonly PoseKey[]
    /**
     * The abilities this item can re-grant, when it speaks to a `Whitelist` dimension.
     *
     * The grant half of capability, and the same channel distinction the facet makes: a posture
     * dimension promises poses through `Allowed`, a whitelist dimension promises abilities through
     * `Granted`. An omission says nothing, which is a different statement from *"none"*.
     */
    readonly Granted?: readonly CapabilityKey[]
    /**
     * What the item still contributes when it **loses** the bid.
     *
     * `false` is the honest answer for an item whose only contribution was the constraint. `true` says
     * it changes its model, appearance or pose regardless — which is how §6.7's third rule reaches an
     * item that did not win.
     */
    readonly LoserExpresses: boolean
}

/**
 * Reads a value off an item as a declaration this build can use, or `undefined`.
 *
 * A save is not a trusted input, and `item.data` is a namespace shared with the game and every other
 * mod — so a declaration is **read rather than cast**. The three fields that are the bid itself are
 * required and a malformed one among them drops the whole declaration, which makes the item stop
 * being a provider rather than making the dimension answer with `NaN`: a value nothing downstream
 * survives, and one that would look like an equipment bug rather than a data one.
 *
 * **`Stack`, `Allowed` and `Granted` degrade per axis instead.** They are the statements a family
 * may reasonably leave out, so a malformed one costs the item that statement and nothing else:
 * a `Stack` this build cannot read becomes `Max`, which is what a family that never thought about
 * stacking means anyway, an `Allowed` it cannot read becomes `undefined` — *says nothing about
 * body configurations* — rather than *permits none of them*, which is the reading that would empty
 * the ladder, and a `Granted` it cannot keep becomes `undefined` rather than a key nothing can honour.
 * Dropping the whole declaration over any of them would take a working constraint away with it,
 * which is the failure this boundary exists to prevent rather than to cause.
 */
export const ReadProviderDeclaration = (value: unknown): ProviderDeclaration | undefined => {
    if (value == null || typeof value !== 'object') {
        return undefined
    }
    const candidate = value as Partial<ProviderDeclaration>
    if (
        typeof candidate.Dimension !== 'string'
        || typeof candidate.Power !== 'number'
        || !Number.isFinite(candidate.Power)
        || typeof candidate.LoserExpresses !== 'boolean'
    ) {
        return undefined
    }
    return {
        Dimension: candidate.Dimension,
        Power: candidate.Power,
        Stack: IsStackMode(candidate.Stack) ? candidate.Stack : StackMode.Max,
        Allowed: Array.isArray(candidate.Allowed) && candidate.Allowed.every(IsPoseKey)
            ? candidate.Allowed
            : undefined,
        // A key this build cannot keep is not a statement the bid can make, so it degrades this
        // axis to `undefined` and leaves the power and stacking intact. With the union empty in
        // Phase 1 every non-empty array reads as absent; the first key (2.4) starts being kept
        // without this reader changing.
        Granted: Array.isArray(candidate.Granted)
            && candidate.Granted.every(key =>
                typeof key === 'string' && CapabilityKeys.has(key as CapabilityKey))
            ? candidate.Granted
            : undefined,
        LoserExpresses: candidate.LoserExpresses,
    }
}
