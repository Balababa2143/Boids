/**
 * The dimension catalogue: which dimensions this faction declares, and everything the control
 * model needs to know about each one.
 *
 * Importing this module is what **registers** the dimensions — the same one-shot,
 * throw-on-duplicate side effect every other registration module in this repo carries — so it is
 * reached from `Coordinator/index.ts` rather than only by whoever wants to read it. A catalogue
 * nobody imported is a control model with no dimensions, which is exactly the failure mode that
 * looks like a working store returning baselines for everything.
 *
 * The mechanism these records are handed to lives in `KDExtension/Control`; a second faction
 * writes a folder like this one and changes nothing below it.
 * @module FactionMachine/MachinePrime/Coordinator/Catalog
 */

export * from './Name'

/**
 * The descriptors, imported for the side effect of registering them.
 *
 * A namespace rather than a flat re-export, because the module has no exports of its own: what it
 * does is registration, and the registry is where the records are read from (`AllDimensions`).
 */
export * as Dimensions from './Dimensions'
