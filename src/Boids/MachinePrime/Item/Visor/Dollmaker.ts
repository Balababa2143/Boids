import * as KDS from 'kd-structured'
import * as KDEx from '../../../../KDExtension'
import * as Futuristic from '../../../Futuristic'
import * as Coordinator from '../../Coordinator'
import { ItemArchetype } from '../../Constant'
import { Function, Logistic, Scale, ThrowIfNull } from '../../../../Utilities'
import { MakeMachinePrimeVariant } from '../Common'
import { GlassLayerName } from '../../../Futuristic/GlassVisor/Layer'
import {
    DefaultShowEffectsOnItemMorph,
    HandleBlindLimiterStrengthUpdate,
    MorphableVisorCommonEvents,
    ShouldHideBrows,
} from './Common'
import { HardLightVisor, VariantInfo } from './Constant'
import { DollmakerGoggle, DollmakerMask, Variant as ModelVariant } from '../../../Futuristic/GlassVisor'
import { Layering } from '../../../Futuristic/GlassVisor/Constant'

export type VariantOf<T extends ModelVariant> = Omit<T, 'Socketed' | 'Layering' | 'HideBrows'>
export type Goggle = VariantOf<DollmakerGoggle> & { Layering: Layering.Goggle }
export type Mask = VariantOf<DollmakerMask> & { Layering: Layering.Mask }
export type OverMask = VariantOf<DollmakerMask> & { Layering: Layering.Hood }
export type Variant =
    Goggle |
    Mask |
    OverMask

export const CalcVisorFilter = KDEx.AddEventHandler({
    eventMap: KDEventMapInventory,
    trigger: 'apply',
    type: '211FBBC1-0E8D-4CFF-82E3-ADA9713142ED',
    handler: KDEx.HandleItemEventWhenItemIsEventSource(
        (_e, item, data) => {
            if (item.data?.[HardLightVisor]) {
                console.log('Boids: CalcVisorFilter exec', _e, item, data)
                const targetBlindLevel = Coordinator.SensoryControl.GetLimiterStrength(ItemArchetype.Visor)
                const opaqueFactor = Logistic(3, 2)(targetBlindLevel)
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

export const MorphOnBlindLimiterStrengthUpdate =
    KDEx.AddEventHandler({
        eventMap: KDEventMapInventory,
        trigger: Coordinator.SensoryControl.EventKeys.SensoryLimiterStrengthUpdate,
        type: '11D8DFAE-F831-4D7C-BB21-8987B8234A63',
        handler: HandleBlindLimiterStrengthUpdate({
            DoMorph: (_e, item, data) => {
                const partialVariant = ThrowIfNull<Variant>(item.data?.[VariantInfo])
                const template = GetTemplateForHardLightVariant({ partialVariant, strength: data.NewStrength })
                KDS.KDMorphToInventoryVariant({
                    item,
                    variant: {
                        ...item,
                        template,
                        events: item.events ?? []
                    },
                    forceMorph: true
                })
            },
            ShowEffect: DefaultShowEffectsOnItemMorph
        })
    })

const GetTemplateForHardLightVariant =
    (args: {
        partialVariant: Variant,
        strength: number
    }) => {
        const {
            partialVariant,
            strength
        } = args
        return Futuristic.GlassVisor.GetVariant({
            ...partialVariant,
            Socketed: true,
            HideBrows: ShouldHideBrows(strength)
        })
    }

export const GetHardLightVariant = Function.Cached(
    (partialVariant: Variant) => {
        const template = Futuristic.GlassVisor.GetVariant({
            ...partialVariant,
            Socketed: true,
            HideBrows: ShouldHideBrows(Coordinator.SensoryControl.GetLimiterStrength(ItemArchetype.Visor))
        })
        return MakeMachinePrimeVariant({
            template,
            events: [
                ...MorphableVisorCommonEvents(partialVariant),
                CalcVisorFilter,
                MorphOnBlindLimiterStrengthUpdate,
            ]
        })
    }
)