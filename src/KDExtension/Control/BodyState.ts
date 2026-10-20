/**
 * The questions the base game asks about the body **as a whole**, and how a dimension says it
 * answers one.
 *
 * ## Why a predicate is not a dimension
 *
 * **[Existing] `getArmsBound` and `getHandsBound` are one question each with some fifty callers**
 * (`effect/KinkyDungeonEvents.ts:263-340` and the callers §6.5 lists), and the base game answers
 * each with a single value computed from the restraint's own `bindarms` / `bindhands` fields. Our
 * model has no dimension that means *"her arms are bound"* and deliberately never will: an arm
 * restraint **is a set of bids** on the dimensions that own the seven capabilities a binding
 * actually pays for (§6.5).
 *
 * So when a caller of ours has to answer the game's question — which it must, to take part in the
 * `forceResult` convention — the answer is a **union of the refusals** among the dimensions that
 * feed that predicate. **A compatibility shim, not a dimension** (glossary).
 *
 * ## What this module is, and what it is not
 *
 * It is the **vocabulary** and the **pure combination rule**: `BodyStateName` is closed, and
 * `ResolveBodyState` unions the refusals out of resolutions a caller already has. It reads no
 * state and binds no seam — the seam is the `forceResult` guard, and it is Phase 2.1's.
 *
 * The input is expressed **structurally** rather than as a `DimensionResolution`, for the same
 * reason `Provider` is its own module: `Descriptor` needs the name type, and a vocabulary that
 * depended on the router would put the router and the descriptor registry in a cycle. A caller
 * pairs each descriptor with its resolution on the way in, which it has to do anyway because it
 * is the caller that decided which dimensions to resolve.
 * @module KDExtension/Control/BodyState
 */

import { GateIntent } from './Facet'

/**
 * The closed union of body-state predicates a dimension may feed.
 *
 * The two the base game asks, and no more: a predicate is named here only when some fifty
 * callers already depend on its answer. Adding one is a compatibility decision rather than a
 * modelling one.
 */
export const BodyStateName = {
    /** *"Are her arms bound?"* — `getArmsBound`. */
    ArmsBound: 'ArmsBound',
    /** *"Are her hands bound?"* — `getHandsBound`. */
    HandsBound: 'HandsBound',
} as const

/** One body-state predicate. */
export type BodyStateName = typeof BodyStateName[keyof typeof BodyStateName]

/** Every predicate, for a walk that has to cover the vocabulary. */
export const BodyStateNames: ReadonlySet<BodyStateName> = new Set(
    Object.values(BodyStateName) as readonly BodyStateName[]
)

/** Whether a value is a predicate this build knows. A membership test, not a cast. */
export const IsBodyStateName = (value: unknown): value is BodyStateName =>
    typeof value === 'string' && BodyStateNames.has(value as BodyStateName)

/**
 * One dimension's contribution to the predicates it declared it feeds.
 *
 * The three fields are read off a descriptor and its resolution rather than off the game: the
 * descriptor says *which* predicates the dimension feeds, and the resolution says *whether it is
 * refusing right now*.
 */
export interface BodyStateFeed {
    /** The predicates the dimension declared it feeds, from its descriptor. */
    readonly Feeds?: readonly BodyStateName[] | undefined
    /** Whether the controller is applying this dimension's restraint effect at all. */
    readonly Engaged?: boolean | undefined
    /** Which permission the Host demanded, with an absent one already read as `Free`. */
    readonly Gate?: GateIntent | undefined
}

/**
 * Whether a predicate holds, given what every candidate dimension resolved to.
 *
 * **A union of refusals**, and the two halves of "refusing" both matter:
 *
 * - the gate must be `OverrideForbidden` — an `OverrideAllowed` dimension is *granting*, which is
 *   the opposite of a refusal, and a `Free` one is not engaged at all;
 * - and it must actually be engaged, which is what makes a gate the seams cannot honour count as
 *   nothing rather than as a refusal.
 *
 * A dimension that declares it feeds a predicate but is not refusing contributes no answer, and a
 * dimension that declares it feeds nothing is not consulted — so the answer is exactly the
 * disjunction over the dimensions that both declared the predicate and are refusing.
 *
 * @param name - The predicate to answer.
 * @param feeds - Every dimension that could answer it, paired with what it resolved to.
 * @returns `true` when at least one of them is refusing through this predicate.
 */
export const ResolveBodyState = (
    name: BodyStateName,
    feeds: Iterable<BodyStateFeed>
): boolean => {
    for (const feed of feeds) {
        if (
            feed.Feeds?.includes(name) === true
            && feed.Engaged === true
            && feed.Gate === GateIntent.OverrideForbidden
        ) {
            return true
        }
    }
    return false
}
