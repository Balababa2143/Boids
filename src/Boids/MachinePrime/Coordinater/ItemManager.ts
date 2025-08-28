
import { AddEventHandler } from '../../../KDExtension'
import { KinkyDungeonSendEvent } from 'kd-structured'
import { ItemArchetype } from '../Constant'
import { SetLimiterStrength } from './SensoryControl'
import { GetState, SetStateIn } from './StateStorage'

export const enum EventKeys {
}

export const Register = (args: { restraint: Named, type: ItemArchetype }) => {
    const {
        restraint,
        type
    } = args

    SetStateIn(
        ['ActivePC', 'Items', type, 'RegisteredItems'],
        GetState().ActivePC.Items[type].RegisteredItems.add(restraint.name)
    )
}

export const UnRegister = (args: { restraint: Named, type: ItemArchetype }) => {
    const {
        restraint,
        type
    } = args

    SetStateIn(
        ['ActivePC', 'Items', type, 'RegisteredItems'],
        GetState().ActivePC.Items[type].RegisteredItems.remove(restraint.name)
    )
}

// AddEventHandler({
//     eventMap: KDEventMapGeneric,
//     trigger: 'tick',
//     type: '90F84036-7836-473E-BE57-14009ABE6158',
//     handler(e, data) {
//         console.info('Boids: tick')
//         SetTargetGagStrength(Math.random())
//     },
// })