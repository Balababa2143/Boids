/**
 * The Drone face covers: four flat harnesses that hold the mouth shut and six muzzles that cover
 * it, registered under the display names "Drone Harness" and "Drone Muzzle".
 *
 * Each is one `Common.Variant` handed to `Common.MakeItem` with this family's sockets, sound and
 * escape chances; the model comes from `GagMetal`.
 *
 * A harness carries `Muffler.BallSocket` — and `Muffler.PlugSocket` when its variant has a port —
 * and keeps drawing under a linked flat, muzzle or stuffing gag, while a muzzle also carries the
 * glass-mask socket so a Drone Mask can be linked over it.
 *
 * The items are shrine-proof and weightless from level 0 on every floor, and their `FunctionText`
 * is what distinguishes them in the inventory, since each family shares one display name.
 * @module FactionMachine/Futuristic/Gag/FaceCover
 */

import * as KDEx from '../../../KDExtension'
import { Enum } from '../../../Utilities'
import { SFX, GagEscapeChance } from '../Common'
import { Constant as GVisorConst } from '../GlassVisor'
import { BallKind, Component, MakeItem, MuzzleKind, StrapDetail, StrapKindTags, Variant } from './Common'
import { Category, } from './GagMetal'
import { BallSocket, PlugSocket } from './Muffler'

const MakeStrap = (args: { name: string, variant: Variant }) => {
    const { name, variant } = args
    const baseItem = MakeItem({
        name,
        category: Category.FlatGags,
        variant
    })
    return <restraint>{
        ...baseItem,
        ...SFX.MechanicalLockSfx,
        renderWhenLinked: [
            ...baseItem.renderWhenLinked ?? [],
            Category.FlatGags,
            Category.MuzzleGags,
            Category.Stuffing
        ],
        shrine: [
            ...baseItem.shrine,
            BallSocket,
            ...(
                Enum.HasFlag(variant.Component, Component.PlugPort) ?
                    [PlugSocket] :
                    []
            ),
        ],
        escapeChance: GagEscapeChance,
    }
}

const defaultHarnessText = {
    
    DisplayName: 'Drone Harness'
}

/**
 * The barest harness: one side strap and the perioral clip, with no ball, muzzle, panel or display.
 */
export const SimpleHarness =
    KDEx.AddRestraintWithTextThenGetName(
        MakeStrap({
            name: '1234D2F9-22FB-4D47-974A-DA7FA5F284A4',
            variant: {
                Ball: BallKind.None,
                Strap: {
                    __Type: StrapKindTags.Strap,
                    Detail: StrapDetail.SideStrap
                },
                Muzzle: MuzzleKind.None,
                Component: Component.PerioralClip
            }
        }),
        {
            ...defaultHarnessText,
            FunctionText: 'Simple Harness'
        }
    )

/**
 * A segmented harness with the glabella display and perioral clip, covering more without a panel.
 */
export const AdvanceHarness =
    KDEx.AddRestraintWithTextThenGetName(
        MakeStrap({
            name: 'C38F27C2-0DF8-425A-AA80-01DA5CBE6BC4',
            variant: {
                Ball: BallKind.None,
                Strap: {
                    __Type: StrapKindTags.Harness,
                    Detail: StrapDetail.Segmented
                },
                Muzzle: MuzzleKind.None,
                Component:
                    Component.GlabellaDisplay |
                    Component.PerioralClip
            }
        }),
        {
            ...defaultHarnessText,
            FunctionText: 'Advance Harness'
        }
    )

/** A segmented harness with all three display bands and the flat panel. */
export const PanelHarness =
    KDEx.AddRestraintWithTextThenGetName(
        MakeStrap({
            name: '3AD95579-5641-4CF0-A039-6C7A9C933579',
            variant: {
                Ball: BallKind.None,
                Strap: {
                    __Type: StrapKindTags.Harness,
                    Detail: StrapDetail.Segmented
                },
                Muzzle: MuzzleKind.None,
                Component:
                    Component.GlabellaDisplay |
                    Component.CheekDisplay |
                    Component.PerioralClip |
                    Component.Panel
            }
        }),
        {
            ...defaultHarnessText,
            FunctionText: 'Panel Harness'
        }
    )

/** `PanelHarness` plus the plug port, which puts `Muffler.PlugSocket` in the shrine. */
export const PanelHarnessWithPort =
    KDEx.AddRestraintWithTextThenGetName(
        MakeStrap({
            name: 'BFD88931-19D2-4909-B88C-20E8D08EDFE4',
            variant: {
                Ball: BallKind.None,
                Strap: {
                    __Type: StrapKindTags.Harness,
                    Detail: StrapDetail.Segmented
                },
                Muzzle: MuzzleKind.None,
                Component:
                    Component.GlabellaDisplay |
                    Component.CheekDisplay |
                    Component.PerioralClip |
                    Component.Panel |
                    Component.PlugPort
            }
        }),
        {
            ...defaultHarnessText,
            FunctionText: 'Panel Harness With Port'
        }
    )

