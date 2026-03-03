import { VariantPart } from "../../../KDExtension"
import { SpriteGroup, VisorBodyLayerName } from "./Common"

// Ordered from bottom to top
export const enum Layering {
    Goggle,
    // Mask,
    Blindfold,
    // Hood,
}

const VisorBodySpriteLayering = {
    [Layering.Goggle]: {
        Layer: 'Goggles',
        Pri: 14
    },
    [Layering.Blindfold]: {
        Layer: 'Blindfold',
        Pri: 14
    },
} as const satisfies Record<string, VariantPart<ModelLayer>>

const VisorBodySpriteBaseName = {
    [SpriteGroup.FullTransparent]: 'Dollmaker',
    [SpriteGroup.SemiTransparent]: 'Goggles',
} as const

