export interface IModelVariantBase {
    UseFactionColor: boolean
}

/**
 * Text keys for coloring components by faction.
 */
export type InheritColor = 'Glass' | 'BaseMetal'

export type SpriteBaseName = 'Dollmaker' | 'DollmakerFull' | 'Goggles' | 'Mask'

export const GlassLayerTemplate = {
    Name: '019f89e6-0e42-7f7d-b5e0-606dc1c0bd58',
    Invariant: true,
    HideWhenOverridden: false
} as const satisfies Partial<ModelLayer>

export const GogglesLayer = {
    Layer: 'Goggles',
    Pri: 14
} satisfies Partial<ModelLayer>

export const MaskLayer = {
    Layer: 'Mask',
    Pri: -10
} satisfies Partial<ModelLayer>

export const BlindfoldLayer = {
    Layer: 'Blindfold',
    Pri: 14
} satisfies Partial<ModelLayer>

export const HoodLayer = {
    Layer: 'Hood',
    Pri: -10
} satisfies Partial<ModelLayer>

export const ModelTemplate = {
    Categories: ['Accessories', 'Face'],
    Restraint: true,
    TopLevel: true,
} satisfies Partial<Model>


//#region Tags

interface ITagSet {
    Socket: string,
    SocketedItem: string,
    NonSocketedItem: string
}

type TagSet<_TagSet> = _TagSet & {
    [SocketType in keyof ITagSet]: {
        [SetName in keyof _TagSet]: Iterable<string>
    }
}

export const enum VisorSpriteLayer {
    /** Under Mask */
    Goggle = 0,
    /** Under Hood */
    Blindfold = 2,
}

export const enum MaskSpriteLayer {
    /** Under Blindfold */
    Mask = 1,
    /** Top */
    Hood = 3,
}

const _ItemTags = {
    [VisorSpriteLayer.Goggle]: {
        Socket: '884C4320-844D-4B26-A708-0BE135980B80',
        SocketedItem: 'EB7B7D31-E29B-42D4-9D83-8D395AE981A8',
        NonSocketedItem: 'D985C637-0514-49C6-BD00-17DB7C63D2D7'
    } as const,
    [MaskSpriteLayer.Mask]: {
        Socket: '3978C22D-E2AC-49F3-8D89-689CE4AA0590',
        SocketedItem: '512A0BFC-DB53-49F6-A741-7B14CA5260A7',
        NonSocketedItem: '29DB8B83-CDC4-45A5-A3AA-481AE1F85193'
    } as const,
    [VisorSpriteLayer.Blindfold]: {
        Socket: '3F0FDD62-DBC6-4089-B31D-843E79FB8381',
        SocketedItem: 'BA399B36-175F-4417-9930-36FE47DFD2DA',
        NonSocketedItem: '6798ED87-6698-481A-98D2-7BD037700DFC'
    } as const,
    [MaskSpriteLayer.Hood]: {
        Socket: 'CB291D66-08D1-4F56-A72B-A6EA35DF150F',
        SocketedItem: 'E581A8AF-515F-42C1-86D2-BFEFB614AC30',
        NonSocketedItem: 'A4F264B6-5AD2-40BC-94D4-F928D8F23040'
    } as const,
} as const satisfies Record<VisorSpriteLayer | MaskSpriteLayer, ITagSet>

export type ItemTags = TagSet<typeof _ItemTags>

export const ItemTags = Object.defineProperties(
    _ItemTags,
    {
        Sockets: {
            get: function* () {
                for (const tagCollection of Object.values(_ItemTags)) {
                    yield tagCollection.Socket
                }
            }
        },
        SocketedItems: {
            get: function* () {
                for (const tagCollection of Object.values(_ItemTags)) {
                    yield tagCollection.SocketedItem
                }
            }
        },
        NonSocketedItems: {
            get: function* () {
                for (const tagCollection of Object.values(_ItemTags)) {
                    yield tagCollection.NonSocketedItem
                }
            }
        },
    }
) as ItemTags

//#endregion