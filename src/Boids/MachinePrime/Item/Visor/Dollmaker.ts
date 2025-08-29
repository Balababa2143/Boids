import * as KDS from 'kd-structured'
import * as KDEx from '../../../../KDExtension'
import * as Futuristic from '../../../Futuristic'
import * as Coordinater from '../../Coordinator'
import { ItemArchetype } from '../../Constant'
import { Function, Logistic, Scale, ThrowIfNull } from '../../../../Utilities'
import { MakeMachinePrimeVariant } from '../Common'
import { GlassLayerName } from '../../../Futuristic/GlassVisor/Layer'
import {
    DefaultShowEffectsOnItemMorph,
    HandleBlindLimiterStrengthUpdate,
    MorphableVisorCommonEvents,
    ShouldHideBrows,
    VariantOf as VisorVariantOf,
    Variant as VisorVariant
} from './Common'
import { HardLightVisor, VariantInfo } from './Constant'
import { DollmakerVariant } from '../../../Futuristic/GlassVisor/Variant'

export const CalcVisorFilter = KDEx.AddEventHandler({
    eventMap: KDEventMapInventory,
    trigger: 'apply',
    type: '211FBBC1-0E8D-4CFF-82E3-ADA9713142ED',
    handler: KDEx.HandleItemEventWhenItemIsEventSource(
        (_e, item, data) => {
            if (item.data?.[HardLightVisor]) {
                console.log('Boids: CalcVisorFilter exec', _e, item, data)
                const targetBlindLevel = Coordinater.SensoryControl.GetLimiterStrength(ItemArchetype.Visor)
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

export type HardLightVariant = VisorVariant & VisorVariantOf<DollmakerVariant>

export const MorphOnBlindLimiterStrengthUpdate =
    KDEx.AddEventHandler({
        eventMap: KDEventMapInventory,
        trigger: Coordinater.SensoryControl.EventKeys.SensoryLimiterStrengthUpdate,
        type: '11D8DFAE-F831-4D7C-BB21-8987B8234A63',
        handler: HandleBlindLimiterStrengthUpdate({
            DoMorph: (_e, item, data) => {
                const partialVariant = ThrowIfNull<HardLightVariant>(item.data?.[VariantInfo])
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
        partialVariant: HardLightVariant,
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
    (partialVariant: HardLightVariant) => {
        const template = Futuristic.GlassVisor.GetVariant({
            ...partialVariant,
            Socketed: true,
            HideBrows: ShouldHideBrows(Coordinater.SensoryControl.GetLimiterStrength(ItemArchetype.Visor))
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

export const SetBlindStrength = (value?: number) =>
    Coordinater
        .SensoryControl
        .SetLimiterStrength(ItemArchetype.Visor, value ?? Math.random())