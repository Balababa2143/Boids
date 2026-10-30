/**
 * The questions the base game asks about the body as a whole, and how a dimension says it answers
 * one.
 * @module KDExtension/Control/BodyState
 */

import { GateIntent } from './Facet'

/** The closed union of body-state predicates a dimension may feed: the two the base game asks. */
export const BodyStateName = {
    /** `getArmsBound`. */
    ArmsBound: 'ArmsBound',
    /** `getHandsBound`. */
    HandsBound: 'HandsBound',
} as const

/** One body-state predicate. */
export type BodyStateName = typeof BodyStateName[keyof typeof BodyStateName]

export const BodyStateNames: ReadonlySet<BodyStateName> = new Set(
    Object.values(BodyStateName) as readonly BodyStateName[]
)

export const IsBodyStateName = (value: unknown): value is BodyStateName =>
    typeof value === 'string' && BodyStateNames.has(value as BodyStateName)

/** One dimension's contribution to the predicates it declared it feeds. */
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
 * A dimension contributes only when it declares the predicate, is engaged, and its gate is
 * `OverrideForbidden`; a dimension that declares it feeds nothing is not consulted.
 *
 * @param feeds - Every dimension that could answer it, paired with what it resolved to.
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
