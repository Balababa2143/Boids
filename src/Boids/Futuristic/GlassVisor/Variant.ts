export const enum GlassType {
    DollmakerGoggle,
    DollmakerMask,
    BoidsGoggle,
    BoidsMask,
}

// Ordered from bottom to top
export const enum Layering {
    Goggle,
    Mask,
    Blindfold,
    Hood,
}

interface Variantbase {
    Layering: Layering
}

export type Level = 1 | 2 | 3 | 4

interface DollmakerGoggle extends Variantbase {
    Layering: Layering.Blindfold | Layering.Goggle
    GlassType: GlassType.DollmakerGoggle
}

interface DollmakerMask extends Variantbase {
    Layering: Layering.Mask | Layering.Hood
    GlassType: GlassType.DollmakerMask
}

interface BoidsVariantBase extends Variantbase {
    Colorize: boolean,
    Level: Level
}

interface BoidsGoggle extends BoidsVariantBase {
    Layering: Layering.Blindfold | Layering.Goggle
    GlassType: GlassType.BoidsGoggle
}

interface BoidsMask extends BoidsVariantBase {
    Layering: Layering.Mask | Layering.Hood
    GlassType: GlassType.BoidsMask
}

type Variant =
    DollmakerGoggle |
    DollmakerMask |
    BoidsGoggle |
    BoidsMask

namespace Variant {

    export const ToString = <BaseName extends string>(variant: Variant) =>
        [...(function* () {
            yield variant.Layering
            yield variant.GlassType
            if ('Colorize' in variant) {
                yield variant.Colorize
            }
            else {
                yield '#'
            }
            if ('Level' in variant) {
                yield variant.Level
            }
            else {
                yield '#'
            }
        })()].join('')

    export const IsGoggle = (variant: Variant): variant is DollmakerGoggle | BoidsGoggle => {
        switch (variant.GlassType) {
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

    export const IsBoids = (variant: Variant): variant is BoidsGoggle | BoidsMask => {
        switch (variant.GlassType) {
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
}

export default Variant