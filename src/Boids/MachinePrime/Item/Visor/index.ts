/**
 * The machine-prime visors: two glass families built on one framework, and the
 * blinder-strength console entry point kept at this path.
 * @module Boids/MachinePrime/Item/Visor
 */

/** The Dollmaker glass, whose dimming is a layer filter rather than a blind level. */
export * as Dollmaker from './Dollmaker'
/** The Boids glass: four blind levels, full colour or dark. */
export * as Boids from './Boids'

/**
 * Kept at this path because it is a console entry point
 * (`MachinePrime.Item.Visor.SetBlindStrength`); the implementation now lives with
 * the rest of the development scaffolding.
 */
export { SetBlindStrength } from '../../Debug'
