import * as KDEx from '../../../../KDExtension'
import { KinkyDungeonInventoryEventHandler } from '../../../../KDInterface/Event'
import { Invnetory as EventCommInv } from '../../../CommonEvent'
import { Variant } from '../../../Futuristic/GlassVisor'
import { ItemArchetype } from '../../Constant'
import * as Coordinater from '../../Coordinator'
import { HardLightVisor as MorphableVisor, VariantInfo } from './Constant'

export const CalcBlind = KDEx.AddEventHandler({
    eventMap: KDEventMapInventory,
    trigger: 'calcBlind',
    type: '7BCC6086-764D-42A6-B92C-93E230E7086F',
    handler: (_e, item, data) => {
        if (item.data?.[MorphableVisor]) {
            data['blindness'] = Math.max(data['blindness'], Coordinater.SensoryControl.GetLimiterStrength(ItemArchetype.Visor))
        }
    },
})

export const MorphableVisorCommonEvents = (visorVariant: Partial<Variant>) => [
    CalcBlind,
    EventCommInv.AddTags([ItemArchetype.Visor]),
    Coordinater.Eventhandler.RegisterItemOnApply(ItemArchetype.Visor),
    Coordinater.Eventhandler.UnRegisterItemOnRemoval(ItemArchetype.Visor),
    EventCommInv.SetItemDataOnApply({
        [MorphableVisor]: 1,
        [VariantInfo]: visorVariant
    }),
] satisfies KinkyDungeonEvent[]

const HideBrowsThreshold = 2 as const

export const ShouldHideBrows = (strength: number) => 
    HideBrowsThreshold <  strength

export const DefaultShowEffectsOnItemMorph = (delta: number) =>
    Coordinater.SensoryControl.ShowEffectsOnItemMorph({
        delta,
        sfxIncrease: 'BeepEngage',
        sfxDecrease: 'BeepEngage',
        messageIncrease: {
            priority: 50,
            text: 'Your hard light visor dims, and your vision becomes more restricted.',
            color: '#a0160a',
            time: 2,
            noDupe: true
        },
        messageDecrease: {
            priority: 50,
            text: 'Your hard light visor clears up, and your vision becomes less restricted.',
            color: '#33c3dd',
            time: 2,
            noDupe: true
        }
    })

export const HandleBlindLimiterStrengthUpdate = 
    (args:{
        DoMorph: KinkyDungeonInventoryEventHandler<Coordinater.SensoryControl.LimiterStrengthUpdateEventArgs>,
        ShowEffect: typeof DefaultShowEffectsOnItemMorph
    }) =>
    ((e, item, data: Coordinater.SensoryControl.LimiterStrengthUpdateEventArgs) => {
        if (data.Type === ItemArchetype.Visor) {
            if(ShouldHideBrows(data.OldStrength) !== ShouldHideBrows(data.NewStrength)){ // XOR
                args.DoMorph(e, item, data)
            }
            args.ShowEffect(data.NewStrength - data.OldStrength)
        }
    }) satisfies KinkyDungeonInventoryEventHandler<Coordinater.SensoryControl.LimiterStrengthUpdateEventArgs>