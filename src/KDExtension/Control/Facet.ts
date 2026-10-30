/**
 * The reusable semantic components a dimension composes.
 * @module KDExtension/Control/Facet
 */

import type { CapabilityKey } from './Capability'
import type { DimensionId } from './Identity'
import type { PoseKey } from './Pose'

/** Every dimension has one, and it is the only thing a save or a descriptor addresses it by. */
export interface Identity {
    readonly Id: DimensionId
}

/**
 * How strictly a value is squeezed: `Target` is the applied severity, `Ceiling` the most this facet's
 * owner can impose. Both are 0..1, and 0 is the baseline.
 */
export interface Rate {
    readonly Target: number
    readonly Ceiling: number
}

/**
 * A body configuration: the set of poses the dimension permits, as {@link PoseKey}. This is the one
 * facet whose baseline is not empty — permitting everything and "nothing imposed" are one statement.
 */
export interface Posture {
    readonly Allowed: ReadonlySet<PoseKey>
}

/** A permission: which of the three `GateIntent` demands the Host makes. */
export interface Gate {
    readonly Intent: GateIntent
}

/**
 * The abilities equipment may re-grant for this dimension: empty for a deny-only dimension. A `Posture`
 * dimension promises poses instead, and `OverrideAllowed` needs a promise on the channel it has.
 */
export interface Whitelist {
    readonly Granted: ReadonlySet<CapabilityKey>
}

/**
 * The three things the Host can demand of one dimension.
 *
 * Enumerable at run time, because the console and the descriptor walk reach the vocabulary from
 * JavaScript; each value is its own name, so a save and a console read the same string.
 */
export const GateIntent = {
    /** Neither the restraint layer nor the substitution layer is engaged: nothing is injected. */
    Free: 'Free',
    /** The Host applies the restraint effect, and the injection layer denies. */
    OverrideForbidden: 'OverrideForbidden',
    /**
     * The Host re-grants an ability through the equipment, and only from the equipment's granted
     * set: a write is refused unless equipment can actually promise it.
     */
    OverrideAllowed: 'OverrideAllowed',
} as const

/** One of the three demands above. */
export type GateIntent = typeof GateIntent[keyof typeof GateIntent]

export const GateIntents: readonly GateIntent[] = [
    GateIntent.Free,
    GateIntent.OverrideForbidden,
    GateIntent.OverrideAllowed,
]

export const IsGateIntent = (value: unknown): value is GateIntent =>
    typeof value === 'string' && (GateIntents as readonly string[]).includes(value)

/**
 * How a bid stacks with the other bids on the same dimension: the mode comes from the winning bid, and
 * the aggregate is clamped to 0..1 before the engine value map converts it.
 */
export const StackMode = {
    /**
     * The capability is the highest bid's power. Ties keep the earlier bid, so the answer is
     * deterministic for a given worn set. This is the default.
     */
    Max: 'Max',
    /** The capability is the sum of every bid's power. */
    Sum: 'Sum',
} as const

/** One stacking mode. */
export type StackMode = typeof StackMode[keyof typeof StackMode]

export const StackModes: readonly StackMode[] = [
    StackMode.Max,
    StackMode.Sum,
]

export const IsStackMode = (value: unknown): value is StackMode =>
    typeof value === 'string' && (StackModes as readonly string[]).includes(value)

/** Which of the three operations owns a dimension. */
export const DimensionGroup = {
    /** Squeeze a value: the Host demand and the equipment ceiling are both 0..1. */
    Constraint: 'Constraint',
    /** Take an ability away and re-grant it through another carrier. */
    Substitution: 'Substitution',
    /** Give something the character never had. */
    Buff: 'Buff',
} as const

export type DimensionGroup = typeof DimensionGroup[keyof typeof DimensionGroup]

export const DimensionGroups: readonly DimensionGroup[] = [
    DimensionGroup.Constraint,
    DimensionGroup.Substitution,
    DimensionGroup.Buff,
]

/** Which mechanism group a dimension belongs to, split by mechanism rather than body part. */
export const Subsystem = {
    /** Perception: sight, hearing, spell range. */
    Sensory: 'Sensory',
    /** Multipliers and rates. */
    Stats: 'Stats',
    /** Action gates: binding, speech, movement, attack, casting, escaping, arousal. */
    Behavior: 'Behavior',
} as const

export type Subsystem = typeof Subsystem[keyof typeof Subsystem]

export const Subsystems: readonly Subsystem[] = [
    Subsystem.Sensory,
    Subsystem.Stats,
    Subsystem.Behavior,
]

/**
 * Which way a dimension's seams can move a value: `Deny` imposes only, `Grant` relaxes or
 * re-grants only, `Both` moves either way.
 */
export const Direction = {
    /** The seam can only impose. */
    Deny: 'deny',
    /** The seam can only relax or re-grant. */
    Grant: 'grant',
    /** Both are expressible. */
    Both: 'both',
} as const

export type Direction = typeof Direction[keyof typeof Direction]

export const CanDeny = (direction: Direction): boolean =>
    direction === Direction.Deny || direction === Direction.Both

export const CanGrant = (direction: Direction): boolean =>
    direction === Direction.Grant || direction === Direction.Both

/** The facets, by name, so a descriptor's composed set is enumerable rather than structural. */
export const FacetName = {
    Rate: 'Rate',
    Posture: 'Posture',
    Gate: 'Gate',
    Whitelist: 'Whitelist',
} as const

export type FacetName = typeof FacetName[keyof typeof FacetName]

/**
 * Every facet name, in the order a dimension's intent parameters read: `IntentParameterNames` walks this
 * list, so where a facet sits here decides the parameter order a dimension reports.
 */
export const FacetNames: readonly FacetName[] = [
    FacetName.Rate,
    FacetName.Posture,
    FacetName.Gate,
    FacetName.Whitelist,
]
