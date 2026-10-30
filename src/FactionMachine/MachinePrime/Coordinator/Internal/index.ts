/**
 * The coordinator's own bookkeeping: the state records a save is made of, and the storage that
 * addresses and serialises them. Items do not touch the state directly: they register through
 * `Coordinator/Public` and read through `Coordinator/SensoryControl`.
 * @module FactionMachine/MachinePrime/Coordinator/Internal
 */

export type State = typeof import('./State')
/** The record types a coordinator save is made of, each with a `fromJS` companion. */
export * as State from './State'

export type StateStorage = typeof import('./StateStorage')
/** The accessors for the coordinator's live state, and its save round-trip. */
export * as StateStorage from './StateStorage'

export type SavePrompts = typeof import('./SavePrompts')
/** The two save decisions put to the player, as prompt specs. */
export * as SavePrompts from './SavePrompts'

export type Integrity = typeof import('./Integrity')
/** The recomputation check run at load: a stored name against the key it derives from. */
export * as Integrity from './Integrity'