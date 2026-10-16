/**
 * The machine major faction: its outfit layer, its first sub-faction, and the demo driver.
 *
 * The three namespaces are published one level down, under this folder's own name
 * (`Boids.FactionMachine`), so the surface reads as *factions, plus shared UI* and a second
 * faction is a sibling of this folder rather than a fourth name on the surface. What the mod
 * shares across factions lives in `src/Common/` and is not published from here.
 *
 * The exports below are **order-sensitive**: `export * as … from …` declarations are hoisted
 * and their targets evaluated in textual order, so `Futuristic`'s tree — including the glass
 * and gag families `MachinePrime` builds on — is registered before `MachinePrime` runs, and
 * `DebugStart`, which reads both, is registered last.
 * @module FactionMachine
 */

/** The outfit layer: cuffs, straps, suits, gags, visors, links and their models. */
export * as Futuristic from './Futuristic'
/** The machine-prime sub-faction: the drone coordinator and the items that drive it. */
export * as MachinePrime from './MachinePrime'
/** Console drivers; importing them also registers the `Drone Toys` start perk. */
export * as DebugStart from './DebugStart'
