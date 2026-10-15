/**
 * The three models the arm items wear, each assembled from the layer factories in
 * `Layer.ts` for both hands and registered as a `ModelDefs` entry.
 *
 * Every model is named by a GUID and registered without model text, so the display name
 * belongs to the restraint that wears it; the exported constants are exactly the values
 * `Item.ts` puts in its `Model` field.
 * @module Boids/Futuristic/Limb/Mitten/Model
 */

import { AddModelWithTextThenGetName } from '../../../../KDExtension'
import { GetEmptyBodyLayers, GetLongMittenBodyLayers, GetLongMittenCaplayers, GetLongMittenCommonLayers, GetSleevesBodyLayers } from './Layer'

const modelBase = {
    Folder: 'CyberMitts',
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

/**
 * The sleeve model: the `CyberArms` sleeve bands plus the fourteen common bands, in the
 * `Restraints` and `Cuffs` categories. The `Sleeve` restraint in `Item.ts` wears it.
 */
export const Sleeve = AddModel({
    modelName: 'B63736C6-B5E9-49CD-A320-ADD991DACE31',
    categories: ['Restraints', 'Cuffs'],
    layerFactory: CollectLayers([
        GetSleevesBodyLayers,
        GetLongMittenCommonLayers
    ])
})

/**
 * The wire cuff model: the common bands with no sleeve art under them, so only the
 * cuff, display, lock and glow bands draw. In the `Gloves` and `Sleeves` categories,
 * worn by the `WireCuff` restraint in `Item.ts`.
 */
export const WireCuff = AddModel({
    modelName: '3C58669E-8A81-4A27-83AE-1885FA318CE1',
    categories: ['Gloves', 'Sleeves'],
    layerFactory: CollectLayers([
        GetEmptyBodyLayers,
        GetLongMittenCommonLayers
    ])
})

/**
 * The long mitten model: the mitten bands that erase the bare hand, the cap bands over
 * them, and the common bands. In the `Gloves`, `Mittens` and `Restraints` categories,
 * worn by the `LongMitten` restraint in `Item.ts`.
 */
export const LongMitten = AddModel({
    modelName: 'EF0F0539-C955-42CC-B258-39762179B14C',
    categories: ['Gloves', 'Mittens', 'Restraints'],
    layerFactory: CollectLayers([
        GetLongMittenBodyLayers,
        GetLongMittenCaplayers,
        GetLongMittenCommonLayers
    ])
})