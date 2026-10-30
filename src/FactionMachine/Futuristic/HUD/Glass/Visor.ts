/**
 * The hard-light HUD visor model set: 32 models, one per combination of `UseFactionColor` x
 * `OpaqueLevel` x `Dimmed` x layering.
 * @module FactionMachine/Futuristic/HUD/Glass/Visor
 */

import { Record, RecordOf} from "immutable";
import { GlassLayerTemplate, ModelTemplate } from "../Common";
import { GlassLayerFragments, GlassSpriteName, InheritColor, Layering } from "../../GlassVisor/Constant";
import { AddModelVariantMapToGame, ModelVariantMapBuilder } from "../../../../KDExtension";
import { DerivedVariantBase } from "../../../../KDExtension/Release";
import { Constant } from "../../Common";
import { IGlassModelVariantBase, ValidGlassModelVariants } from "./Common";

interface IModelVariant extends IGlassModelVariantBase {
    Layer: Layering
}

/**
 * The namespace this HUD glass's model names are hashed under, derived from the mod root rather
 * than written as a literal: a hand-written base is unversioned forever, because nothing can
 * recognise or retire it programmatically.
 */
const ModelBaseName = DerivedVariantBase.HudGlassVisorModel
const ModelFolder = `${Constant.ModelSetRootDir}/Visor` as const

/**
 * A HUD visor variant key as an Immutable `Record`: the three HUD choices plus the layer the model
 * is drawn on.
 *
 * A `Record` rather than a literal is what fixes the field order the generated model names are
 * hashed from, so the key order of this type and of the `ModelVariant` default below is part of the
 * save format.
 */
export type ModelVariant = RecordOf<IModelVariant>

/**
 * The `Record` class the keys above are instances of, and the default key.
 *
 * `ValidModelVariantMap` never uses this default; the defaults define the key's shape and field
 * order.
 */
export const ModelVariant = Record(<IModelVariant>{
    UseFactionColor: false,
    Layer: Layering.Goggle,
    OpaqueLevel: 1,
    Dimmed: false
})

/**
 * The registered model names, keyed by variant key: building this map registers the 32 models into
 * `ModelDefs` as a side effect of importing this module.
 */
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
            // Brows hide at opaque level 2 or above when bright, 3 or above when dimmed.
            if (variant.OpaqueLevel >= (variant.Dimmed ? 3 : 2)) {
                variantBuilder.AddPart({
                    HideLayers: ["Brows"]
                })
            }
            return variantBuilder
        })
    }

    for(const v of ValidGlassModelVariants()){
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