/**
 * The metal gag models: one layer definition per piece of hardware, the colour keys
 * the game's faction filters are keyed by, and the factory that assembles a
 * `Common.Variant` into a registered model name.
 *
 * Layers are declared once here and selected per variant, so a new face cover normally
 * costs no new art code: it picks a `Category`, sets flags on a variant, and this
 * module composes the layers and registers the model the first time an item asks for
 * it.
 * @module Boids/Futuristic/Gag/GagMetal
 */

import * as KDEx from '../../../KDExtension'
import { Enum } from '../../../Utilities'
import { Variant } from './Common'
import { BallKind, StrapKindTags, StrapDetail, MuzzleKind, Component } from './Common'

/**
 * The colour keys the metal gag layers inherit, and the keys `Common.MakeItem` lists
 * in its `factionFilters` with the colour a faction should repaint them to:
 * `BaseMetal` for the structural plates, `DecorationMetal` for the trim, `Ball` for
 * the ball and its teeth, and `Light` for the emissive display bands.
 *
 * Each layer below names one of these, so recolouring a key repaints every layer
 * using it.
 */
export const InheritColor = {
    BaseMetal: 'BaseMetal',
    DecorationMetal: 'DecorationMetal',
    Ball: 'Ball',
    Light: 'Light',
} as const

//#region Layers

const LayerName = {
    Muzzle: 'Muzzle',
    Strap: 'Strap',
    Harness: 'Harness',
    BallMaterial: 'BallMaterial',
}

const HideLightPose = {
    PerioralClip: '7FC08ACF-B177-4103-AD07-157AF174647F',
    CheekDisplay: 'A533FA99-24B9-429D-B603-1BAE2237AD9F',
    GlabellaDisplay: '7A5E12DE-49E1-4681-9067-EC6D977475DB',
}

enum PriRef {
    Ball = 0.0,
    Panel = 50.0,
    Decoration = 100.0
}

enum GagLayerBase {
    GagMuzzle = 'GagMuzzle',
    GagFlat = 'GagFlat',
    Gag = 'Gag'
}

enum RelativeLayer {
    Body = '',
    Strap = 'Straps',
}

/**
 * The five gag families. The member is a single knob that decides three things: the
 * layer base the model draws into (`Gag`, `GagFlat` or `GagMuzzle`, with a `Straps`
 * suffix for the strap layers), the game link set `Common.MakeItem` lets the item be
 * linked by, and the middle field of the generated model name.
 *
 * `FlatGags` differs in behaviour as well as in sprite: every layer of a flat gag also
 * swaps into the `MaskOver` group for the `XrayFace` pose, so a flat gag keeps drawing
 * over a mask when the face is laid open.
 */
export enum Category {
    /** Plug gags; drawn in `Gag`, linked by `KDPlugGagLink`. */
    PlugGags = 'PlugGags',
    /**
     * Mouth-filling items -- the mufflers, balls and plug; drawn in `Gag`, linked by
     * `KDStuffingLink`.
     */
    Stuffing = 'Stuffing',
    /** Ball gags; drawn in `Gag`, linked by `KDBallGagLink`. */
    BallGags = 'BallGags',
    /**
     * Flat harness gags; drawn in `GagFlat`, linked by `KDFlatGagLink`, and the one
     * family whose layers swap into `MaskOver` for the x-ray face pose.
     */
    FlatGags = 'FlatGags',
    /** Muzzles; drawn in `GagMuzzle`, linked by `KDMuzzleGagLink`. */
    MuzzleGags = 'MuzzleGags',
}

const CategoryToLayerMap = {
    [Category.PlugGags]: GagLayerBase.Gag,
    [Category.Stuffing]: GagLayerBase.Gag,
    [Category.BallGags]: GagLayerBase.Gag,
    [Category.FlatGags]: GagLayerBase.GagFlat,
    [Category.MuzzleGags]: GagLayerBase.GagMuzzle,
}

const MapLayerName = (category: Category, layer: RelativeLayer | string) => {
    switch (layer) {
        case RelativeLayer.Body:
        case RelativeLayer.Strap:
            return CategoryToLayerMap[Category[category]] + layer
        default:
            return layer
    }
}


namespace Layer {
    const layerBase: ModelLayer = {
        Name: '',
        Layer: '',
        Folder: 'GagMetal',
        OffsetX: 942,
        OffsetY: 200,
        Invariant: true
    }
    export const MetalMuzzle: ModelLayer = {
        ...layerBase,
        Name: LayerName.Muzzle,
        Layer: RelativeLayer.Body,
        Sprite: 'SciFiMuzzle',
        InheritColor: InheritColor.BaseMetal,
        Pri: PriRef.Panel + 2.0,
    }

