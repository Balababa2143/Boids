/**
 * The layer set for the elbow link: one tether between the two elbow cuffs.
 * @module Boids/Futuristic/Link/Layer/Arm/Elbow
 */

import { LinkFolder } from '../../Common';
import { AddGlow } from '../Common';

/**
 * The chain drawn between the elbow cuffs, in the free, yoked and up poses. It
 * sorts in `BindChainLinksUnder`, beneath the cuffs it runs between, and comes out
 * of the layer factory as a tether and a glow.
 */
export const BetweenElbowCuff: ModelLayer[] =
    [
        {
            Name: '',
            Poses: ToMap(['Free', 'Yoked', 'Up']),
            Layer: 'BindChainLinksUnder'
        }
    ]
        .map(layer => ({
            ...layer,
            Folder: `${LinkFolder}/BetweenElbowCuff`,
        }))
        .flatMap(AddGlow)