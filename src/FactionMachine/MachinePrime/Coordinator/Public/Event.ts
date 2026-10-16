/**
 * The two events an item spreads into its own `events` list so the coordinator
 * learns it exists: one adds the item's name to its archetype's slot when the game
 * applies it, the other takes the name out again when the item is removed.
 *
 * Both register their game handler once, at import time, and each then returns a
 * builder. An item module calls the builder per variant to stamp its archetype onto
 * an event whose handler is already in place — one handler for every machine-prime
 * item, not one per item.
 * @module FactionMachine/MachinePrime/Coordinator/Public/Event
 */

import * as ItemManagement from './ItemManagement'
import * as KDEx from '../../../../KDExtension'
import { KinkyDungeonEventPostRemovalData } from '../../../../KDInterface/Event'
import { ItemArchetype } from '../../Constant'

/**
 * A game event carrying the archetype the handler should act on.
 *
 * The item event itself does not say which sensory slot an item belongs to, so the
 * builder's `processArgs` supplies the tag and the handler reads it back. Every
 * event built by this module is one of these.
 */
export interface EventWithItemArchetype extends KinkyDungeonEvent {
    ItemArchetype: ItemArchetype
}

/**
 * Builds the event an item uses to register itself with the coordinator when the
 * game applies it.
 *
 * The handler runs only when the item it is handed is the source of the event, or is
 * reached from the source through `dynamicLink`, so a dynamically linked restraint
 * is not mistaken for the one being applied. It then adds the item's name to the
 * `RegisteredItems` set of the slot the archetype names, which makes a repeat
 * registration a no-op.
 *
 * @param itemArcheType - The sensory slot this item occupies.
 * @returns An event to spread into the restraint's `events` list.
 */
export const RegisterItemOnApply = KDEx.MakeEventBuilder<EventWithItemArchetype>()({
    eventTemplate: KDEx.AddEventHandler({
        eventMap: KDEventMapInventory,
        trigger: 'postApply',
        type: '84E37F14-A8F7-4D5B-9B38-C0F89ECC4C2C',
        handler: KDEx.HandleItemEventWhenItemIsEventSource(
            (e, item, _data) => {
                const event = e as EventWithItemArchetype
                ItemManagement.Register({
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

/**
 * Builds the event an item uses to release its slot when the game removes it.
 *
 * Unlike the apply half this handler does not check the event's source: it
 * unregisters whichever item the game hands it when the removal fires, matched by
 * name. Removing a name that was never registered is harmless.
 *
 * @param itemArcheType - The sensory slot this item occupied.
 * @returns An event to spread into the restraint's `events` list.
 */
export const UnRegisterItemOnRemoval = KDEx.MakeEventBuilder<EventWithItemArchetype>()({
    eventTemplate: KDEx.AddEventHandler({
        eventMap: KDEventMapInventory,
        trigger: 'postRemoval',
        type: '5588B613-0A09-4383-983F-21FF7036755C',
        handler: (e, item, _data: KinkyDungeonEventPostRemovalData) => {
            const event = e as EventWithItemArchetype
            ItemManagement.UnRegister({
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