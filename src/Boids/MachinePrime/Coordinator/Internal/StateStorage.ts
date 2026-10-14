import { AddEventHandler } from '../../../../KDExtension'
import { State } from './State'
import { KeyPath, PropAtPath } from '../../../../Utilities'

const GameDataStateKey = '68C84945-3A9A-4024-8CC6-E3CE092E9154' as const

declare global {
    interface KDGameDataBase {
        [GameDataStateKey]: ReturnType<State['toJS']>
    }
}

let CoordinatorState: State = State()

export const GetState = () => CoordinatorState

export const SetState = (newState: State) => {
    // TODO: Handle synchronization across save, etc
    if(!newState.equals(CoordinatorState)){
        CoordinatorState = newState
    }
    return newState
}

export const SetStateIn = <Path extends KeyPath<State>>(path: Path, newProp: PropAtPath<State, Path>) =>
    SetState(GetState().setIn(path, newProp))

/**
 * A write whose value is derived from what is already stored. The path is spelled
 * once, so the read and the write cannot drift apart.
 *
 * The cast is Immutable's: `getIn` is typed as returning `unknown` however the
 * path is typed, while `setIn` keeps the path's type. Writing a value the caller
 * computed stays checked by `SetStateIn`.
 */
export const UpdateStateIn = <Path extends KeyPath<State>>(path: Path, update: (current: PropAtPath<State, Path>) => PropAtPath<State, Path>) =>
    SetStateIn(path, update(GetState().getIn(path) as PropAtPath<State, Path>))

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
    KDGameDataBase[GameDataStateKey] = CoordinatorState.toJS()
    return _KinkyDungeonGenerateSaveData()
}
