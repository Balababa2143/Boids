/**
 * The visor variant key: the union of every glass, layering, socket and colouring
 * combination the visor family registers, together with the predicates and the
 * enumerator used to walk them.
 *
 * The key is the save format. `Item.ts` and `Model.ts` derive a restraint name and
 * a model name from it with `uuidv5`, and that name is a hash of the key's fields
 * in literal order, so neither the field names nor the order they are written in
 * can change without breaking existing saves.
 * @module FactionMachine/Futuristic/GlassVisor/Variant
 */

import { GlassType, Layering } from './Constant'


/**
 * The fields every visor variant carries, whichever glass it is made of.
 *
 * `Layering` is narrowed by each interface below to the positions that glass
 * supports; `Socketed` says the visor has to be attached to a mount rather than
 * worn on its own; `HideBrows` hides the brow layer, which the Boids glass ties
 * to its level.
 */
interface Variantbase {
    Layering: Layering
    Socketed: boolean
    HideBrows: boolean
}

/**
 * The Boids glass strength tiers, 1 to 4. The level picks the glass sprite in
 * `Layer.ts` and scales the blindfold value in `Item.ts`, and levels above
 * `Variant.BoidsHideBrowsThreshold` hide the brows.
 */
export type Level = 1 | 2 | 3 | 4

/**
 * A Dollmaker goggle: the Dollmaker glass worn over the eyes or as a blindfold.
 * That glass is neither colourised nor levelled, so it renders the same sprite at
 * either layering.
 */
export interface DollmakerGoggle extends Variantbase {
    Layering: Layering.Blindfold | Layering.Goggle
    GlassType: GlassType.DollmakerGoggle
}

/**
 * A Dollmaker mask: the Dollmaker glass worn as a mask or as a hood over one.
 */
export interface DollmakerMask extends Variantbase {
    Layering: Layering.Mask | Layering.Hood
    GlassType: GlassType.DollmakerMask
}

interface BoidsVariantBase extends Variantbase {
    GlassType: GlassType.BoidsGoggle | GlassType.BoidsMask
    Colorize: boolean,
    Level: Level
}

/**
 * A Boids visor at a level that still shows the brows — 1 or 2 — on top of the
 * Boids fields: its `GlassType`, whether it is `Colorize`d rather than dark, and
 * its `Level`. `AddValidVariants` derives the flag from the level rather than
 * letting a caller set it, so a key cannot claim to hide brows at a level that
 * does not.
 */
export interface BoidsShowBrows extends BoidsVariantBase {
    HideBrows: false,
    Level: 1 | 2
}

/**
 * A Boids visor at a level that hides the brows — 3 or 4, the levels above
 * `Variant.BoidsHideBrowsThreshold` — on top of the Boids fields: its
 * `GlassType`, whether it is `Colorize`d rather than dark, and its `Level`.
 */
export interface BoidsHideBrows extends BoidsVariantBase {
    HideBrows: true,
    Level: 3 | 4
}

interface _BoidsGoggle extends BoidsVariantBase {
    Layering: Layering.Blindfold | Layering.Goggle
    GlassType: GlassType.BoidsGoggle
}

/**
 * Every Boids goggle: the Boids glass worn over the eyes or as a blindfold, at
 * any of the four levels, coloured or dark, brows shown or hidden as the level
 * dictates. `Variant.IsGoggleVariant` narrows to the goggles of either glass.
 */
export type BoidsGoggle =
    _BoidsGoggle & BoidsShowBrows |
    _BoidsGoggle & BoidsHideBrows

/**
 * Every Boids mask: the Boids glass worn as a mask or as a hood over one, at any
 * of the four levels, coloured or dark, brows shown or hidden as the level
 * dictates.
 */
export type BoidsMask =
    _BoidsMask & BoidsShowBrows |
    _BoidsMask & BoidsHideBrows

interface _BoidsMask extends BoidsVariantBase {
    Layering: Layering.Mask | Layering.Hood
    GlassType: GlassType.BoidsMask
}

/**
 * Both Dollmaker visors: the goggle and the mask. Together with `BoidsVariant`
 * it makes up the key union the family's three variant maps are keyed by.
 */
export type DollmakerVariant =
    DollmakerGoggle |
    DollmakerMask

/**
 * Both Boids visors: the goggle and the mask, at any level and either colouring.
 */
export type BoidsVariant =
    BoidsGoggle |
    BoidsMask

/**
 * The union of every valid variant key, which is what the three variant maps of
 * this family are keyed by and what `GetVariant` accepts.
 */
type Variant =
    DollmakerVariant |
    BoidsVariant

/**
 * The variant namespace: the layer lists, the glass-family predicates and the
 * brow threshold that together describe which keys exist.
 */
namespace Variant {

