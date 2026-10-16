/**
 * The item-data keys the morphable visors share, kept out of the framework so that
 * every glass family and every reader of them agrees on the same GUIDs.
 * @module FactionMachine/MachinePrime/Item/Visor/Constant
 */

/**
 * Marks a worn item as a morphable visor.
 *
 * `MorphableVisorCommonEvents` writes it onto the item's data, and both the blindness
 * contribution and the Dollmaker layer filter act only on items carrying it — that is
 * what keeps the mod's other glass visors out of the limiter's way.
 */
export const HardLightVisor = '4F575103-E9A2-4C34-BEAD-9E7173B1913D' as const

/**
 * Holds the partial variant a visor was built from.
 *
 * `MakeMorphableVisor` reads it back on every strength update and hands it to the
 * family's `GetTemplateForStrength`, which is how the item can be re-modelled without
 * knowing which restraint name it was equipped as.
 */
export const VariantInfo = 'A2C4BB95-0C66-4461-905E-35E3186403E9' as const