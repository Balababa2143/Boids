/**
 * The drone coordinator: the control model's dimensions, the save state behind them, the events an
 * item spreads to declare what it moves, and the morph channel its appearance follows.
 *
 * `FactionMachine.MachinePrime.Item` is what these dimensions exist for, and
 * `Boids.FactionMachine.MachinePrime.Debug` is the console driver that pokes at them; a
 * third-party mod that wants a dimension of its own reads `KDExtension.Control` for the mechanism
 * and writes a catalogue of its own rather than editing this one.
 * @module FactionMachine/MachinePrime/Coordinator
 */

// The registration is the reason this import is here at all: the catalogue is a **side effect**, so
// reaching it is what puts the descriptors in the registry. It is first so the registration happens
// before anything below it can resolve a dimension and find none. A coordinator whose catalogue nobody
// imported is a control model that answers the baseline for everything — a failure that looks like a
// working store.
import './Catalog'

/**
 * The morph channel as a type, for a caller that has to name its shape without importing it.
 */
export type SensoryControl = typeof import('./SensoryControl')
/**
 * The strength a dimension is resolving to, the channel a morphing item hears about it on, and the
 * feedback helper the item families share.
 */
export * as SensoryControl from './SensoryControl'

/**
 * The dimension catalogue: which dimensions this faction declares, and everything the control model
 * needs to know about each one.
 */
export * as Catalog from './Catalog'

/**
 * The posture route, **declared and not bound** (§6.13): the two globals a later phase wraps, the
 * words a controlled restraint may not put in its `shrine`, and the flag that says the wrap has not
 * been made.
 */
export * as PoseRoute from './PoseRoute'

/** The item-facing half: the dossier, the checked writes, and the resolution. */
export * from './Public'
