
/**
 * The glass layer the visor draws: one layer per variant key, carrying the sprite
 * the glass resolves to, the game layer and priority of its layering, and — for
 * the colourised Boids glass — the instruction to take the faction colour.
 *
 * Nothing here registers with the game. `Model.ts` puts the result into a model,
 * and `MachinePrime`'s visor morph handler looks the layer up by name to hang the
 * transparent-glass filter on it.
 * @module FactionMachine/Futuristic/GlassVisor/Layer
 */

import { AddValidVariants, default as Variant} from './Variant'
import { GlassLayerFragments, GlassSpriteName, GlassType, InheritColor, MakeGlassLayerTemplate } from './Constant'
import { VariantMapBuilder, VariantKeyOrImmutable, VariantPart, VariantKeyToImmutable } from '../../../KDExtension'
import { ThrowIfNull } from '../../../Utilities'
import { FromJS } from 'immutable'

/**
 * The layer's name, and therefore its identity: it is the key `ModelLayers` holds
 * the layer under, the string a `LayerFilter` is looked up by, and how the
 * hard-light visor's morph handler finds the layer to dim.
 */
export const GlassLayerName = '0307649C-E62D-4AAF-BFFF-BF5F87EE2106' as const

const GlassLayerTemplate = MakeGlassLayerTemplate(GlassLayerName)


const GlassLayerPartColorization: VariantPart<ModelLayer> = {
    InheritColor: InheritColor.Glass,
}

const GlassSpriteBaseName = {
    [GlassType.DollmakerGoggle]: 'Dollmaker',
    [GlassType.DollmakerMask]: 'DollmakerFull',
    [GlassType.BoidsGoggle]: 'Goggles',
    [GlassType.BoidsMask]: 'Mask',
} as const satisfies Record<GlassType, GlassSpriteName>

const GetGlassLayerSpritename =
    (variant: Variant) => {
        switch (variant.GlassType) {
            case GlassType.DollmakerGoggle:
            case GlassType.DollmakerMask:
                return `${GlassSpriteBaseName[variant.GlassType]}` as const
            case GlassType.BoidsGoggle:
            case GlassType.BoidsMask:
                return `${GlassSpriteBaseName[variant.GlassType]}${variant.Colorize ? 'Light' : 'Dark'}${variant.Level}` as const
        }
    }

const ValidVariantMap = (() => {
    const builder = new VariantMapBuilder<FromJS<Variant>, ModelLayer>()

    const AddVariant = (variant) => {
        const variantKey = VariantKeyToImmutable(variant)
        builder.AddVariantParts(variantKey, [
            GlassLayerFragments[variant.Layering],
            {
                Sprite: GetGlassLayerSpritename(variant)
            }
        ])
        switch (variant.GlassType) {
            case GlassType.BoidsGoggle:
            case GlassType.BoidsMask:
                if (variant.Colorize) {
                    builder.AddVariantPart(variantKey, GlassLayerPartColorization)
                }
        }
    }

    AddValidVariants(AddVariant)

    return builder.BuildVariantMap(GlassLayerTemplate)
})()

/**
 * The layer definition for one visor variant.
 *
 * It is built from the same variant list as the restraint and the model, so every
 * restraint this family registers has exactly one layer behind it.
 *
 * @param variant - The variant key, as a plain literal or already Immutable.
 * @returns The `ModelLayer` to put in a model's `Layers`: its `Sprite`, the
 * `Layer` and `Pri` of its layering, and `InheritColor: 'Glass'` when the glass
 * is colourised.
 * @throws If the key is not one of the variants `AddValidVariants` enumerates.
 */
export const GetVariant =
    (variant: VariantKeyOrImmutable<Variant>) => ThrowIfNull(ValidVariantMap.get(VariantKeyToImmutable<Variant>(variant)))
