import { AddRestraintWithTextThenGetName, RestraintText } from '../../../../KDInterface/KDExtension'
import { FactionFilter } from '../../../../KDInterface/TextKey'
import { InheritColor } from './Model'
import * as Model from './Model'


const ItemBase: restraint = {
    name: '',
    special: true,
    inventory: false,
    accessible: true,
    Group: '',
    shrine: [
        'Metal',
        'Cuffs',
        // Link.ItemTags.Socket
    ],
    noShrine: true,
    LinkableBy: [
        ...KDDevices,
        ...KDBindable,
        //Link.ItemTags.Link
    ],
    renderWhenLinked: [
        ...KDBindable
    ],
    //alwaysRender: true,

    sfx: 'HydraulicLock',
    sfxRemove: 'HydraulicUnlock',
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
    weight: 0,
    minLevel: 0,
    allFloors: true,
    nonbinding: true,

    playerTags: {},
    enemyTags: {},

    events: [
        {
            trigger: 'postUnlock',
            type: 'RequireLocked',
            inheritLinked: true
        }
    ]
}

export const LightCollar =
    AddRestraintWithTextThenGetName(
        {
            ...ItemBase,
            name: '{F918EAC6-DEE2-4E71-BA76-8BF84BDA173B}',
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
            ...RestraintText.Default,
            DisplayName: 'Drone Collar',
            FlavorText: 'Light'
        }
    )

export const HeavyCollar =
    AddRestraintWithTextThenGetName(
        {
            ...ItemBase,
            name: '{82B14B3F-01C2-4B39-BCD9-6AACEB8E8A95}',
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
            ...RestraintText.Default,
            DisplayName: 'Drone Collar',
            FlavorText: 'Heavy'
        }
    )

export const ArmCuff =
    AddRestraintWithTextThenGetName(
        {
            ...ItemBase,
            name: '{081DC364-EEA5-440D-B4BD-E956F72CD9E5}',
            Model: Model.ArmCuff,
            Group: 'ItemArms',
            shrine: [
                ...ItemBase.shrine,
                'ArmCuffsBase'
            ],
            bindarms: false,
            linkCategory: 'Cuffs',
            linkSize: 0.7,
        },
        {
            ...RestraintText.Default,
            DisplayName: 'Drone Arm Cuff'
        }
    )

export const ElbowCuff =
    AddRestraintWithTextThenGetName(
        {
            ...ItemBase,
            name: '{6724991E-F8F0-41FC-9FCF-8941F63CD821}',
            Model: Model.ElbowCuff,
            Group: 'ItemArms',
            shrine: [
                ...ItemBase.shrine,
                'ArmCuffsBase'
            ],
            bindarms: false,
            linkCategory: 'Cuffs',
            linkSize: 0.4,
        },
        {
            ...RestraintText.Default,
            DisplayName: 'Drone Elbow Cuff'
        }
    )

export const WristCuff =
    AddRestraintWithTextThenGetName(
        {
            ...ItemBase,
            name: '{1E161AB5-4FDA-4AD4-9557-E8816F17A99A}',
            Model: Model.WristCuff,
            Group: 'ItemArms',
            shrine: [
                ...ItemBase.shrine,
                'ArmCuffsBase'
            ],
            bindarms: false,
            linkCategory: 'Cuffs',
            linkSize: 0.4,
        },
        {
            ...RestraintText.Default,
            DisplayName: 'Drone Wrist Cuff'
        }
    )

export const WaistCuff =
    AddRestraintWithTextThenGetName(
        {
            ...ItemBase,
            name: '{D667E4A4-E531-4D2A-B069-6F5CFA7DA2C1}',
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
            ...RestraintText.Default,
            DisplayName: 'Drone Waist Cuff'
        }
    )

export const ThighCuff =
    AddRestraintWithTextThenGetName(
        {
            ...ItemBase,
            name: '{A5EFD394-8E39-4701-BAD4-5B8623619628}',
            Model: Model.ThighCuff,
            Group: 'ItemLegs',
            shrine: [
                ...ItemBase.shrine,
                'LegCuffsBase'
            ],
            linkCategory: 'LegCuffs',
            linkSize: 0.55,
        },
        {
            ...RestraintText.Default,
            DisplayName: 'Drone Thigh Cuff'
        }
    )

export const AnkleCuff =
    AddRestraintWithTextThenGetName(
        {
            ...ItemBase,
            name: '{EB56F491-EE14-4431-B641-C3C397292435}',
            Model: Model.AnkleCuff,
            Group: 'ItemFeet',
            shrine: [
                ...ItemBase.shrine,
                'AnkleCuffsBase'
            ],
            linkCategory: 'AnkleCuffs',
            linkSize: 0.55,
        },
        {
            ...RestraintText.Default,
            DisplayName: 'Drone Ankle Cuff'
        }
    )