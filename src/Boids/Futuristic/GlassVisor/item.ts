import { v5 as uuidv5 } from 'uuid'
import { FactionFilter } from '../../../KDInterface/TextKey'
import { GlassType, InheritColor, ItemTags, Layering } from './Constant'
import Variant, { AddValidVariants } from './Variant'
import { GetGlassModelVariant, MaskMountModel } from './Model'
import { AddRestraintWithTextThenGetName, RestraintText, RestraintVariant, VariantKeyOrImmutable, VariantPart, RestraintVariantMapBuilder, VariantKeyToImmutable } from '../../../KDExtension'
import { ThrowIfNull } from '../../../Utilities'
import { FromJS, Map } from 'immutable'
import { RequireSocket } from '../Common/VariantPart'


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
} satisfies RestraintText)

class VisorVariantMapBuilder extends RestraintVariantMapBuilder<Variant>
{
    protected override _PostProcess(variantKey: FromJS<Variant>, workingItem: FromJS<VariantPart<restraint>>): FromJS<RestraintVariant> {
        return super._PostProcess(
            variantKey,
            workingItem
                .set('Model', GetGlassModelVariant(variantKey))
        )
    }
}

const {
    variantToNameMap:ValidVariantNameMap,
    variantMap: ValidVariantRestraintMap
} = (() => {
    const variantMapBuilder = new VisorVariantMapBuilder({
        baseName: BaseName
    })

    const AddVariant = (variant) => {
        const immutableVariantKey = VariantKeyToImmutable(variant)
        variantMapBuilder.AddVariantPart(immutableVariantKey, {
            preview: Variant.IsGoggleVariant(variant) ? 'GlassVisor' : 'GlassMask',
        })
        if(Variant.IsBoidsVariant(variant)) {
            variantMapBuilder.AddVariantPart(immutableVariantKey, {
                blindfold: CalcBlind(variant)
            })
        }
        const tagCollection = ItemTags[variant.Layering]
        if (variant.Socketed) {
            variantMapBuilder.AddVariantPart(
                immutableVariantKey,
                RequireSocket({
                sockets: [tagCollection.Socket],
                renderWhenLinkedBySocket: true
            })
            )
        }
        variantMapBuilder.AddVariantPart(immutableVariantKey, {
            shrine: variant.Socketed ?
                [tagCollection.SocketedItem] :
                [tagCollection.NonSocketedItem]
        })

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
        variantMapBuilder.AddVariantPart(immutableVariantKey, {
            LinkableBy: link,
            shrine
        })
        variantMapBuilder.AddText(variant, GetDebugText(variant))
    }

    AddValidVariants(AddVariant)

    const variantMap = variantMapBuilder.BuildVariantMap(ItemTemplate)
    const variantToNameMap: Map<FromJS<Variant>, string> =
        variantMap.map(({Restraint, TextInfo}) => 
            AddRestraintWithTextThenGetName(
                Restraint,
                TextInfo
            )
        )
    return {
        variantMap,
        variantToNameMap
    }
})()

export { ValidVariantNameMap, ValidVariantRestraintMap }

export const GetVariant =
    (variant: VariantKeyOrImmutable<Variant>) => ThrowIfNull(ValidVariantNameMap.get(VariantKeyToImmutable<Variant>(variant)))

export const FullMaskMount = AddRestraintWithTextThenGetName({
    ...ItemTemplate,
    name: 'B599D065-0BEA-4CA7-8E17-7F4BE959A0A8',
    Model: MaskMountModel,
    shrine: [
        'Masks',
        ItemTags[Layering.Hood].Socket,
        ItemTags[Layering.Mask].Socket,

    ],
    LinkableBy: [
        ...KDMaskLink,
        ...KDVisorLink,
    ]
} satisfies restraint, {
    DisplayName: 'Mask Mount',
    FunctionText: 'A mount for attaching visors and masks. Can be used as a base for more powerful variants.'
}) 