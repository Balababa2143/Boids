

export namespace InheritColor {
    export const Mitten = '6C1C38FE-D89C-43E5-8DBB-8A67CE48B17D'
    export const Straps = '4CB992E7-88CF-469F-8A41-0152BDA9C896'
    export const Display = '1A320E06-CAE9-4607-A0B3-F722992F87EE'
    export const Screen = '21089F91-66FF-47E4-9A45-48C5439E559C'
    export const Lock = '3B5D5A69-CA6B-42C9-AC78-278DC11A0B07'
    export const Glow = '21446D52-F0E9-4C73-8326-52ED150B6F63'
    export const Cuff = '809300EA-3AAE-4615-803C-BDCD4B2A81F5'
    export const UpperCuff = '4EA907A6-CF47-404A-AA12-833ABEEEC93A'
    export const UpperDisplay = 'B4A7BCF3-DA11-4EC5-907F-D1E02C4A2203'
    export const UpperLock = 'A8E9A555-1442-4297-B747-7DE609D8B9ED'
    export const UpperGlow = 'CB46BB91-4B03-45C8-85E2-200D615FDC40'
    export const Cap = '9C464FC0-BA59-4B4F-8212-A8BFC7B64B5D'
}

const ArmPoseMap = ToMap(ARMPOSES)

const ForeArmPoseMap = ToMap(FOREARMPOSES)

const FrontCrossLayerMap = ToMap(['Front', 'Crossed'])

const enum LayersToSwap {
    Crossed = 1 << 0,
    Front = 1 << 1
}

type SwapLayerPose = Required<ModelLayer>['SwapLayerPose']

const MakeSwapLayerPose = (layerToSwap: LayersToSwap, suffix) => ({
    ... (layerToSwap | LayersToSwap.Crossed) && {
        Crossed: `CrossMitten${suffix}`
    },
    ... (layerToSwap | LayersToSwap.Front) && {
        Front: `FrontMitten${suffix}`
    }
} satisfies SwapLayerPose)

const GetSleevesLayerName =
    suffix => `LongMitten${suffix}`

const GetForeSleevesLayerName =
    suffix => `ForeLongMitten${suffix}`

