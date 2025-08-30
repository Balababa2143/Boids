import { v5 as uuidv5 } from 'uuid'
import { AddModelVariant, MergeLayer, ModelVariantMap, VariantTransformer } from '../../../KDInterface/VariantItem'
import { Constant } from '../Common'
import Variant from './Variant'
import { GetVariant as GetLayerVariant } from './Layer'
import { Function } from '../../../Utilities'
import { Transformer as CommonTransformer } from '../Common'
import { GlassType, Layering } from './Constant'

const ModelTemplate = {
    Categories: ['Accessories', 'Face'],
    Restraint: true,
    TopLevel: true,
} satisfies Partial<Model>

const DollMakerVisorFolder = 'Visors' as const
const BoidsGlassVisorFolder = `${Constant.ModelSetRootDir}/Visor` as const


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
    if(Variant.IsBoidsVariant(variant)){
        Transformers.push(CommonTransformer.SetModelProps('Folder')(BoidsGlassVisorFolder))
    }
    else{
        Transformers.push(CommonTransformer.SetModelProps('Folder')(DollMakerVisorFolder))
    }
    if(variant.HideBrows){
        Transformers.push(CommonTransformer.MergeModelArray('HideLayers')(["Brows"]))
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
    Function.Cached(
        AddModelVariant({
            template: ModelTemplate,
            VariantMap: VariantMap
        }) 
    )