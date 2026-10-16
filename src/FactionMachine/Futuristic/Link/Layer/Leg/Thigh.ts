/**
 * The layer set for the thigh link: one tether between the two thigh cuffs.
 * @module FactionMachine/Futuristic/Link/Layer/Leg/Thigh
 */

import { LinkFolder } from '../../Common'
import { AddGlow } from '../Common'

/**
 * The chain drawn between the thigh cuffs in the spread pose. It sorts in
 * `BindChainLinksUnder`, beneath the cuffs it runs between, and comes out of the
 * layer factory as a tether and a glow.
 */
export const BetweenThighCuff: ModelLayer[] =
    [
        {
            Name: '',
            Poses: ToMap(['Spread']),
            Layer: 'BindChainLinksUnder'
        },
    ]
        .map(layer => ({
            ...layer,
            Folder: `${LinkFolder}/BetweenThighCuff`,
        }))
        .flatMap(AddGlow)