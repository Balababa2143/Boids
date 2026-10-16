/**
 * The two layer factories every link layer set is assembled from: one that splits
 * a layer into its left and right halves, and one that turns a layer into the
 * tether and glow that draw a link.
 * @module FactionMachine/Futuristic/Link/Layer/Common
 */

import { InheritColor } from '../Common'

/**
 * Splits one layer into its left and right halves by suffixing the name, which is
 * also the sprite name, so the halves are drawn from `Left` and `Right` artwork in
 * the caller's folder.
 *
 * @param layerBase - The layer to split; its `Name` is the part without a side.
 * @returns Two layers, left first, sharing every other field of the base.
 */
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

/**
 * Turns one layer into the pair that draws a link: the tether, tinted from the
 * tether colour channel, and the glow that runs along it, tinted from the glow
 * channel. The link restraint template binds both channels to the highlight
 * filter, which is what gives them a colour.
 *
 * The caller's poses and layer group are kept, so the pair sorts where the caller
 * asked for; only the priority differs between the two, and only by a tenth, so
 * the glow sorts directly above the tether it lights.
 *
 * @param layerBase - The layer to draw the link for; its `Name` is the part before
 *   `Link` and `Glow`.
 * @returns Two layers, the tether first and the glow at the slightly higher
 *   priority.
 */
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