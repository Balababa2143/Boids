/**
 * The drone coordinator: the control model's dimensions, the save state behind them, the events an
 * item spreads to declare what it moves, and the morph channel its appearance follows.
 * `FactionMachine.MachinePrime.Item` is what these dimensions exist for, and
 * `Boids.FactionMachine.MachinePrime.Debug` is the console driver that pokes at them.
 * @module FactionMachine/MachinePrime/Coordinator
 */

// The catalogue's registration is the side effect this import exists for, and it has to run before
// anything below can resolve a dimension.
import './Catalog'

/** The morph channel as a type, for a caller that has to name its shape without importing it. */
export type SensoryControl = typeof import('./SensoryControl')
/**
 * The strength a dimension is resolving to, the channel a morphing item hears it on, and the shared
 * helper.
 */
export * as SensoryControl from './SensoryControl'

/**
 * The dimension catalogue: which dimensions this faction declares, and what the control model knows
 * of each.
 */
export * as Catalog from './Catalog'

/**
 * The posture route: the two globals it wraps when bound, the `shrine` words a controlled restraint
 * may not use, and the flag that records whether the wrap has been made.
 */
export * as PoseRoute from './PoseRoute'

/** The item-facing half: the dossier, the checked writes, and the resolution. */
export * from './Public'
