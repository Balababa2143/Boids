import { v5 as uuidv5 } from 'uuid'
import { AddModelVariant, MergeLayer, ModelVariantDescriptor, ModelVariantMap, VariantTransformer } from '../../../KDInterface/VariantItem'
import { ModelSetRootDir } from '../Common'
import { GlassType, Layering, Level, Variant, VariantToString } from './Common'
import { GetVariant as GetLayerVariant } from './Layer'
import { Function } from '../../../Utilities'

const ModelTemplate = {
    Categories: ['Accessories', 'Face'],
    //Restraint: true,
    TopLevel: true,
} satisfies Partial<Model>

const DollMakerVisorFolder = 'Visors' as const
const BoidsGlassVisorFolder = `${ModelSetRootDir}/Visor` as const

const SetFolder = (folder: string) => (template: Partial<ModelLayer>) => ({
    ...template,
    Folder: folder
} satisfies Partial<ModelLayer>)

const AddHoodMaskPose: VariantTransformer<Model> = (template) => ({
    ...template,
    AddPose: [
        ...template.AddPose ?? [],
        'HoodMask'
    ]
})

const ModelBaseName = 'E5050056-23AD-4935-BBC9-68B49F27FB9A'

const GetModelName = (variant: Variant) => ((template) => ({
    ...template,
    Name: uuidv5(VariantToString(variant), ModelBaseName)
})) satisfies VariantTransformer<Model>

const GetModelDebugDisplayName = (variant: Variant) => `Drone Visor: ${VariantToString(variant)}`

const VariantMap: ModelVariantMap<Variant> = (variant) => {
    const Transformers: VariantTransformer<Model>[] = []
    Transformers.push(
        GetModelName(variant),
        MergeLayer([GetLayerVariant(variant)])
    )
    switch(variant.GlassType)
    {
        case GlassType.DollmakerGoggle:
        case GlassType.DollmakerMask:
            Transformers.push(SetFolder(DollMakerVisorFolder))
            break
        case GlassType.BoidsGoggle:
        case GlassType.BoidsMask:
            Transformers.push(SetFolder(BoidsGlassVisorFolder))
            break
        default:
            throw new TypeError('Unknown GlassType')
    }
    if(variant.Layering === Layering.Hood){
        Transformers.push(AddHoodMaskPose)
    }

    return {
        Transformers,
        Text: {
            DisplayName: GetModelDebugDisplayName(variant)
        }
    }
}

export const GetGlassModelVariant =
    Function.CacheWith({
        toString: VariantToString,
        func: AddModelVariant({
            template: ModelTemplate,
            VariantMap: VariantMap
        })
    })

for (let GlassType = 0; GlassType < 4; GlassType++) {
    for (let _Colorize = 0; _Colorize <= 1; _Colorize++) {
        const Colorize = _Colorize > 0
        for (let Layering = 0; Layering < 4; Layering++) {
            if (GlassType > 1) {
                for (let Level = 1; Level < 5; Level++) {
                    console.log('Boids: variant debug GetVariant', GetGlassModelVariant({
                        Colorize,
                        GlassType,
                        Layering,
                        Level: Level as Level,
                    }))
                }
            }
            else {
                console.log('Boids: variant debug GetVariant', GetGlassModelVariant({
                    Colorize,
                    GlassType,
                    Layering,
                }))
            }
        }
    }
}