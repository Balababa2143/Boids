/**
 * Registar for drone equipments
 * @module Boids/MachinePrime/Coordinator/ItemManagement
 * @see module:Boids/MachinePrime/Coordinator/ItemManagement
 */

import { ItemArchetype } from '../../Constant'
import { UpdateStateIn } from '../Internal/StateStorage'

export const Register = (args: { restraint: Named, type: ItemArchetype }) =>
    UpdateStateIn(
        ['ActivePC', 'Items', args.type, 'RegisteredItems'],
        registeredItems => registeredItems.add(args.restraint.name)
    )

export const UnRegister = (args: { restraint: Named, type: ItemArchetype }) =>
    UpdateStateIn(
        ['ActivePC', 'Items', args.type, 'RegisteredItems'],
        registeredItems => registeredItems.remove(args.restraint.name)
    )
