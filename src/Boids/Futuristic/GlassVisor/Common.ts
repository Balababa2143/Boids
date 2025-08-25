export const enum GlassType {
    DollmakerGoggle,
    DollmakerMask,
    BoidsGoggle,
    BoidsMask,
}

export const enum Layering {
    UnderMask,
    UnderBlindfold,
    UnderHood,
    Hood,
}

interface Variantbase {
    Layering: Layering
}

export type Level = 1 | 2 | 3 | 4

interface DollmakerVariant extends Variantbase {
    GlassType: GlassType.DollmakerGoggle | GlassType.DollmakerMask
}

interface BoidsVariant extends Variantbase {
    GlassType: GlassType.BoidsGoggle | GlassType.BoidsMask
    Colorize: boolean
    Level: Level
}

export type Variant = DollmakerVariant | BoidsVariant

export const VariantToString = <BaseName extends string>(variant: Variant) =>
    [...(function* () {
        yield variant.Layering
        yield variant.GlassType
        if('Colorize' in variant) {
            yield variant.Colorize
        }
        else{
            yield '#'
        }
        if ('Level' in variant) {
            yield variant.Level
        }
        else{
            yield '#'
        }
    })()].join('')
