/**
 * The readable names of the dimensions this faction declares, and the ids they derive. A
 * dimension's id is derived from its name and the release root, never picked, and a save stores
 * that id as a key in the dossier: the id is the persisted half and the name is the readable one.
 * Adding a dimension is a name in {@link DimensionName} and a descriptor in `Dimensions.ts`; the
 * persisted shape does not move.
 * @module FactionMachine/MachinePrime/Coordinator/Catalog/Name
 */

import { DimensionId, Subsystem } from '../../../../KDExtension/Control'

/**
 * Every dimension this mod declares, by subsystem. The split is by mechanism, not by body part, and
 * the three subsystems ship separately in a fixed order. `sight` and `vision` are one dimension, not
 * two: the engine derives both from the single `KinkyDungeonBlindLevel`.
 */
export const DimensionName = {
    /** How blind the wearer is: the dimension the game calls blindness. */
    Sight: 'Sight',
    Hearing: 'Hearing',
    SpellRange: 'SpellRange',

    /** Both a permission and a difficulty; its config names the struggle types it governs. */
    Struggle: 'Struggle',
    /** Whether she can speak — and, through the chokepoint, who she can speak to. */
    Speech: 'Speech',
    /** `immobile`-based movement has no seam of its own. */
    Movement: 'Movement',
    Attack: 'Attack',
    Casting: 'Casting',
    /** Whether she can use what her hands hold — weapons, tools, keys. */
    WeaponUse: 'WeaponUse',
    Escape: 'Escape',
    Arousal: 'Arousal',
    Defense: 'Defense',
    /**
     * What her hands do to the world: doors, picking things up, eating, drinking, tethers, shrines.
     */
    Interaction: 'Interaction',
    PoseArms: 'PoseArms',
    PoseLegs: 'PoseLegs',
    /** The shout and moan radii. */
    Noise: 'Noise',

    Damage: 'Damage',
    Evasion: 'Evasion',
    Crit: 'Crit',
    SpellAccuracy: 'SpellAccuracy',
    /** What an action costs in a resource. Higher target means dearer. */
    ResourceCost: 'ResourceCost',
    StatCeiling: 'StatCeiling',
    Sprint: 'Sprint',
} as const

/** One dimension's readable name. */
export type DimensionName = typeof DimensionName[keyof typeof DimensionName]

/**
 * The name table, grouped the way the subsystems ship. Every subsystem in `Subsystem` has to appear
 * here, and a name whose descriptor claims a different subsystem than this table lists it under is
 * an error.
 */
export const DimensionNamesBySubsystem = {
    [Subsystem.Sensory]: [
        DimensionName.Sight,
        DimensionName.Hearing,
        DimensionName.SpellRange,
    ],
    [Subsystem.Stats]: [
        DimensionName.Damage,
        DimensionName.Evasion,
        DimensionName.Crit,
        DimensionName.SpellAccuracy,
        DimensionName.ResourceCost,
        DimensionName.StatCeiling,
        DimensionName.Sprint,
    ],
    [Subsystem.Behavior]: [
        DimensionName.Struggle,
        DimensionName.Speech,
        DimensionName.Movement,
        DimensionName.Attack,
        DimensionName.Casting,
        DimensionName.WeaponUse,
        DimensionName.Escape,
        DimensionName.Arousal,
        DimensionName.Defense,
        DimensionName.Interaction,
        DimensionName.PoseArms,
        DimensionName.PoseLegs,
        DimensionName.Noise,
    ],
} as const satisfies Record<Subsystem, readonly DimensionName[]>

/** Every readable name, in the order the table lists them, the subsystems in build order. */
export const AllDimensionNames: readonly DimensionName[] = [
    ...DimensionNamesBySubsystem[Subsystem.Sensory],
    ...DimensionNamesBySubsystem[Subsystem.Stats],
    ...DimensionNamesBySubsystem[Subsystem.Behavior],
]

/**
 * The id a readable name derives to. A lookup rather than a fresh derivation, so an id can only be
 * obtained for a name this table declares: an id minted for an unregistered name would be a legal
 * dossier key forever. Unknown names throw.
 * @param name - A name from {@link DimensionName}.
 */
export const DimensionIdOf = (name: DimensionName): string => {
    if (!(name in DimensionName) || DimensionName[name as keyof typeof DimensionName] !== name) {
        throw new Error(
            `Boids control: '${name}' is not one of the declared dimension names, so it has no id.`
        )
    }
    return DimensionId(name)
}
