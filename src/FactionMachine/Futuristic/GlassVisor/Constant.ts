/**
 * The vocabulary the glass visor set is built from: which glass types exist, the four layerings a
 * visor can be worn in, the socket and shrine tags that join a visor to its mount, and the layer,
 * sprite and colour names the models share.
 *
 * `GlassType` and `Layering` are also the values a variant key is built from, so their members and
 * their order are part of the save format rather than private naming: reordering either changes
 * every restraint and model name derived from a key. The HUD set reads this module and nothing else
 * from the visor family.
 * @module FactionMachine/Futuristic/GlassVisor/Constant
 */

/**
 * Text keys for coloring components by faction.
 *
 * `Glass` colours the glass itself and is the key the mod's own faction filter in `Item.ts` is
 * registered under; `BaseMetal` colours a metal part, and the mask mount's rim in `Model.ts` uses
 * it.
 */
export const InheritColor = {
    Glass: 'Glass',
    BaseMetal: 'BaseMetal'
} as const

/**
 * Which glass a visor is made of: the two Dollmaker glasses and the two Boids ones, a goggle and a
 * mask each.
 *
 * The members are serialised into the variant key as their numeric values, so the order below is
 * load-bearing: moving one changes every name derived from a key of that glass. A `const enum`, so
 * a plain-JavaScript consumer reading `GlassType` off the global finds `undefined`.
 */
export const enum GlassType {
    DollmakerGoggle,
    DollmakerMask,
    BoidsGoggle,
    BoidsMask,
}

/**
 * The four ways a visor can be worn, ordered from bottom to top: `Goggle` over the eyes, `Mask`
 * across the face, `Blindfold` in the goggle slot, and `Hood` worn over a mask, labelled "Over
 * Mask" by `Item.ts`.
 *
 * `ItemTags` and `GlassLayerFragments` iterate in this order, and the same save-format caveat as
 * `GlassType` applies to the member values — as does its absence at runtime.
 */
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

/**
 * The socket and shrine tags this family's restraints are joined by, one triple per layering.
 *
 * `Socket` is the attachment point a socketed visor demands on what it is worn under;
 * `SocketedItem` and `NonSocketedItem` are the shrine categories the two variants register under,
 * which other items name in `LinkableBy` and `renderWhenLinked`. The plural getters yield one tag
 * per layering.
 */
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

/**
 * The game layer each layering draws into, with its priority offset.
 *
 * Shared by every glass model set: the visor models and the HUD models must stack against each
 * other consistently or the hood/over-mask ordering breaks.
 */
export const GlassLayerFragments = {
    [Layering.Goggle]: { Layer: 'Goggles', Pri: 14 },
    [Layering.Mask]: { Layer: 'Mask', Pri: -10 },
    [Layering.Blindfold]: { Layer: 'Blindfold', Pri: 14 },
    [Layering.Hood]: { Layer: 'Hood', Pri: -10 },
} as const satisfies Record<Layering, { Layer: string, Pri: number }>

/** The sprite-name stems the glass layer set owns; `Layer.ts` maps each `GlassType` onto one. */
export type GlassSpriteName = 'Dollmaker' | 'DollmakerFull' | 'Goggles' | 'Mask'

/**
 * Shared shape of a glass layer definition, so a model set only supplies the sprite and the game
 * layer.
 *
 * @param Name - The layer's name, and its identity: each model set supplies its own.
 * @returns A partial `ModelLayer`, invariant and not hidden when a higher layer overrides it.
 */
export const MakeGlassLayerTemplate = (Name: string) =>
    ({
        Name,
        Invariant: true,
        HideWhenOverridden: false,
    }) as const satisfies Partial<ModelLayer>
