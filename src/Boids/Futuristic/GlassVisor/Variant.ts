import { GlassType, Layering } from './Constant'


interface Variantbase {
    Layering: Layering
    Socketed: boolean
    HideBrows: boolean
}

export type Level = 1 | 2 | 3 | 4

export interface DollmakerGoggle extends Variantbase {
    Layering: Layering.Blindfold | Layering.Goggle
    GlassType: GlassType.DollmakerGoggle
}

export interface DollmakerMask extends Variantbase {
    Layering: Layering.Mask | Layering.Hood
    GlassType: GlassType.DollmakerMask
}

interface BoidsVariantBase extends Variantbase {
    GlassType: GlassType.BoidsGoggle | GlassType.BoidsMask
    Colorize: boolean,
    Level: Level
}

export interface BoidsShowBrows extends BoidsVariantBase {
    HideBrows: false,
    Level: 1 | 2
}

export interface BoidsHideBrows extends BoidsVariantBase {
    HideBrows: true,
    Level: 3 | 4
}

interface _BoidsGoggle extends BoidsVariantBase {
    Layering: Layering.Blindfold | Layering.Goggle
    GlassType: GlassType.BoidsGoggle
}

export type BoidsGoggle =
    _BoidsGoggle & BoidsShowBrows |
    _BoidsGoggle & BoidsHideBrows

export type BoidsMask =
    _BoidsMask & BoidsShowBrows |
    _BoidsMask & BoidsHideBrows

interface _BoidsMask extends BoidsVariantBase {
    Layering: Layering.Mask | Layering.Hood
    GlassType: GlassType.BoidsMask
}

export type DollmakerVariant =
    DollmakerGoggle |
    DollmakerMask

export type BoidsVariant =
    BoidsGoggle |
    BoidsMask

type Variant =
    DollmakerVariant |
    BoidsVariant

namespace Variant {
    export const ToString = <BaseName extends string>(variant: Variant) =>
        JSON.stringify(variant)

    export const GlassTypes = [
        GlassType.DollmakerGoggle,
        GlassType.DollmakerMask,
        GlassType.BoidsGoggle,
        GlassType.BoidsMask,
    ] as const

    export const GoggleLayers = [Layering.Goggle, Layering.Blindfold] as const
    export const MaskLayers = [Layering.Hood, Layering.Mask] as const

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

    export const IsGoggleVariant = (variant: Variant): variant is DollmakerGoggle | BoidsGoggle =>
        IsGoggle(variant.GlassType)

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

    export const IsBoidsVariant = (variant: Variant): variant is BoidsGoggle | BoidsMask =>
        IsBoids(variant.GlassType)

    // Greater than level 2
    export const BoidsHideBrowsThreshold = 2 as const
}

export default Variant

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