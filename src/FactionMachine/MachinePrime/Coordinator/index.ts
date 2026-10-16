/**
 * The drone coordinator: the sensory limiters that decide how blind a blinder and
 * how muffled a gag leaves the player, the save state behind them, and the events
 * an item registers through to become part of the set it drives.
 *
 * `FactionMachine.MachinePrime.Item` is what these limiters exist for, and
 * `Boids.FactionMachine.MachinePrime.Debug` is the console driver that pokes at them;
 * a third-party mod that wants a limiter of its own reads this namespace.
 * @module FactionMachine/MachinePrime/Coordinator
 */

/**
 * The limiter module as a type, for a caller that has to name its shape without
 * importing it for its values — a field holding the namespace, say, rather than one
 * calling it.
 */
export type SensoryControl = typeof import('./SensoryControl')
/** The limiter accessors items read and write, and the event a change sends. */
export * as SensoryControl from './SensoryControl'

/** The item-facing half: register an item against a slot, and the events that do. */
export * from './Public'