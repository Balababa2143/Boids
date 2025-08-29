import { v5 as uuidv5 } from 'uuid'
import { FactionFilter } from '../../../KDInterface/TextKey'
import { AddRestraintVariant, RestraintVariantMap, VariantTransformer } from '../../../KDInterface/VariantItem'
import { GlassType, InheritColor, ItemTags, Layering } from './Constant'
import Variant, { BoidsVariant, DollmakerVariant } from './Variant'
import { Transformer as CommonTransformer } from '../Common'
import { GetGlassModelVariant } from './Model'
import { IRestraintText } from '../../../KDExtension'
import { Function, ThrowIfNull } from '../../../Utilities'
import { fromJS, FromJS, Map } from 'immutable'


const ItemTemplate = {

    special: true,
    inventory: false,
    accessible: true,

    Group: 'ItemHead',

    Model: '',
    factionFilters: {
        [InheritColor.Glass]: {
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
    if(!Variant.IsBoidsVariant(variant)){
        throw new Error('Not supported')
    }
    const modelFactor = (Number(Variant.IsGoggleVariant(variant)) * 1.2) + (Number(variant.Colorize) * 0.6)
    const maxBlind = 1 + modelFactor
    const psi = 2.0 / (1.0 + Math.sqrt(5.0))
    const exp = 4 - variant.Level
    return maxBlind * Math.pow(psi, exp)
}

const BaseName = '776675EB-33EC-485B-B204-D743B43727CC'

const GetRestraintVariantName = (variant: Variant) =>
    uuidv5(Variant.ToString(variant), BaseName)

const GetDebugText = (variant: Variant) => ({
    DisplayName: variant.GlassType == GlassType.BoidsGoggle || variant.GlassType == GlassType.DollmakerGoggle ? 'Drone Visor' : 'Drone Mask',
    FunctionText: [
        ...function* () {
            yield `Visor Type: ${Variant.IsGoggleVariant(variant) ? 'Goggle' : 'Mask'}`
            const version = {
                [Layering.Goggle]: 'Goggle',
                [Layering.Blindfold]: 'Blindfold',
                [Layering.Mask]: 'Mask',
                [Layering.Hood]: 'Over Mask',
            }[variant.Layering]
            yield `Version: ${version}`
            if (Variant.IsBoidsVariant(variant)) {
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
            name: GetRestraintVariantName(variant),
            Model: GetGlassModelVariant(variant),
            preview: Variant.IsGoggleVariant(variant) ? 'GlassVisor' : 'GlassMask',
        })
    )
    if(Variant.IsBoidsVariant(variant)) {
        Transformers.push(CommonTransformer.SetRestraintProps('blindfold')(CalcBlind(variant)))
    }
    const tagCollection = ItemTags[variant.Layering]
    if (variant.Socketed) {
        
        Transformers.push(
            CommonTransformer.RequireSocket({
                sockets: [tagCollection.Socket],
                renderWhenLinkedBySocket: true
            })
        )
    }
    Transformers.push(
        CommonTransformer.MergeRestraintArray('shrine')(
            variant.Socketed ?
            [tagCollection.SocketedItem] :
            [tagCollection.NonSocketedItem]
        )
    )

    const [link, shrine] = ThrowIfNull(({
        [Layering.Mask]: [
            KDMaskLink,
            ['Masks']
        ],
        [Layering.Hood]: [
            KDMaskLink,
            ['Masks']
        ],
        [Layering.Blindfold]: [
            KDBlindfoldLink,
            ['Blindfolds']
        ],
        [Layering.Goggle]: [
            KDVisorLink,
            ['Visors']
        ],
    } as const)[variant.Layering])
    Transformers.push(
        CommonTransformer.MergeRestraintArray('LinkableBy')(link),
        CommonTransformer.MergeRestraintArray('shrine')(shrine)
    )
    return {
        Transformers: Transformers,
        Text: GetDebugText(variant)
    }
}

export const ValidVariants = (() => {
    let ret = Map<FromJS<Variant>, string>()
    const AddVariant =
        AddRestraintVariant({
            template: ItemTemplate,
            VariantMap: SocketedVariantMap
        })


    const AddDollMaker =
        <
            G extends Readonly<DollmakerVariant['GlassType']>,
            L extends Readonly<Extract<DollmakerVariant, { GlassType: G }>['Layering'][]>
        >(glassType: G, Layerings: L) => {
            for (const Layering of Layerings) {
                for (const Socketed of [true, false] as const) {
                    for (const HideBrows of [true, false] as const) {
                        const variant = {
                            Socketed,
                            HideBrows,
                            GlassType: glassType,
                            Layering
                        } as DollmakerVariant
                        const restraintTemplateName = AddVariant(variant)
                        ret = ret.set(fromJS(variant), restraintTemplateName)
                    }
                }
            }
        }

    AddDollMaker(GlassType.DollmakerGoggle, Variant.GoggleLayers)
    AddDollMaker(GlassType.DollmakerMask, Variant.MaskLayers)

    const AddBoids =
        <
            G extends Readonly<BoidsVariant['GlassType']>,
            L extends Readonly<Extract<BoidsVariant, { GlassType: G }>['Layering'][]>
        >(glassType: G, Layerings: L) => {
            for (const Layering of Layerings) {
                for (const Socketed of [true, false] as const) {
                    for (const Colorize of [true, false] as const) {
                        for (const Level of [1, 2, 3, 4] as const) {
                            const HideBrows = Level < 3
                            const variant = {
                                Socketed,
                                HideBrows,
                                GlassType: glassType,
                                Layering,
                                Colorize,
                                Level
                            } as BoidsVariant
                            const restraintTemplateName = AddVariant(variant)
                            ret = ret.set(fromJS(variant), restraintTemplateName)
                        }
                    }
                }
            }
        }

    AddBoids(GlassType.BoidsGoggle, Variant.GoggleLayers)
    AddBoids(GlassType.BoidsMask, Variant.MaskLayers)
    return ret
})()

export const GetVariant =
    (variant: Variant) => ThrowIfNull(ValidVariants.get(fromJS(variant)))