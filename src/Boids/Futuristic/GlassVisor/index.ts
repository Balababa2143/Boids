/**
 * The glass visor family: the restraint a player wears over the eyes or face,
 * and the layer and model each of its variants renders as.
 *
 * A variant key spells one visor out completely — its glass, where it sits,
 * whether it needs a socket and whether it hides the brows — and `GetVariant`
 * turns that key back into the name of the restraint this barrel registered at
 * import time. Importing the barrel registers the whole family, layers and models
 * included.
 * @module Boids/Futuristic/GlassVisor
 */

/** The shared vocabulary: glass types, layerings, socket tags and sprite names. */
export * as Constant from './Constant'
/**
 * Spelled out rather than `export * as Variant`, because consumers use `Variant`
 * as a type (the glass union) as well as a namespace.
 */
export { Level, BoidsGoggle, BoidsMask, DollmakerGoggle, DollmakerMask, default as Variant, } from './Variant'
/** Builds the glass layer a variant renders as, and looks one up by its key. */
export * as Layer from './Layer'
/** Builds and registers the model for a variant, plus the mask mount's model. */
export * as Model from './Model'
/** The registered restraints: `FullMaskMount`, and `GetVariant` to look one up. */
export * from './Item'