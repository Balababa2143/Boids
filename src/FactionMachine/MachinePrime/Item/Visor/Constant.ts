/**
 * The item-data keys the morphable visors share, kept out of the framework so that every glass
 * family and every reader of them agrees on the same GUIDs.
 * @module FactionMachine/MachinePrime/Item/Visor/Constant
 */

/**
 * Marks a worn item as a morphable visor. Both the blindness contribution and the Dollmaker layer
 * filter act only on items carrying it, which keeps the mod's other glass visors out of the
 * limiter's way.
 */
export const HardLightVisor = '4F575103-E9A2-4C34-BEAD-9E7173B1913D' as const

/**
 * Holds the partial variant a visor was built from, so a strength update can re-model the item
 * without knowing which restraint name it was equipped as.
 */
export const VariantInfo = 'A2C4BB95-0C66-4461-905E-35E3186403E9' as const