import * as KDS from 'kd-structured'
import * as KDEx from '../../../../KDExtension'
import * as Futuristic from '../../../Futuristic'
import * as Coordinator from '../../Coordinator'
import { Function, ThrowIfNull } from '../../../../Utilities'
import { MakeMachinePrimeVariant } from '../Common'
import {
    DefaultShowEffectsOnItemMorph,
    HandleBlindLimiterStrengthUpdate,
    MorphableVisorCommonEvents,
    ShouldHideBrows
} from './Common'
import { VariantInfo } from './Constant'
import { BoidsGoggle, BoidsMask, Level, Variant as ModelVariant } from '../../../Futuristic/GlassVisor'
import { ItemArchetype } from '../../Constant'
import { Layering } from '../../../Futuristic/GlassVisor/Constant'

export type VariantOf<T extends ModelVariant> = Omit<T, 'Socketed' | 'Layering' | 'HideBrows' | 'Level'>

export type Goggle = VariantOf<BoidsGoggle> & { Layering: Layering.Goggle }
export type Mask = VariantOf<BoidsMask> & { Layering: Layering.Mask }
export type OverMask = VariantOf<BoidsMask> & { Layering: Layering.Hood }
export type Variant =
    Goggle |
    Mask |
    OverMask

const MorphLevelThreshold = [0, 1, 2, 4] as const

const GetTemplateForVariant =
    (args: {
        partialVariant: Variant,
        strength: number
    }) => {
        const {
            partialVariant,
            strength
        } = args
        const idx = MorphLevelThreshold.findLastIndex(threshold => strength >= threshold)
        if(idx < 0) {
            throw new Error('Invalid blind level')
        }
        const Level = idx + 1 as any
        const HideBrows = Level > ModelVariant.BoidsHideBrowsThreshold
        return Futuristic.GlassVisor.GetVariant({
            ...partialVariant,
            Socketed: true,
            Level,
            HideBrows
        })
    }

export const MorphOnBlindLimiterStrengthUpdate =
    KDEx.AddEventHandler({
        eventMap: KDEventMapInventory,
        trigger: Coordinator.SensoryControl.EventKeys.SensoryLimiterStrengthUpdate,
        type: '33790C6F-4629-4387-896E-A999E6641B40',
        handler: HandleBlindLimiterStrengthUpdate({
            DoMorph: (_e, item, data) => {
                const partialVariant = ThrowIfNull<Variant>(item.data?.[VariantInfo])
                const template = GetTemplateForVariant({ partialVariant, strength: data.NewStrength })
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



export const Variant = Function.Cached(
    (partialVariant: Variant) => {
        const template = GetTemplateForVariant({
            partialVariant,
            strength: Coordinator.SensoryControl.GetLimiterStrength(ItemArchetype.Visor)
        })
        return MakeMachinePrimeVariant({
            template,
            events: [
                ...MorphableVisorCommonEvents(partialVariant),
                MorphOnBlindLimiterStrengthUpdate,
            ]
        })
    }
)