/**
 * Holographic displays, require projector item to function
 */

import * as KDEx from '../../../KDInterface/KDExtension'
import { AddHeadSetItem, AddVariants, AppendVariantToName, GetVariantDebugLabel } from "./Common"
import * as Model from "./Model"

//#region Goggle
export const VisorSocket = "{54EB62BD-0462-46EF-8C96-9219382E75CA}"

/**
 * Get restraint template name for holographic goggle given variant.
 * @param variant
 *  Specify the desired variant template.
 */
export const GetGoggleVariant =
    AppendVariantToName("{8C6B8355-7152-4937-A7FD-409F0A930CD3}")

AddVariants((variant) => AddHeadSetItem({
    socket: VisorSocket,
    GetName: GetGoggleVariant,
    GetModel: (variant) =>
        variant.OpaqueLevel < 3 ?
            Model.AddGoggleModel(variant).Name :
            Model.AddBlindfoldModel(variant).Name,
    GetText: (variant) => ({
        ...KDEx.RestraintText.Default,
        DisplayName: 'Drone Goggle',
        FlavorText: 'Goggle layer',
        FunctionText: GetVariantDebugLabel(variant)
    }),
    variant
}))
//#endregion

//#region Mask
export const MaskSocket = "{EC2F4BFD-A143-4C8E-826C-8C85A1BE2689}"

/**
 * Get restraint template name for holographic goggle given variant.
 * @param variant
 *  Specify the desired variant template.
 */
export const GetGlassOnlyMaskVariant =
    AppendVariantToName("{C1051C87-3A9D-4E32-A2D0-9E664975D33A}")

AddVariants((variant) => AddHeadSetItem({
    socket: VisorSocket,
    GetName: GetGlassOnlyMaskVariant,
    GetModel: (variant) => Model.AddGlassOnlyMask(variant).Name,
    GetText: (variant) => ({
        ...KDEx.RestraintText.Default,
        DisplayName: 'Drone Glass Only Mask',
        FlavorText: 'Mask layer',
        FunctionText: GetVariantDebugLabel(variant)
    }),
    variant
}))

/**
 * Get restraint template name for holographic goggle given variant.
 * @param variant
 *  Specify the desired variant template.
 */
export const GetGlassOnlyHoodVariant =
    AppendVariantToName("{D03EB58A-110A-42A0-873F-D29F28A7A368}")

AddVariants((variant) => AddHeadSetItem({
    socket: VisorSocket,
    GetName: GetGlassOnlyHoodVariant,
    GetModel: (variant) => Model.AddGlassOnlyHood(variant).Name,
    GetText: (variant) => ({
        ...KDEx.RestraintText.Default,
        DisplayName: 'Drone Glass Only Hood',
        FlavorText: 'Mask layer',
        FunctionText: GetVariantDebugLabel(variant)
    }),
    variant
}))

//#endregion