/**
 * The visor restraints: one per variant key, registered into the game's restraint list and cache as
 * a side effect of importing this module, plus the mask mount they can be attached to.
 *
 * `GetVariant` maps a variant key to the restraint the game already knows by name, which is what
 * `MachinePrime` hands to a morph as its template.
 * @module FactionMachine/Futuristic/GlassVisor/Item
 */

// The family's text tree: importing it registers the keys the restraints below resolve.
import './Data'
import { FactionFilter } from '../../../KDInterface/TextKey'
import { GlassType, InheritColor, ItemTags, Layering } from './Constant'
import Variant, { AddValidVariants } from './Variant'
import { GetGlassModelVariant, MaskMountModel } from './Model'
import { AddRestraintWithTextThenGetName, AddRestraintVariantMapToGame, RestraintText, RestraintVariant, VariantKeyOrImmutable, VariantPart, RestraintVariantMapBuilder, VariantKeyToImmutable } from '../../../KDExtension'
import { DerivedVariantBase } from '../../../KDExtension/Release'
import { ThrowIfNull } from '../../../Utilities'
import { FromJS } from 'immutable'
import { RequireSocket } from '../Common/VariantPart'
import { RequireLockedEvent, CommonItemAvailability } from '../Common'
import { ControlledTag } from '../../MachinePrime/Coordinator/Tag'


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
        Struggle: -1,
        Pick: -1,
        Unlock: 0.32,
        Cut: -0.8
    },
    power: 0,
    ...CommonItemAvailability,

    playerTags: {},
    enemyTags: {},

    events: [
        RequireLockedEvent
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

/**
 * The namespace this family's restraint names are hashed under, derived from the mod root rather
 * than written as a literal: a hand-written base id is unversioned forever.
 */
const BaseName = DerivedVariantBase.GlassVisorItem

/**
 * The path this variant's text is addressed at: one node per glass family, because the two names
 * are authored in the family's tree rather than computed from the variant.
 */
const TextPath = (variant: Variant): readonly string[] => [
    'FactionMachine',
    'Futuristic',
    'GlassVisor',
    variant.GlassType == GlassType.BoidsGoggle || variant.GlassType == GlassType.DollmakerGoggle
        ? 'Goggle'
        : 'Mask',
]

/**
 * A variant's function line: what the glass is, which version, whether it colours, and at what
 * level.
 */
const GetVariantText = (variant: Variant) => ({
    Path: TextPath(variant),
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

class VisorVariantMapBuilder extends RestraintVariantMapBuilder<FromJS<Variant>>
{
    protected override _DoFinalizeWorkingDraft(workingItem: FromJS<VariantPart<restraint>>, variantKey: FromJS<Variant>): FromJS<Partial<RestraintVariant>> {
        return super._DoFinalizeWorkingDraft(
            workingItem
                .set('Model', GetGlassModelVariant(variantKey)),
                variantKey
        )
    }
}

const ValidVariantNameMap = (() => {
    const variantMapBuilder = new VisorVariantMapBuilder({
        baseId: BaseName
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
            shrine: [...shrine, ControlledTag]
        })
        variantMapBuilder.AddText(immutableVariantKey, GetVariantText(variant))
    }

    AddValidVariants(AddVariant)

    // Registering the restraints is the point of this call; the table only maps variants to names.
    return AddRestraintVariantMapToGame(variantMapBuilder.BuildVariantMap(ItemTemplate))
})()

/**
 * The registered restraint name for a visor variant: the entry point a downstream mod calls to make
 * a visor of a given glass, and a lookup rather than a factory, because every valid variant is
 * already registered by the time this module has finished evaluating.
 *
 * @returns The restraint's registered name, the string to hand to the game as an item name or as a
 *   morph `template`.
 * @throws For a key `AddValidVariants` does not enumerate — an unknown glass, a layering the glass
 *   cannot take, or a `HideBrows` contradicting the level.
 */
export const GetVariant =
    (variant: VariantKeyOrImmutable<Variant>) => ThrowIfNull(ValidVariantNameMap.get(VariantKeyToImmutable<Variant>(variant)))

/**
 * The `Mask Mount` restraint: the visor-less base a socketed mask or hood visor is attached to,
 * offering the mask and hood sockets as shrine categories and accepting both mask and visor link
 * categories.
 *
 * It is a single fixed restraint rather than a member of the variant map, so it has its own name
 * and its own model (`Model.MaskMountModel`).
 */
export const FullMaskMount = AddRestraintWithTextThenGetName({
    ...ItemTemplate,
    name: 'B599D065-0BEA-4CA7-8E17-7F4BE959A0A8',
    Model: MaskMountModel,
    shrine: [
        'Masks',
        ItemTags[Layering.Hood].Socket,
        ItemTags[Layering.Mask].Socket,
        ControlledTag,

    ],
    LinkableBy: [
        ...KDMaskLink,
        ...KDVisorLink,
    ]
} satisfies restraint, {
    DisplayName: 'Mask Mount',
    FunctionText: 'A mount for attaching visors and masks. Can be used as a base for more powerful variants.'
}) 
