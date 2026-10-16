/**
 * The reusable semantic components a dimension composes.
 *
 * The point of facets is that semantics genuinely overlap: a struggle is both a permission
 * and a difficulty, so a dimension cannot belong to one category. It composes the facets it
 * needs and nothing else (`design/spec.md` §6.1).
 *
 * **Facets live in the type system and in the code-side registry; the persisted shape stays
 * uniform.** That is the split that lets a dimension grow a field without the save moving.
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
 * How strictly a value is squeezed. `Target` is the currently applied severity and `Ceiling`
 * is the most this facet's owner can impose — both 0 to 1, higher meaning more severe, and
 * **0 is the baseline**: nothing imposed at all.
 */
export interface Rate {
    readonly Target: number
    readonly Ceiling: number
}

/**
 * **A body configuration is a set, not a number.**
 *
 * The arms can be free, in front, crossed, wrist-tied, box-tied, yoked or raised, and the legs
 * spread, closed, kneeling, kneeling-closed or hogtied — the base game already treats each as a
 * named pose with a permitted set (`Data/Poses.ts:1, :16`). So `Allowed` holds the poses the
 * dimension permits, and the values are {@link PoseKey}, that facet's own vocabulary
 * (`design/spec.md` §6.1, §6.13).
 *
 * ## This is the one facet whose baseline is not "nothing"
 *
 * `Rate` rests at 0 and `Gate` at `Free`, and both mean *an absence of effect*. `Posture` rests
 * at **the whole ladder** — every pose the dimension governs — because an unconstrained body is
 * free to take any of them, and the facet is by construction a permission rather than a severity.
 * That is why the parameter is written as a **permitted set** and not as a list of refusals:
 * `Free` and "every pose allowed" have to be the same statement, or removing the last covering
 * item would have to *restore* a set instead of releasing one (§6.5, invariant 12).
 *
 * ## What a set resolves to
 *
 * Not a winner: a posture dimension's bids combine by **intersection**, because a pose is a
 * sprite variable and an item that cannot deliver one may not carry it at all — so the worn set's
 * capability is what *all* of them can deliver. The Host's demand then moves down. The whole
 * algebra, the answer's non-emptiness and the route it travels are §6.7 and §6.13.
 */
export interface Posture {
    readonly Allowed: ReadonlySet<PoseKey>
}

/**
 * A permission.
 *
 * There is deliberately **no `Capability: boolean`** beside `Intent`: whether equipment can
 * offer a substitute for a dimension is exactly *whether that dimension can grant a key at
 * all*, so a boolean would be a second source of truth for the same fact (`design/spec.md`
 * §6.1).
 */
export interface Gate {
    readonly Intent: GateIntent
}

/**
 * The abilities equipment may re-grant for one dimension.
 *
 * Empty for a dimension that cannot grant, which is not an accident but the definition: a
 * dimension whose direction is deny-only has no `CapabilityKey`s to carry.
 *
 * **This is one of the two grant channels, not the only one** (`design/spec.md` §6.4). A
 * `Whitelist` dimension promises *abilities*, by key; a `Posture` dimension promises *body
 * configurations*, by pose. Invariant 6's rule — `OverrideAllowed` requires equipment capability
 * — is therefore stated over the channel the dimension actually has, and `CapabilityKey` is the
 * vocabulary of this one rather than of granting in general.
 */
export interface Whitelist {
    readonly Granted: ReadonlySet<CapabilityKey>
}

/**
 * The three things the Host can demand of one dimension.
 *
 * ## Why this is an object and not a `const enum`
 *
 * The repo's other closed vocabularies are `const enum`s, which are inlined and absent at
 * runtime. This one has to be **enumerable**: `test/control-descriptor.test.ts` walks every
 * member against the registry, and a facade whose whole claim is "drivable from the console"
 * cannot have its vocabulary unreachable from JavaScript.
 *
 * The values are their own names — `'Free'` rather than `1` — for the same reason a save
 * stores paths rather than derived ids: the value stays readable in a save and in the
 * console, at no cost, because nothing is ordering these.
 */
export const GateIntent = {
    /**
     * Neither the restraint layer nor the substitution layer is engaged: **the injection
     * layer injects nothing at all**, so the behavioural boundary is the restraint template's
     * own defaults — the game's rules, unmodified.
     */
    Free: 'Free',
    /** The Host applies the restraint effect, and the injection layer denies. */
    OverrideForbidden: 'OverrideForbidden',
    /**
     * The Host re-grants an ability **through the equipment**, and only from the equipment's
     * granted set. A write of this value is refused unless equipment can actually promise it
     * (`design/spec.md` §6.4).
     */
    OverrideAllowed: 'OverrideAllowed',
} as const

/** One of the three demands above. */
export type GateIntent = typeof GateIntent[keyof typeof GateIntent]

/** Every gate value, for a walk that has to cover the enum rather than sample it. */
export const GateIntents: readonly GateIntent[] = [
    GateIntent.Free,
    GateIntent.OverrideForbidden,
    GateIntent.OverrideAllowed,
]

/**
 * Whether a value is one of the three. A plain membership test rather than a cast, because
 * this runs on a value that came from a save.
 */
export const IsGateIntent = (value: unknown): value is GateIntent =>
    typeof value === 'string' && (GateIntents as readonly string[]).includes(value)

