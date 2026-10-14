/**
 * HUD model-set vocabulary.
 *
 * The glass layer/colour/tag vocabulary itself lives in
 * `GlassVisor/Constant.ts` and is shared; this module only holds what is specific
 * to the HUD set. It previously carried a second, byte-identical copy of the
 * tag table and a second layering enum family, both of which turned out to have
 * no consumer once the commented-out HUD restraint module was removed.
 */

import { MakeGlassLayerTemplate } from '../GlassVisor/Constant'

export interface IModelVariantBase {
    UseFactionColor: boolean
}

/**
 * The HUD set's own glass layer. Distinct from the visor set's layer
 * (`GlassVisor/Layer.ts`) because the layer name is its identity.
 */
export const GlassLayerTemplate = MakeGlassLayerTemplate('019f89e6-0e42-7f7d-b5e0-606dc1c0bd58')

export const ModelTemplate = {
    Categories: ['Accessories', 'Face'],
    Restraint: true,
    TopLevel: true,
} satisfies Partial<Model>
