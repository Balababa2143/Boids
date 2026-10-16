/**
 * The coordinator's own bookkeeping: the state records a save is made of, and the
 * storage that addresses and serialises them.
 *
 * It sits inside the coordinator but the `Coordinator` barrel does not re-export this
 * folder, because items are not meant to touch the state directly: they register
 * through `Coordinator/Public` and read their limiter through
 * `Coordinator/SensoryControl`. The records are nevertheless part of the published
 * types, so this is the documentation for a caller that has to inspect or seed a save
 * rather than let the coordinator own it.
 * @module FactionMachine/MachinePrime/Coordinator/Internal
 */

/** The state records as a type, so a caller can name the module without importing. */
export type State = typeof import('./State')
/** The record types a coordinator save is made of, each with a `fromJS` companion. */
export * as State from './State'

/** The storage module as a type, so a caller can name it without importing it. */
export type StateStorage = typeof import('./StateStorage')
/** The accessors for the coordinator's live state, and its save round-trip. */
export * as StateStorage from './StateStorage'

/** The prompt module as a type, so a caller can name it without importing it. */
export type SavePrompts = typeof import('./SavePrompts')
/** The two save decisions put to the player, as prompt specs. */
export * as SavePrompts from './SavePrompts'

/** The integrity module as a type, so a caller can name it without importing it. */
export type Integrity = typeof import('./Integrity')
/** The recomputation check run at load: a stored name against the key it derives from. */
export * as Integrity from './Integrity'