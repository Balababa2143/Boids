import { ModelSetRootDir } from "../../../Futuristic"

export namespace InheritColor {
    export const Tether = '{17954016-CB1A-4C61-A312-A1675EE128CB}'
    export const Glow = '{E15BC39C-544C-49B2-9969-AF5E4E19B14C}'
}

export type InheritColor = Record<string, string>

/* Layer Sprite Naming:
 *     `${BodyPart}/${LeftRight?}${LinkGlow}${Pose}`
 * 
 * Use folder to distinguish which item the links are attached to.
 */

export const LinkFolder = `${ModelSetRootDir}/Link`

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