/**
 * How a bid stacks with the other bids on the same dimension.
 *
 * ## Why one number could not carry this
 *
 * **[既有] The base game's own aggregates do not agree with one another.** A `gag` value is a
 * **sum** with a saturating floor (`player/KinkyDungeonStats.ts:2209-2231`); a blind level is a
 * **count and a maximum at once**, where every item adds one *and* raises a floor
 * (`:2063-2075`); a deaf level is a **weighted maximum plus a weighted sum** (`:413-435`). So the
 * rule for combining bids belongs to the bid, and the aggregate's mode is the **winning bid's**
 * (`design/spec.md` §6.7).
 *
 * ## Two modes, and why there is no third
 *
 * **[决定] There is no `Count` mode.** A count aggregates the **number** of contributing items
 * rather than what any of them says, so it only means anything if a piece's contribution is a
 * fixed step — *one item, one rung* — and this mod does not build fixed-value restraints: a piece
 * declares a **power**, and two pieces of the same kind are stronger than one because their powers
 * add rather than because there are two of them. Nothing is lost, because a count is a sum in which
 * every contributor bids the same step.
 *
 * The aggregate is clamped to 0..1 like any other rate; the dimension's **engine value** map is
 * what puts it on the engine's own scale, which is where a base-game integer ladder lives.
 *
 * Enumerable at run time for the same reason `GateIntent` is: a console has to be able to say
 * which mode a dimension resolved under.
 */
export const StackMode = {
    /**
     * The capability is the highest bid's power. Ties keep the earlier bid, so the answer is
     * deterministic for a given worn set.
     *
     * **The default**, which is what a family that never thought about stacking means and what the
     * base game's own `getArmsBound` handlers do.
     */
    Max: 'Max',
    /**
     * The capability is the sum of every bid's power.
     *
     * The base-game `gag`, and also a blind level's count half — a count is a sum in which every
     * contributor bids the same step.
     */
    Sum: 'Sum',
} as const

/** One stacking mode. */
export type StackMode = typeof StackMode[keyof typeof StackMode]

/** Every mode, for a walk that has to cover the enum rather than sample it. */
export const StackModes: readonly StackMode[] = [
    StackMode.Max,
    StackMode.Sum,
]

/** Whether a value is one of the three. A membership test, because this came off a save. */
export const IsStackMode = (value: unknown): value is StackMode =>
    typeof value === 'string' && (StackModes as readonly string[]).includes(value)

/**
 * Which of the three operations owns a dimension, and which of the mechanism groups it
 * belongs to. They are different questions: the group says what kind of demand it is, the
 * subsystem says when it ships.
 */
export const DimensionGroup = {
    /** Squeeze a value: Host demand is 0..1, equipment ceiling is 0..1. */
    Constraint: 'Constraint',
    /** Take an ability away and re-grant it through another carrier. */
    Substitution: 'Substitution',
    /** Give something the character never had. */
    Buff: 'Buff',
} as const

export type DimensionGroup = typeof DimensionGroup[keyof typeof DimensionGroup]

/** The three mechanism groups, for a walk. */
export const DimensionGroups: readonly DimensionGroup[] = [
    DimensionGroup.Constraint,
    DimensionGroup.Substitution,
    DimensionGroup.Buff,
]

/** Which mechanism group a dimension belongs to, split by mechanism rather than body part. */
export const Subsystem = {
    /** Perception: sight, hearing, spell range. */
    Sensory: 'Sensory',
    /** Multipliers and rates. Declared now, implemented when the resource system exists. */
    Stats: 'Stats',
    /** Action gates: binding, speech, movement, attack, casting, escaping, arousal. */
    Behavior: 'Behavior',
} as const

export type Subsystem = typeof Subsystem[keyof typeof Subsystem]

/** The three subsystems, in the order they are built. */
export const Subsystems: readonly Subsystem[] = [
    Subsystem.Sensory,
    Subsystem.Stats,
    Subsystem.Behavior,
]

/**
 * Which way a dimension's seams can move a value.
 *
 * An ability may be one-way at the seam even when the design wants both directions, which is
 * why this is recorded per dimension rather than assumed from the design's intent
 * (`design/spec.md` §6.2).
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

/** Whether a direction includes the denying half. */
export const CanDeny = (direction: Direction): boolean =>
    direction === Direction.Deny || direction === Direction.Both

/** Whether a direction includes the granting half. */
export const CanGrant = (direction: Direction): boolean =>
    direction === Direction.Grant || direction === Direction.Both

/**
 * The facets, by name, so a descriptor's composed set is enumerable rather than structural and a
 * test can walk it.
 */
export const FacetName = {
    Rate: 'Rate',
    Posture: 'Posture',
    Gate: 'Gate',
    Whitelist: 'Whitelist',
} as const

export type FacetName = typeof FacetName[keyof typeof FacetName]

/**
 * Every facet name, **in the order a dimension's intent parameters read**.
 *
 * The order is load-bearing: `IntentParameterNames` walks this list, so `Struggle` reports
 * `['Target', 'Intent']` and `PoseArms` reports `['Allowed', 'Intent']` because of where the
 * facets sit here. It follows §6.1's own order.
 */
export const FacetNames: readonly FacetName[] = [
    FacetName.Rate,
    FacetName.Posture,
    FacetName.Gate,
    FacetName.Whitelist,
]
