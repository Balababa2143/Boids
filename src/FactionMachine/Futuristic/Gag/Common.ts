/**
 * The metal gag vocabulary: the axes a gag model is selected by, the key those
 * axes render to, and the restraint factory every face cover and muffler in this
 * family is built from.
 *
 * A `Variant` decides both which layers `GagMetal` draws and how much the item adds
 * to the wearer's gag strength, so the family is expressed as a flag set plus a
 * factory rather than as a hand-written list of restraints.
 * @module FactionMachine/Futuristic/Gag/Common
 */

import { Enum } from '../../../Utilities'
import { FactionFilter } from '../../../KDInterface/TextKey'
import { ControlledTag } from '../../MachinePrime/Coordinator/Tag'
import { Category, GetGagMetal, InheritColor } from './GagMetal'
import { GagEscapeChance, CommonItemAvailability } from '../Common'

//#region Variants

/**
 * The optional hardware a variant may wear, as a flag set: each set flag adds its
 * own layers to the model and its own amount to the item's gag total, and no flag is
 * mandatory or exclusive.
 *
 * `None` is a declared bit that nothing reads, so "no hardware" is written as a
 * variant that sets no flag at all rather than as `Component.None`.
 *
 * - `PerioralClip`: the clip spanning the mouth, with a separate lit display band.
 * - `CheekDisplay`: a rim and display over each cheek.
 * - `GlabellaDisplay`: the display between the brows.
 * - `OTNRivets`: rivets tied to the muzzle layer, so they draw only with a muzzle.
 * - `OTNStrap`: the strap and its rivets over the muzzle, likewise tied to it.
 * - `Panel`: the flat plate the flat-gag category is built around.
 * - `Plug`: the plug sprite, and the heaviest single contribution to the gag total;
 *   it also forces the `StuffMouth` and `HideMouth` poses.
 * - `PlugPort`: the empty port, which is what puts a plug socket on the item and so
 *   what lets a `Muffler.Plug` be worn on top of it.
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
 * The muzzle the variant wears over the mouth: the plate itself, and the second of
 * the two big decisions in a variant after the ball.
 *
 * `Metal` is the opaque plate, `Transparent` the see-through one and `OTN` the plate
 * the OTN rivet and strap components are made for; each is worth a different amount
 * of gag. `None` leaves the mouth uncovered.
 */
export enum MuzzleKind {
    None = 0,
    Metal = 1,
    Transparent = 2,
    OTN = 3,
}

/**
 * What fills the mouth: nothing, a ball, or a ball big enough to hide the mouth
 * entirely.
 *
 * `Ball` draws a teeth overlay with the ball and contributes the least of the two;
 * `BigBall` is the larger ball, worth considerably more gag, and the one that forces
 * the `FaceBigGag` pose.
 */
export enum BallKind {
    None = 0,
    Ball = 1,
    BigBall = 2,
}

/**
 * How the strap or harness a variant wears is detailed, as a flag set; it is only
 * read when the variant has a strap at all.
 *
 * `Segmented` switches the strap or harness to its banded sprite and `SideStrap` adds
 * the strap down the side of the face, and each set flag adds a little to the gag
 * total. `None` carries no meaning beyond being a value here -- it adds no layer and
 * no weight, though it still appears in the generated key if it is set.
 */
export enum StrapDetail {
    None = 1 << 0,
    Segmented = 1 << 1,
    SideStrap = 1 << 2,
}

/**
 * Which of the three strap shapes a variant wears. Unlike the flag sets above, this
 * is a discriminator: it is read as `StrapKind.__Type` to pick a branch, not combined
 * with anything.
 *
 * `Strap` is the single band around the head and `Harness` the multi-band harness
 * worth several times as much gag, while `None` is the branch that carries no
 * `Detail` at all.
 */
export enum StrapKindTags {
    None = 0,
    Strap = 1,
    Harness = 2
}

/**
 * The strap or harness a variant wears, discriminated on `__Type`: `Detail` is the
 * `StrapDetail` flag set and exists only on the two branches that have a strap, so a
 * switch on `__Type` has to handle `None` without one.
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
 * The four axes that describe one metal gag: what fills the mouth, what holds it
 * there, what covers it, and what extra hardware is bolted on.
 *
 * Between them the axes decide the model's layers, the generated model name and the
 * item's gag strength, so two variants that differ in any one axis are two separate
 * models rather than one model with options.
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
 * The value half of `Variant`: the validation and the key rendering that the model
 * factory and the item factory both go through, so they agree on what a legal variant
 * is and on what it is called.
 */
export namespace Variant {
    /**
     * Throws the "invalid metal gag variant" error, and is typed `never` so a `default`
     * arm that calls it satisfies any exhaustiveness check.
     */
    export const ThrowInvalid = () => { throw new Error('Invalid metal gag variant.') }
    /**
     * Checks that every axis is a known member and that a strap carries a numeric
     * `Detail`, throwing through `ThrowInvalid` if not. Nothing else calls
     * `ThrowInvalid`, so an invalid variant fails loudly at registration instead of
     * silently drawing nothing.
     *
     * `Component` is only checked to be a number, so unknown bits are ignored rather
     * than rejected.
     *
     * @param v - The variant to check.
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
     * Renders the variant as the `_`-joined key that ends a generated model name, for
     * example `None_Strap-SideStrap_None_PerioralClip` for `FaceCover.SimpleHarness`.
     *
     * The strap part is empty when the variant has no strap and the flags are joined
     * with `-`, so the key is one-to-one with the variant.
     *
     * @param variant - The variant to render.
     * @returns The key fragment, without the category or the `Boids.Asset.Gag` prefix.
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
 * The game totals the `linkSize` of the equipped items sharing this key and refuses
 * one that would take the total past 1, which is why the empty muffler's 0.4 leaves
 * exactly room for the plug's 0.6 while a ball's 0.7 does not.
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
 * Builds the restraint template for one gag or face cover from a category and a
 * variant. It does not register the restraint: the caller hands the result to
 * `AddRestraintWithTextThenGetName`. Asking for the template does register its model,
 * because `Model` comes from `GagMetal.GetGagMetal`.
 *
 * The template is where the family's shared decisions live: the `ItemMouth` group, a
 * shrine tag list of `Gags` plus the category, the gag strength the variant adds up
 * to, the faction filters the layers inherit their colour from, the escape chances the
 * flat harnesses and muzzles share, and the "weightless, level 0, every floor"
 * availability trio. The category also picks the link set the item can be linked by,
 * and `noShrine` keeps a shrine from taking the item off.
 *
 * @param args.name - The restraint name to register under, not shown to the player;
 *   the display name comes from the text passed to the registration helper.
 * @param args.category - Which gag family the item belongs to. It selects the link
 *   set, the layer base the model draws into, and the second tag in the shrine list.
 * @param args.variant - The layers to draw and the gag strength to add; see `Variant`
 *   for the axes.
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
            // Every gag this family makes is a participant in the control model: it fills the mouth,
            // and the membership tag is what the controller reads when it computes what the worn set
            // can do (`Coordinator/Membership.ts`). It is on the shared template rather than on each
            // category because the whole family participates or none of it does.
            ControlledTag,
        ],
        LinkableBy: link,
        renderWhenLinked: [
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

        escapeChance: GagEscapeChance,

        power: 0,
        ...CommonItemAvailability,

        playerTags: {},
        enemyTags: {}
    }
}