import * as Coordinater from '../Coordinater'
import * as KDEx from '../../../KDExtension'
import { KinkyDungeonEventPostRemovalData } from '../../../KDInterface/Event'
import { ItemArchetype } from '../Constant'

export interface EventWithItemArchetype extends KinkyDungeonEvent {
    ItemArchetype: ItemArchetype
}

export const RegisterItemOnApply = KDEx.MakeEventBuilder<EventWithItemArchetype>()({
    eventTemplate: KDEx.AddEventHandler({
        eventMap: KDEventMapInventory,
        trigger: 'postApply',
        type: '84E37F14-A8F7-4D5B-9B38-C0F89ECC4C2C',
        handler: KDEx.HandleItemEventWhenItemIsEventSource(
            (e, item, _data) => {
                const event = e as EventWithItemArchetype
                Coordinater.Register({
                    restraint: item,
                    type: event.ItemArchetype
                })
            }
        )
    }),
    extraEventProps: {
        inheritLinked: true
    },
    processArgs: (itemArcheType: ItemArchetype) => ({
        ItemArchetype: itemArcheType
    } satisfies Partial<EventWithItemArchetype>)
})

export const UnRegisterItemOnRemoval = KDEx.MakeEventBuilder<EventWithItemArchetype>()({
    eventTemplate: KDEx.AddEventHandler({
        eventMap: KDEventMapInventory,
        trigger: 'postApply',
        type: '5588B613-0A09-4383-983F-21FF7036755C',
        handler: (e, item, _data: KinkyDungeonEventPostRemovalData) => {
            const event = e as EventWithItemArchetype
            Coordinater.UnRegister({
                restraint: item,
                type: event.ItemArchetype
            })
        } 
    }),
    extraEventProps: {
        inheritLinked: true
    },
    processArgs: (itemArcheType: ItemArchetype) => ({
        ItemArchetype: itemArcheType
    } satisfies Partial<EventWithItemArchetype>)
})