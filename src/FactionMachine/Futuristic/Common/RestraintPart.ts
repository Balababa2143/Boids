/**
 * Restraint fragments that every item family in this mod spells out identically.
 *
 * Each is a frozen literal whose value is the same at every use site, so editing one changes every
 * item that spreads it. Values are not shared where sibling items differ: escape chances, power,
 * level requirements and faction filters vary per family.
 * @module FactionMachine/Futuristic/Common/RestraintPart
 */

/** Keeps the restraint on until it is unlocked. Every restraint this mod registers adds it. */
export const RequireLockedEvent = {
    trigger: 'postUnlock',
    type: 'RequireLocked',
    inheritLinked: true,
} satisfies KinkyDungeonEvent

/** Escape chances shared by the flat-harness and muzzle gag families. */
export const GagEscapeChance = {
    Remove: 0.7,
    Struggle: 0.05,
    Unlock: 0.44,
    Pick: 0.27,
    Cut: 0.16,
} satisfies restraint['escapeChance']

/**
 * The "weightless, available from level 0, on every floor" trio most items in
 * the mod share. Spread it only where all three values already match.
 */
export const CommonItemAvailability = {
    weight: 0,
    minLevel: 0,
    allFloors: true,
} satisfies Partial<restraint>
