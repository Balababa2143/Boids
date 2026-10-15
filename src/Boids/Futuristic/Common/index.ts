/**
 * The fragments the futuristic item families share: where their models live, what
 * they sound like, the variant part that conditions an item on a tag, and the
 * restraint literals that are identical wherever they appear.
 * @module Boids/Futuristic/Common
 */

/** The root folder of the futuristic model set. */
export * as Constant from './Constant'
/** The lock and unlock sound pairs the items use. */
export * as SFX from './SFX'
/** The variant part that makes an item require a tag the player is carrying. */
export * as VariantPart from './VariantPart'
/** Restraint fragments repeated verbatim across the item families. */
export * from './RestraintPart'