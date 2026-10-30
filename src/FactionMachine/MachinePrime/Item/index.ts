/**
 * The machine-prime items: the visors and gags that register themselves with the coordinator.
 * Importing this barrel runs both item modules, which is what registers their restraints and event
 * handlers.
 * @module FactionMachine/MachinePrime/Item
 */

/** The inflatable mufflers, and the ball socket that installs them. */
export * as Gag from './Gag'
/** The hard light visors, in a Boids-glass and a Dollmaker-glass family. */
export * as Visor from './Visor'