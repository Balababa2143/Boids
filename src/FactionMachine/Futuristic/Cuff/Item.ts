/**
 * The drone collar and cuff restraint family: the two collars, and the cuffs for arm, elbow, wrist,
 * waist, thigh and ankle. All eight are built on one shared template that marks them non-binding,
 * unlimited and lock-required, and each then declares only what tells it apart: its model, its
 * body-slot group and its link category. The tethers that attach to these cuffs live in
 * `Futuristic/Link`.
 *
 * ## Why a variant map rather than eight literals
 *
 * It used to be eight `AddRestraintWithTextThenGetName` calls, each spreading `ItemBase` and repeating
 * its own `Group`, `shrine`, `LinkableBy`, `renderWhenLinked` and text. Every registered name was a
 * hand-written GUID, which made the family **unversionable**: nothing could recognise or retire one of
 * those names programmatically, and a copy-paste between two of them was invisible.
 *
 * As a map, the eight differ in the fields `CuffItemParts` states and nothing else, and every name is
 * `uuidv5(JSON.stringify({Name: kind}), baseId)`. That is what lets `Internal/Integrity.ts` recompute a
 * name at load and compare it against the one the game has.
 *
 * ## The names changed, and are not migrated
 *
 * The generated names differ from the literals they replace. There is **no migration**: 0.5.0 has not
 * shipped, so no save in the world resolves the old names. From the first release onward this is a
 * migration rather than a rename, and `KDExtension/Release.ts` says so.
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
 * The parts every collar and cuff shares: a special, non-inventory, accessible restraint that is not
 * binding and can be worn unlimited times, that requires a lock to come off, and that announces
 * itself as a **participant in the control model** through {@link ControlledTag}.
 *
 * The membership tag is the contract's first clause (`design/spec.md` §6.12): an item that carries it
 * is one the controller computes capability from, and an item that does not is invisible to the
 * control model no matter what it does. It is in the shared template because the whole family
 * participates or none of it does.
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

/**
 * The per-kind parts, and the **single statement** of every difference between the eight.
 *
 * A table rather than eight literals because the differences are exactly the interesting part: read
 * down one column and the family's shape is visible, where eight 30-line literals hid it.
 */
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
    // The model is named from the map the model half returned, so the restraint can only ever carry a
    // model that was actually registered for its own kind.
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
 * The **registered restraint name** for each kind.
 *
 * A lookup rather than eight exported names, because a name here is a generated identifier and a caller
 * has no use for the literal: `GetCuff(kind)` is typed by the same union the parts table is, so an
 * unknown kind is a compile error rather than an undefined name at runtime.
 *
 * ## It is the *restraint* name, not the variant name, and the difference matters
 *
 * Each variant of this family is registered as a **restraint**, and `BuildVariantMap`'s key is the
 * restraint's name — so this is exactly what `KinkyDungeonGetRestraintByName` resolves, and exactly
 * what the game's equip entry points expect to be handed.
 *
 * The *variant* name (`uuidv5(key, baseId)`) is minted separately, when the game equips a variant and
 * records it under `KinkyDungeonRestraintVariants`. Handing a variant name to a `ByName` lookup finds
 * nothing and the equip silently does nothing, which is the failure this comment exists to prevent.
 */
export const CuffRestraints: IMMap<CuffKind, string> =
    AddRestraintVariantMapToGame(builder.BuildVariantMap(ItemBase))

/**
 * The registered restraint for one kind, throwing rather than answering `undefined`.
 *
 * @param kind - One of the eight. The parameter is the family's own union, so a typo cannot reach here
 *   from TypeScript; the throw is for a caller holding a string from somewhere untyped.
 */
export const GetCuff = (kind: CuffKind): string =>
    ThrowIfNull(CuffRestraints.get(kind), `Boids: no restraint was registered for '${kind}'.`)
