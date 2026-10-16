/**
 * The machine-prime items: the visors and gags that register themselves with the
 * coordinator and are morphed by it.
 *
 * Importing this barrel is what runs both item modules, and therefore what registers
 * their restraints and event handlers; the two namespaces are the handles a consumer
 * uses to build a variant from them.
 * @module FactionMachine/MachinePrime/Item
 */

/** The inflatable mufflers, and the ball socket that installs them. */
export * as Gag from './Gag'
/** The hard light visors, in a Boids-glass and a Dollmaker-glass family. */
export * as Visor from './Visor'