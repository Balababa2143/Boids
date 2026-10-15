/**
 * The models the collar and cuff items render with: each one a copy of a base-game
 * model under a new name, differing only in that its lock layers are marked as
 * such. The models are registered as a side effect of importing this module, and
 * `Cuff/Item` uses the names it exports.
 *
 * Every name here is a generated GUID rather than a readable name, because the copy
 * needs a name of its own and the item is what carries the readable name.
 * @module Boids/Futuristic/Cuff/Model
 */

import { AddModelWithTextThenGetName } from '../../../KDExtension'

/**
 * The colour banks the copied models' layers inherit from, named once so
 * `Cuff/Item` can key its `factionFilters` by them instead of repeating string
 * literals. A bank is what `InheritColor` on a model layer points at, so these are
 * the keys through which a faction can recolour a whole group of layers at once.
 */
export const InheritColor = {
    BaseMetal: 'BaseMetal',
    Display: 'Display',
    Screen: 'Screen',
    Lock: 'Lock',
} as const

const MakeModel = (args: { model: Model, newName: string }) => {
    const { model, newName } = args
    return <Model>{
        ...model,
        Name: newName,
        Layers: ToLayerMap(
            Object.values(model.Layers)
                .map(l => ({
                    ...l,
                    LockLayer: l.Name.includes('Lock')
                }))
        )
    }
}

/**
 * The copy of the base game's `NeoCyberCollar` that the light collar item renders
 * with.
 */
export const LightCollar =
    AddModelWithTextThenGetName(
        MakeModel({
            model: ModelDefs['NeoCyberCollar'],
            newName: '205EA297-C542-481C-8F5F-17544199464A'
        })
    )
/**
 * The copy of the base game's `FutureCollar` that the heavy collar item renders
 * with.
 */
export const HeavyCollar =
    AddModelWithTextThenGetName(
        MakeModel({
            model: ModelDefs['FutureCollar'],
            newName: '673CCE96-01DC-49B6-9D1D-FB034EC5C83D'
        })
    )

/** The copy of the base game's `CyberCuffsWrists` that the wrist cuff renders with. */
export const WristCuff =
    AddModelWithTextThenGetName(
        MakeModel({
            model: ModelDefs['CyberCuffsWrists'],
            newName: '28BB62F0-AFD5-493F-9473-90CCEDB3610B'
        })
    )

/** The copy of the base game's `CyberCuffsElbows` that the elbow cuff renders with. */
export const ElbowCuff =
    AddModelWithTextThenGetName(
        MakeModel({
            model: ModelDefs['CyberCuffsElbows'],
            newName: '8B1FCA3F-37B3-4146-B4C6-11D99D99581D'
        })
    )

/**
 * The copy of the base game's `CyberCuffsArms` that the upper-arm cuff renders
 * with.
 */
export const ArmCuff =
    AddModelWithTextThenGetName(
        MakeModel({
            model: ModelDefs['CyberCuffsArms'],
            newName: 'A112E8ED-9A09-4FD6-8EDE-2D13A6BC4E92'
        })
    )

/**
 * The copy of the base game's `NeoCyberBelt` that the waist cuff renders with —
 * unlike the others, the source is a belt model rather than a cuff model.
 */
export const WaistCuff =
    AddModelWithTextThenGetName(
        MakeModel({
            model: ModelDefs['NeoCyberBelt'],
            newName: '8107614F-5782-48E8-B57C-5668154E1737'
        })
    )

/** The copy of the base game's `CyberCuffsThigh` that the thigh cuff renders with. */
export const ThighCuff =
    AddModelWithTextThenGetName(
        MakeModel({
            model: ModelDefs['CyberCuffsThigh'],
            newName: '19395012-73B9-45F6-A3D1-85D01E6CA80B'
        })
    )

/** The copy of the base game's `CyberCuffsAnkles` that the ankle cuff renders with. */
export const AnkleCuff =
    AddModelWithTextThenGetName(
        MakeModel({
            model: ModelDefs['CyberCuffsAnkles'],
            newName: '1B29F6F7-3390-4C52-B222-9B73696F2799'
        })
    )