const MakeMuzzle = (args: { name: string, variant: Variant }) => {
    const { name, variant } = args
    const baseItem = MakeItem({
        name,
        category: Category.MuzzleGags,
        variant
    })
    return <restraint>{
        ...baseItem,
        ...SFX.MechanicalLockSfx,
        shrine: [
            ...baseItem.shrine,
            BallSocket,
            GVisorConst.ItemTags[GVisorConst.Layering.Mask].Socket,
            ...(
                Enum.HasFlag(variant.Component, Component.PlugPort) ?
                    [PlugSocket] :
                    []
            )
        ],
        escapeChance: GagEscapeChance,
    }
}

const defaultMuzzleText = {
    
    DisplayName: 'Drone Muzzle'
}

/** The opaque plate with a cheek display and the OTN rivet set. */
export const MetalMuzzle1 =
    KDEx.AddRestraintWithTextThenGetName(
        MakeMuzzle({
            name: '805F7C18-E33D-4596-9AD6-AFA1A0391A66',
            variant: {
                Ball: BallKind.None,
                Strap: { __Type: StrapKindTags.None },
                Muzzle: MuzzleKind.Metal,
                Component:
                    Component.CheekDisplay |
                    Component.OTNRivets
            }
        }),
        {
            ...defaultMuzzleText,
            FunctionText: 'Metal Muzzle 1'
        }
    )

/** The opaque plate with the perioral clip and a cheek display, and no rivets or strap. */
export const MetalMuzzle2 =
    KDEx.AddRestraintWithTextThenGetName(
        MakeMuzzle({
            name: '5AA74A4B-7F42-4B70-B68F-BA85631A9473',
            variant: {
                Ball: BallKind.None,
                Strap: { __Type: StrapKindTags.None },
                Muzzle: MuzzleKind.Metal,
                Component:
                    Component.PerioralClip |
                    Component.CheekDisplay
            }
        }),
        {
            ...defaultMuzzleText,
            FunctionText: 'Metal Muzzle 2'
        }
    )

/** The OTN plate with its own strap and rivets and a plug port, so a plug mounts on the muzzle. */
export const OTN1 =
    KDEx.AddRestraintWithTextThenGetName(
        MakeMuzzle({
            name: 'D61157B2-2A92-4E3F-AA64-0C0B0543CCB9',
            variant: {
                Ball: BallKind.None,
                Strap: { __Type: StrapKindTags.None },
                Muzzle: MuzzleKind.OTN,
                Component:
                    Component.OTNRivets |
                    Component.OTNStrap |
                    Component.PlugPort
            }
        }),
        {
            ...defaultMuzzleText,
            FunctionText: 'OTN Muzzle 1'
        }
    )

/** The OTN plate with the perioral clip, a cheek display and a plug port in place of its strap. */
export const OTN2 =
    KDEx.AddRestraintWithTextThenGetName(
        MakeMuzzle({
            name: 'BD1559C9-773C-4BE4-9439-5140666771F3',
            variant: {
                Ball: BallKind.None,
                Strap: { __Type: StrapKindTags.None },
                Muzzle: MuzzleKind.OTN,
                Component:
                    Component.CheekDisplay |
                    Component.PerioralClip |
                    Component.PlugPort
            }
        }),
        {
            ...defaultMuzzleText,
            FunctionText: 'OTN Muzzle 2'
        }
    )

/** The transparent plate with the OTN strap and rivets, and no strap of its own. */
export const Transparent1 =
    KDEx.AddRestraintWithTextThenGetName(
        MakeMuzzle({
            name: '74668098-8709-4C77-82BE-5FE53D109D54',
            variant: {
                Ball: BallKind.None,
                Strap: { __Type: StrapKindTags.None },
                Muzzle: MuzzleKind.Transparent,
                Component:
                    Component.OTNStrap |
                    Component.OTNRivets
            }
        }),
        {
            ...defaultMuzzleText,
            FunctionText: 'Transparent Muzzle 1'
        }
    )

/** The transparent plate with a cheek and glabella display and one plain strap. */
export const Transparent2 =
    KDEx.AddRestraintWithTextThenGetName(
        MakeMuzzle({
            name: '0377EC29-363A-4280-9E4E-D01189A0B833',
            variant: {
                Ball: BallKind.None,
                Strap: {
                    __Type: StrapKindTags.Strap,
                    Detail: StrapDetail.None
                },
                Muzzle: MuzzleKind.Transparent,
                Component:
                    Component.CheekDisplay |
                    Component.GlabellaDisplay
            }
        }),
        {
            ...defaultMuzzleText,
            FunctionText: 'Transparent Muzzle 2'
        }
    )