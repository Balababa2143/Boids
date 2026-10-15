/**
 * The layer bands the long mitten models are assembled from, declared as data and
 * expanded by five factories that take a left or right suffix.
 *
 * The bands are near-identical literals that differ in a bank name, a colour key and
 * one priority, so they are written once as `CommonLayerBanks` and expanded here;
 * every name and every `SwapLayerPose` target is derived from the suffix, which is what
 * keeps the two halves of a model from colliding when they are keyed into the same
 * layer map.
 *
 * The swap targets matter as much as the layers do: a `SwapLayerPose` target has to be
 * a group in the game's layer table, and the two used here -- `CrossMitten<suffix>` for
 * the crossed pose and `ForeMitten<suffix>` for the front pose -- are the ones the base
 * game's own mitten models use.
 * @module Boids/Futuristic/Limb/Mitten/Layer
 */

/**
 * The colour keys the mitten layers inherit, one per band: the mitten material, its
 * straps, and the lock, cuff, display, glow and cap plates, with an `Upper*` key for
 * each band that exists only on the mitten itself.
 *
 * The values are GUIDs, and they are the same keys `Item.ts` lists in its
 * `factionFilters`, so a faction colouring one of them repaints every band that
 * inherits it.
 */
export const InheritColor = {
    Mitten: '6C1C38FE-D89C-43E5-8DBB-8A67CE48B17D',
    Straps: '4CB992E7-88CF-469F-8A41-0152BDA9C896',
    Display: '1A320E06-CAE9-4607-A0B3-F722992F87EE',
    Lock: '3B5D5A69-CA6B-42C9-AC78-278DC11A0B07',
    Glow: '21446D52-F0E9-4C73-8326-52ED150B6F63',
    Cuff: '809300EA-3AAE-4615-803C-BDCD4B2A81F5',
    UpperCuff: '4EA907A6-CF47-404A-AA12-833ABEEEC93A',
    UpperDisplay: 'B4A7BCF3-DA11-4EC5-907F-D1E02C4A2203',
    UpperLock: 'A8E9A555-1442-4297-B747-7DE609D8B9ED',
    UpperGlow: 'CB46BB91-4B03-45C8-85E2-200D615FDC40',
    Cap: '9C464FC0-BA59-4B4F-8212-A8BFC7B64B5D',
} as const

const ArmPoseMap = ToMap(ARMPOSES)

const ForeArmPoseMap = ToMap(FOREARMPOSES)

const FrontCrossLayerMap = ToMap(['Front', 'Crossed'])

const enum LayersToSwap {
    Crossed = 1 << 0,
    Front = 1 << 1
}

type SwapLayerPose = Required<ModelLayer>['SwapLayerPose']

const MakeSwapLayerPose = (layerToSwap: LayersToSwap, suffix) => ({
    ... (layerToSwap & LayersToSwap.Crossed) && {
        Crossed: `CrossMitten${suffix}`
    },
    ... (layerToSwap & LayersToSwap.Front) && {
        Front: `ForeMitten${suffix}`
    }
} satisfies SwapLayerPose)

const GetSleevesLayerName =
    suffix => `LongMitten${suffix}`

const GetForeSleevesLayerName =
    suffix => `ForeLongMitten${suffix}`

/**
 * The nine layer bands that make up the long mitten: the cuff, display, lock and
 * glow bands, the strap layer, and the four `Upper*` bands that exist only on the
 * mitten itself.
 *
 * Each band declares both of its priorities rather than computing them. The two
 * families share fractions, and `20 + 1/10` is not reliably the same double as
 * `20.1` -- these numbers land in `ModelDefs` and are compared as JSON, so they
 * are written out exactly.
 */
const CommonLayerBanks = [
    { Bank: 'Cuff',         Color: InheritColor.Cuff,         Fore: true,  ForePri: 20.1, Pri: 120.1 },
    { Bank: 'Display',      Color: InheritColor.Display,      Fore: true,  ForePri: 20.2, Pri: 120.2 },
    { Bank: 'Lock',         Color: InheritColor.Lock,         Fore: true,  ForePri: 20.3, Pri: 120.3 },
    { Bank: 'Glow',         Color: InheritColor.Glow,         Fore: true,  ForePri: 20.4, Pri: 120.4 },
    { Bank: 'Straps',       Color: InheritColor.Straps,       Fore: true,  ForePri: 20.1, Pri: 120.1 },
    { Bank: 'UpperCuff',    Color: InheritColor.UpperCuff,    Fore: false, ForePri: 0,    Pri: 120.1 },
    { Bank: 'UpperDisplay', Color: InheritColor.UpperDisplay, Fore: false, ForePri: 0,    Pri: 120.2 },
    { Bank: 'UpperLock',    Color: InheritColor.UpperLock,    Fore: false, ForePri: 0,    Pri: 120.3 },
    { Bank: 'UpperGlow',    Color: InheritColor.UpperGlow,    Fore: false, ForePri: 0,    Pri: 120.4 },
] as const

