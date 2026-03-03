/**
 * Text keys for coloring components by faction.
 */
export const enum InheritColor {
    Glass = 'Glass',
    BaseMetal = 'BaseMetal'
}

export const enum SpriteGroup {
    PinkTransparent,
    FullTransparent,
    SemiTransparent
}

export const enum SemiTransparent {
    White,
    Blackened
}

export type OpaqueLevel = 1 | 2 | 3 | 4

export const VisorBodyLayerName = 'DB235FC0-1716-408F-8144-5F8DD6A443DD' as const

export const VisorBodySpriteTemplate = {
    Name: VisorBodyLayerName,
    Invariant: true,
    HideWhenOverridden: false
} as const satisfies Partial<ModelLayer>