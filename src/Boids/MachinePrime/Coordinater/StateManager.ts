
import { AddEventHandler } from '../../../KDExtension'
import { KinkyDungeonSendEvent } from 'kd-structured'
import { ItemArchetype } from '../Constant'
import { SetTargetGagStrength } from './Gag'
import { GetState, SetStateIn } from './StateStorage'

export const enum EventKeys {
    BeforeRegister = '3AED5D62-7144-4340-AA64-2E1F0C93FAAF',
    AfterRegister = '58D8130E-FF31-4FB0-AFB6-244FE29AB85C',
}

export const Register = (args: { restraint: Named, type: ItemArchetype }) => {
    const {
        restraint,
        type
    } = args

    KinkyDungeonSendEvent({
        Event: EventKeys.BeforeRegister,
        data: args
    })

    SetStateIn(
        ['ActivePC', 'Items', type, 'RegisteredItems'],
        GetState().ActivePC.Items[type].RegisteredItems.add(restraint.name)
    )

    // console.info('Boids: Register', newPC)

    KinkyDungeonSendEvent({
        Event: EventKeys.AfterRegister,
        data: {
            ...args,
            NewPC: GetState().ActivePC
        }
    })
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