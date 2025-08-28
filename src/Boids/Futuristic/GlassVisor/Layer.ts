
import { MakeLayerVariant, ModelLayerVariantMap, VariantTransformer as VariantTransformer } from '../../../KDInterface/VariantItem'
import { GlassType, Layering, default as Variant} from './Variant'
import { Function } from '../../../Utilities'
import { InheritColor } from './Constant'

export const GlassLayerName = '0307649C-E62D-4AAF-BFFF-BF5F87EE2106' as const

const GlassLayerTemplate = {
    Name: GlassLayerName,
    Invariant: true,
    HideWhenOverridden: false
} as const satisfies Partial<ModelLayer>

const GlassLayerPartColorization: VariantTransformer<ModelLayer> = (layer) => ({
    ...layer,
    InheritColor: InheritColor.Glass,
})

const GlassLayerPartLayering = {
    [Layering.Goggle]: (layer) => ({
        ...layer,
        Layer: 'Goggles',
        Pri: 14
    }),
    [Layering.Mask]: (layer) => ({
        ...layer,
        Layer: 'Mask',
        Pri: -10
    }),
    [Layering.Blindfold]: (layer) => ({
        ...layer,
        Layer: 'Blindfold',
        Pri: 14
    }),
    [Layering.Hood]: (layer) => ({
        ...layer,
        Layer: 'Hood',
        Pri: -10
    }),
} as const satisfies Record<string, VariantTransformer<ModelLayer>>

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

const VariantMap: ModelLayerVariantMap<Variant> =
    (variant) => {
        const Transformers: VariantTransformer<ModelLayer>[] = []
        Transformers.push(GlassLayerPartLayering[variant.Layering])
        Transformers.push((layer) => ({
            ...layer,
            Sprite: GetGlassLayerSpritename(variant)
        }))
        switch (variant.GlassType) {
            case GlassType.BoidsGoggle:
            case GlassType.BoidsMask:
                if (variant.Colorize) {
                    Transformers.push(GlassLayerPartColorization)
                }
        }
        return { Transformers }
    }

export const GetVariant =
    Function.Cached(
        MakeLayerVariant({
            template: GlassLayerTemplate,
            VariantMap
        })
    )
