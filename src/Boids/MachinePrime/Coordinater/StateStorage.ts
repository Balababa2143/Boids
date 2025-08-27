import { v7 as NewUUID } from 'uuid'
import { KeyPath, PropAtPath, FrozenObject } from '../../../Utilities'
import { ItemArchetype } from '../Constant'
import { AddEventHandler } from '../../../KDExtension'
import { State } from './State'

const GameDataStateKey = '68C84945-3A9A-4024-8CC6-E3CE092E9154' as const

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
            },
        },
    },
    ActiveNPC: {
    },
} satisfies State)

export const InitState = () => {
    console.info(`Boids: setting KDGameData[${GameDataStateKey}]`)
    SetState(KDGameDataBase[GameDataStateKey])
}

export const GetState = () => KDGameData[GameDataStateKey]

export const SetState = (newState: State) => {
    // TODO: Handle synchronization across save, etc
    KDGameData[GameDataStateKey] = newState
    return newState
}

export const SetStateIn = <Path extends KeyPath<State>>(path: Path, newProp: PropAtPath<State, Path>) =>
    SetState(FrozenObject.CopySetIn(GetState(), path, newProp))

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
