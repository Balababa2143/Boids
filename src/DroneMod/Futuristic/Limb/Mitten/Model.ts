import { AddModelWithTextThenGetName } from "../../../../KDInterface/KDExtension"
import { GetEmptyBodyLayers, GetLongMittenBodyLayers, GetLongMittenCaplayers, GetLongMittenCommonLayers, GetSleevesBodyLayers } from "./Layer"

const modelBase = {
    Folder: "CyberMitts",
    TopLevel: true,
    Categories: [],
    // Restraint: true,
} satisfies Partial<Model>

type LayerFactory = (suffix: string) => ModelLayer[]

const CollectLayers =
    (layerFactories: LayerFactory[]) =>
    (suffix: string) =>
        layerFactories.flatMap(
            factory => factory(suffix)
        )

const AddModel = (args: {
    modelName,
    categories,
    layerFactory: LayerFactory
}) => {
    const {
        modelName,
        categories,
        layerFactory: getLayers
    } = args
    return AddModelWithTextThenGetName(
        {
            ...modelBase,
            Name: modelName,
            Categories: categories,
            Layers: ToLayerMap([
                ...getLayers('Left'),
                ...getLayers('Right')
            ])
        }
    )
}

export const Sleeve = AddModel({
    modelName: '{B63736C6-B5E9-49CD-A320-ADD991DACE31}',
    categories: ["Restraints", "Cuffs"],
    layerFactory: CollectLayers([
        GetSleevesBodyLayers,
        GetLongMittenCommonLayers
    ])
})

export const WireCuff = AddModel({
    modelName: '{3C58669E-8A81-4A27-83AE-1885FA318CE1}',
    categories: ["Gloves", "Sleeves"],
    layerFactory: CollectLayers([
        GetEmptyBodyLayers,
        GetLongMittenCommonLayers
    ])
})

export const LongMitten = AddModel({
    modelName: '{EF0F0539-C955-42CC-B258-39762179B14C}',
    categories: ["Gloves", "Mittens", "Restraints"],
    layerFactory: CollectLayers([
        GetLongMittenBodyLayers,
        GetLongMittenCaplayers,
        GetLongMittenCommonLayers
    ])
})