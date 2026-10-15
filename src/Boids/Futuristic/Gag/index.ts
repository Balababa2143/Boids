/**
 * The gag family's barrel: the variant vocabulary a metal gag is described with,
 * the layers and model factory behind it, the registered face covers, and the
 * sockets a muffler fills.
 * @module Boids/Futuristic/Gag
 */

/** The variant axes a metal gag is described by, plus `MakeItem`. */
export * as Common from './Common'
/** The per-component layers, the colour keys and the registering model factory. */
export * as GagMetal from './GagMetal'
/** The registered face covers: four flat harnesses and six muzzles. */
export * as FaceCover from './FaceCover'
/** The mouth sockets a face cover exposes, and the devices that fill them. */
export * as Muffler from './Muffler'
