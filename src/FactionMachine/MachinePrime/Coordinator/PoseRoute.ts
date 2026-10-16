/**
 * The posture route, **declared and deliberately not bound**.
 *
 * ## What this module is
 *
 * `design/spec.md` §6.13 states a route that is unlike every other one in the model: a posture
 * dimension is routed **directly from the controller to the game's own pose system**, because the
 * base game offers neither a `calc*` seam nor a `forceResult` guard for it. The two functions that
 * answer *which poses may she take* are **pure functions with no event**
 * (`Data/Poses.ts:382, :477`), so the only way in is §6.2's fourth seam kind — **replace** — by
 * wrapping the global.
 *
 * This module holds **the declaration**: the two globals, the words a mod restraint may not put in
 * its `shrine`, the game's own sentinel, and the flag that says the wrap has not been made. It
 * **does not wrap anything**, and that is the current phase's constraint rather than an oversight:
 * the catalogue names the seam so a partial implementation is loud (§6.2), and `PoseRouteBound`
 * below is `false` so nothing can mistake the declaration for the binding.
 *
 * ## The route, in the order it runs
 *
 * 1. **Attach at the availability functions** by wrapping the two globals. The mod already wraps
 *    two game globals at module evaluation, so this is an established technique rather than a new
 *    one.
 * 2. **When the controller has a demand, its set overrides the game's answer.** The base game's tag
 *    cascade is consulted **only** when the gate is `Free`. Filtering instead of overriding would
 *    defeat half the route: the cascade assigns a **single** pose the moment one shrine word matches
 *    (`:484-498`), and a single-element set cannot be widened by subtraction.
 * 3. **Subtract first, then add**, and **allow wins** — the same algebra the router already applies,
 *    so the wrap writes `DimensionResolution.Posture` and computes nothing.
 * 4. **The result is never empty.** The game's own sentinel runs **after** both operations.
 * 5. **A mod restraint declares no pose fields** — not `addPose`, not `addPoseIfTopLevel`, not
 *    `removePose` (`base/KDTypeDefs.ts:530-538`).
 * 6. **A mod restraint's `shrine` carries no pose-driver word** — see
 *    {@link PoseDrivingShrineWords}.
 * 7. **A `<name>Worn` pose is not a posture.** The game injects one per worn restraint for rendering
 *    (`Data/Poses.ts:682`). That is the item's appearance declaration, not the controller's business.
 * 8. **The availability function reads its own output back** — `CheckPoseOrTags` consults `Poses`
 *    and `TempPoses` (`:370-377`) — and under rule 2 that feedback does not exist for a controlled
 *    dimension. **Recorded as intended, not as a defect.**
 * @module FactionMachine/MachinePrime/Coordinator/PoseRoute
 */

import { ArmPoseLadder, DimensionId, LegPoseLadder, PoseKey } from '../../../KDExtension/Control'
import { DimensionIdOf, DimensionName } from './Catalog/Name'

/**
 * The two globals the route wraps, by their engine names.
 *
 * A `Replace` seam has no trigger bucket to hang on, so its `Trigger` is **the name of the function
 * being wrapped** — see `Control/Descriptor.ts`. Naming them here rather than in the descriptor
 * alone is what lets the phase that binds the wrap import the name it is wrapping instead of
 * retyping it.
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
 * The pose-driver words a mod restraint may **not** carry in its `shrine` list.
 *
 * `shrine` is the membership tag (§6.12 clause 1) and the game bulk-copies the whole list into the
 * wearer's tag map (`restraint/KinkyDungeonRestraints.ts:4245-4248`), which makes it a **second,
 * invisible route into the pose system**. A controlled item that carried one of these would move the
 * body's configuration outside the controller — which is precisely what this route exists to
 * prevent.
 *
 * The list is the cascade's own words (`Data/Poses.ts:484-521`), `BallGags` and `PlugGags`
 * (`:683-686`), and the lower-body family. **`Hogties` matters most of all:**
 * `KDForcedToGround` reads it (`player/KinkyDungeonStats.ts:2573-2575`) and its consumers include
 * the heel level, the slow level and the melee penalty — so one word there moves the lower body's
 * numbers outside the controller.
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
 * Whether the wrap on the availability functions has been made.
 *
 * **`false`, and it is a marker rather than a switch.** The catalogue already names the `Replace`
 * seam on both posture dimensions, which is what keeps a half-built dimension visible rather than
 * silently wrong (§6.2) — and this is the other half of the same statement: a caller can ask
 * whether the route is live without reading the source. The phase that binds the wrap replaces this
 * with `true` **in the same commit**, so the two can never disagree for longer than a diff.
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
 * The pose the route falls back to when its own algebra empties the set, per limb.
 *
 * It is **the ladder's own first member**, which is the same value the router's non-empty sentinel
 * uses (§6.7, invariant 23) and the same pose the game's own cascade reaches for first
 * (`Data/Poses.ts:459-467`). Rule 4 has the game's sentinel run after both operations; this is the
 * controller's half of the same guarantee, and the two agree because every ladder is ordered so its
 * first member is the one every rig can draw.
 *
 * Derived from the ladders rather than written out, so a ladder that was reordered could not leave
 * this map behind — which is the one way the two halves of the guarantee could come to disagree.
 */
export const PoseFallback: Readonly<Record<'Arms' | 'Legs', PoseKey>> = {
    Arms: ArmPoseLadder[0],
    Legs: LegPoseLadder[0],
}
