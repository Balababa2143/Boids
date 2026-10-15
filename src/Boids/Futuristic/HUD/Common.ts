/**
 * HUD model-set vocabulary.
 *
 * The glass layer/colour/tag vocabulary itself lives in
 * `GlassVisor/Constant.ts` and is shared; this module only holds what is specific
 * to the HUD set. It previously carried a second, byte-identical copy of the
 * tag table and a second layering enum family, both of which turned out to have
 * no consumer once the commented-out HUD restraint module was removed.
 * @module Boids/Futuristic/HUD/Common
 */

import { MakeGlassLayerTemplate } from '../GlassVisor/Constant'

/**
 * The base every HUD variant key extends. `UseFactionColor` is the HUD set's own
 * switch: when set, the model's glass layer is given `InheritColor.Glass` and is
 * tinted by the game's faction filter instead of using its sprite's own colour.
 */
export interface IModelVariantBase {
    UseFactionColor: boolean
}

/**
 * The HUD set's own glass layer. Distinct from the visor set's layer
 * (`GlassVisor/Layer.ts`) because the layer name is its identity.
 */
export const GlassLayerTemplate = MakeGlassLayerTemplate('019f89e6-0e42-7f7d-b5e0-606dc1c0bd58')

/**
 * The model metadata every HUD visor model shares: an accessory for the face,
 * worn as a restraint, and a top-level wardrobe entry rather than a sub-layer of
 * another item.
 */
export const ModelTemplate = {
    Categories: ['Accessories', 'Face'],
    Restraint: true,
    TopLevel: true,
} satisfies Partial<Model>