    export const TransparentMetalMuzzle: ModelLayer = {
        ...layerBase,
        Name: LayerName.Muzzle,
        Layer: RelativeLayer.Body,
        Sprite: 'SciFiMuzzle2',
        InheritColor: InheritColor.DecorationMetal,
        Pri: PriRef.Panel + 2.0,
    }
    export const PerioralClip: ModelLayer = {
        ...layerBase,
        Name: 'PerioralClip',
        Layer: RelativeLayer.Strap,
        Sprite: 'HarnessMask',
        InheritColor: InheritColor.DecorationMetal,
        Pri: (PriRef.Decoration - 1.0),

    }
    export const PerioralClipLight: ModelLayer = {
        ...layerBase,
        Name: 'PerioralClipLight',
        Layer: RelativeLayer.Strap,
        Sprite: 'HarnessMaskDisplay',
        InheritColor: InheritColor.Light,
        Pri: (PriRef.Decoration - 0.5),
        TieToLayer: PerioralClip.Name,
        HidePoses: ToMap([HideLightPose.PerioralClip]),
    }
    export const CheekDisplay: ModelLayer = {
        ...layerBase,
        Name: 'CheekDisplay',
        Layer: RelativeLayer.Strap,
        Sprite: 'HarnessRim',
        InheritColor: InheritColor.DecorationMetal,
        Pri: (PriRef.Decoration + 10.0),
    }
    export const CheekDisplayLight: ModelLayer = {
        ...layerBase,
        Name: 'CheekDisplayLight',
        Layer: RelativeLayer.Strap,
        Sprite: 'HarnessDisplay',
        InheritColor: InheritColor.Light,
        Pri: (PriRef.Decoration + 10.0),
        TieToLayer: CheekDisplay.Name,
        HidePoses: ToMap([HideLightPose.CheekDisplay]),
    }
    export const GlabellaDisplay: ModelLayer = {
        ...layerBase,
        Name: 'GlabellaDisplay',
        Layer: RelativeLayer.Strap,
        Sprite: 'Rim',
        InheritColor: InheritColor.DecorationMetal,
        Pri: (PriRef.Decoration + 15.0),
    }
    export const GlabellaDisplayLight: ModelLayer = {
        ...layerBase,
        Name: 'GlabellaDisplayLight',
        Layer: RelativeLayer.Strap,
        Sprite: 'Display',
        InheritColor: InheritColor.Light,
        Pri: (PriRef.Decoration + 15.0),
        TieToLayer: GlabellaDisplay.Name,
        HidePoses: ToMap([HideLightPose.GlabellaDisplay]),
    }
    export const OTN: ModelLayer = {
        ...layerBase,
        Name: LayerName.Muzzle,
        Layer: RelativeLayer.Body,
        Sprite: 'OTN',
        InheritColor: InheritColor.BaseMetal,
        Pri: PriRef.Panel + 3.0,
    }
    export const OTNRivets: ModelLayer = {
        ...layerBase,
        Name: 'OTNRivets',
        Layer: RelativeLayer.Body,
        Sprite: 'OTNRivets',
        Pri: PriRef.Panel + 3.5,
        TieToLayer: LayerName.Muzzle,
    }
    export const OTNStrap: ModelLayer = {
        ...layerBase,
        Name: 'OTNStrap',
        Layer: RelativeLayer.Body,
        Sprite: 'OTNStrap',
        Pri: (PriRef.Decoration + 12.0),
        InheritColor: InheritColor.DecorationMetal,
        TieToLayer: LayerName.Muzzle,
    }
    export const OTNStrapRivits: ModelLayer = {
        ...layerBase,
        Name: 'OTNStrapRivits',
        Layer: RelativeLayer.Body,
        Sprite: 'OTNStrapRivits',
        Pri: (PriRef.Decoration + 12.5),
        TieToLayer: OTNStrap.Name,
    }
    export const BallStrap: ModelLayer = {
        ...layerBase,
        Name: LayerName.Strap,
        Layer: 'GagStrapsUnder',
        Sprite: 'BallStrap',
        Pri: (PriRef.Ball + 15.0),
    }
    export const BigBallStrap: ModelLayer = {
        ...layerBase,
        Name: LayerName.Strap,
        Layer: 'GagStrapsUnder',
        Sprite: 'BigBallStrap',
        Pri: (PriRef.Ball + 15.0),
    }
    export const BigBallStrapSegmented: ModelLayer = {
        ...layerBase,
        Name: LayerName.Strap,
        Layer: 'GagStrapsUnder',
        Sprite: 'BigBallStrapSegmented',
        Pri: (PriRef.Ball + 15.0),
    }
    export const SideStrap: ModelLayer = {
        ...layerBase,
        Name: 'SideStrap',
        Layer: RelativeLayer.Strap,
        Sprite: 'BallSideStrap',
        Pri: (PriRef.Ball + 20.0),
    }
    export const BallHarness: ModelLayer = {
        ...layerBase,
        Name: LayerName.Harness,
        Layer: 'GagStrapsUnder',
        Sprite: 'BallHarness',
        Pri: (PriRef.Ball + 10.0),
        AppendPose: {
            'FaceBigGag': 'Large'
        },
    }
    export const BallHarnessSegmented: ModelLayer = {
        ...layerBase,
        Name: LayerName.Harness,
        Layer: 'GagStrapsUnder',
        Sprite: 'BallHarnessSegmented',
        Pri: (PriRef.Ball + 10.0),
        AppendPose: {
            'FaceBigGag': 'Large'
        },
    }
    export const Ball: ModelLayer = {
        ...layerBase,
        Name: LayerName.BallMaterial,
        Layer: RelativeLayer.Body,
        Sprite: 'Ball',
        InheritColor: InheritColor.Ball,
        Pri: PriRef.Ball,
        AppendPose: {
            '2Fang': '2Fang',
            'Fang': 'Fang'
        },
        MorphPoses: {
            'MouthNeutral': '_TeethDeep',
            'MouthSurprised': '_Teeth',
            'MouthPout': '_TeethDeep',
            'MouthDistracted': '_Teeth',
        }
    }
    export const BallTeeth: ModelLayer = {
        ...layerBase,
        Name: 'BallTeeth',
        Layer: RelativeLayer.Body,
        Sprite: 'Ball',
        Pri: (PriRef.Ball + 0.1),
        InheritColor: InheritColor.Ball,
        TieToLayer: Ball.Name,
        AppendPose: {
            '2Fang': '2Fang',
            'Fang': 'Fang'
        },
        Poses: ToMap(['MouthNeutral', 'MouthSurprised', 'MouthPout', 'MouthDistracted']),
        MorphPoses: {
            'MouthNeutral': '_TeethDeep',
            'MouthSurprised': '_Teeth',
            'MouthPout': '_TeethDeep',
            'MouthDistracted': '_Teeth',
        }
    }
    export const BigBall: ModelLayer = {
        ...layerBase,
        Name: LayerName.BallMaterial,
        Layer: RelativeLayer.Body,
        Sprite: 'BigBall',
        InheritColor: InheritColor.Ball,
        Pri: PriRef.Ball,
    }
    export const Panel: ModelLayer = {
        ...layerBase,
        Name: 'Panel',
        Sprite: 'SciFiPanel',
        InheritColor: InheritColor.BaseMetal,
        Layer: 'GagFlat',
        Pri: (PriRef.Panel),
        SwapLayerPose: {
            'XrayFace': 'MaskOver'
        }
    }
    const plugBase: ModelLayer = {
        ...layerBase,
        Sprite: 'SciFiPlug',
        InheritColor: InheritColor.BaseMetal,
        Layer: RelativeLayer.Body,
        Pri: (PriRef.Decoration + 40.0),
    }
    export const Plug: ModelLayer = {
        ...plugBase,
        Name: 'Plug',
    }
    export const PlugPort: ModelLayer = {
        ...plugBase,
        Name: 'PlugPort',
    }
}

