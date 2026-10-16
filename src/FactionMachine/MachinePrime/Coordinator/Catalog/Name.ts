/**
 * The readable names of the dimensions this faction declares, and the ids they derive.
 *
 * ## Why a name and an id, and which one is written where
 *
 * A dimension's id is `uuidv5('Boids.MachinePrime.Dimension.' + name, Release.Root)` — derived,
 * never picked, exactly like every other identifier in the mod (`design/spec.md` §4.1). A save
 * stores that id as a key in the dossier, so the **id is the persisted half** and the name is
 * the readable one a person writes in code.
 *
 * The pair is kept here, in one file, because the mapping has to be visible in one place for it
 * to be auditable: `test/control-descriptor.test.ts` walks this table rather than guessing at
 * what a catalogue registered.
 *
 * ## Adding a dimension
 *
 * Add a name to {@link DimensionName} and a descriptor to `Dimensions.ts`. Nothing else: the
 * module is total over this object, so a name without a descriptor fails a test, and the
 * persisted shape does not move because a dimension was added.
 * @module FactionMachine/MachinePrime/Coordinator/Catalog/Name
 */

import { DimensionId, Subsystem } from '../../../../KDExtension/Control'

/**
 * Every dimension this mod declares, by subsystem.
 *
 * The split is by **mechanism**, not by body part (`design/spec.md` §6.3), and the three
 * subsystems ship separately and in a fixed order. `Sensory` and `Behavior` are implemented
 * progressively; **`Stats` is declared now and left unused** until the resource system exists,
 * which is a decision rather than an omission.
 *
 * `sight` and `vision` are one dimension, not two: the engine derives both from the single
 * `KinkyDungeonBlindLevel`, and §6.3's word list names the sense rather than the two ways of
 * reading it.
 */
export const DimensionName = {
    /** How blind the wearer is. The dimension the game calls blindness. */
    Sight: 'Sight',
    /** How deaf the wearer is. */
    Hearing: 'Hearing',
    /** How far the wearer's spells reach. */
    SpellRange: 'SpellRange',

    /** How hard the wearer can struggle against what holds her. */
    Struggle: 'Struggle',
    /** Whether she can speak — and, through the chokepoint, who she can speak to. */
    Speech: 'Speech',
    /** Whether she can move. `immobile`-based movement has no seam of its own (§3.2). */
    Movement: 'Movement',
    /** Whether she can attack. */
    Attack: 'Attack',
    /** Whether she can cast. */
    Casting: 'Casting',
    /** Whether she can use what her hands hold — weapons, tools, keys. */
    WeaponUse: 'WeaponUse',
    /** Whether she can escape what she is in. */
    Escape: 'Escape',
    /** Whether she can reach her own arousal. */
    Arousal: 'Arousal',
    /** Whether she can block — raise something against an incoming blow. */
    Defense: 'Defense',
    /**
     * What her hands do to the world: doors, picking things up, eating and drinking, tethers and
     * shrines.
     */
    Interaction: 'Interaction',
    /** Which configurations her arms may take. */
    PoseArms: 'PoseArms',
    /** Which configurations her legs may take. */
    PoseLegs: 'PoseLegs',
    /** How much noise she makes — the shout and moan radii. */
    Noise: 'Noise',

    /** Damage dealt. */
    Damage: 'Damage',
    /** Evasion. */
    Evasion: 'Evasion',
    /** Critical chance. */
    Crit: 'Crit',
    /** Spell accuracy. */
    SpellAccuracy: 'SpellAccuracy',
    /** What an action costs in a resource. Higher target means dearer. */
    ResourceCost: 'ResourceCost',
    /** The ceiling a stat may reach. */
    StatCeiling: 'StatCeiling',
    /** How far she can sprint. */
    Sprint: 'Sprint',
} as const

/** One dimension's readable name. */
export type DimensionName = typeof DimensionName[keyof typeof DimensionName]

/**
 * The name table, grouped the way the subsystems ship.
 *
 * Grouped rather than flat because the grouping is a claim that can be checked: every subsystem
 * in `Subsystem` has to appear here, and `test/control-descriptor.test.ts` fails on a name whose
 * descriptor claims a different subsystem than this table lists it under.
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
 * The id a readable name derives to.
 *
 * **A lookup rather than a fresh derivation**, so an id can only be obtained for a name this
 * table declares: deriving an id for a name nobody registered would mint an identifier for a
 * dimension that does not exist, and it would be a legal key in the dossier forever.
 *
 * @param name - A name from {@link DimensionName}. Unknown names throw, because every caller
 *   holds a literal from this table.
 */
export const DimensionIdOf = (name: DimensionName): string => {
    if (!(name in DimensionName) || DimensionName[name as keyof typeof DimensionName] !== name) {
        throw new Error(
            `Boids control: '${name}' is not one of the declared dimension names, so it has no id.`
        )
    }
    return DimensionId(name)
}
