/**
 * The `Drone Heel`: one locked ballet heel that wears the base game's own
 * `CyberBalletHeels` model, clears the player's own shoes when it goes on, and raises
 * the heel power the game allows.
 * @module Boids/Futuristic/Limb/Boot
 */

import { AddRestraintWithTextThenGetName } from '../../../KDExtension'
import { FactionFilter } from '../../../KDInterface/TextKey'
import { SFX, CommonItemAvailability } from '../Common'
import { Socket } from '../Link'

/**
 * The `Drone Heel` boot, registered in the `ItemBoots` group and tagged
 * `Link.Socket.Ankle` so the ankle link set can be anchored to it.
 *
 * It is weightless at level 0 on every floor, cannot be duplicated (`noDupe`), is
 * `unlimited` so the game always lets it be applied, and is `inaccessible` so nothing
 * linked under it can be reached. `heelpower: 2` doubles the heel level the game
 * tolerates while it is worn, and `remove: ['Shoes']` clears the game's own `Shoes`
 * outfit slot so the two cannot be worn together.
 */
export const Heel = AddRestraintWithTextThenGetName(
    {
        name: 'F913D9BF-E661-4F6E-88EA-E5F509A1A0E9',
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
        ...SFX.MechanicalLockSfx,
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
        ...CommonItemAvailability,
        heelpower: 2,

        playerTags: {},
        enemyTags: {},
    },
    {
        DisplayName: 'Drone Heel'
    }
)