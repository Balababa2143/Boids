import { AddGlow, LayerTemplate, MakeLeftRight } from "../Common"


const Free = {
    Name: 'WristLink',
    Sprite: 'WristLink',
    Poses: ToMap(["Free"])
} satisfies Partial<ModelLayer>

const Front = {
    Name: 'WristLinkChained',
    Sprite: 'WristLink',
    Poses: ToMap(['Front']),
} satisfies Partial<ModelLayer>

const Yoked = {
    Name: 'WristCollarLink',
    Sprite: 'WristLink',
    Poses: ToMap(['Yoked']),
} satisfies Partial<ModelLayer>

const MakeWristLayers = <Base extends LayerTemplate>(layerBase: Base) => {
    const [left, right] = MakeLeftRight(layerBase)
    return [
        {
            ...left,
            Layer: 'BindChainLinksUnder',
            SwapLayerPose: {
                "Front": "BindForeWristLeft"
            }
        },
        {
            ...right,
            Layer: 'BindChainLinksUnder',
            SwapLayerPose: {
                "Front": "BindForeWristRight",
                "Crossed": "BindCrossWristRight"
            }
        }
    ] satisfies Partial<ModelLayer>[]
}

export const WristToWrist: ModelLayer[] =
    [Free, Front, Yoked]
        .flatMap(MakeWristLayers)
        .flatMap(AddGlow)