//#endregion

//#region Model

function* GetSprites(variant: Variant): Iterable<ModelLayer> {
    Variant.Verify(variant)
    // Ball
    switch (variant.Ball) {
        case BallKind.None:
            break
        case BallKind.Ball:
            yield Layer.Ball
            yield Layer.BallTeeth
            break
        case BallKind.BigBall:
            yield Layer.BigBall
            break
        default:
            Variant.ThrowInvalid()
    }

    // Strap
    switch (variant.Strap.__Type) {
        case StrapKindTags.None:
            break
        case StrapKindTags.Strap:
            if (Enum.HasFlag(variant.Strap.Detail, StrapDetail.Segmented)) {
                yield Layer.BigBallStrapSegmented
            }
            else if (variant.Ball === BallKind.Ball) {
                yield Layer.BallStrap
            }
            else {
                yield Layer.BigBallStrap
            }
            break
        case StrapKindTags.Harness:
            if (Enum.HasFlag(variant.Strap.Detail, StrapDetail.Segmented)) {
                yield Layer.BallHarnessSegmented
            }
            else {
                yield Layer.BallHarness
            }
            break
        default:
            Variant.ThrowInvalid()
    }

    switch (variant.Strap.__Type) {
        case StrapKindTags.None:
            break
        case StrapKindTags.Strap:
        case StrapKindTags.Harness:
            if (Enum.HasFlag(variant.Strap.Detail, StrapDetail.SideStrap)) {
                yield Layer.SideStrap
            }
            break
        default:
            Variant.ThrowInvalid()
    }

    // Muzzle
    switch (variant.Muzzle) {
        case MuzzleKind.None:
            break
        case MuzzleKind.Metal:
            yield Layer.MetalMuzzle
            break
        case MuzzleKind.Transparent:
            yield Layer.TransparentMetalMuzzle
            break
        case MuzzleKind.OTN:
            yield Layer.OTN
            break
        default:
            Variant.ThrowInvalid()
    }

    //Components
    if (Enum.HasFlag(variant.Component, Component.PerioralClip)) {
        yield Layer.PerioralClip
        yield Layer.PerioralClipLight
    }
    if (Enum.HasFlag(variant.Component, Component.CheekDisplay)) {
        yield Layer.CheekDisplay
        yield Layer.CheekDisplayLight
    }
    if (Enum.HasFlag(variant.Component, Component.GlabellaDisplay)) {
        yield Layer.GlabellaDisplay
        yield Layer.GlabellaDisplayLight
    }
    if (Enum.HasFlag(variant.Component, Component.OTNRivets)) {
        yield Layer.OTNRivets
    }
    if (Enum.HasFlag(variant.Component, Component.OTNStrap)) {
        yield Layer.OTNStrap
        yield Layer.OTNStrapRivits
    }
    if (Enum.HasFlag(variant.Component, Component.Panel)) {
        yield Layer.Panel
    }
    if (Enum.HasFlag(variant.Component, Component.Plug)) {
        yield Layer.Plug
    }
    if (Enum.HasFlag(variant.Component, Component.PlugPort)) {
        yield Layer.PlugPort
    }
}

