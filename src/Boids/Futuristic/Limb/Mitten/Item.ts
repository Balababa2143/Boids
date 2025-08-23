import { AddRestraintWithTextThenGetName } from '../../../../KDInterface/KDExtension'
import { FactionFilter } from '../../../../KDInterface/TextKey'
import { MechanichalLockSfx } from '../../Common'
import { Socket } from '../../Link'
import { InheritColor } from './Layer'
import * as Model from './Model'

const ItemBase = {
    Group: 'ItemArms',
    inventory: true,
    accessible: true,
    special: true,
    noDupe: true,
    unlimited: true,

    shrine: [
        'Metal'
        // Socket.Mitten
    ],
    noShrine: true,

    Model: '',
    ...MechanichalLockSfx,

    LinkableBy: [
        ...KDDevices,
        ...KDBindable
    ],
    bindarms: false,
    linkCategory: 'Cuffs',
    linkSize: 0.55,
    renderWhenLinked: [
        ...KDBindable
    ],

    preview: 'CyberMittens',
    factionFilters: {
        [InheritColor.Mitten]: {
            color: FactionFilter.Catsuit,
            override: false
        },
        [InheritColor.Straps]: {
            color: FactionFilter.DarkNeutral,
            override: true
        },
        [InheritColor.Cap]: {
            color: FactionFilter.LightNeutral,
            override: false
        },
        [InheritColor.Cuff]: {
            color: FactionFilter.DarkNeutral,
            override: true
        },
        [InheritColor.UpperCuff]: {
            color: FactionFilter.DarkNeutral,
            override: true
        },
        [InheritColor.Display]: {
            color: FactionFilter.Highlight,
            override: true
        },
        [InheritColor.UpperDisplay]: {
            color: FactionFilter.Highlight,
            override: true
        },
        [InheritColor.Lock]: {
            color: FactionFilter.DarkNeutral,
            override: true
        },
        [InheritColor.UpperLock]: {
            color: FactionFilter.DarkNeutral,
            override: true
        },
        [InheritColor.Glow]: {
            color: FactionFilter.Highlight,
            override: true
        },
        [InheritColor.UpperGlow]: {
            color: FactionFilter.Highlight,
            override: true
        },
    },

    escapeChance: {
        Remove: 0.13,
        Struggle: -1,
        Pick: 0,
        Unlock: 0.22,
        Cut: -0.8
    },

    power: 0,
    weight: 0,
    minLevel: 0,
    allFloors: true,

    playerTags: {},
    enemyTags: {},
} satisfies Partial<restraint>

export const Sleeve = AddRestraintWithTextThenGetName(
    {
        ...ItemBase,
        name: 'FC75F4CB-A745-45D4-A7F4-FA9A786F70EC',
        Model: Model.Sleeve,
        shrine: [
            ...ItemBase.shrine,
            // Socket.Elbow
            Socket.Wrist,
            'Gloves',
        ],
    },
    {
        DisplayName: 'Drone Sleeve'
    }
)

export const WireCuff = AddRestraintWithTextThenGetName(
    {
        ...ItemBase,
        name: 'CEB2873B-E378-4C2B-A1ED-47618FD801DB',
        Model: Model.WireCuff,
        shrine: [
            ...ItemBase.shrine,
            // Socket.Elbow
            Socket.Wrist,
            'Cuffs',
        ],
    },
    {
        DisplayName: 'Drone Wire Cuff'
    }
)

export const LongMitten = AddRestraintWithTextThenGetName(
    {
        ...ItemBase,
        name: 'D76F027D-E788-42C3-9B49-94B52F0F3C7F',
        Model: Model.LongMitten,
        shrine: [
            ...ItemBase.shrine,
            // Socket.Elbow
            Socket.Wrist,
            'LongMittens',
            'Mittens',
        ],
        bindhands: 1.4,
    },
    {
        DisplayName: 'Drone Long Mitten'
    }
)