import * as Futuristic from '../../../Futuristic'
import {
    BoidsGoggle,
    BoidsMask,
    Variant as ModelVariant,
} from '../../../Futuristic/GlassVisor'
import { MakeMorphableVisor, VisorVariantSet } from './Common'

type Variants = VisorVariantSet<BoidsGoggle, BoidsMask, 'Level'>

export type Goggle = Variants['Goggle']
export type Mask = Variants['Mask']
export type OverMask = Variants['OverMask']
export type Variant =
    Goggle |
    Mask |
    OverMask

const MorphLevelThreshold = [0, 0.25, 0.5, 0.75] as const

const GetTemplateForVariant =
    (partialVariant: Variant, strength: number) => {
        const idx = MorphLevelThreshold.findLastIndex(threshold => strength >= threshold)
        if (idx < 0) {
            throw new Error('Invalid blind level')
        }
        // `Level` and `HideBrows` are correlated in the model variant types, which
        // a computed level cannot express; the original cast is kept as found.
        const Level = idx + 1 as any
        return Futuristic.GlassVisor.GetVariant({
            ...partialVariant,
            Socketed: true,
            Level,
            HideBrows: Level > ModelVariant.BoidsHideBrowsThreshold
        })
    }

export const {
    MorphOnBlindLimiterStrengthUpdate,
    Variant,
} = MakeMorphableVisor({
    Type: '33790C6F-4629-4387-896E-A999E6641B40',
    GetTemplateForStrength: GetTemplateForVariant,
    InheritLinked: true,
})
