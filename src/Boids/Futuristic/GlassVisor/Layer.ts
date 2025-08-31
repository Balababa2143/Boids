
import { AddValidVariants, default as Variant} from './Variant'
import { GlassType, InheritColor, Layering } from './Constant'
import { AsVariantKey, VariantBuilder, VariantKey, VariantOrKey, VariantPart } from '../../../KDExtension'
import { Map } from 'immutable'
import { ThrowIfNull } from '../../../Utilities'

export const GlassLayerName = '0307649C-E62D-4AAF-BFFF-BF5F87EE2106' as const

const GlassLayerTemplate = {
    Name: GlassLayerName,
    Invariant: true,
    HideWhenOverridden: false
} as const satisfies Partial<ModelLayer>


const GlassLayerPartColorization: VariantPart<ModelLayer> = {
    InheritColor: InheritColor.Glass,
}

const GlassLayerPartLayering = {
    [Layering.Goggle]: {
        Layer: 'Goggles',
        Pri: 14
    },
    [Layering.Mask]: {
        Layer: 'Mask',
        Pri: -10
    },
    [Layering.Blindfold]: {
        Layer: 'Blindfold',
        Pri: 14
    },
    [Layering.Hood]: {
        Layer: 'Hood',
        Pri: -10
    },
} as const satisfies Record<string, VariantPart<ModelLayer>>

const GlassSpriteBaseName = {
    [GlassType.DollmakerGoggle]: 'Dollmaker',
    [GlassType.DollmakerMask]: 'DollmakerFull',
    [GlassType.BoidsGoggle]: 'Goggles',
    [GlassType.BoidsMask]: 'Mask',
} as const

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

export const ValidVariantMap = (() => {
    const builder = new VariantBuilder<Variant, ModelLayer>()

    const AddVariant = (variant) => {
        const parts: VariantPart<ModelLayer>[] = []
        parts.push(GlassLayerPartLayering[variant.Layering])
        parts.push({
            Sprite: GetGlassLayerSpritename(variant)
        })
        switch (variant.GlassType) {
            case GlassType.BoidsGoggle:
            case GlassType.BoidsMask:
                if (variant.Colorize) {
                    parts.push(GlassLayerPartColorization)
                }
        }
        builder.Add(variant, parts)
    }

    AddValidVariants(AddVariant)

    const variantMap = builder.BuildVariantMap({
        template: GlassLayerTemplate
    })

    return variantMap as Map<VariantKey<Variant>, ModelLayer>
})()

export const GetVariant =
    (variant: VariantOrKey<Variant>) => ThrowIfNull(ValidVariantMap.get(AsVariantKey<Variant>(variant)))
