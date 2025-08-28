import { KinkyDungeonSendEvent } from 'kd-structured'
import { ItemArchetype } from '../Constant'
import { GetState, SetStateIn } from './StateStorage'
import { AddEventHandler } from '../../../KDExtension'

type SensoryController = ItemArchetype.HeadPhone | ItemArchetype.Visor | ItemArchetype.Gag

const ThrowIfNotIsSensoryController = (type: ItemArchetype): SensoryController => {
    switch (type) {
        case ItemArchetype.HeadPhone:
        case ItemArchetype.Visor:
        case ItemArchetype.Gag:
            return type
        default:
            throw new Error('Invalid sensory controller type')
    }
}

export interface LimiterStrengthUpdateEventArgs {
    Type: SensoryController
    OldStrength: number
    NewStrength: number
}

export const enum EventKeys {
    SensoryLimiterStrengthUpdate = '26228B48-2471-481C-92B7-420F6F5513C9'
}

export const GetLimiterStrength = (type: ItemArchetype) =>
    GetState().ActivePC.Items[
        ThrowIfNotIsSensoryController(type)
    ].Strength

export const SetLimiterStrength = (type: ItemArchetype, newStrength: number) => {
    const controllerType = ThrowIfNotIsSensoryController(type)
    const oldStrength = GetState().ActivePC.Items[controllerType].Strength
    if (oldStrength !== newStrength) {
        SetStateIn(['ActivePC', 'Items', controllerType, 'Strength'], newStrength)
        KinkyDungeonSendEvent({
            Event: EventKeys.SensoryLimiterStrengthUpdate,
            data: {
                Type: controllerType,
                OldStrength: oldStrength,
                NewStrength: newStrength
            } satisfies LimiterStrengthUpdateEventArgs
        })
    }
}

AddEventHandler({
    eventMap: KDEventMapGeneric,
    trigger: 'calcBlind',
    type: '7BCC6086-764D-42A6-B92C-93E230E7086F',
    handler: (_e, data) => {
        if (KinkyDungeonPlayerTags.get(ItemArchetype.Visor)) {
            data['blindness'] = Math.max(data['blindness'], GetLimiterStrength(ItemArchetype.Visor))
        }
    },
})