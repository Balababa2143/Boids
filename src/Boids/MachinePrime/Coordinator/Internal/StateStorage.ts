/**
 * The coordinator's state as a module owns it: one live value, the accessors that
 * read and write it, and the hook that puts it into a save and takes it back out.
 *
 * The live value is an Immutable record tree, so every write produces a new tree and
 * the module swaps its reference; nothing here hands the current tree out to be
 * mutated. `GetState` reads it, the two `…In` helpers are what a caller writes with,
 * and `SetState` replaces the whole tree — which is what the two helpers go through,
 * and what the load path uses when it has a complete state in hand.
 *
 * Persistence is a game-side hook rather than a function here: an `afterLoadGame`
 * handler rebuilds the tree from `KDGameData` when a save carries one, and a wrapper
 * around `KinkyDungeonGenerateSaveData` writes the current tree's `toJS()` back. That
 * write goes to `KDGameDataBase` while the read comes from `KDGameData`; whether the
 * two alias at runtime is unverified — see #48 — so this describes the code as
 * written rather than as it is assumed to work.
 * @module Boids/MachinePrime/Coordinator/Internal/StateStorage
 */

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

/**
 * The coordinator's live state, seeded at module evaluation with a fresh default so a
 * call made before any save is loaded still answers.
 */
export const GetState = () => CoordinatorState

/**
 * Replaces the whole stored state in one step, and returns the state that was passed
 * in.
 *
 * A state that `.equals` the current one is dropped rather than installed, so a write
 * that changes nothing leaves the module holding the object it already had — which is
 * how a no-op `Register` or `UnRegister` leaves the stored tree untouched. This is the
 * wholesale setter: for one value inside the tree, prefer `SetStateIn` or
 * `UpdateStateIn`, which cannot silently discard sibling fields.
 *
 * @param newState - The tree to store, complete; nothing is merged into the old one.
 * @returns `newState`, whether or not it was installed.
 */
export const SetState = (newState: State) => {
    // TODO: Handle synchronization across save, etc
    if(!newState.equals(CoordinatorState)){
        CoordinatorState = newState
    }
    return newState
}

/**
 * Writes one value into the state, at the place a `KeyPath` names, replacing whatever
 * was stored there.
 *
 * The path is an array of keys rather than a dotted string because it is typed:
 * `KeyPath<State>` spells out which chains of fields exist and `PropAtPath` derives
 * what the last one holds, so an unknown field, or a value of the wrong type, is a
 * compile error instead of a lost write. A path like
 * `['ActivePC', 'Items', type, 'TargetStrength']` is one field of one slot of one
 * entity, and assigning through Immutable produces a new tree along the way.
 *
 * Read a value, change it, and write it back is `UpdateStateIn`; use this one when the
 * caller already knows the value to store.
 *
 * @param path - The field to write, as the chain of keys leading to it.
 * @param newProp - The value to store there.
 * @returns The state now in effect.
 */
export const SetStateIn = <Path extends KeyPath<State>>(path: Path, newProp: PropAtPath<State, Path>) =>
    SetState(GetState().setIn(path, newProp))

/**
 * A write whose value is derived from what is already stored. The path is spelled
 * once, so the read and the write cannot drift apart.
 *
 * The cast is Immutable's: `getIn` is typed as returning `unknown` however the
 * path is typed, while `setIn` keeps the path's type. Writing a value the caller
 * computed stays checked by `SetStateIn`.
 *
 * This is the read-modify-write helper: it suits a set that gains or loses a member,
 * or a counter, better than `SetStateIn`, because the caller never has to name the
 * current value.
 *
 * @param path - The field to update, as the chain of keys leading to it.
 * @param update - Called with the value stored there now; its result replaces it.
 * @returns The state now in effect.
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
