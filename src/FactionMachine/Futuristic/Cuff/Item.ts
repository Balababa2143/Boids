/**
 * The drone collar and cuff restraint family: the two collars, and the cuffs for arm, elbow, wrist,
 * waist, thigh and ankle.
 *
 * All eight are built on one shared template and each declares only what tells it apart; every name
 * is `uuidv5(JSON.stringify({Name: kind}), baseId)`. The tethers that attach to these cuffs live in
 * `Futuristic/Link`.
 * @module FactionMachine/Futuristic/Cuff/Item
 */

import { Map as IMMap } from 'immutable'
import { AddRestraintVariantMapToGame, RestraintVariantMapBuilder, VariantPart } from '../../../KDExtension'
import { DerivedVariantBase } from '../../../KDExtension/Release'
import { ThrowIfNull } from '../../../Utilities'
import { ControlledTag } from '../../MachinePrime/Coordinator/Membership'
import { RequireLockedEvent, CommonItemAvailability, SFX } from '../Common'
import { FactionFilter } from '../../../KDInterface/TextKey'
import { CuffKind, CuffKinds } from './Common'
import { CuffModelNames, InheritColor } from './Model'
import { Socket } from '../Link'

/**
 * The parts every collar and cuff shares: special, non-inventory, accessible, non-binding and
 * wearable unlimited times, requiring a lock to come off.
 *
 * It carries {@link ControlledTag} in `shrine`: an item without that tag is invisible to the
 * control model however it behaves, and the whole family participates or none of it does.
 */
const ItemBase = {
    special: true,
    inventory: false,
    accessible: true,
    shrine: [
        'Metal',
        'Cuffs',
        ControlledTag,
    ],
    noShrine: true,
    LinkableBy: [
        ...KDDevices,
        ...KDBindable,
    ],
    renderWhenLinked: [
        ...KDBindable
    ],

    ...SFX.MechanicalLockSfx,
    Model: '',
    factionFilters: {
        [InheritColor.BaseMetal]: {
            color: FactionFilter.DarkNeutral,
            override: true
        },
        [InheritColor.Display]: {
            color: FactionFilter.Highlight,
            override: true
        },
        [InheritColor.Screen]: {
            color: FactionFilter.LightNeutral,
            override: true
        },
        [InheritColor.Lock]: {
            color: FactionFilter.DarkNeutral,
            override: true
        },
    },
    preview: 'CyberCuffs',

    escapeChance: {
        Remove: 0.2,
        Struggle: -1,
        Pick: 0.01,
        Unlock: 0.32,
        Cut: -0.8
    },

    noDupe: true,
    unlimited: true,
    power: 15,
    ...CommonItemAvailability,
    nonbinding: true,

    playerTags: {},
    enemyTags: {},

    events: [
        RequireLockedEvent
    ]
} satisfies Partial<restraint>

/**
 * What a variant declares: the fields that tell one collar or cuff from another.
 *
 * `Group` and the link fields are what the game reads to decide where the item sits and what may
 * attach to it; the rest is the two text lines a player reads.
 */
interface CuffItemParts {
    /** The second word of the display name, e.g. `Drone Collar` or `Drone Wrist Cuff`. */
    readonly Kind: string
    /** The flavour word, and the only thing that tells two collars or two belts apart in a list. */
    readonly Flavor?: string
}

/** The per-kind parts: every difference between the eight. */
const CuffItemParts: Readonly<Record<CuffKind, VariantPart<restraint> & CuffItemParts>> = {
    LightCollar: {
        Kind: 'Drone Collar',
        Flavor: 'Light',
        Group: 'ItemNeck',
        shrine: [
            'Metal',
            'Collars',
        ],
        LinkableBy: [
            ...KDCollarLink
        ],
        renderWhenLinked: [
            ...KDCollarRender
        ],
        playerTags: {
            'ItemNeckEmpty': 10
        },
        linkCategory: 'BasicCollar',
        linkSize: 0.55,
    },
    HeavyCollar: {
        Kind: 'Drone Collar',
        Flavor: 'Heavy',
        Group: 'ItemNeck',
        shrine: [
            'Metal',
            'Collars',
        ],
        LinkableBy: [
            ...KDCollarLink
        ],
        renderWhenLinked: [
            ...KDCollarRender
        ],
        playerTags: {
            'ItemNeckEmpty': 10
        },
        linkCategory: 'BasicCollar',
        linkSize: 0.55,
    },
    ArmCuff: {
        Kind: 'Drone Arm Cuff',
        Group: 'ItemArms',
        shrine: [
            'ArmCuffsBase',
            Socket.Wrist,
            Socket.Elbow,
        ],
        bindarms: false,
        linkCategory: 'Cuffs',
        linkSize: 0.7,
    },
    ElbowCuff: {
        Kind: 'Drone Elbow Cuff',
        Group: 'ItemArms',
        shrine: [
            'ArmCuffsBase',
            Socket.Elbow,
        ],
        bindarms: false,
        linkCategory: 'Cuffs',
        linkSize: 0.4,
    },
    WristCuff: {
        Kind: 'Drone Wrist Cuff',
        Group: 'ItemArms',
        shrine: [
            'ArmCuffsBase',
            Socket.Wrist,
        ],
        bindarms: false,
        linkCategory: 'Cuffs',
        linkSize: 0.4,
    },
    WaistCuff: {
        Kind: 'Drone Waist Cuff',
        Group: 'ItemTorso',
        shrine: [
            'WaistBelts',
        ],
        LinkAll: true,
        AlwaysLinkable: true,
        linkCategory: 'WaistBelt',
        linkSize: 0.55,
    },
    ThighCuff: {
        Kind: 'Drone Thigh Cuff',
        Group: 'ItemLegs',
        shrine: [
            Socket.Thigh,
            'LegCuffsBase',
        ],
        linkCategory: 'LegCuffs',
        linkSize: 0.55,
    },
    AnkleCuff: {
        Kind: 'Drone Ankle Cuff',
        Group: 'ItemFeet',
        shrine: [
            'AnkleCuffsBase',
            Socket.Ankle,
        ],
        linkCategory: 'AnkleCuffs',
        linkSize: 0.55,
    },
}

const builder = new RestraintVariantMapBuilder<CuffKind>({
    baseId: DerivedVariantBase.CuffRestraint,
})

for (const kind of CuffKinds) {
    const parts = CuffItemParts[kind]
    // The model comes from the model half's map, so a restraint carries only its own.
    builder.AddVariantPart(kind, {
        Model: ThrowIfNull(CuffModelNames.get(kind), `Boids: no model was registered for '${kind}'.`),
        ...parts,
    } as VariantPart<restraint>)
    builder.AddText(kind, {
        DisplayName: parts.Kind,
        FlavorText: parts.Flavor,
    })
}

/**
 * The registered restraint name for each kind, which is the name `KinkyDungeonGetRestraintByName`
 * resolves and what the game's equip entry points expect to be handed.
 *
 * A variant name — minted per equip and recorded under `KinkyDungeonRestraintVariants` — resolves
 * to nothing here, and the equip silently does nothing.
 */
export const CuffRestraints: IMMap<CuffKind, string> =
    AddRestraintVariantMapToGame(builder.BuildVariantMap(ItemBase))

/**
 * The registered restraint for one kind, throwing rather than answering `undefined`.
 *
 * @param kind - The family's own union, so a typo cannot reach here from TypeScript. The throw is
 *   for a caller holding a string from somewhere untyped.
 */
export const GetCuff = (kind: CuffKind): string =>
    ThrowIfNull(CuffRestraints.get(kind), `Boids: no restraint was registered for '${kind}'.`)
