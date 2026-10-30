/**
 * The machine major faction: its outfit layer, its sub-faction and the demo driver. The exports are
 * order-sensitive: `export * as … from …` is hoisted and evaluated in textual order, so
 * `Futuristic` registers before `MachinePrime` builds on it, and `DebugStart`, which reads both, is
 * registered last.
 * @module FactionMachine
 */

/** The outfit layer: cuffs, straps, suits, gags, visors, links and their models. */
export * as Futuristic from './Futuristic'
/** The machine-prime sub-faction: the drone coordinator and the items that drive it. */
export * as MachinePrime from './MachinePrime'
/** Console drivers; importing them also registers the `Drone Toys` start perk. */
export * as DebugStart from './DebugStart'