type CommonLayerBank = (typeof CommonLayerBanks)[number]

const MakeCommonLayer = (args: {
    suffix: string,
    bank: CommonLayerBank,
    fore: boolean,
    sleevesLayerName: string,
    foreSleevesLayerName: string,
}): ModelLayer => {
    const { suffix, bank, fore, sleevesLayerName, foreSleevesLayerName } = args
    const side = fore ? 'Fore' : ''
    return {
        Name: `${bank.Bank}${side}LongMitten${suffix}`,
        Layer: `${side}Mitten${suffix}`,
        // A `Fore` band always declares `ForePri`.
        Pri: fore ? bank.ForePri! : bank.Pri,
        Poses: fore ? ForeArmPoseMap : ArmPoseMap,
        GlobalDefaultOverride: FrontCrossLayerMap,
        // A forearm band already sorts in `ForeMitten<suffix>`, so only the
        // crossed pose needs a swap; the sleeve bands move there in the front
        // pose. This mirrors the base game's cyber mitten model list.
        SwapLayerPose: MakeSwapLayerPose(
            fore
                ? LayersToSwap.Crossed
                : LayersToSwap.Crossed | LayersToSwap.Front,
            suffix
        ),
        TieToLayer: fore ? foreSleevesLayerName : sleevesLayerName,
        NoOverride: true,
        InheritColor: bank.Color,
    }
}

/**
 * Builds the fourteen bands every long mitten model shares: each of the nine
 * `CommonLayerBanks` crossed with the side it belongs to, so the five banks that also
 * exist on a forearm are emitted twice and the four `Upper*` banks once.
 *
 * Each band claims the model's layer group, ties to the body band of the same side
 * (`TieToLayer`) and takes over the `Front` and `Crossed` poses as their global
 * default.
 *
 * @param suffix - Appended to every layer name and swap target; the models pass `Left`
 *   and `Right`.
 * @returns The fourteen layer definitions, in bank order.
 */
export const GetLongMittenCommonLayers =
    suffix => {
        const sleevesLayerName = GetSleevesLayerName(suffix)
        const foreSleevesLayerName = GetForeSleevesLayerName(suffix)
        return CommonLayerBanks.flatMap(bank =>
            (bank.Fore ? [true, false] : [false]).map(fore =>
                MakeCommonLayer({ suffix, bank, fore, sleevesLayerName, foreSleevesLayerName })
            )
        )
    }

/**
 * Builds the two sleeve bands that carry the sleeve art, named `LongMitten<suffix>` and
 * `ForeLongMitten<suffix>` and drawn from the base game's `CyberArms` folder. The
 * sleeve model is these two plus the common bands; the wire cuff is their empty twin.
 *
 * @param suffix - Appended to both names and to the forearm band's swap target.
 * @returns The sleeve band and its forearm counterpart.
 */
export const GetSleevesBodyLayers =
    suffix => {
        const sleevesLayerName = GetSleevesLayerName(suffix)
        const foreSleevesLayerName = GetForeSleevesLayerName(suffix)
        return [
            {
                Name: sleevesLayerName,
                // Sprite = `LongMitten${suffix}`,
                Folder: 'CyberArms',
                Layer: `Mitten${suffix}`,
                Pri: 120,
                Poses: ArmPoseMap,
                GlobalDefaultOverride: FrontCrossLayerMap,
                InheritColor: InheritColor.Mitten,
            },
            {
                Name: foreSleevesLayerName,
                Layer: `ForeMitten${suffix}`,
                Folder: 'CyberArms',
                Pri: 20,
                Poses: ForeArmPoseMap,
                InheritColor: InheritColor.Mitten,
                GlobalDefaultOverride: FrontCrossLayerMap,
                SwapLayerPose: MakeSwapLayerPose(LayersToSwap.Crossed, suffix)
            },
        ]
    }
