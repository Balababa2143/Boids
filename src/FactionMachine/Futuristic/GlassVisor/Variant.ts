/**
 * The visor variant key: the union of every glass, layering, socket and colouring combination the
 * visor family registers, the predicates over it, and the enumerator that walks them.
 *
 * The key is the save format: restraint and model names are hashed from its fields in literal
 * order, so neither the field names nor their order can change without breaking saves.
 * @module FactionMachine/Futuristic/GlassVisor/Variant
 */

import { GlassType, Layering } from './Constant'


/**
 * The fields every visor variant carries. Each interface below narrows `Layering` to the positions
 * that glass supports.
 */
interface Variantbase {
    Layering: Layering
    Socketed: boolean
    HideBrows: boolean
}

/**
 * The Boids glass strength tiers, 1 to 4. The level picks the glass sprite and scales the blindfold
 * value; levels above `Variant.BoidsHideBrowsThreshold` hide the brows.
 */
export type Level = 1 | 2 | 3 | 4

/** A Dollmaker goggle: the uncoloured, unlevelled glass over the eyes or as a blindfold. */
export interface DollmakerGoggle extends Variantbase {
    Layering: Layering.Blindfold | Layering.Goggle
    GlassType: GlassType.DollmakerGoggle
}

/** A Dollmaker mask: the Dollmaker glass worn as a mask or as a hood over one. */
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
 * A Boids visor at a level that still shows the brows, 1 or 2.
 *
 * `AddValidVariants` derives `HideBrows` from the level rather than letting a caller set it, so a
 * key cannot claim to hide brows at a level that does not.
 */
export interface BoidsShowBrows extends BoidsVariantBase {
    HideBrows: false,
    Level: 1 | 2
}

/** A Boids visor at a level that hides the brows: 3 or 4. */
export interface BoidsHideBrows extends BoidsVariantBase {
    HideBrows: true,
    Level: 3 | 4
}

interface _BoidsGoggle extends BoidsVariantBase {
    Layering: Layering.Blindfold | Layering.Goggle
    GlassType: GlassType.BoidsGoggle
}

/** Every Boids goggle, at any level, coloured or dark. */
export type BoidsGoggle =
    _BoidsGoggle & BoidsShowBrows |
    _BoidsGoggle & BoidsHideBrows

/** Every Boids mask, at any level, coloured or dark. */
export type BoidsMask =
    _BoidsMask & BoidsShowBrows |
    _BoidsMask & BoidsHideBrows

interface _BoidsMask extends BoidsVariantBase {
    Layering: Layering.Mask | Layering.Hood
    GlassType: GlassType.BoidsMask
}

/** Both Dollmaker visors: the goggle and the mask. */
export type DollmakerVariant =
    DollmakerGoggle |
    DollmakerMask

/** Both Boids visors: the goggle and the mask. */
export type BoidsVariant =
    BoidsGoggle |
    BoidsMask

/** The union of every valid variant key, which the family's three variant maps are keyed by. */
type Variant =
    DollmakerVariant |
    BoidsVariant

/**
 * The variant namespace: the layer lists, the glass-family predicates and the brow threshold that
 * together describe which keys exist.
 */
namespace Variant {

    /** All four glasses, in `GlassType` declaration order. Nothing in this repo reads it. */
    export const GlassTypes = [
        GlassType.DollmakerGoggle,
        GlassType.DollmakerMask,
        GlassType.BoidsGoggle,
        GlassType.BoidsMask,
    ] as const

    /**
     * The layerings a goggle-shaped visor is registered in, in the order `AddValidVariants` walks
     * them.
     */
    export const GoggleLayers = [Layering.Goggle, Layering.Blindfold] as const
    /**
     * The layerings a mask-shaped visor is registered in, in the order `AddValidVariants` walks
     * them.
     */
    export const MaskLayers = [Layering.Hood, Layering.Mask] as const

    /**
     * Whether a glass is goggle-shaped rather than mask-shaped.
     *
     * @throws A `TypeError` for a value that is not a `GlassType`; an unknown number cannot read as
     *   a mask.
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
     * The variant-level form of `IsGoggle`, narrowing a variant to the goggles; `Item.ts` picks a
     * visor's preview sprite and its blind strength from it.
     */
    export const IsGoggleVariant = (variant: Variant): variant is DollmakerGoggle | BoidsGoggle =>
        IsGoggle(variant.GlassType)

    /**
     * Whether a glass belongs to the Boids family, the glass that has a level and a colouring
     * choice.
     *
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
     * The variant-level form of `IsBoids`: the only variants whose key carries `Colorize` and
     * `Level`.
     */
    export const IsBoidsVariant = (variant: Variant): variant is BoidsGoggle | BoidsMask =>
        IsBoids(variant.GlassType)

    /**
     * The highest level that still shows the brows: 2.
     *
     * `AddValidVariants` sets `HideBrows` from `Level > BoidsHideBrowsThreshold`, and
     * `FactionMachine.MachinePrime.Item.Visor.Boids` makes the same comparison when it maps a
     * limiter strength onto a level.
     */
    export const BoidsHideBrowsThreshold = 2 as const
}

/**
 * The `Variant` union and the namespace above it as a single default export, so a consumer can use
 * `GlassVisor.Variant` as a type as well as a value.
 */
export default Variant

/**
 * Enumerates every valid variant and hands each one to `AddVariant`, which is the single source of
 * the family's key list: `Item.ts`, `Layer.ts` and `Model.ts` each call it, which keeps the
 * restraint, layer and model maps keyed by exactly the same variants.
 *
 * @param AddVariant - Called once per variant, with its field order fixed: the generated names are
 *   hashed from it, so the literals below must not be tidied.
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