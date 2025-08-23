import * as KDEx from '../../../KDInterface/KDExtension'
import * as Enum from '../../../Utilities/Enum'
import { FactionFilter } from '../../../KDInterface/TextKey'
import { Category, GetGagMetal, InheritColor } from './GagMetal'
import { ItemArchetype } from '../Common'

//#region Variants

export enum Component {
    None = 1 << 0,
    PerioralClip = 1 << 1,
    CheekDisplay = 1 << 2,
    GlabellaDisplay = 1 << 3,
    OTNRivets = 1 << 4,
    OTNStrap = 1 << 5,
    Panel = 1 << 6,
    Plug = 1 << 7,
    PlugPort = 1 << 8,
}

export enum MuzzleKind {
    None = 0,
    Metal = 1,
    Transparent = 2,
    OTN = 3,
}

export enum BallKind {
    None = 0,
    Ball = 1,
    BigBall = 2,
}

export enum StrapDetail {
    None = 1 << 0,
    Segmented = 1 << 1,
    SideStrap = 1 << 2,
}

export enum StrapKindTags {
    None = 0,
    Strap = 1,
    Harness = 2
}

export type StrapKind =
    { __Type: StrapKindTags.None } |
    { __Type: StrapKindTags.Strap, Detail: StrapDetail } |
    { __Type: StrapKindTags.Harness, Detail: StrapDetail }

namespace StrapKind {
    export const ToStringKey = (strapKind: StrapKind) =>
        [
            ...(function* () {
                switch (strapKind.__Type) {
                    case StrapKindTags.None:
                        break
                    case StrapKindTags.Harness:
                        yield 'Harness'
                        break
                    case StrapKindTags.Strap:
                        yield 'Strap'
                }
                if (strapKind.__Type !== StrapKindTags.None) {
                    for (const tag of Enum.GetSetFlags(StrapDetail, strapKind.Detail)) {
                        yield tag
                    }
                }
            })()
        ].join('-')
}

export interface Variant {
    Ball: BallKind
    Strap: StrapKind
    Muzzle: MuzzleKind
    Component: Component
}

export namespace Variant {
    export const ThrowInvalid = () => { throw new Error('Invalid metal gag variant.') }
    export const Verify = (v: Variant) => {
        if (!(
            Enum.IsDefined(BallKind, v.Ball) &&
            Enum.IsDefined(MuzzleKind, v.Muzzle) &&
            Enum.IsDefined(StrapKindTags, v.Strap.__Type)
        )) {
            ThrowInvalid()
        }
        switch (v.Strap.__Type) {
            case StrapKindTags.None:
                break
            case StrapKindTags.Strap:
            case StrapKindTags.Harness:
                if (typeof v.Strap.Detail !== 'number') {
                    ThrowInvalid()
                }
                break
            default:
                ThrowInvalid()
        }
        if (typeof v.Component !== 'number') {
            ThrowInvalid()
        }
    }

    export const ToStringKey = (variant: Variant) => [
        BallKind[variant.Ball],
        StrapKind.ToStringKey(variant.Strap),
        MuzzleKind[variant.Muzzle],
        Enum.GetSetFlags(Component, variant.Component).join('-')
    ].join('_')

}
//#endregion

/**
 * Link category for oral devices.
 * Control stacking.
 */
export const OralDeviceLinkCategory = '39C79AA5-74A9-4391-8FBA-2B7F23C2D6E0'

const GetGagStrength = (variant: Variant) => {
    Variant.Verify(variant)
    return [
        {
            [BallKind.None]: 0,
            [BallKind.Ball]: 0.4,
            [BallKind.BigBall]: 0.7,
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
                [Component.PerioralClip, 0.025],
                [Component.Panel, 0.125],
                [Component.Plug, 1],
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
        [Category.PlugGags]: KDPlugGagLink,
        [Category.Stuffing]: KDStuffingLink,
        [Category.BallGags]: KDBallGagLink,
        [Category.FlatGags]: KDFlatGagLink,
        [Category.MuzzleGags]: KDMuzzleGagLink,
    }[category]

    return <restraint>{
        name,
        Model: GetGagMetal({ category, variant }),
        shrine: [
            'Gags',
            category
        ],
        LinkableBy: link,
        renderWhenLinked: [
            ItemArchetype.FaceCover,
            ItemArchetype.OralDevice
        ],
        gag: GetGagStrength(variant),

        Group: 'ItemMouth',
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