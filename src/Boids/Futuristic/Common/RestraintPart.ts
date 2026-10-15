/**
 * Restraint fragments that every item family in this mod spells out identically.
 *
 * These are extracted because they were literally repeated, not to build a
 * template system: each is a small frozen literal whose value is the same at
 * every use site, so replacing the copies changes no registered restraint. The
 * registration manifest is the check on that.
 *
 * Values are deliberately *not* shared where sibling items differ: escape
 * chances, power, level requirements and faction filters vary per family, and
 * collapsing those would change item behaviour.
 * @module Boids/Futuristic/Common/RestraintPart
 */

/**
 * "This restraint stays on until it is unlocked", which every restraint the mod
 * registers adds to its `events`.
 */
export const RequireLockedEvent = {
    trigger: 'postUnlock',
    type: 'RequireLocked',
    inheritLinked: true,
} satisfies KinkyDungeonEvent

/**
 * Escape chances shared by the flat-harness and muzzle gag families, used by
 * `Gag/Common.MakeItem`, `Gag/FaceCover.MakeStrap` and `Gag/FaceCover.MakeMuzzle`.
 */
export const GagEscapeChance = {
    Remove: 0.7,
    Struggle: 0.05,
    Unlock: 0.44,
    Pick: 0.27,
    Cut: 0.16,
} satisfies restraint['escapeChance']

/**
 * The "weightless, available from level 0, on every floor" trio that most items
 * in the mod share. Spread it where the three values already match.
 */
export const CommonItemAvailability = {
    weight: 0,
    minLevel: 0,
    allFloors: true,
} satisfies Partial<restraint>
