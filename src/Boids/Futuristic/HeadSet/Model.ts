import * as KDEx from '../../../KDInterface/KDExtension'
import { ModelSetRootDir } from '../Common'
import { AppendVariantToName, GlassType, InheritColor, MakeModel, Variant } from './Common'

namespace GlassLayers {
    const Folder = 'Visors'

    const GlassMask: ModelLayer = {
        Name: 'DollmakerFull',
        Layer: 'Mask',
        Folder: Folder,
        // OffsetX: 1014,
        // OffsetY: 285,
        Pri: -10,
        InheritColor: InheritColor.Glass,
        Invariant: true,
        HideWhenOverridden: false
    }

    const GlassGoggle: ModelLayer = {
        Name: 'Dollmaker',
        Layer: 'Goggles',
        Folder: Folder,
        // OffsetX: 1013,
        // OffsetY: 502,
        Pri: 14,
        InheritColor: InheritColor.Glass,
        Invariant: true,
        HideWhenOverridden: false
    }

    const ConvertBaseToVariant = (args: {
        getSprite: (_: Variant) => string,
        baseSprite: ModelLayer,
        variant: Variant
    }) => (<ModelLayer>{
        ...args.baseSprite,
        Sprite: args.getSprite(args.variant),
        InheritColor:
            (args.variant.Type === GlassType.Black ? undefined : args.baseSprite.InheritColor)
    })

    export const GetGoggleLayer = (variant: Variant) => [
        GlassGoggle,
    ]

    export const GetMaskLayer = (variant: Variant) => [
        GlassMask,
    ]
}

namespace FrameLayers {
    export const MaskRim: ModelLayer = {
        Name: 'DollmakerFullRim',
        Layer: 'Mask',
        Pri: -10.0 + 0.1,
        InheritColor: InheritColor.BaseMetal,
        Invariant: true,
        NoOverride: true,
        Folder: 'Visors'
    }
}

/**
 * 
 * @param variant 
 * @satisfies
 *  Under Mask
 */
export const AddGoggleModel = (variant: Variant) =>
    KDEx.AddModelWithText({
        ...MakeModel(
            variant,
            GlassLayers.GetGoggleLayer(variant),
            'Goggles'
        ),
        Name: AppendVariantToName('CDCA7F49-7337-481C-81C9-5ACC995493A4')(variant)
    })

/**
 * 
 * @param variant 
 * @satisfies
 *  Under Hood
 */
export const AddBlindfoldModel = (variant: Variant) =>
    KDEx.AddModelWithText({
        ...MakeModel(
            variant,
            GlassLayers.GetGoggleLayer(variant),
            'Blindfold'
        ),
        Name: AppendVariantToName('BD830A7F-5C4C-4D39-8F7F-FD0CACD4179A')(variant)
    })

/**
 * 
 * @param variant 
 * @satisfies
 *  Under Blindfold
 */
export const AddGlassOnlyMask = (variant: Variant) =>
    KDEx.AddModelWithText({
        ...MakeModel(
            variant,
            GlassLayers.GetMaskLayer(variant),
            'Mask'
        ),
        Name: AppendVariantToName('62C5B6AC-934A-4B4F-B48C-71BFC555A4C7')(variant)
    })

export const AddGlassOnlyHood = (variant: Variant) => {
    const baseModel = MakeModel(
        variant,
        GlassLayers.GetMaskLayer(variant),
        'Hood'
    )
    return KDEx.AddModelWithText({
        ...baseModel,
        Name: AppendVariantToName('8926839C-9AAE-483E-8667-C1DA4B0AD2DB')(variant),
        AddPose: [
            ...baseModel.AddPose ?? [],
            'HoodMask' // Push hair to the front
        ]
    })
}

/**
 * 
 * @param variant 
 * @satisfies
 *  Under Blindfold
 */
export const AddFullMask = (variant: Variant) =>
    KDEx.AddModelWithText({
        ...MakeModel(
            variant,
            [
                ...GlassLayers.GetMaskLayer(variant),
                FrameLayers.MaskRim
            ],
            'Mask'
        ),
        Name: AppendVariantToName('8926839C-9AAE-483E-8667-C1DA4B0AD2DB')(variant)
    })

export const AddFullHood = (variant: Variant) => {
    const baseModel = MakeModel(
        variant,
        [
            ...GlassLayers.GetMaskLayer(variant),
            FrameLayers.MaskRim
        ],
        'Hood'
    )
    return KDEx.AddModelWithText({
        ...baseModel,
        Name: AppendVariantToName('F53ADBCD-9519-44FE-830C-E8C60BD3A610')(variant),
        AddPose: [
            ...baseModel.AddPose ?? [],
            'HoodMask' // Push hair to the front
        ]
    })
}
