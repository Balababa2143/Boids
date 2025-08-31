import { v5 as uuidv5 } from 'uuid'
import { FactionFilter } from '../../../KDInterface/TextKey'
import { GlassType, InheritColor, ItemTags, Layering } from './Constant'
import Variant, { AddValidVariants } from './Variant'
import { Transformer as CommonTransformer } from '../Common'
import { GetGlassModelVariant } from './Model'
import { AddRestraintWithTextThenGetName, AsVariantKey, IRestraintText, RestraintReceiver, RestraintVariant, VariantBuilder, VariantOrKey, VariantPart } from '../../../KDExtension'
import { ThrowIfNull } from '../../../Utilities'
import { FromJS, Map, Seq } from 'immutable'


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

export const ValidVariants = (() => {
    const restraintVariantBuilder = new VariantBuilder<Variant, RestraintVariant>({
        receiver: RestraintReceiver,
        getVariantValueDependentParts: (variantValue) => [({
            Restraint: {
                name: uuidv5(JSON.stringify(variantValue.toJS()), BaseName),
                Model: GetGlassModelVariant(variantValue),
            }
        })]
    })

    const AddVariant = (variant) => {
        const restraintParts: VariantPart<restraint>[] = []
        restraintParts.push({            
            preview: Variant.IsGoggleVariant(variant) ? 'GlassVisor' : 'GlassMask',
        })
        if(Variant.IsBoidsVariant(variant)) {
            restraintParts.push({
                blindfold: CalcBlind(variant)
            })
        }
        const tagCollection = ItemTags[variant.Layering]
        if (variant.Socketed) {
            restraintParts.push(CommonTransformer.RequireSocket2({
                sockets: [tagCollection.Socket],
                renderWhenLinkedBySocket: true
            }))
        }
        restraintParts.push({
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
        restraintParts.push({
            LinkableBy: link,
            shrine
        })
        const parts =
            Seq(restraintParts)
                .map(r => ({
                    Restraint: r
                } satisfies VariantPart<RestraintVariant>))
                .concat({
                    TextInfo: GetDebugText(variant)
                } satisfies VariantPart<RestraintVariant>)
        restraintVariantBuilder.Add(variant, parts)
    }

    AddValidVariants(AddVariant)

    const variantMap = restraintVariantBuilder.BuildVariantMap({
        template: {
            Restraint: ItemTemplate
        }
    })
    const variantToNameMap: Map<FromJS<Variant>, string> =
        variantMap.map(({Restraint, TextInfo}) => 
            AddRestraintWithTextThenGetName(
                Restraint,
                TextInfo
            )
        )
    return variantToNameMap
})()

export const GetVariant =
    (variant: VariantOrKey<Variant>) => ThrowIfNull(ValidVariants.get(AsVariantKey<Variant>(variant)))