    /**
     * All four glasses, in `GlassType` declaration order. Nothing in this repo
     * reads it; it is here so a consumer can enumerate the glasses the family is
     * made of.
     */
    export const GlassTypes = [
        GlassType.DollmakerGoggle,
        GlassType.DollmakerMask,
        GlassType.BoidsGoggle,
        GlassType.BoidsMask,
    ] as const

    /**
     * The layerings a goggle-shaped visor is registered in, in the order
     * `AddValidVariants` walks them: over the eyes first, then as a blindfold.
     */
    export const GoggleLayers = [Layering.Goggle, Layering.Blindfold] as const
    /**
     * The layerings a mask-shaped visor is registered in, in the order
     * `AddValidVariants` walks them: the hood over a mask first, then the mask.
     */
    export const MaskLayers = [Layering.Hood, Layering.Mask] as const

    /**
     * Whether a glass is goggle-shaped, and so worn over the eyes or as a
     * blindfold, rather than mask-shaped.
     *
     * @param glassType - One of the four glasses.
     * @returns `true` for the two goggle glasses, `false` for the two masks.
     * @throws A `TypeError` for a value that is not a `GlassType`, so an
     * unknown number cannot quietly read as a mask.
     */
    export const IsGoggle = (glassType: GlassType) => {
        switch (glassType) {
            case GlassType.BoidsGoggle:
            case GlassType.DollmakerGoggle:
                return true
            case GlassType.BoidsMask:
            case GlassType.DollmakerMask:
                return false
            default:
                throw new TypeError('Unknown GlassType')
        }
    }

    /**
     * The variant-level form of `IsGoggle`: narrows a variant to the goggles,
     * which is how `Item.ts` picks a visor's preview sprite and how
     * `Item.CalcBlind` decides how much the glass blinds.
     */
    export const IsGoggleVariant = (variant: Variant): variant is DollmakerGoggle | BoidsGoggle =>
        IsGoggle(variant.GlassType)

    /**
     * Whether a glass belongs to the Boids family, the glass that has a level and
     * a colouring choice, rather than to the fixed Dollmaker skin.
     *
     * @param glassType - One of the four glasses.
     * @returns `true` for the two Boids glasses, `false` for the Dollmaker ones.
     * @throws A `TypeError` for a value that is not a `GlassType`.
     */
    export const IsBoids = (glassType: GlassType) => {
        switch (glassType) {
            case GlassType.BoidsGoggle:
            case GlassType.BoidsMask:
                return true
            case GlassType.DollmakerGoggle:
            case GlassType.DollmakerMask:
                return false
            default:
                throw new TypeError('Unknown GlassType')
        }
    }

    /**
     * The variant-level form of `IsBoids`: narrows a variant to the Boids glass,
     * the only variants whose key carries `Colorize` and `Level`.
     */
    export const IsBoidsVariant = (variant: Variant): variant is BoidsGoggle | BoidsMask =>
        IsBoids(variant.GlassType)

    /**
     * The highest level that still shows the brows: 2. `AddValidVariants` sets a
     * Boids variant's `HideBrows` from `Level > BoidsHideBrowsThreshold`, which
     * is what keeps the `BoidsShowBrows`/`BoidsHideBrows` split true by
     * construction, and `FactionMachine.MachinePrime.Item.Visor.Boids` makes the same
     * comparison when it maps a limiter strength onto a level.
     */
    export const BoidsHideBrowsThreshold = 2 as const
}

/**
 * The `Variant` union and the namespace above it as a single default export.
 *
 * This is why `GlassVisor/index.ts` spells the import out by name instead of
 * re-exporting the module as a namespace: a consumer needs `GlassVisor.Variant`
 * as a type as well as a value.
 */
export default Variant

/**
 * Enumerates every valid variant and hands each one to `AddVariant`.
 *
 * This is the single source of the family's key list: `Item.ts`, `Layer.ts` and
 * `Model.ts` each call it with their own callback, which is what guarantees that
 * the restraint map, the layer map and the model map are keyed by exactly the
 * same variants. The Dollmaker combinations are enumerated first — socketed by
 * brows by layering — then the Boids ones, socketed by colouring by level by
 * layering.
 *
 * @param AddVariant - Called once per variant. Each call receives a fresh plain
 * object, and its field order is the variant key's field order, which the
 * generated names are hashed from, so the literals below must not be tidied.
 */
export const AddValidVariants = (AddVariant: (_: Variant) => void) => {
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
                        AddVariant(variant)
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
                            const HideBrows = Level > Variant.BoidsHideBrowsThreshold
                            const variant = {
                                Socketed,
                                HideBrows,
                                GlassType: glassType,
                                Layering,
                                Colorize,
                                Level
                            } as BoidsVariant
                            AddVariant(variant)
                        }
                    }
                }
            }
        }

    AddBoids(GlassType.BoidsGoggle, Variant.GoggleLayers)
    AddBoids(GlassType.BoidsMask, Variant.MaskLayers)
}