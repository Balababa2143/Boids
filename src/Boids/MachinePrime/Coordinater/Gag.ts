import { KinkyDungeonSendEvent } from 'kd-structured'
import { ItemArchetype } from '../Common'
import { GetState, SetStateIn } from './StateStorage'

export interface TargetGagStrengthUpdateEventArgs {
    OldStrength: number,
    NewStrength: number
}

export const enum EventKeys {
    TargetGagStrengthUpdate = '26228B48-2471-481C-92B7-420F6F5513C9'
}

export const SetTargetGagStrength = (newStrength: number) => {
    const oldStrength = GetState().ActivePC.Items[ItemArchetype.Gag].TargetGagStrength
    if (oldStrength !== newStrength) {
        SetStateIn(['ActivePC', 'Items', ItemArchetype.Gag, 'TargetGagStrength'], newStrength)
        KinkyDungeonSendEvent({
            Event: EventKeys.TargetGagStrengthUpdate,
            data: {
                OldStrength: oldStrength,
                NewStrength: newStrength
            } satisfies TargetGagStrengthUpdateEventArgs
        })
    }
}