/**
 * The metal gag vocabulary: the axes a gag model is selected by, the key those axes render to, and
 * the restraint factory every face cover and muffler here is built from. A `Variant` decides both
 * which layers `GagMetal` draws and how much gag strength the item adds.
 * @module FactionMachine/Futuristic/Gag/Common
 */

import { Enum } from '../../../Utilities'
import { FactionFilter } from '../../../KDInterface/TextKey'
import { ControlledTag } from '../../MachinePrime/Coordinator/Tag'
import { Category, GetGagMetal, InheritColor } from './GagMetal'
import { GagEscapeChance, CommonItemAvailability } from '../Common'

//#region Variants

/**
 * The optional hardware a variant wears, as a flag set; no flag is mandatory or exclusive.
 *
 * `PlugPort` puts a plug socket on the item, so `Muffler.Plug` can be worn on top of it; `Plug`
 * forces the `StuffMouth` and `HideMouth` poses.
 */
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

/**
 * The muzzle the variant wears over the mouth; each is worth a different amount of gag. `OTN` is
 * the plate the OTN rivet and strap components are made for.
 */
export enum MuzzleKind {
    None = 0,
    Metal = 1,
    Transparent = 2,
    OTN = 3,
}

/**
 * What fills the mouth: nothing, a ball, or a ball big enough to hide the mouth. `Ball` draws a
 * teeth overlay with it; `BigBall` forces the `FaceBigGag` pose.
 */
export enum BallKind {
    None = 0,
    Ball = 1,
    BigBall = 2,
}

/**
 * How the strap or harness a variant wears is detailed, as a flag set; read only when the variant
 * has a strap. `None` adds no layer and no weight, though it still appears in the generated key if
 * set.
 */
export enum StrapDetail {
    None = 1 << 0,
    Segmented = 1 << 1,
    SideStrap = 1 << 2,
}

/**
 * Which of the three strap shapes a variant wears: a discriminator read as `StrapKind.__Type`,
 * never combined with anything.
 */
export enum StrapKindTags {
    None = 0,
    Strap = 1,
    Harness = 2
}

/**
 * The strap or harness a variant wears, discriminated on `__Type`: `Detail` exists only on the two
 * branches that have a strap.
 */
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

/**
 * The four axes that describe one metal gag. They decide the model's layers, the generated model
 * name and the item's gag strength, so two variants that differ in any one axis are two models
 * rather than one model with options.
 */
export interface Variant {
    Ball: BallKind
    /** The strap or harness; the `None` branch carries no `Detail`. */
    Strap: StrapKind
    Muzzle: MuzzleKind
    /** The flag set of `Component`; no flag is required. */
    Component: Component
}

/**
 * The value half of `Variant`: the validation and key rendering the model and item factories share.
 */
export namespace Variant {
    /** Throws the "invalid metal gag variant" error; typed `never` so a `default` arm satisfies an
     * exhaustiveness check. */
    export const ThrowInvalid = () => { throw new Error('Invalid metal gag variant.') }
    /**
     * Checks that every axis is a known member and that a strap carries a numeric `Detail`; an
     * invalid variant fails loudly at registration instead of silently drawing nothing.
     *
     * `Component` is only checked to be a number, so unknown bits are ignored rather than rejected.
     *
     * @throws If the variant is not a legal combination of axes.
     */
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

    /**
     * Renders the variant as the `_`-joined key that ends a generated model name, e.g.
     * `None_Strap-SideStrap_None_PerioralClip`; it is one-to-one with the variant.
     */
    export const ToStringKey = (variant: Variant) => [
        BallKind[variant.Ball],
        StrapKind.ToStringKey(variant.Strap),
        MuzzleKind[variant.Muzzle],
        Enum.GetSetFlags(Component, variant.Component).join('-')
    ].join('_')

}
//#endregion

/**
 * The link category the mod's oral devices stack under, set on every muffler by
 * `Muffler.MakeMuffler`.
 *
 * The game totals the `linkSize` of the equipped items sharing this key and refuses one that would
 * take the total past 1, which is why the empty muffler's 0.4 leaves room for the plug's 0.6 but
 * not for a ball's 0.7.
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
 * Builds the restraint template for one gag or face cover from a category and a variant.
 *
 * It does not register the restraint — the caller hands the result to
 * `AddRestraintWithTextThenGetName` — but asking for the template does register its model, through
 * `GagMetal.GetGagMetal`.
 *
 * @param args.name - The restraint name to register under, not shown to the player.
 * @param args.category - Which gag family the item belongs to: it selects the link set, the layer
 *   the model draws into, and the second tag in the shrine list.
 * @param args.variant - The layers to draw and the gag strength to add.
 * @returns A restraint template, not registered.
 * @throws If the variant is not a legal combination, via `Variant.Verify`.
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
            category,
            // The membership tag: the family participates in the control model or none of it does.
            ControlledTag,
        ],
        LinkableBy: link,
        renderWhenLinked: [
        ],
        gag: GetGagStrength(variant),

        Group: 'ItemMouth',
        noShrine: true,
        special: true,

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

        escapeChance: GagEscapeChance,

        power: 0,
        ...CommonItemAvailability,

        playerTags: {},
        enemyTags: {}
    }
}