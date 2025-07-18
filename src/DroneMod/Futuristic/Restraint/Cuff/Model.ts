import { AddModelWithTextThenGetName } from '../../../../KDInterface/KDExtension'

export namespace InheritColor {
    export const BaseMetal = 'BaseMetal'
    export const Display = 'Display'
    export const Screen = 'Screen'
    export const Lock = 'Lock'
}

export type InheritColor = Record<string, string>

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

export const LightCollar =
    AddModelWithTextThenGetName(
        MakeModel({
            model: ModelDefs['NeoCyberCollar'],
            newName: '{205EA297-C542-481C-8F5F-17544199464A}'
        })
    )
export const HeavyCollar =
    AddModelWithTextThenGetName(
        MakeModel({
            model: ModelDefs['FutureCollar'],
            newName: '{673CCE96-01DC-49B6-9D1D-FB034EC5C83D}'
        })
    )

export const WristCuff =
    AddModelWithTextThenGetName(
        MakeModel({
            model: ModelDefs['CyberCuffsWrists'],
            newName: 'Elbow'
        })
    )

export const ElbowCuff =
    AddModelWithTextThenGetName(
        MakeModel({
            model: ModelDefs['CyberCuffsElbows'],
            newName: '{8B1FCA3F-37B3-4146-B4C6-11D99D99581D}'
        })
    )

export const ArmCuff =
    AddModelWithTextThenGetName(
        MakeModel({
            model: ModelDefs['CyberCuffsArms'],
            newName: '{A112E8ED-9A09-4FD6-8EDE-2D13A6BC4E92}'
        })
    )

export const WaistCuff =
    AddModelWithTextThenGetName(
        MakeModel({
            model: ModelDefs['NeoCyberBelt'],
            newName: '{8107614F-5782-48E8-B57C-5668154E1737}'
        })
    )

export const ThighCuff =
    AddModelWithTextThenGetName(
        MakeModel({
            model: ModelDefs['CyberCuffsThigh'],
            newName: '{19395012-73B9-45F6-A3D1-85D01E6CA80B}'
        })
    )

export const AnkleCuff =
    AddModelWithTextThenGetName(
        MakeModel({
            model: ModelDefs['CyberCuffsAnkles'],
            newName: '{1B29F6F7-3390-4C52-B222-9B73696F2799}'
        })
    )