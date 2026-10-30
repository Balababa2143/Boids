/**
 * The drone coordinator: the sensory limiters that decide how blind a blinder and how muffled a gag
 * leaves the player, the save state behind them, and the item-registration events.
 * @module FactionMachine/MachinePrime
 */

/** The vision and hearing limiters, their state, and the item-registration events. */
export * as Coordinator from './Coordinator'
/** The items that drive the coordinator: machine-prime visors and gags. */
export * as Item from './Item'
/** Development-only drivers and console entry points. */
export * as Debug from './Debug'
