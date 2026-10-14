import { Record, RecordOf} from "immutable";
import { BlindfoldLayer, GlassLayerTemplate, GogglesLayer, ModelTemplate, SpriteBaseName, InheritColor, VisorSpriteLayer } from "../Common";
import { AddModelWithTextThenGetName, ModelVariantMapBuilder } from "../../../../KDExtension";
import { Constant } from "../../Common";
import { IGlassModelVariantBase, ValidGlassModelVaraints } from "./Common";

interface IModelVariant extends IGlassModelVariantBase {
    Layer: VisorSpriteLayer
}

const ModelBaseName = '019f8a25-2f30-7ce3-9217-ef3ea41c8a5d'
const ModelFolder = `${Constant.ModelSetRootDir}/Visor` as const

export type ModelVariant = RecordOf<IModelVariant>

export const ModelVariant = Record(<IModelVariant>{
    UseFactionColor: false,
    Layer: VisorSpriteLayer.Goggle,
    OpaqueLevel: 1,
    Dimmed: false
})

export const ValidModelVariantMap = (() => {
    const builder = new ModelVariantMapBuilder<ModelVariant>({
        baseId: ModelBaseName,
        baseName: 'Boids | Futuristic Visor HUD'
    })

    const AddVariant = (variant: ModelVariant) => {
        const sptriteBaseName: SpriteBaseName = 'Goggles' as const
        const glassLayer: ModelLayer = {
            ...GlassLayerTemplate,
            Sprite: `${sptriteBaseName}${variant.Dimmed ? 'Dark' : 'Light'}${variant.OpaqueLevel}`,
            ... (variant.Layer === VisorSpriteLayer.Blindfold ? BlindfoldLayer : GogglesLayer),
            ...variant.UseFactionColor && {
                InheritColor: <InheritColor>'Glass'
            }
        }

        builder.WithVariant(variant, variantBuilder => {
            variantBuilder.AddPart({
                Layers: [glassLayer]
            })
            /*
                Opaque level threshold to hide brows:

                Dimmed     | 2
                Not dimmed | 3
            */
            if (variant.OpaqueLevel >= (variant.Dimmed ? 3 : 2)) {
                variantBuilder.AddPart({
                    HideLayers: ["Brows"]
                })
            }
            return variantBuilder
        })
    }

    for(const v of ValidGlassModelVaraints()){
        for(const layer of [VisorSpriteLayer.Goggle, VisorSpriteLayer.Blindfold]){
            AddVariant(ModelVariant({
                ...v,
                Layer: layer
            }))
        }
    }
    const variantMap = builder.BuildVariantMap({
        ...ModelTemplate,
        Folder: ModelFolder
    })


    const variantToNameMap =
        variantMap.map((modelVariant) =>
            AddModelWithTextThenGetName(modelVariant.Model, modelVariant.TextInfo)
        )
    return variantToNameMap
})()