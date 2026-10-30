/**
 * What an item declares about itself, and whether a value off an item is a declaration this build
 * can use. It lives apart from both its readers, the item-facing facade and the membership walk,
 * because `Membership` importing the facade's barrel would put the two in an import cycle.
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
 * One item's declaration that it can move a dimension, written onto its own `item.data` when the
 * game applies it and read back by `Membership.FindProviders`. `Power` is only ever compared with
 * another bid, and higher means harder: the dimension being moved is how much restriction applies.
 * An item's appearance is not a field here — a look moves no dimension.
 */
export interface ProviderDeclaration {
    readonly Dimension: string
    readonly Power: number
    /** How this bid stacks with the others, when this bid is the one that wins. */
    readonly Stack: StackMode
    /**
     * The body configurations this item can deliver, when it speaks to a posture dimension. A
     * second axis rather than a second power: posture providers combine by intersection. An
     * omission says nothing about body configurations, which is a different statement from "none
     * are permitted".
     */
    readonly Allowed?: readonly PoseKey[]
    /**
     * The abilities this item can re-grant, when it speaks to a `Whitelist` dimension. An omission
     * says nothing, which is a different statement from "none".
     */
    readonly Granted?: readonly CapabilityKey[]
    /**
     * What the item still contributes when it loses the bid: `true` says it changes its model,
     * appearance or pose regardless.
     */
    readonly LoserExpresses: boolean
}

/**
 * Reads a value off an item as a declaration this build can use, or `undefined`. A declaration is
 * read rather than cast, because `item.data` is a namespace shared with the game and every other
 * mod. The three fields that are the bid itself are required, and a malformed one among them drops
 * the whole declaration; `Stack`, `Allowed` and `Granted` degrade per axis instead, so a malformed
 * statement costs the item that statement and not the bid.
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
        // A key this build cannot keep is not a statement the bid can make: this axis degrades to
        // `undefined` and the power and stacking stay intact.
        Granted: Array.isArray(candidate.Granted)
            && candidate.Granted.every(key =>
                typeof key === 'string' && CapabilityKeys.has(key as CapabilityKey))
            ? candidate.Granted
            : undefined,
        LoserExpresses: candidate.LoserExpresses,
    }
}