export const GetLongMittenCommonLayers =
    suffix => {
        const sleeveLayerName = GetSleevesLayerName(suffix)
        const foreSleeveLayerName = GetForeSleevesLayerName(suffix)
        return [
            {
                Name: `CuffForeLongMitten${suffix}`,
                Layer: `ForeMitten${suffix}`,
                Pri: 20.1,
                Poses: ForeArmPoseMap,
                GlobalDefaultOverride: FrontCrossLayerMap,
                SwapLayerPose: MakeSwapLayerPose(LayersToSwap.Crossed, suffix),
                TieToLayer: foreSleeveLayerName,
                NoOverride: true,
                InheritColor: InheritColor.Cuff,
            },
            {
                Name: `CuffLongMitten${suffix}`,
                Layer: `Mitten${suffix}`,
                Pri: 120.1,
                Poses: ArmPoseMap,
                GlobalDefaultOverride: FrontCrossLayerMap,
                SwapLayerPose: MakeSwapLayerPose(LayersToSwap.Crossed | LayersToSwap.Crossed, suffix),
                TieToLayer: sleeveLayerName,
                NoOverride: true,
                InheritColor: InheritColor.Cuff,
            },
            {
                Name: `DisplayForeLongMitten${suffix}`,
                Layer: `ForeMitten${suffix}`,
                Pri: 20.2,
                Poses: ForeArmPoseMap,
                GlobalDefaultOverride: FrontCrossLayerMap,
                SwapLayerPose: MakeSwapLayerPose(LayersToSwap.Crossed, suffix),
                TieToLayer: foreSleeveLayerName,
                NoOverride: true,
                InheritColor: InheritColor.Display,
            },
            {
                Name: `DisplayLongMitten${suffix}`,
                Layer: `Mitten${suffix}`,
                Pri: 120.2,
                Poses: ArmPoseMap,
                GlobalDefaultOverride: FrontCrossLayerMap,
                SwapLayerPose: MakeSwapLayerPose(LayersToSwap.Crossed | LayersToSwap.Crossed, suffix),
                TieToLayer: sleeveLayerName,
                NoOverride: true,
                InheritColor: InheritColor.Display,
            },
            {
                Name: `LockForeLongMitten${suffix}`,
                Layer: `ForeMitten${suffix}`,
                Pri: 20.3,
                Poses: ForeArmPoseMap,
                GlobalDefaultOverride: FrontCrossLayerMap,
                SwapLayerPose: MakeSwapLayerPose(LayersToSwap.Crossed, suffix),
                TieToLayer: foreSleeveLayerName,
                NoOverride: true,
                InheritColor: InheritColor.Lock,
            },
            {
                Name: `LockLongMitten${suffix}`,
                Layer: `Mitten${suffix}`,
                Pri: 120.3,
                Poses: ArmPoseMap,
                GlobalDefaultOverride: FrontCrossLayerMap,
                SwapLayerPose: MakeSwapLayerPose(LayersToSwap.Crossed | LayersToSwap.Crossed, suffix),
                TieToLayer: sleeveLayerName,
                NoOverride: true,
                InheritColor: InheritColor.Lock,
            },
            {
                Name: `GlowForeLongMitten${suffix}`,
                Layer: `ForeMitten${suffix}`,
                Pri: 20.4,
                Poses: ForeArmPoseMap,
                GlobalDefaultOverride: FrontCrossLayerMap,
                SwapLayerPose: MakeSwapLayerPose(LayersToSwap.Crossed, suffix),
                TieToLayer: foreSleeveLayerName,
                NoOverride: true,
                InheritColor: InheritColor.Glow,
            },
            {
                Name: `GlowLongMitten${suffix}`,
                Layer: `Mitten${suffix}`,
                Pri: 120.4,
                Poses: ArmPoseMap,
                GlobalDefaultOverride: FrontCrossLayerMap,
                SwapLayerPose: MakeSwapLayerPose(LayersToSwap.Crossed | LayersToSwap.Crossed, suffix),
                TieToLayer: sleeveLayerName,
                NoOverride: true,
                InheritColor: InheritColor.Glow,
            },
            {
                Name: `StrapsForeLongMitten${suffix}`,
                Layer: `ForeMitten${suffix}`,
                Pri: 20.1,
                Poses: ForeArmPoseMap,
                GlobalDefaultOverride: FrontCrossLayerMap,
                SwapLayerPose: MakeSwapLayerPose(LayersToSwap.Crossed, suffix),
                TieToLayer: foreSleeveLayerName,
                NoOverride: true,
                InheritColor: InheritColor.Straps,
            },
            {
                Name: `StrapsLongMitten${suffix}`,
                Layer: `Mitten${suffix}`,
                Pri: 120.1,
                Poses: ArmPoseMap,
                GlobalDefaultOverride: FrontCrossLayerMap,
                SwapLayerPose: MakeSwapLayerPose(LayersToSwap.Crossed | LayersToSwap.Crossed, suffix),
                TieToLayer: sleeveLayerName,
                NoOverride: true,
                InheritColor: InheritColor.Straps,
            },
            {
                Name: `UpperCuffLongMitten${suffix}`,
                Layer: `Mitten${suffix}`,
                Pri: 120.1,
                Poses: ArmPoseMap,
                GlobalDefaultOverride: FrontCrossLayerMap,
                SwapLayerPose: MakeSwapLayerPose(LayersToSwap.Crossed | LayersToSwap.Crossed, suffix),
                TieToLayer: sleeveLayerName,
                NoOverride: true,
                InheritColor: InheritColor.UpperCuff,
            },
            {
                Name: `UpperDisplayLongMitten${suffix}`,
                Layer: `Mitten${suffix}`,
                Pri: 120.2,
                Poses: ArmPoseMap,
                GlobalDefaultOverride: FrontCrossLayerMap,
                SwapLayerPose: MakeSwapLayerPose(LayersToSwap.Crossed | LayersToSwap.Crossed, suffix),
                TieToLayer: sleeveLayerName,
                NoOverride: true,
                InheritColor: InheritColor.UpperDisplay,
            },
            {
                Name: `UpperLockLongMitten${suffix}`,
                Layer: `Mitten${suffix}`,
                Pri: 120.3,
                Poses: ArmPoseMap,
                GlobalDefaultOverride: FrontCrossLayerMap,
                SwapLayerPose: MakeSwapLayerPose(LayersToSwap.Crossed | LayersToSwap.Crossed, suffix),
                TieToLayer: sleeveLayerName,
                NoOverride: true,
                InheritColor: InheritColor.UpperLock,
            },
            {
                Name: `UpperGlowLongMitten${suffix}`,
                Layer: `Mitten${suffix}`,
                Pri: 120.4,
                Poses: ArmPoseMap,
                GlobalDefaultOverride: FrontCrossLayerMap,
                SwapLayerPose: MakeSwapLayerPose(LayersToSwap.Crossed | LayersToSwap.Crossed, suffix),
                TieToLayer: sleeveLayerName,
                NoOverride: true,
                InheritColor: InheritColor.UpperGlow,
            },
        ] satisfies ModelLayer[]
    }

