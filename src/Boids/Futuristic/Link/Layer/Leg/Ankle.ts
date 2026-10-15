/**
 * The layer set for the ankle link: one tether between the two ankle cuffs.
 * @module Boids/Futuristic/Link/Layer/Leg/Ankle
 */

import { LinkFolder } from '../../Common'
import { AddGlow } from '../Common'

/**
 * The chain drawn between the ankle cuffs in the spread pose. It sorts in
 * `BindChainLinksUnder`, beneath the cuffs it runs between, and comes out of the
 * layer factory as a tether and a glow.
 */
export const BetweenAnkleCuff: ModelLayer[] =
    [
        {
            Name: '',
            Poses: ToMap(['Spread']),
            Layer: 'BindChainLinksUnder'
        },
    ]
        .map(layer => ({
            ...layer,
            Folder: `${LinkFolder}/BetweenAnkleCuff`,
        }))
        .flatMap(AddGlow)