const create = (args: {
    name: string,
    category: Category,
    variant: Variant
}) => {
    const {
        name,
        category,
        variant
    } = args
    const sprites: ModelLayer[] = []
    for (const sprite of GetSprites(variant)) {
        sprites.push({
            ...sprite,
            Layer: MapLayerName(category, sprite.Layer as RelativeLayer),
            SwapLayerPose:
                CategoryToLayerMap[category] === GagLayerBase.GagFlat ?
                    {
                        ...sprite.SwapLayerPose,
                        'XrayFace': 'MaskOver'
                    } :
                    sprite.SwapLayerPose
        })
    }

    const addPose: string[] = [...(function* () {
        if (
            variant.Ball === BallKind.Ball ||
            Enum.HasFlag(variant.Component, Component.Plug)
        ) {
            yield 'StuffMouth'
        }
        if (
            variant.Ball === BallKind.BigBall ||
            Enum.HasFlag(variant.Component, Component.Plug)
        ) {
            yield 'HideMouth'
        }
        if (variant.Ball === BallKind.BigBall) {
            yield 'FaceBigGag'
        }
        if (variant.Muzzle !== MuzzleKind.None) {
            yield 'FaceCoverGag'
        }
    })()]

    return <Model>{
        Name: name,
        Folder: 'GagMetal',
        Categories: ['Restraints', 'Gags'],
        TopLevel: true,
        Group: 'Mouth',
        Restraint: true,
        AddPose: addPose,
        Layers: ToLayerMap(sprites)
    }
}

/**
 * Returns the model name for a category and variant, creating and registering the
 * model the first time that combination is asked for. Deferring registration keeps a
 * variant nothing wears from costing anything, and the name is derived from the
 * category plus `Variant.ToStringKey`, so it is readable rather than a GUID:
 * `Boids.Asset.Gag.GagMetal_FlatGags_None_Strap-SideStrap_None_PerioralClip`.
 *
 * The model is registered without model text, so it carries no display name of its own
 * and the restraint wearing it supplies one.
 *
 * @param args.category - The gag family, which sets the layer base and, for
 *   `FlatGags`, the `MaskOver` swap.
 * @param args.variant - The hardware to draw; see `Common.Variant`.
 * @returns The model name, which is also the key it is registered under in `ModelDefs`.
 * @throws If the variant is not a legal combination, via `Variant.Verify`.
 */
export const GetGagMetal = (args: { category: Category, variant: Variant }) => {
    const { category, variant } = args
    //TODO: change to GUID and numbers
    const name =
        `Boids.Asset.Gag.GagMetal_${category}_${Variant.ToStringKey(variant)}`
    if (ModelDefs[name] == null) {
        KDEx.AddModelWithText(
            create({ name, category, variant })
        )
    }
    return name
}

//#endregion