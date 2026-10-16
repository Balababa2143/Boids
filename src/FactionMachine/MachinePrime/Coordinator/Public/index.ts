/**
 * What an item may use to take part in the coordinator: the calls that register it
 * against a sensory slot, and the prebuilt game events that make those calls when
 * the game applies or removes it.
 *
 * Both halves reach the state through `Coordinator/Internal`, so nothing here names
 * a state record directly.
 * @module FactionMachine/MachinePrime/Coordinator/Public
 */

/** The calls an item's own events make to claim or release a sensory slot. */
export * from './ItemManagement'
/** The event builders an item spreads into its restraint's `events` list. */
export * from './Event'