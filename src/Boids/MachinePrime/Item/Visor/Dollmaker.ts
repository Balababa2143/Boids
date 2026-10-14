import * as KDEx from '../../../../KDExtension'
import { Scale } from '../../../../Utilities'
import * as Futuristic from '../../../Futuristic'
import { DollmakerGoggle, DollmakerMask } from '../../../Futuristic/GlassVisor'
import { GlassLayerName } from '../../../Futuristic/GlassVisor/Layer'
import { ItemArchetype } from '../../Constant'
import * as Coordinator from '../../Coordinator'
import { MakeMorphableVisor, ShouldHideBrows, VisorVariantSet } from './Common'
import { HardLightVisor } from './Constant'

type Variants = VisorVariantSet<DollmakerGoggle, DollmakerMask>

export type Goggle = Variants['Goggle']
export type Mask = Variants['Mask']
export type OverMask = Variants['OverMask']
export type Variant =
    Goggle |
    Mask |
    OverMask

const LN_SHIFT = 1/(Math.E-1)
const LN_CORRECTION = Math.log(LN_SHIFT)

export const CalcVisorFilter = KDEx.AddEventHandler({
    eventMap: KDEventMapInventory,
    trigger: 'apply',
    type: '211FBBC1-0E8D-4CFF-82E3-ADA9713142ED',
    eventData: {
        inheritLinked: true,
    },
    handler: KDEx.HandleItemEventWhenItemIsEventSource(
        (_e, item, data) => {
            if (item.data?.[HardLightVisor]) {
                // console.log('Boids: CalcVisorFilter exec', _e, item, data)
                const targetBlindLevel = Coordinator.SensoryControl.GetLimiterStrength(ItemArchetype.Blinder)
                const opaqueFactor = Math.log(targetBlindLevel + LN_SHIFT) - LN_CORRECTION
                const dimFactor = Scale(0, 0.8, opaqueFactor)
                const filter: LayerFilter = data['Filters'][GlassLayerName] ?? {}
                filter.saturation = 1
                filter.alpha = Scale(1, 3.4, opaqueFactor)
                filter.brightness = Scale(1, 0.2, dimFactor)
                data['Filters'][GlassLayerName] = filter
            }
        }
    ),
})

const GetTemplateForVariant =
    (partialVariant: Variant, strength: number) =>
        Futuristic.GlassVisor.GetVariant({
            ...partialVariant,
            Socketed: true,
            HideBrows: ShouldHideBrows(strength)
        })

export const {
    MorphOnBlindLimiterStrengthUpdate,
    Variant,
} = MakeMorphableVisor({
    Type: '11D8DFAE-F831-4D7C-BB21-8987B8234A63',
    GetTemplateForStrength: GetTemplateForVariant,
    Events: [CalcVisorFilter],
})
