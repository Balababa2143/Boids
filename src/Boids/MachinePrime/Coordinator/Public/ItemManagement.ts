/**
 * The two writes that put an item into a sensory slot and take it out again, by
 * name, on the active player's registry.
 *
 * They are the mutating half of the item protocol: `Event.ts` wires them to the
 * game's apply and removal events, so an item normally reaches them through its own
 * `events` list instead of calling them. The set they write is the record of which
 * item holds which slot; nothing in the mod reads it back yet, and
 * `test/coordinator-state.property.test.ts` is what pins its behaviour.
 * @module Boids/MachinePrime/Coordinator/Public/ItemManagement
 */

import { ItemArchetype } from '../../Constant'
import { UpdateStateIn } from '../Internal/StateStorage'

/**
 * Records that an item is now on the active player and belongs to one archetype's
 * slot.
 *
 * The write is read-modify-write through {@link UpdateStateIn}, so a name already
 * in the set leaves the state as it was. Registering the same item twice therefore
 * costs nothing and cannot duplicate it.
 *
 * @param args.restraint - The item being applied; only its name is stored.
 * @param args.type - The archetype whose slot it joins, which is also the tag the
 * item was applied under.
 */
export const Register = (args: { restraint: Named, type: ItemArchetype }) =>
    UpdateStateIn(
        ['ActivePC', 'Items', args.type, 'RegisteredItems'],
        registeredItems => registeredItems.add(args.restraint.name)
    )

/**
 * Records that an item has left the active player, releasing its archetype's slot.
 *
 * Removing a name that was never registered is harmless: the set simply does not
 * change, and `SetState` drops a write that changes nothing.
 *
 * @param args.restraint - The item being removed; matched by name.
 * @param args.type - The archetype whose slot it leaves.
 */
export const UnRegister = (args: { restraint: Named, type: ItemArchetype }) =>
    UpdateStateIn(
        ['ActivePC', 'Items', args.type, 'RegisteredItems'],
        registeredItems => registeredItems.remove(args.restraint.name)
    )
