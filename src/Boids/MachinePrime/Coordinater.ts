import { v7 as NewUUID } from 'uuid'
import { AddEventHandler } from '../../KDInterface/KDExtension'
import { KinkyDungeonSendEvent } from 'kd-structured'
import { FrozenObject, KeyPath, PropAtPath } from '../../Utilities'
import { ItemArchetype } from './Common'

interface ItemStateBase {
    readonly RegisteredItems: {
        readonly [_: string]: true
    }
}

interface Gag extends ItemStateBase {
    readonly TargetGagStrength: number
}

interface ItemRegistry {
    readonly [ItemArchetype.Visor]: ItemStateBase
    readonly [ItemArchetype.HeadPhone]: ItemStateBase
    readonly [ItemArchetype.Gag]: Gag
}

interface Entry {
    readonly ID: string
    readonly Items: ItemRegistry
}

interface State {
    readonly ActivePC: Entry
    readonly ActiveNPC: Readonly<Record<string, Entry>>
}

export const GameDataStateKey = '68C84945-3A9A-4024-8CC6-E3CE092E9154' as const
declare global {
    interface KDGameDataBase {
        [GameDataStateKey]: State
    }
}

KDGameDataBase[GameDataStateKey] = Object.freeze({
    ActivePC: {
        ID: NewUUID(),
        Items: {
            [ItemArchetype.Gag]: {
                TargetGagStrength: 0,
                RegisteredItems: Object.freeze({})
            },
            [ItemArchetype.HeadPhone]: {
                RegisteredItems: Object.freeze({})
            },
            [ItemArchetype.Visor]: {
                RegisteredItems: Object.freeze({})
            }
        },
    },
    ActiveNPC: {
    },
} satisfies State)

const GetState = () => KDGameData[GameDataStateKey]

const SetState = (newState: State) => {
    // TODO: Handle synchronization across save, etc
    KDGameData[GameDataStateKey] = newState
    return newState
}

const SetStateIn = <Path extends KeyPath<State>>(path: Path, newProp: PropAtPath<State, Path>) =>
    SetState(FrozenObject.CopySetIn(GetState(), path, newProp))

export const InitState = () => {
    console.info(`Boids: setting KDGameData[${GameDataStateKey}]`)
    SetState(KDGameDataBase[GameDataStateKey])
}

AddEventHandler({
    eventMap: KDEventMapGeneric,
    trigger: 'afterLoadGame',
    type: 'B8D7875F-EDC2-41AA-B96B-3C91E905C761',
    handler(_e, _data) {
        if (null == KDGameData[GameDataStateKey]) {
            InitState()
        }
        // else {
        //     console.info(`Boids: afterLoadGame, KDGameData[${GameDataStateKey}] is set.`)
        // }
    },
})

export const enum EventKeys {
    BeforeRegister = '3AED5D62-7144-4340-AA64-2E1F0C93FAAF',
    AfterRegister = '58D8130E-FF31-4FB0-AFB6-244FE29AB85C',
    TargetGagStrengthUpdate = '26228B48-2471-481C-92B7-420F6F5513C9'
}

export interface TargetGagStrengthUpdateEventArgs {
    OldStrength: number,
    NewStrength: number
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

    SetStateIn(['ActivePC', 'Items', ItemArchetype.Gag, 'RegisteredItems', restraint.name], true)

    // console.info('Boids: Register', newPC)

    KinkyDungeonSendEvent({
        Event: EventKeys.AfterRegister,
        data: {
            ...args,
            NewPC: GetState().ActivePC
        }
    })
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

AddEventHandler({
    eventMap: KDEventMapGeneric,
    trigger: 'tick',
    type: '90F84036-7836-473E-BE57-14009ABE6158',
    handler(e, data) {
        SetTargetGagStrength(Math.random())
    },
})