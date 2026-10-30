/**
 * The dimension catalogue: which dimensions this faction declares, and what the control model needs
 * to know about each one. Importing this module registers the dimensions, a one-shot
 * throw-on-duplicate side effect, which is why `Coordinator/index.ts` imports it: a catalogue
 * nobody imported answers the baseline for everything, which looks like a working store.
 * @module FactionMachine/MachinePrime/Coordinator/Catalog
 */

export * from './Name'

/**
 * The descriptors, imported for the side effect of registering them. A namespace rather than a flat
 * re-export, because the module has no exports of its own: what it does is registration, and the
 * records are read from the registry (`AllDimensions`).
 */
export * as Dimensions from './Dimensions'
