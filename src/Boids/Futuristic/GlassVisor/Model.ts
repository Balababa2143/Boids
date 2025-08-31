import { v5 as uuidv5 } from 'uuid'
import { Constant } from '../Common'
import Variant, { AddValidVariants } from './Variant'
import { GetVariant as GetLayerVariant } from './Layer'
import { ThrowIfNull } from '../../../Utilities'
import { Layering } from './Constant'
import { AddModelWithTextThenGetName, AsVariantKey, ModelReceiver, ModelWithLayerSet, ModelWithLayerSetToModel, VariantBuilder, VariantOrKey, VariantPart } from '../../../KDExtension'
import { FromJS, Map } from 'immutable'

const ModelTemplate = {
    Categories: ['Accessories', 'Face'],
    Restraint: true,
    TopLevel: true,
} satisfies Partial<Model>

const DollMakerVisorFolder = 'Visors' as const
const BoidsGlassVisorFolder = `${Constant.ModelSetRootDir}/Visor` as const

const BaseName = 'E5050056-23AD-4935-BBC9-68B49F27FB9A'

export const ValidVariantMap = (() => {
    const builder = new VariantBuilder<Variant, ModelWithLayerSet>({
        receiver: ModelReceiver,
        getVariantValueDependentParts: (variantValue) => [({
            Name: uuidv5(JSON.stringify(variantValue.toJS()), BaseName)
        })]
    })

    const AddVariant = (variant) => {
        const Parts: VariantPart<ModelWithLayerSet>[] = []
        Parts.push({
            Layers: [GetLayerVariant(variant)]
        })
        if (Variant.IsBoidsVariant(variant)) {
            Parts.push({
                Folder: BoidsGlassVisorFolder
            })
        }
        else {
            Parts.push({
                Folder: DollMakerVisorFolder
            })
        }
        if (variant.HideBrows) {
            Parts.push({
                HideLayers: ["Brows"]
            })
        }
        if (variant.Layering === Layering.Hood) {
            Parts.push({
                AddPose: ['HoodMask']
            })
        }
        builder.Add(variant, Parts)
    }

    AddValidVariants(AddVariant)

    const variantMap = builder.BuildVariantMap<Model>({
        template: ModelTemplate,
        finalize: ModelWithLayerSetToModel
    })


    const variantToNameMap: Map<FromJS<Variant>, string> =
        variantMap.map((model) => 
            AddModelWithTextThenGetName(model)
        )
    return variantToNameMap
})()

export const GetGlassModelVariant =
    (variant: VariantOrKey<Variant>) => ThrowIfNull(ValidVariantMap.get(AsVariantKey<Variant>(variant)))