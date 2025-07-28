export namespace InheritColor {
    export const Tether = '{17954016-CB1A-4C61-A312-A1675EE128CB}'
    export const Glow = '{E15BC39C-544C-49B2-9969-AF5E4E19B14C}'
}

export type InheritColor = Record<string, string>

export interface LayerTemplate extends Optional<ModelLayer, 'Layer'> {
    Sprite: string
}

export const MakeLeftRight = <Base extends LayerTemplate>(layerBase: Base) => [
    {
        ...layerBase,
        Name: layerBase.Name + 'Left',
        Sprite: layerBase.Sprite + 'Left',
    },
    {
        ...layerBase,
        Name: layerBase.Name + 'Right',
        Sprite: layerBase.Sprite + 'Right'
    },
]

export const AddGlow = <Base extends LayerTemplate>(layerBase: Base) => [
    {
        ...layerBase,
        InheritColor: InheritColor.Tether,
        Pri: -10.0
    },
    {
        ...layerBase,
        Name: layerBase.Name + "Glow",
        Sprite: layerBase.Sprite + "Glow",
        InheritColor: InheritColor.Glow,
        Pri: -9.9
    },
]