import { InheritColor } from '../Common'

export const MakeLeftRight = <Base extends Partial<ModelLayer>>(layerBase: Base) => [
    {
        ...layerBase,
        Name: layerBase.Name + 'Left',
        // Sprite: layerBase.Sprite + 'Left',
    },
    {
        ...layerBase,
        Name: layerBase.Name + 'Right',
        // Sprite: layerBase.Sprite + 'Right'
    },
]

export const AddGlow = <Base extends Partial<ModelLayer>>(layerBase: Base) => [
    {
        ...layerBase,
        Name: layerBase.Name + 'Link',
        // Sprite: layerBase.Sprite + 'Link',
        InheritColor: InheritColor.Tether,
        Pri: -10.0
    },
    {
        ...layerBase,
        Name: layerBase.Name + 'Glow',
        // Sprite: layerBase.Sprite + 'Glow',
        InheritColor: InheritColor.Glow,
        Pri: -9.9
    },
]