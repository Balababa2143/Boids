/**
 * The layer sets for the arm links that involve a wrist cuff: the chain between
 * the two wrists, and the chains from the wrists to the collar.
 * @module Boids/Futuristic/Link/Layer/Arm/Wrist
 */

import { LinkFolder } from '../../Common'
import { AddGlow, MakeLeftRight } from '../Common'

const MakeWristLayers = <Base extends Partial<ModelLayer>>(layerBase: Base) => {
    const [left, right] = MakeLeftRight(layerBase)
    return [
        {
            ...left,
            Layer: 'BindChainLinksUnder',
            SwapLayerPose: {
                'Front': 'BindForeWristLeft',
            }
        },
        {
            ...right,
            Layer: 'BindChainLinksUnder',
            SwapLayerPose: {
                'Front': 'BindForeWristRight',
                // 'Crossed': 'BindCrossWristRight'
            }
        }
    ] satisfies Partial<ModelLayer>[]
}

/**
 * The chain between the wrist cuffs. In the free and yoked poses one centre layer
 * draws it; in the front pose each wrist gets its own half and swaps its sorting
 * group to `BindForeWristLeft` or `BindForeWristRight`, the groups the game's own
 * handcuff layers sort with when the hands are held in front.
 *
 * Those halves also override the default sprite prefix of the front and crossed
 * poses — both default to `Boxtie` — so each half is looked up under its own name
 * instead of as box-tie artwork.
 */
export const BetweenWristCuff: ModelLayer[] =
    [
        {
            Name: '',
            Poses: ToMap(['Free', 'Yoked']),
            Layer: 'BindChainLinksUnder'
        },
        ...MakeWristLayers({
            Name: '',
            Poses: ToMap(['Front']),
            GlobalDefaultOverride: ToMap(['Front', 'Crossed']),
        })
    ]
        .map(layer => ({
            ...layer,
            Folder: `${LinkFolder}/BetweenWristCuff`,
        }))
        .flatMap(AddGlow)

/**
 * The chain from each wrist cuff to the collar, left and right, drawn in the yoked
 * pose only.
 */
export const WristToCollar: ModelLayer[] =
    [
        ...MakeLeftRight({
            Name: '',
            Poses: ToMap(['Yoked']),
            Layer: 'BindChainLinksUnder'
        })
    ]
        .map(layer => ({
            ...layer,
            Folder: `${LinkFolder}/WristToCollar`,
        }))
        .flatMap(AddGlow)