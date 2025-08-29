/**
 * Text keys for coloring components by faction.
 */
export const enum InheritColor {
    Glass = 'Glass',
    BaseMetal = 'BaseMetal'
}

export const enum GlassType {
    DollmakerGoggle,
    DollmakerMask,
    BoidsGoggle,
    BoidsMask,
}

// Ordered from bottom to top
export const enum Layering {
    Goggle,
    Mask,
    Blindfold,
    Hood,
}

 const _ItemTags = {
    [Layering.Goggle]: {
        Socket: '884C4320-844D-4B26-A708-0BE135980B80',
        SocketedItem: 'EB7B7D31-E29B-42D4-9D83-8D395AE981A8',
        NonSocketedItem: 'D985C637-0514-49C6-BD00-17DB7C63D2D7'
    } as const,
    [Layering.Mask]: {
        Socket: '3978C22D-E2AC-49F3-8D89-689CE4AA0590',
        SocketedItem: '512A0BFC-DB53-49F6-A741-7B14CA5260A7',
        NonSocketedItem: '29DB8B83-CDC4-45A5-A3AA-481AE1F85193'
    } as const,
    [Layering.Blindfold]: {
        Socket: '3F0FDD62-DBC6-4089-B31D-843E79FB8381',
        SocketedItem: 'BA399B36-175F-4417-9930-36FE47DFD2DA',
        NonSocketedItem: '6798ED87-6698-481A-98D2-7BD037700DFC'
    } as const,
    [Layering.Hood]: {
        Socket: 'CB291D66-08D1-4F56-A72B-A6EA35DF150F',
        SocketedItem: 'E581A8AF-515F-42C1-86D2-BFEFB614AC30',
        NonSocketedItem: 'A4F264B6-5AD2-40BC-94D4-F928D8F23040'
    } as const,
} as const

type _ItemTags = typeof _ItemTags

interface ItemTags extends _ItemTags {
    Sockets: Iterable<_ItemTags[Layering]['Socket']>
    SocketedItems: Iterable<_ItemTags[Layering]['SocketedItem']>
    NonSocketedItems: Iterable<_ItemTags[Layering]['NonSocketedItem']>
}

export const ItemTags = Object.defineProperties(
    _ItemTags,
    {
        Sockets: {
            get: function*(){
                for(const tagCollection of Object.values(_ItemTags)){
                    yield tagCollection.Socket
                }
            }
        },
        SocketedItems: {
            get: function*(){
                for(const tagCollection of Object.values(_ItemTags)){
                    yield tagCollection.SocketedItem
                }
            }
        },
        NonSocketedItems: {
            get: function*(){
                for(const tagCollection of Object.values(_ItemTags)){
                    yield tagCollection.NonSocketedItem
                }
            }
        },
    }
) as ItemTags