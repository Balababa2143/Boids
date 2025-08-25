
import { ModelSetRootDir } from '../Common'
import { MakeLayerVariant, ModelLayerVariantMap, TransformInstance as VariantTransformer } from '../../../KDInterface/VariantItem'
import { GlassType, Layering, Level, Variant, VariantToString } from './Common'
import { Function } from '../../../Utilities'

/**
 * Text keys for coloring components by faction.
 */
export const enum InheritColor {
    Glass = 'Glass',
    BaseMetal = 'BaseMetal'
}

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
    [Layering.UnderMask]: (layer) => ({
        ...layer,
        Layer: 'Goggles',
        Pri: 14
    }),
    [Layering.UnderBlindfold]: (layer) => ({
        ...layer,
        Layer: 'Mask',
        Pri: -10
    }),
    [Layering.UnderHood]: (layer) => ({
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

const DollMakerVisorFolder = 'Visors' as const
const BoidsGlassVisorFolder = `${ModelSetRootDir}/Visor` as const

const SetFolder = (folder: string) => (template: Partial<ModelLayer>) => ({
    ...template,
    Folder: folder
} satisfies Partial<ModelLayer>)

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
    Function.CacheWith({
        toString: VariantToString,
        func: MakeLayerVariant({
            template: GlassLayerTemplate,
            VariantMap
        })
    })

for (let GlassType = 0; GlassType < 4; GlassType++) {
    for (let _Colorize = 0; _Colorize <= 1; _Colorize++) {
        const Colorize = _Colorize > 0
        for (let Layering = 0; Layering < 4; Layering++) {
            if (GlassType > 1) {
                for (let Level = 1; Level < 5; Level++) {
                    console.log('Boids: variant debug GetVariant', GetVariant({
                        Colorize,
                        GlassType,
                        Layering,
                        Level: Level as Level,
                    }))
                }
            }
            else {
                console.log('Boids: variant debug GetVariant', GetVariant({
                    Colorize,
                    GlassType,
                    Layering,
                }))
            }
        }
    }
}
