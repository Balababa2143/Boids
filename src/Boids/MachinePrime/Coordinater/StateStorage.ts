import { AddEventHandler } from '../../../KDExtension'
import { State } from './State'
import { KeyPathEx, PropAtPath } from 'immutable'

const GameDataStateKey = '68C84945-3A9A-4024-8CC6-E3CE092E9154' as const

declare global {
    interface KDGameDataBase {
        [GameDataStateKey]: ReturnType<State['toJS']>
    }
}

let CoordinaterState: State = State()

export const GetState = () => CoordinaterState

export const SetState = (newState: State) => {
    // TODO: Handle synchronization across save, etc
    if(!newState.equals(CoordinaterState)){
        CoordinaterState = newState
    }
    return newState
}

export const SetStateIn = <Path extends KeyPathEx<State>>(path: Path, newProp: PropAtPath<State, Path>) =>
    SetState(GetState().setIn(path, newProp))

AddEventHandler({
    eventMap: KDEventMapGeneric,
    trigger: 'afterLoadGame',
    type: 'B8D7875F-EDC2-41AA-B96B-3C91E905C761',
    handler(_e, _data) {
        if (null != KDGameData[GameDataStateKey]) {
            SetState(State.fromJS(KDGameData[GameDataStateKey]))
        }
    },
})

const _KinkyDungeonGenerateSaveData = globalThis.KinkyDungeonGenerateSaveData

globalThis.KinkyDungeonGenerateSaveData = function() {
    KDGameDataBase[GameDataStateKey] = CoordinaterState.toJS()
    return _KinkyDungeonGenerateSaveData()
}
