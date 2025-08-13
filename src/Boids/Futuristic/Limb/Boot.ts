import { AddRestraintWithTextThenGetName, RestraintText } from '../../../KDInterface/KDExtension'
import { FactionFilter } from '../../../KDInterface/TextKey'
import { MechanichalLockSfx } from '../Common'
import { Socket } from '../Link'

export const Heel = AddRestraintWithTextThenGetName(
    {
        name: '{F913D9BF-E661-4F6E-88EA-E5F509A1A0E9}',
        Group: 'ItemBoots',
        inventory: true,
        inaccessible: true,
        special: true,
        noDupe: true,
        unlimited: true,

        shrine: [
            'Heels',
            'Metal',
            'Boots',
            Socket.Ankle,
            //Socket.Heel
        ],

        Model: 'CyberBalletHeels',
        ...MechanichalLockSfx,
        preview: 'BalletHeels',

        remove: ['Shoes'],
        factionFilters: {
            Glow: {
                color: FactionFilter.Highlight,
                override: false
            }
        },

        escapeChance: {
            Remove: 0.2,
            Struggle: 0.01,
            Unlock: 0.6,
            Pick: 0.03,
            Cut: -0.8,
        },

        power: 0,
        weight: 0,
        minLevel: 0,
        allFloors: true,
        heelpower: 2,

        playerTags: {},
        enemyTags: {},
    },
    {
        ...RestraintText.Default,
        DisplayName: 'Drone Heel'
    }
)