import * as KDEx from '../../../KDInterface/KDExtension'
import * as Enum from '../../../Utilities/Enum'
import { FactionFilter } from '../../../KDInterface/TextKey'
import { BallKind, Category, Component, GetGagMetal, InheritColor, MuzzleKind, StrapDetail, StrapKindTags, Variant } from './GagMetal'

const GetGagStrength = (variant: Variant) => {
    Variant.Verify(variant)
    return [
        {
            [BallKind.None]: 0,
            [BallKind.Ball]: 0.3,
            [BallKind.BigBall]: 0.6,
        }[variant.Ball],
        {
            [MuzzleKind.None]: 0,
            [MuzzleKind.Metal]: 0.15,
            [MuzzleKind.Transparent]: 0.1,
            [MuzzleKind.OTN]: 0.3,
        }[variant.Muzzle],
        {
            [StrapKindTags.None]: 0,
            [StrapKindTags.Strap]: 0.05,
            [StrapKindTags.Harness]: 0.2
        }[variant.Strap.__Type],
        ...(function* () {
            const strengthMap = [
                [StrapDetail.Segmented, 0.0125],
                [StrapDetail.SideStrap, 0.025],
            ]
            if (variant.Strap.__Type !== StrapKindTags.None) {
                for (const [flag, strength] of strengthMap) {
                    if (Enum.HasFlag(variant.Strap.Detail, flag)) {
                        yield strength
                    }
                }
            }
        })(),
        ...(function* () {
            const strengthMap = [
                [Component.PerioralClip, 0.05],
                [Component.Panel, 0.125],
                [Component.Plug, 0.9],
                [Component.OTNRivets, 0.05],
                [Component.OTNStrap, 0.15],
                [Component.GlabellaDisplay, 0.025],
                [Component.CheekDisplay, 0.075]
            ]
            for (const [flag, strength] of strengthMap) {
                if (Enum.HasFlag(variant.Component, flag)) {
                    yield strength
                }
            }
        })()
    ].reduce((a, b) => a + b)
}

/**
 * Generate restraint template from given parameter.
 * @param args.name
 *  Text key for the generated template.
 * @param args.category
 *  Used to set model layering parameters.
 * @param args.variant
 *  Specify model details, as well as gag mechanic parameters.
 * @returns 
 *  A restraint template with model and properties set to variant.
 */
export const MakeItem = (args: { name: string, category: Category, variant: Variant }) => {
    const { name, category, variant } = args
    const link = {
        [Category.Gag]: KDBallGagLink,
        [Category.GagFlat]: KDFlatGagLink,
        [Category.GagMuzzle]: KDMuzzleGagLink
    }[category]

    // Order of shrine affect inventory icon
    const gagType = (function* () {
        if (Enum.HasFlag(variant.Component, Component.Plug)) {
            yield 'PlugGags'
        }
        if (
            variant.Muzzle !== MuzzleKind.None ||
            Enum.HasFlag(variant.Component, Component.Panel)
        ) {
            yield 'FlatGags'
        }
        if (variant.Ball != BallKind.None) {
            yield 'BallGags'
        }
    })()

    return <restraint>{
        name,
        Model: GetGagMetal({ category, variant }),
        shrine: [
            "Gags",
            ...gagType
        ],
        LinkableBy: link,
        gag: GetGagStrength(variant),

        Group: "ItemMouth",
        noShrine: true,
        // inventory: false,
        special: true,
        // noDupe: true,

        factionFilters: {
            [InheritColor.BaseMetal]: {
                color: FactionFilter.LightNeutral,
                override: true
            },
            [InheritColor.DecorationMetal]: {
                color: FactionFilter.DarkNeutral,
                override: true
            },
            [InheritColor.Light]: {
                color: FactionFilter.Highlight,
                override: true
            },
            [InheritColor.Ball]: {
                color: FactionFilter.Catsuit,
                override: false
            },
        },

        escapeChance: {
            Remove: 0.7,
            Struggle: 0.05,
            Unlock: 0.44,
            Pick: 0.27,
            Cut: 0.16
        },

        power: 0,
        weight: 0,
        minLevel: 0,
        allFloors: true,

        playerTags: {},
        enemyTags: {}
    }
}