/**
 * Builds the same two band names as `GetSleevesBodyLayers` with an empty sprite and no
 * folder, so a model can claim the long mitten's layer groups and layering without
 * drawing a sleeve. The wire cuff model is built on this.
 *
 * @param suffix - Appended to both names and to the forearm band's swap target.
 * @returns The two band definitions, with nothing to draw.
 */
export const GetEmptyBodyLayers =
    suffix => {
        const sleevesLayerName = GetSleevesLayerName(suffix)
        const foreSleevesLayerName = GetForeSleevesLayerName(suffix)
        return [
            {
                Name: sleevesLayerName,
                Sprite: '',
                Layer: `Mitten${suffix}`,
                Pri: 120,
                Poses: ArmPoseMap,
                GlobalDefaultOverride: FrontCrossLayerMap,
                InheritColor: InheritColor.Mitten,
            },
            {
                Name: foreSleevesLayerName,
                Sprite: '',
                Layer: `ForeMitten${suffix}`,
                Pri: 20,
                Poses: ForeArmPoseMap,
                InheritColor: InheritColor.Mitten,
                GlobalDefaultOverride: FrontCrossLayerMap,
                SwapLayerPose: MakeSwapLayerPose(LayersToSwap.Crossed, suffix)
            },
        ]
    }
/**
 * Builds the two bands that draw the mitten itself, and erase the base game's `Mitts`
 * sprite and layer while they are worn (`EraseSprite` / `EraseLayers`), so the bare
 * hand does not show through them.
 *
 * @param suffix - Appended to both names and to the forearm band's swap target.
 * @returns The mitten band and its forearm counterpart.
 */
export const GetLongMittenBodyLayers =
    suffix => {
        const sleevesLayerName = GetSleevesLayerName(suffix)
        const foreSleevesLayerName = GetForeSleevesLayerName(suffix)
        const mittsLayersMap = ToMap(['Mitts'])
        return [
            {
                Name: sleevesLayerName,
                Sprite: `LongMitten${suffix}`,
                Layer: `Mitten${suffix}`,
                Pri: 120.05,
                Poses: ArmPoseMap,
                GlobalDefaultOverride: FrontCrossLayerMap,
                InheritColor: InheritColor.Mitten,
                NoOverride: true,
                EraseSprite: 'Mitts',
                EraseLayers: mittsLayersMap,
            },
            {
                Name: foreSleevesLayerName,
                Layer: `ForeMitten${suffix}`,
                Pri: 20.05,
                Poses: ForeArmPoseMap,
                InheritColor: InheritColor.Mitten,
                GlobalDefaultOverride: FrontCrossLayerMap,
                SwapLayerPose: MakeSwapLayerPose(LayersToSwap.Crossed, suffix),
                NoOverride: true,
                EraseSprite: 'Mitts',
                EraseLayers: mittsLayersMap,
            },
        ]
    }
/**
 * Builds the two cap bands, drawn over the body bands they tie to and hidden as soon
 * as a higher layer overrides them (`HideWhenOverridden`). Only the long mitten model
 * wears them.
 *
 * @param suffix - Appended to both names and to the forearm band's swap target.
 * @returns The cap band and its forearm counterpart.
 */
export const GetLongMittenCaplayers =
    suffix => {
        const sleevesLayerName = GetSleevesLayerName(suffix)
        const foreSleevesLayerName = GetForeSleevesLayerName(suffix)
        return [
            {
                Name: `CapLongMitten${suffix}`,
                Layer: `Mitten${suffix}`,
                TieToLayer: sleevesLayerName,
                Pri: 120,
                Poses: ArmPoseMap,
                GlobalDefaultOverride: FrontCrossLayerMap,
                HideWhenOverridden: true,
                InheritColor: InheritColor.Cap,
            },
            {
                Name: `CapForeLongMitten${suffix}`,
                Layer: `ForeMitten${suffix}`,
                TieToLayer: foreSleevesLayerName,
                Pri: 20.1,
                Poses: ForeArmPoseMap,
                InheritColor: InheritColor.Cap,
                GlobalDefaultOverride: FrontCrossLayerMap,
                HideWhenOverridden: true,
                SwapLayerPose: MakeSwapLayerPose(LayersToSwap.Crossed, suffix)
            },
        ]
    }
