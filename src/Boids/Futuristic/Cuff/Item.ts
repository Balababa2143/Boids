/**
 * The drone collar and cuff restraint family: the two collars, and the cuffs for
 * arm, elbow, wrist, waist, thigh and ankle. All eight are built on one shared base
 * that marks them non-binding, unlimited and lock-required, and each is then given
 * its own model, body-slot group and link category. The tethers that attach to
 * these cuffs live in `Futuristic/Link`.
 *
 * Every export is the registered restraint's name, a generated GUID, and the
 * display text the item shows is written as a side effect of registering it.
 * @module Boids/Futuristic/Cuff/Item
 */

import { AddRestraintWithTextThenGetName } from '../../../KDExtension'
import { RequireLockedEvent, CommonItemAvailability, SFX } from '../Common'
import { FactionFilter } from '../../../KDInterface/TextKey'
import { InheritColor } from './Model'
import * as Model from './Model'
import { Socket } from '../Link'

const ItemBase = {
    special: true,
    inventory: false,
    accessible: true,
    shrine: [
        'Metal',
        'Cuffs',
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
    // debris: 'Chains',
    // struggleBreak: true,

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
 * The slim neck collar, shown as "Drone Collar" with "Light" as its flavour word.
 * Worn in `ItemNeck` and linkable by the game's collar links, so tethers attach to
 * it directly.
 */
export const LightCollar =
    AddRestraintWithTextThenGetName(
        {
            ...ItemBase,
            name: 'F918EAC6-DEE2-4E71-BA76-8BF84BDA173B',
            Model: Model.LightCollar,
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
                ...ItemBase.playerTags,
                'ItemNeckEmpty': 10
            },
            linkCategory: 'BasicCollar',
            linkSize: 0.55,
        },
        {
            
            DisplayName: 'Drone Collar',
            FlavorText: 'Light'
        }
    )

/**
 * The thick neck collar: "Drone Collar", flavour word "Heavy". Same `ItemNeck`
 * placement and collar links as {@link LightCollar}, over the heavier
 * `FutureCollar` model.
 */
export const HeavyCollar =
    AddRestraintWithTextThenGetName(
        {
            ...ItemBase,
            name: '82B14B3F-01C2-4B39-BCD9-6AACEB8E8A95',
            Model: Model.HeavyCollar,
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
                ...ItemBase.playerTags,
                'ItemNeckEmpty': 10
            },
            linkCategory: 'BasicCollar',
            linkSize: 0.55,
        },
        {
            DisplayName: 'Drone Collar',
            FlavorText: 'Heavy'
        }
    )

/**
 * The upper-arm cuff, "Drone Arm Cuff", in `ItemArms`. It sets `bindarms: false`
 * and is non-binding, so what it is for is to be something a link or a tether
 * attaches to; it offers both the wrist and the elbow socket for that.
 */
export const ArmCuff =
    AddRestraintWithTextThenGetName(
        {
            ...ItemBase,
            name: '081DC364-EEA5-440D-B4BD-E956F72CD9E5',
            Model: Model.ArmCuff,
            Group: 'ItemArms',
            shrine: [
                ...ItemBase.shrine,
                'ArmCuffsBase',
                Socket.Wrist,
                Socket.Elbow
            ],
            bindarms: false,
            linkCategory: 'Cuffs',
            linkSize: 0.7,
        },
        {
            
            DisplayName: 'Drone Arm Cuff'
        }
    )

/**
 * The elbow cuff, "Drone Elbow Cuff", in `ItemArms`, offering only the elbow
 * socket. Like the other cuffs it does not bind the arms.
 */
export const ElbowCuff =
    AddRestraintWithTextThenGetName(
        {
            ...ItemBase,
            name: '6724991E-F8F0-41FC-9FCF-8941F63CD821',
            Model: Model.ElbowCuff,
            Group: 'ItemArms',
            shrine: [
                ...ItemBase.shrine,
                'ArmCuffsBase',
                Socket.Elbow
            ],
            bindarms: false,
            linkCategory: 'Cuffs',
            linkSize: 0.4,
        },
        {
            DisplayName: 'Drone Elbow Cuff'
        }
    )

/**
 * The wrist cuff, "Drone Wrist Cuff", in `ItemArms`, offering only the wrist
 * socket. Like the other cuffs it does not bind the arms.
 */
export const WristCuff =
    AddRestraintWithTextThenGetName(
        {
            ...ItemBase,
            name: '1E161AB5-4FDA-4AD4-9557-E8816F17A99A',
            Model: Model.WristCuff,
            Group: 'ItemArms',
            shrine: [
                ...ItemBase.shrine,
                'ArmCuffsBase',
                Socket.Wrist
            ],
            bindarms: false,
            linkCategory: 'Cuffs',
            linkSize: 0.4,
        },
        {   
            DisplayName: 'Drone Wrist Cuff'
        }
    )

/**
 * The waist cuff, "Drone Waist Cuff", in `ItemTorso`. Unlike its siblings it is
 * linkable over anything below it and can itself be linked by anything on top, so a
 * link need not match its category to be anchored here.
 */
export const WaistCuff =
    AddRestraintWithTextThenGetName(
        {
            ...ItemBase,
            name: 'D667E4A4-E531-4D2A-B069-6F5CFA7DA2C1',
            Model: Model.WaistCuff,
            Group: 'ItemTorso',
            shrine: [
                ...ItemBase.shrine,
                'WaistBelts'
            ],
            LinkAll: true,
            AlwaysLinkable: true,
            linkCategory: 'WaistBelt',
            linkSize: 0.55,
        },
        {
            DisplayName: 'Drone Waist Cuff'
        }
    )

/**
 * The thigh cuff, "Drone Thigh Cuff", in `ItemLegs`, linkable at the thigh socket.
 * It does not block or hobble the legs; a link is what would do that.
 */
export const ThighCuff =
    AddRestraintWithTextThenGetName(
        {
            ...ItemBase,
            name: 'A5EFD394-8E39-4701-BAD4-5B8623619628',
            Model: Model.ThighCuff,
            Group: 'ItemLegs',
            shrine: [
                ...ItemBase.shrine,
                Socket.Thigh,
                'LegCuffsBase'
            ],
            linkCategory: 'LegCuffs',
            linkSize: 0.55,
        },
        {          
            DisplayName: 'Drone Thigh Cuff'
        }
    )

/**
 * The ankle cuff, "Drone Ankle Cuff", in `ItemFeet`, linkable at the ankle socket.
 * It does not block or hobble the feet; a link is what would do that.
 */
export const AnkleCuff =
    AddRestraintWithTextThenGetName(
        {
            ...ItemBase,
            name: 'EB56F491-EE14-4431-B641-C3C397292435',
            Model: Model.AnkleCuff,
            Group: 'ItemFeet',
            shrine: [
                ...ItemBase.shrine,
                'AnkleCuffsBase',
                Socket.Ankle
            ],
            linkCategory: 'AnkleCuffs',
            linkSize: 0.55,
        },
        {
            DisplayName: 'Drone Ankle Cuff'
        }
    )