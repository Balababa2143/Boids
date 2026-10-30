/**
 * The pose route: the two globals a posture dimension wraps, and the `shrine` words a controlled
 * restraint may not use.
 *
 * The availability functions are pure, so wrapping the globals is the only way in.
 * {@link PoseRouteBound} is `false` because this module declares the route and binds nothing.
 * @module FactionMachine/MachinePrime/Coordinator/PoseRoute
 */

import { ArmPoseLadder, DimensionId, LegPoseLadder, PoseKey } from '../../../KDExtension/Control'
import { DimensionIdOf, DimensionName } from './Catalog/Name'

/**
 * The two globals the route wraps, by their engine names. A `Replace` seam has no trigger bucket to
 * hang on, so its `Trigger` is the name of the function being wrapped.
 */
export const PoseAvailabilityFunction = {
    /** Answers which poses the arms may take. */
    Arms: 'KDGetAvailablePosesArms',
    /** Answers which poses the legs may take. */
    Legs: 'KDGetAvailablePosesLegs',
} as const

/** One of the two availability functions. */
export type PoseAvailabilityFunction =
    typeof PoseAvailabilityFunction[keyof typeof PoseAvailabilityFunction]

/**
 * The pose-driver words a mod restraint may not carry in its `shrine` list. `shrine` is the
 * membership tag and the game bulk-copies the whole list into the wearer's tag map, which makes it
 * a second, invisible route into the pose system: a controlled item carrying one of these would
 * move the body's configuration outside the controller. `Hogties` matters most: `KDForcedToGround`
 * reads it, and its consumers include the heel level, the slow level and the melee penalty.
 */
export const PoseDrivingShrineWords: readonly string[] = [
    // The arm cascade's own words.
    'BallGags',
    'PlugGags',
    'Hogties',
    'Yokes',
    'Armbinders',
    'Boxbinders',
    'Straitjackets',
    'Crossties',
    'Boxties',
    'Wristties',
    'Petsuits',
    'Fiddles',
    // The lower body's.
    'BlockKneel',
    'HogtieLower',
    'FeetLinked',
    'LegBind',
    'ForceKneel',
]

/**
 * Whether the wrap on the availability functions has been made. `false`, and a marker rather than a
 * switch: a marker keeps the catalogue's `Replace` seam visible on both posture dimensions.
 */
export const PoseRouteBound = false

/**
 * The two controlled posture dimensions, resolved through the catalogue rather than written as
 * literals, so a rename in the catalogue is a compile error here rather than a second spelling.
 */
export const ControlledPoseDimensions: ReadonlyMap<'Arms' | 'Legs', DimensionId> = new Map([
    ['Arms', DimensionIdOf(DimensionName.PoseArms)],
    ['Legs', DimensionIdOf(DimensionName.PoseLegs)],
])

/**
 * The pose the route falls back to when its own algebra empties the set, per limb. The ladder's own
 * first member, derived from the ladders rather than written out, so a reordered ladder cannot
 * leave this map behind.
 */
export const PoseFallback: Readonly<Record<'Arms' | 'Legs', PoseKey>> = {
    Arms: ArmPoseLadder[0],
    Legs: LegPoseLadder[0],
}
