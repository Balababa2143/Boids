import * as KDEx from '../../../KDInterface/KDExtension'
import { FactionFilter } from '../../../KDInterface/TextKey'
import { InheritColor } from './GagMetal'

export enum LinkPriority {
    Muzzle = 50,
    MuzzleMuffler = Muzzle - 10,
    MuzzlePlug = Muzzle + 10
}

/** Shrine for muzzle that can be mounted by mufflers */
export const MufflerSocket = "{DC286164-4B5D-41DD-A260-72EAE44C610D}"

/** Shrine for muzzle that can be mounted by mufflers */
export const Muffler = "{4339E6A8-D10E-4AB1-83BA-0A354B296CEE}"

/** Shrine for muzzle that can be mounted by mufflers */
export const MuzzleAttachment = "{F38A19FC-CE21-48FD-AEB6-77E29C8B60D8}"

export const PlugSocket = "{A5D48002-9255-48AF-A7A9-23885EC910AD}"

export const Plug = "{B5B65E3B-B0A6-46DA-91C3-FF115639C001}"

const itemBase: restraint = {
    name: "",
    Group: "ItemMouth",
    shrine: ["Gags", "Metal"],
    noShrine: true,
    // TODO: Disable this for mounted items
    inventory: true,
    special: true,
    Model: "",
    noDupe: true,

    factionFilters: {
        [InheritColor.BaseMetal]: {
            color: FactionFilter.LightNeutral,
            override: true
        },
        [InheritColor.DecorationMetal]: {
            color: FactionFilter.DarkNeutral,
            override: true
        },
        [InheritColor.Light]: {
            color: FactionFilter.Highlight,
            override: true
        },
        [InheritColor.Ball]: {
            color: FactionFilter.Catsuit,
            override: false
        },
    },


    escapeChance: {
        Remove: 0.2,
        Struggle: -1,
        Unlock: 0.32,
        Cut: -0.8
    },

    power: 0,
    weight: 0,
    minLevel: 0,
    allFloors: true,

    playerTags: {},
    enemyTags: {}
}