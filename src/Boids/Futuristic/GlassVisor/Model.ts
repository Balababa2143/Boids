import { Constant } from '../Common'
import Variant, { AddValidVariants } from './Variant'
import { GetVariant as GetLayerVariant } from './Layer'
import { ThrowIfNull } from '../../../Utilities'
import { Layering } from './Constant'
import { AddModelWithTextThenGetName, VariantKeyOrImmutable, ModelVariantMapBuilder, VariantKeyToImmutable } from '../../../KDExtension'
import { FromJS, Map } from 'immutable'

const ModelTemplate = {
    Categories: ['Accessories', 'Face'],
    Restraint: true,
    TopLevel: true,
} satisfies Partial<Model>

const DollMakerVisorFolder = 'Visors' as const
const BoidsGlassVisorFolder = `${Constant.ModelSetRootDir}/Visor` as const

const BaseName = 'E5050056-23AD-4935-BBC9-68B49F27FB9A' as const

export const ValidVariantMap = (() => {
    const builder = new ModelVariantMapBuilder<Variant>({ baseName: BaseName })

    const AddVariant = (variant: Variant) => {
        const immutableVariantKey = VariantKeyToImmutable<Variant>(variant)
        builder.AddVariantPart(immutableVariantKey,{
            Layers: [GetLayerVariant(variant)]
        })
        if (Variant.IsBoidsVariant(variant)) {
            builder.AddVariantPart(immutableVariantKey,{
                Folder: BoidsGlassVisorFolder
            })
        }
        else {
            builder.AddVariantPart(immutableVariantKey,{
                Folder: DollMakerVisorFolder
            })
        }
        if (variant.HideBrows) {
            builder.AddVariantPart(immutableVariantKey,{
                HideLayers: ["Brows"]
            })
        }
        if (variant.Layering === Layering.Hood) {
            builder.AddVariantPart(immutableVariantKey,{
                AddPose: ['HoodMask']
            })
        }
    }

    AddValidVariants(AddVariant)

    const variantMap = builder.BuildVariantMap(ModelTemplate)


    const variantToNameMap: Map<FromJS<Variant>, string> =
        variantMap.map((modelVariant) =>
            AddModelWithTextThenGetName(modelVariant.Model, modelVariant.TextInfo)
        )
    return variantToNameMap
})()

export const GetGlassModelVariant =
    (variant: VariantKeyOrImmutable<Variant>) => ThrowIfNull(ValidVariantMap.get(VariantKeyToImmutable<Variant>(variant)))