export const GetSleevesBodyLayers =
    suffix => {
        const sleevesLayerName = GetSleevesLayerName(suffix)
        const foreSleevesLayerName = GetForeSleevesLayerName(suffix)
        return [
            {
                Name: sleevesLayerName,
                // Sprite = `LongMitten${suffix}`,
                Folder: "CyberArms",
                Layer: `Mitten${suffix}`,
                Pri: 120,
                Poses: ArmPoseMap,
                GlobalDefaultOverride: FrontCrossLayerMap,
                InheritColor: InheritColor.Mitten,
            },
            {
                Name: foreSleevesLayerName,
                Layer: `ForeMitten${suffix}`,
                Folder: "CyberArms",
                Pri: 20,
                Poses: ForeArmPoseMap,
                InheritColor: InheritColor.Mitten,
                GlobalDefaultOverride: FrontCrossLayerMap,
                SwapLayerPose: MakeSwapLayerPose(LayersToSwap.Crossed, suffix)
            },
        ]
    }
export const GetEmptyBodyLayers =
    suffix => {
        const sleevesLayerName = GetSleevesLayerName(suffix)
        const foreSleevesLayerName = GetForeSleevesLayerName(suffix)
        return [
            {
                Name: sleevesLayerName,
                Sprite: "",
                Layer: `Mitten${suffix}`,
                Pri: 120,
                Poses: ArmPoseMap,
                GlobalDefaultOverride: FrontCrossLayerMap,
                InheritColor: InheritColor.Mitten,
            },
            {
                Name: foreSleevesLayerName,
                Sprite: "",
                Layer: `ForeMitten${suffix}`,
                Pri: 20,
                Poses: ForeArmPoseMap,
                InheritColor: InheritColor.Mitten,
                GlobalDefaultOverride: FrontCrossLayerMap,
                SwapLayerPose: MakeSwapLayerPose(LayersToSwap.Crossed, suffix)
            },
        ]
    }
export const GetLongMittenBodyLayers =
    suffix => {
        const sleevesLayerName = GetSleevesLayerName(suffix)
        const foreSleevesLayerName = GetForeSleevesLayerName(suffix)
        const mittsLayersMap = ToMap(["Mitts"])
        return [
            {
                Name: sleevesLayerName,
                Sprite: `LongMitten${suffix}`,
                Layer: `Mitten${suffix}`,
                Pri: 120.05,
                Poses: ArmPoseMap,
                GlobalDefaultOverride: FrontCrossLayerMap,
                InheritColor: InheritColor.Mitten,
                NoOverride: true,
                EraseSprite: "Mitts",
                EraseLayers: mittsLayersMap,
            },
            {
                Name: foreSleevesLayerName,
                Layer: `ForeMitten${suffix}`,
                Pri: 20.05,
                Poses: ForeArmPoseMap,
                InheritColor: InheritColor.Mitten,
                GlobalDefaultOverride: FrontCrossLayerMap,
                SwapLayerPose: MakeSwapLayerPose(LayersToSwap.Crossed, suffix),
                NoOverride: true,
                EraseSprite: "Mitts",
                EraseLayers: mittsLayersMap,
            },
        ]
    }
export const GetLongMittenCaplayers =
    suffix => {
        const sleevesLayerName = GetSleevesLayerName(suffix)
        const foreSleevesLayerName = GetForeSleevesLayerName(suffix)
        return [
            {
                Name: `CapLongMitten${suffix}`,
                Layer: `Mitten${suffix}`,
                TieToLayer: sleevesLayerName,
                Pri: 120,
                Poses: ArmPoseMap,
                GlobalDefaultOverride: FrontCrossLayerMap,
                HideWhenOverridden: true,
                InheritColor: InheritColor.Cap,
            },
            {
                Name: `CapForeLongMitten${suffix}`,
                Layer: `ForeMitten${suffix}`,
                TieToLayer: foreSleevesLayerName,
                Pri: 20.1,
                Poses: ForeArmPoseMap,
                InheritColor: InheritColor.Cap,
                GlobalDefaultOverride: FrontCrossLayerMap,
                HideWhenOverridden: true,
                SwapLayerPose: MakeSwapLayerPose(LayersToSwap.Crossed, suffix)
            },
        ]
    }