import { v5 as uuidv5 } from 'uuid'
import { FactionFilter } from '../../../KDInterface/TextKey'
import { AddRestraintVariant, RestraintVariantMap, VariantTransformer } from '../../../KDInterface/VariantItem'
import * as Constant from './Constant'
import { GlassType, Layering, default as Variant } from './Variant'
import { Transformer as CommonTransformer } from '../Common'
import { GetGlassModelVariant } from './Model'
import { IRestraintText } from '../../../KDExtension'
import { Function, ThrowIfNull } from '../../../Utilities'

const ItemTemplate = {

    special: true,
    inventory: false,
    accessible: true,

    Group: 'ItemHead',

    Model: '',
    factionFilters: {
        [Constant.InheritColor.Glass]: {
            color: FactionFilter.Highlight,
            override: false
        }
    },

    noDupe: true,
    escapeChance: {
        // Remove: 0.01,
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
} satisfies Partial<restraint>

const CalcBlind = (variant: Variant) => {
    if(!Variant.IsBoids(variant)){
        throw new Error('Not supported')
    }
    const modelFactor = (Number(Variant.IsGoggle(variant)) * 1.2) + (Number(variant.Colorize) * 0.6)
    const maxBlind = 1 + modelFactor
    const psi = 2.0 / (1.0 + Math.sqrt(5.0))
    const exp = 4 - variant.Level
    return maxBlind * Math.pow(psi, exp)
}

const BaseName = '776675EB-33EC-485B-B204-D743B43727CC'

const GetVariantName = (variant: Variant) =>
    uuidv5(Variant.ToString(variant), BaseName)

const GetDebugText = (variant: Variant) => ({
    DisplayName: variant.GlassType == GlassType.BoidsGoggle || variant.GlassType == GlassType.DollmakerGoggle ? 'Drone Visor' : 'Drone Mask',
    FunctionText: [
        ...function* () {
            yield `Visor Type: ${Variant.IsGoggle(variant) ? 'Goggle' : 'Mask'}`
            const version = {
                [Layering.Goggle]: 'Goggle',
                [Layering.Blindfold]: 'Blindfold',
                [Layering.Mask]: 'Mask',
                [Layering.Hood]: 'Over Mask',
            }[variant.Layering]
            yield `Version: ${version}`
            if (Variant.IsBoids(variant)) {
                yield `Mode: ${variant.Colorize ? 'Full Color' : 'Dark'}`
                yield `Level: ${variant.Level}`
            }
        }()
    ].join('\n')
} satisfies IRestraintText)

const SocketedVariantMap: RestraintVariantMap<Variant> = (variant) => {
    const Transformers: VariantTransformer<restraint>[] = []
    Transformers.push(
        CommonTransformer.MergeRestraintProps({
            name: GetVariantName(variant),
            Model: GetGlassModelVariant(variant),
            preview: Variant.IsGoggle(variant) ? 'GlassVisor' : 'GlassMask',
        })
    )
    if(Variant.IsBoids(variant)) {
        Transformers.push(CommonTransformer.SetRestraintProps('blindfold')(CalcBlind(variant)))
    }
    Transformers.push(CommonTransformer.RequireSocket({
        sockets: Variant.IsGoggle(variant) ? [Constant.Socket.Goggle] : [Constant.Socket.Mask],
        renderWhenLinkedBySocket: true
    }))
    const [link, shrine] = ThrowIfNull(({
        [Layering.Mask]: [
            KDMaskLink,
            ['Masks', Constant.SocketedVisor.Mask]
        ],
        [Layering.Hood]: [
            KDMaskLink,
            ['Masks', Constant.SocketedVisor.Mask]
        ],
        [Layering.Blindfold]: [
            KDBlindfoldLink,
            ['Blindfolds', Constant.SocketedVisor.Goggle]
        ],
        [Layering.Goggle]: [
            KDVisorLink,
            ['Visors', Constant.SocketedVisor.Goggle]
        ],
    } as const)[variant.Layering])
    Transformers.push(
        CommonTransformer.MergeArray('LinkableBy')(link),
        CommonTransformer.MergeArray('shrine')(shrine)
    )
    return {
        Transformers: Transformers,
        Text: GetDebugText(variant)
    }
}

export const GetSocketedVisorVariant =
    Function.CacheWith({
        toString: Variant.ToString,
        func: AddRestraintVariant({
            template: ItemTemplate,
            VariantMap: SocketedVariantMap
        })
    })

const goggleLayers = [Layering.Goggle, Layering.Blindfold] as const
const maskLayers = [Layering.Hood, Layering.Mask] as const

for (const layering of goggleLayers) {
    GetSocketedVisorVariant({
        GlassType: GlassType.DollmakerGoggle,
        Layering: layering
    })
}

for (const layering of maskLayers) {
    GetSocketedVisorVariant({
        GlassType: GlassType.DollmakerMask,
        Layering: layering
    })
}

for (const layering of goggleLayers) {
    for (const colorize of [false, true]) {
        for (const level of [1, 2, 3, 4] as const) {
            GetSocketedVisorVariant({
                GlassType: GlassType.BoidsGoggle,
                Layering: layering,
                Colorize: colorize,
                Level: level
            })
        }
    }
}

for (const layering of maskLayers) {
    for (const colorize of [false, true]) {
        for (const level of [1, 2, 3, 4] as const) {
            GetSocketedVisorVariant({
                GlassType: GlassType.BoidsMask,
                Layering: layering,
                Colorize: colorize,
                Level: level
            })
        }
    }
}