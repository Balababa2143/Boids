import * as KDS from 'kd-structured'
import * as KDEx from '../../../../KDExtension'
import * as Futuristic from '../../../Futuristic'
import * as Coordinater from '../../Coordinator'
import { ItemArchetype } from '../../Constant'
import { Function, Logistic, Scale, ThrowIfNull } from '../../../../Utilities'
import { MakeMachinePrimeVariant } from '../Common'
import { GlassLayerName } from '../../../Futuristic/GlassVisor/Layer'
import { Invnetory as EventCommInv } from '../../../CommonEvent'
import { Variant } from '../../../Futuristic/GlassVisor'
import { DollmakerGoggle, DollmakerMask, DollmakerVariant } from '../../../Futuristic/GlassVisor/Variant'
import { GlassType, Layering } from '../../../Futuristic/GlassVisor/Constant'
import { SFX } from '../../../Futuristic/Common'

export const CalcBlind = KDEx.AddEventHandler({
    eventMap: KDEventMapInventory,
    trigger: 'calcBlind',
    type: '7BCC6086-764D-42A6-B92C-93E230E7086F',
    handler: (_e, item, data) => {
        if (item.data?.[HardLightVisor]) {
            data['blindness'] = Math.max(data['blindness'], Coordinater.SensoryControl.GetLimiterStrength(ItemArchetype.Visor))
        }
    },
})

const HardLightVisor = '4F575103-E9A2-4C34-BEAD-9E7173B1913D' as const

export const CalcVisorFilter = KDEx.AddEventHandler({
    eventMap: KDEventMapInventory,
    trigger: 'apply',
    type: '211FBBC1-0E8D-4CFF-82E3-ADA9713142ED',
    handler: KDEx.HandleItemEventWhenItemIsEventSource(
        (_e, item, data) => {
            if(item.data?.[HardLightVisor]){
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

type HardLightVariantProps<T extends Variant> = Omit<T, 'Socketed' | 'Layering' | 'HideBrows'>

export type HardLightGoggle = HardLightVariantProps<DollmakerGoggle> & { Layering: Layering.Goggle }
export type HardLightMask = HardLightVariantProps<DollmakerMask> & { Layering: Layering.Mask }
export type HardLightOverMask = HardLightVariantProps<DollmakerMask> & { Layering: Layering.Hood }
export type HardLightVariant =
    HardLightGoggle |
    HardLightMask |
    HardLightOverMask

const VariantInfo = 'A2C4BB95-0C66-4461-905E-35E3186403E9'

const HideBrowsThreshold = 4 as const

const ShouldHideBrows = (strength: number) => 
    HideBrowsThreshold <  strength

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

export const MorphOnBlindLimiterStrengthUpdate =
    KDEx.AddEventHandler({
        eventMap: KDEventMapInventory,
        trigger: Coordinater.SensoryControl.EventKeys.SensoryLimiterStrengthUpdate,
        type: '11D8DFAE-F831-4D7C-BB21-8987B8234A63',
        handler: (e, item, data: Coordinater.SensoryControl.LimiterStrengthUpdateEventArgs) => {
            if (data.Type === ItemArchetype.Visor) {
                if((data.OldStrength > HideBrowsThreshold) !== (data.NewStrength > HideBrowsThreshold)){ // XOR
                    const partialVariant = ThrowIfNull<HardLightVariant>(item.data?.[VariantInfo])
                    const template = GetTemplateForHardLightVariant({partialVariant, strength: data.NewStrength})
                    KDS.KDMorphToInventoryVariant({
                        item,
                        variant: {
                            ...item,
                            template,
                            events: item.events ?? []
                        },
                        forceMorph: true
                    })
                }
                Coordinater.SensoryControl.ShowEffectsOnItemMorph({
                    delta: data.NewStrength - data.OldStrength,
                    sfxIncrease: 'BeepEngage',
                    sfxDecrease: 'BeepEngage',
                    messageIncrease: {
                        priority: 50,
                        text: 'Your hard light visor dims, and your vision becomes more restricted.',
                        color: '#a0160a',
                        time: 2,
                        noDupe: true
                    },
                    messageDecrease:{
                        priority: 50,
                        text: 'Your hard light visor clears up, and your vision becomes less restricted.',
                        color: '#33c3dd',
                        time: 2,
                        noDupe: true
                    }
                })
            }
        },
    })



const MakeHardLightVisor = (partialVariant: HardLightVariant) => {
    const template = Futuristic.GlassVisor.GetVariant({
        ...partialVariant,
        Socketed: true,
        HideBrows: ShouldHideBrows(Coordinater.SensoryControl.GetLimiterStrength(ItemArchetype.Visor))
    })
    return MakeMachinePrimeVariant({
        template,
        events: [
            CalcBlind,
            CalcVisorFilter,
            MorphOnBlindLimiterStrengthUpdate,
            EventCommInv.SetItemDataOnApply({
                [HardLightVisor]: 1,
                [VariantInfo]: partialVariant
            }),
            EventCommInv.AddTags([ItemArchetype.Visor]),
            Coordinater.Eventhandler.RegisterItemOnApply(ItemArchetype.Visor),
            Coordinater.Eventhandler.UnRegisterItemOnRemoval(ItemArchetype.Visor),
        ]
    })
}


export const GetHardLightVariant = Function.Cached(
    MakeHardLightVisor
)
export const SetBlindStrength = (value?: number) =>
    Coordinater
        .SensoryControl
        .SetLimiterStrength(ItemArchetype.Visor, value ?? Math.random())