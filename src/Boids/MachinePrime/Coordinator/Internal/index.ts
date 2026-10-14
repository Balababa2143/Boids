/**
 * State definition of the coordinator
 * @module Boids/MachinePrime/Coordinator/State
 * @see module:Boids/MachinePrime/Coordinator/State
 */
export type State = typeof import('./State')
export * as State from './State'

/**
 * Manage coordinator state and serialization
 * @module Boids/MachinePrime/Coordinator/StateStorage
 * @see module:Boids/MachinePrime/Coordinator/StateStorage
 */
export type StateStorage = typeof import('./StateStorage')
export * as StateStorage from './StateStorage'