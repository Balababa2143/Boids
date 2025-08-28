import * as KDS from 'kd-structured'
import * as Futuristic from '../../../Futuristic'
import * as Coordinater from '../../Coordinater'
import { ItemArchetype } from '../../Constant'
import { Function, Logistic, Scale } from '../../../../Utilities'
import { AddEventHandler, HandleItemEventWhenItemIsEventSource } from '../../../../KDExtension'
import { MakeMachinePrimeVariant, MakeAddTagsEvent, MakeRegisterItemOnApplyEvent, MakeUnRegisterItemOnRemovalEvent } from '../Common'
import { GlassLayerName } from '../../../Futuristic/GlassVisor/Layer'

const DynamicVisualVisor = '4F575103-E9A2-4C34-BEAD-9E7173B1913D' as const

export const CalcVisorFilter = AddEventHandler({
    eventMap: KDEventMapInventory,
    trigger: 'apply',
    type: '211FBBC1-0E8D-4CFF-82E3-ADA9713142ED',
    handler: HandleItemEventWhenItemIsEventSource(
        (_e, _item, data) => {
            const targetBlindLevel = Coordinater.SensoryControl.GetLimiterStrength(ItemArchetype.Visor)
            const opaqueFactor = Logistic(3, 2)(targetBlindLevel)
            const dimFactor = Scale(0, 0.8, opaqueFactor)
            const filter: LayerFilter = data['Filters'][GlassLayerName] ?? {}
            filter.saturation = 1
            filter.alpha = Scale(1, 3.4, opaqueFactor)
            filter.brightness = Scale(1, 0.2, dimFactor)
            // const colorFactor = Scale(1, 0.4, dimFactor)
            // filter.red *= colorFactor
            // filter.green *= colorFactor
            // filter.blue *= colorFactor
            // console.log('caled Filters', filter)
            data['Filters'][GlassLayerName] = filter
        }
    ),
})

const MakeVisor = (template: string) =>
    MakeMachinePrimeVariant({
        template,
        events: [
            CalcVisorFilter,
            MakeAddTagsEvent([ItemArchetype.Visor]),
            MakeRegisterItemOnApplyEvent(ItemArchetype.Visor),
            MakeUnRegisterItemOnRemovalEvent(ItemArchetype.Visor),
        ]
    })

export const GetVisor = Function.CacheWith({
    func: (
        variant: Futuristic.GlassVisor.DollmakerGoggle |
            Futuristic.GlassVisor.DollmakerMask
    ) => MakeVisor(
        Futuristic.GlassVisor.GetSocketedVisorVariant(variant)
    )
})
export const SetBlindStrength = (value?: number) =>
    Coordinater
        .SensoryControl
        .SetLimiterStrength(ItemArchetype.Visor, value ?? Math.random())