import * as KDS from 'kd-structured'
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
        KDS.KinkyDungeonSendEvent({
            Event: EventKeys.SensoryLimiterStrengthUpdate,
            data: {
                Type: controllerType,
                OldStrength: oldStrength,
                NewStrength: newStrength
            } satisfies LimiterStrengthUpdateEventArgs
        })
    }
    KinkyDungeonAdvanceTime(1)
}

export const ShowEffectsOnItemMorph = (args:{
    delta: number,
    sfxIncrease?: string,
    sfxDecrease?: string,
    messageIncrease?: KDS.IKinkyDungeonSendTextMessageParameters
    messageDecrease?: KDS.IKinkyDungeonSendTextMessageParameters
}) => {
    const {
        delta,
        sfxIncrease,
        sfxDecrease,
        messageIncrease,
        messageDecrease
    } = args
    if(delta > 0 && null != messageIncrease){
        KDS.KinkyDungeonSendTextMessage(messageIncrease)
    }
    else if(null != messageDecrease){
        KDS.KinkyDungeonSendTextMessage(messageDecrease)
    }

    if (KDSoundEnabled()) {
        if (delta > 0 && null != sfxIncrease) {
            AudioPlayInstantSoundKD(`${KinkyDungeonRootDirectory}Audio/${sfxIncrease}.ogg`)
        }
        else if(null != sfxDecrease) {
            AudioPlayInstantSoundKD(`${KinkyDungeonRootDirectory}Audio/${sfxDecrease}.ogg`)
        }
    }
}


AddEventHandler({
    eventMap: KDEventMapGeneric,
    trigger: 'tick',
    type: '90F84036-7836-473E-BE57-14009ABE6158',
    handler(e, data) {
        // console.info('Boids: tick')
        if(Math.random() < 0.25){
            SetLimiterStrength(ItemArchetype.Gag, Math.random())
        }
        else if(Math.random() < 0.2){
            SetLimiterStrength(ItemArchetype.Visor, Math.random() * 4)
        }
    },
})