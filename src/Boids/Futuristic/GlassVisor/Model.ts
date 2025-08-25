import { v5 as uuidv5 } from 'uuid'
import { AddModelVariant, MergeLayer, ModelVariantMap, VariantTransformer } from '../../../KDInterface/VariantItem'
import { Constant } from '../Common'
import { GlassType, Layering, Level } from './Variant'
import Variant from './Variant'
import { GetVariant as GetLayerVariant } from './Layer'
import { Function } from '../../../Utilities'
import { Transformer as CommonTransformer } from '../Common'

const ModelTemplate = {
    Categories: ['Accessories', 'Face'],
    //Restraint: true,
    TopLevel: true,
} satisfies Partial<Model>

const DollMakerVisorFolder = 'Visors' as const
const BoidsGlassVisorFolder = `${Constant.ModelSetRootDir}/Visor` as const

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

const BaseName = 'E5050056-23AD-4935-BBC9-68B49F27FB9A'

const GetVariantName = (variant: Variant) => 
    uuidv5(Variant.ToString(variant), BaseName)

const GetModelDebugDisplayName = (variant: Variant) => `Drone Visor: ${Variant.ToString(variant)}`

const VariantMap: ModelVariantMap<Variant> = (variant) => {
    const Transformers: VariantTransformer<Model>[] = []
    Transformers.push(
        CommonTransformer.SetModelProps('Name')(GetVariantName(variant)),
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
        toString: Variant.ToString,
        func: AddModelVariant({
            template: ModelTemplate,
            VariantMap: VariantMap
        })
    })