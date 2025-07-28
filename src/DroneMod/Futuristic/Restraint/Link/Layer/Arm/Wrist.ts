import { AddGlow, LinkFolder, MakeLeftRight } from '../Common'


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

export const WristToWrist: ModelLayer[] =
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