import * as TextKey from '../../../KDInterface/TextKey'
import { Scale } from '../../../Utilities/Math'
import { AddEventHandler, IRestraintText, AddRestraintWithText } from '../../../KDExtension'


/**
 * Text keys for coloring components by faction.
 */
export enum InheritColor {
    Glass = 'Glass',
    BaseMetal = 'BaseMetal'
}

export enum GlassType {
    Color,
    Black
}

/**
 * Describes the glass sprite of a headset.
 */
export class Variant {
    #type: GlassType
    #opaqueLevel: number
    constructor(type, opaqueLevel) {
        Variant.#checkParams(type, opaqueLevel)
        this.#type = type
        this.#opaqueLevel = opaqueLevel
    }
    static #checkParams(type, opaqueLevel) {
        if (!Number.isInteger(opaqueLevel)) {
            throw new Error('Headset opaque level should be an integer')
        }
        if (type !== GlassType.Color && type !== GlassType.Black) {
            throw new Error('Unknown headset glass type.')
        }
    }
    get Type() { return this.#type }
    get OpaqueLevel() { return this.#opaqueLevel }
}

export const GetVariantDebugLabel = (variant: Variant) => {
    if (variant.Type === GlassType.Black) {
        return `Dark Lv.${variant.OpaqueLevel}`
    }
    else if (variant.Type === GlassType.Color) {
        return `Light Lv.${variant.OpaqueLevel}`
    }
    else {
        throw new Error('Unknown headset variant type.')
    }
}

export const AppendVariantToName = (baseName: string) => (variant: Variant) => {
    let glassName
    if (variant.Type === GlassType.Color) {
        glassName = 'Light'
    }
    else if (variant.Type === GlassType.Black) {
        glassName = 'Dark'
    }
    return `${baseName}${glassName}${variant.OpaqueLevel}`
}

const ModelCategories = ['Accessories', 'Face']

/**
 * Generate model definition from given parameters.
 * @param variant
 *  Headset variant.
 * @param sprites 
 *  Actual sprites in the model.
 * @param replacementDrawLayer
 *  Replace the Layer property of all sprites with this.
 */
export const MakeModel = (
    variant: Variant,
    sprites: ModelLayer[],
    replacementDrawLayer?: string): Model => ({
        Name: '',
        Folder: '',
        Categories: ModelCategories,
        //Restraint: true,
        TopLevel: true,
        HideLayers: (
            variant.OpaqueLevel > 2 ?
                ['Brows'] :
                []),
        Layers: ToLayerMap([...(function* (): Generator<ModelLayer> {
            if (sprites != null) {
                if (replacementDrawLayer != null) {
                    for (const sprite of sprites) {
                        yield {
                            ...sprite,
                            Layer: replacementDrawLayer
                        }
                    }
                }
                else {
                    for (const sprite of sprites) {
                        yield sprite
                    }
                }
            }
        })()])
    })

interface CalcVisorFilterEvent extends KinkyDungeonEvent {
    restraint: string
}

const CalcVisorFilter = AddEventHandler({
    eventMap: KDEventMapInventory,
    trigger: 'apply',
    type: '211FBBC1-0E8D-4CFF-82E3-ADA9713142ED',
    handler(e, item, data) {
        const event = e as CalcVisorFilterEvent
        if (data.item.name === event.restraint) {
            // console.info('CalcVisorFilter', {
            //     e, item, data
            // })
            const filterKey = InheritColor.Glass
            const opaqueSetting = globalThis.VisorOpaqueFactor ?? 0
            const dimSetting = globalThis.VisorDimFactor ?? 0
            const opaqueFactor = Scale(Scale(0, 0.5, dimSetting), 1, opaqueSetting)
            const dimFactor = Scale(Scale(0, 0.4, opaqueSetting), 1, dimSetting)
            const filter = data.Filters[filterKey] ?? {}
            filter.saturation = 0
            filter.alpha = Scale(1.1, 3.4, opaqueFactor)
            filter.brightness = Scale(1, 0.2, dimFactor)
            const colorFactor = Scale(1, 0.4, dimFactor)
            filter.red *= colorFactor
            filter.green *= colorFactor
            filter.blue *= colorFactor
            // console.log('caled Filters', filter)
            data.Filters[filterKey] = filter
        }
    },
})

export const VisorSocket = '54EB62BD-0462-46EF-8C96-9219382E75CA'
export const SocketedVisor = 'E1F99BA2-20C3-450B-AE98-47CE61C94470'
export const MaskSocket = 'EC2F4BFD-A143-4C8E-826C-8C85A1BE2689'

const ItemBase: restraint = {
    name: '',
    // noShrine: true,
    special: true,
    inventory: false,
    accessible: true,

    Group: 'ItemHead',
    shrine: [
        'Visors',
        SocketedVisor,
        'DroneVisor',
    ],
    LinkableBy: ([
        ...KDVisorLink,
    ]),

    Model: '',
    factionFilters: {
        [InheritColor.Glass]: {
            color: TextKey.FactionFilter.Highlight,
            override: false
        }
    },
    // Model: 'Goggles',
    // factionFilters: {
    //     'Goggles': {
    //         color: TextKey.FactionFilter.Highlight,
    //         override: false
    //     }
    // },
    sfx: 'FutureLock',
    sfxRemove: 'SciFiConfigure',

    noDupe: true,
    escapeChance: {
        Remove: 0.01,
        Struggle: -1,
        Pick: -1,
        Unlock: 0.32,
        Cut: -0.8
    },
    power: 0,
    weight: 0,
    minLevel: 0,
    allFloors: true,

    playerTags: {},
    enemyTags: {},

    events: [
        {
            trigger: 'postUnlock',
            type: 'RequireLocked',
            inheritLinked: true
        }
    ]
}

const CalcBlind = (variant: Variant) => {
    let max;
    if (variant.Type === GlassType.Color) {
        max = 2
    }
    else if (variant.Type === GlassType.Black) {
        max = 4
    }
    return variant.OpaqueLevel / 4 * max
}

export const AddVariants = (addItem: (_: Variant) => void) => {
    for (let i = 1; i <= 4; i++) {
        addItem(new Variant(GlassType.Color, i))
    }
    for (let i = 1; i <= 4; i++) {
        addItem(new Variant(GlassType.Black, i))
    }
}

export const AddHeadSetItem = (args: {
    socket: string,
    GetName: (_: Variant) => string,
    GetModel: (_: Variant) => string,
    GetText: (_: Variant) => IRestraintText,
    variant: Variant
}) => {
    const {
        socket,
        GetName,
        GetModel,
        GetText,
        variant
    } = args
    const restraintName = GetName(variant)
    AddRestraintWithText({
        ...ItemBase,
        name: restraintName,
        Model: GetModel(variant),
        blindfold: CalcBlind(variant),
        requireAllTagsToEquip: [socket],
        events: [
            ...ItemBase.events ?? [],
            {
                ...CalcVisorFilter,
                inheritLinked: true,
                restraint: restraintName
            } satisfies CalcVisorFilterEvent,
            {
                trigger: 'postRemoval',
                type: 'RequireTag',
                requiredTag: socket,
                inheritLinked: true
            }
        ],
    }, GetText(variant))
}