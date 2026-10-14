/**
 * The hard-light HUD visor model set: 32 models, one per combination of
 * `UseFactionColor` x `OpaqueLevel` x `Dimmed` x sprite layer.
 *
 * @todo
 *  These models are registered at import time but nothing consumes
 *  `ValidModelVariantMap` yet. The module that was going to build restraints from
 *  them (`MachinePrime/Item/HUD/Restraint.ts`) never got past a commented-out
 *  draft, and its `RestraintTemplate` was removed as dead code. Picking the right
 *  model for a given visor is #40; the physical visor and mask items are #3.
 *  Until then this is deliberate weight in `ModelDefs`, not an oversight.
 */

import { Record, RecordOf} from "immutable";
import { GlassLayerTemplate, ModelTemplate } from "../Common";
import { GlassLayerFragments, GlassSpriteName, InheritColor, Layering } from "../../GlassVisor/Constant";
import { AddModelVariantMapToGame, ModelVariantMapBuilder } from "../../../../KDExtension";
import { Constant } from "../../Common";
import { IGlassModelVariantBase, ValidGlassModelVaraints } from "./Common";

interface IModelVariant extends IGlassModelVariantBase {
    Layer: Layering
}

const ModelBaseName = '019f8a25-2f30-7ce3-9217-ef3ea41c8a5d'
const ModelFolder = `${Constant.ModelSetRootDir}/Visor` as const

export type ModelVariant = RecordOf<IModelVariant>

export const ModelVariant = Record(<IModelVariant>{
    UseFactionColor: false,
    Layer: Layering.Goggle,
    OpaqueLevel: 1,
    Dimmed: false
})

export const ValidModelVariantMap = (() => {
    const builder = new ModelVariantMapBuilder<ModelVariant>({
        baseId: ModelBaseName,
        baseName: 'Boids | Futuristic Visor HUD'
    })

    const AddVariant = (variant: ModelVariant) => {
        const spriteBaseName: GlassSpriteName = 'Goggles' as const
        const glassLayer: ModelLayer = {
            ...GlassLayerTemplate,
            Sprite: `${spriteBaseName}${variant.Dimmed ? 'Dark' : 'Light'}${variant.OpaqueLevel}`,
            ...GlassLayerFragments[variant.Layer],
            ...variant.UseFactionColor && {
                InheritColor: InheritColor.Glass
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
        for(const layer of [Layering.Goggle, Layering.Blindfold]){
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

    return AddModelVariantMapToGame(variantMap)
})()