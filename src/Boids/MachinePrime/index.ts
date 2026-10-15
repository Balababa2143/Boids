/**
 * The drone coordinator: the sensory limiters that decide how blind a blinder and
 * how muffled a gag leaves the player, the save state behind them, and the events
 * items register through to become part of the set.
 *
 * Items reach the limiters through `Item`; everything else is read from `Coordinator`.
 * @module Boids/MachinePrime
 */

/** The vision and hearing limiters, their state, and the item-registration events. */
export * as Coordinator from './Coordinator'
/** The items that drive the coordinator: machine-prime visors and gags. */
export * as Item from './Item'
/**
 * Development-only drivers and console entry points; see `Debug.ts` for why the
 * sensory limiter driver is load-bearing placeholder code rather than debris.
 */
export * as Debug from './Debug'
