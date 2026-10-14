/**
 * Controls the vision and hearing ability of drones
 * @module Boids/MachinePrime/Coordinator
 * @see module:Boids/MachinePrime/Coordinator/SensoryControl
 */
export type SensoryControl = typeof import('./SensoryControl')
export * as SensoryControl from './SensoryControl'

export * from './Public'