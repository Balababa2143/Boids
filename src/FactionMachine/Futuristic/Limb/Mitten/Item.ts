/**
 * The three arm restraints that wear the long mitten models: a sleeve, a bare wire
 * cuff, and the long mitten itself.
 *
 * All three share one base literal -- the `ItemArms` group, the device and bindable
 * link sets, the mechanical lock sound, and escape chances with a strongly negative
 * struggle value, so struggling is a poor route out -- and they differ in their model,
 * their shrine tags and how much they bind the hands.
 *
 * They are shrine-proof, weightless at level 0 on every floor, unduplicable, and always
 * allowed to be applied.
 * @module FactionMachine/Futuristic/Limb/Mitten/Item
 */

import { AddRestraintWithTextThenGetName } from '../../../../KDExtension'
import { FactionFilter } from '../../../../KDInterface/TextKey'
import { ControlledTag } from '../../../MachinePrime/Coordinator/Tag'
import { SFX, CommonItemAvailability } from '../../Common'
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
        'Metal',
        ControlledTag,
        // Socket.Mitten
    ],
    noShrine: true,

    Model: '',
    ...SFX.MechanicalLockSfx,

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
    ...CommonItemAvailability,

    playerTags: {},
    enemyTags: {},
} satisfies Partial<restraint>

/**
 * The `Drone Sleeve`: the arm item that draws the sleeve art, tagged `Gloves` and
 * anchored on `Link.Socket.Wrist`.
 */
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

/**
 * The `Drone Wire Cuff`: tagged `Cuffs` and anchored on `Link.Socket.Wrist`, drawing
 * the mitten bands without the sleeve.
 */
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

/**
 * The `Drone Long Mitten`: tagged `LongMittens` and `Mittens`, and the only one of the
 * three that binds the hands (`bindhands: 1.4`), so the wearer loses the use of weapons
 * and picks.
 */
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