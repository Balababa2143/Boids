import { ItemArchetype } from '../Constant'
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
