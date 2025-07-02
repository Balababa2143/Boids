import * as KDEx from '../../../KDInterface/KDExtension'
import * as Enum from '../../../Utilities/Enum'
import { ItemArchetype } from '../Futuristic'
import { MaskSocket } from '../HeadSet/Common'
import { MakeItem } from './Common'
import { BallKind, Category, Component, MuzzleKind, StrapDetail, StrapKindTags, Variant } from './GagMetal'
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
        shrine: [
            ...baseItem.shrine,
            ItemArchetype.FaceCover,
            BallSocket,
            ...(
                Enum.HasFlag(variant.Component, Component.PlugPort) ?
                    [PlugSocket] :
                    []
            ),
        ],
        escapeChance: {
            Remove: 0.7,
            Struggle: 0.05,
            Unlock: 0.44,
            Pick: 0.27,
            Cut: 0.16
        },
    }
}

const defaultHarnessText = {
    ...KDEx.RestraintText.Default,
    DisplayName: 'Drone Harness'
}

export const SimpleHarness =
    KDEx.AddRestraintWithText(
        MakeStrap({
            name: '{1234D2F9-22FB-4D47-974A-DA7FA5F284A4}',
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

export const AdvanceHarness =
    KDEx.AddRestraintWithText(
        MakeStrap({
            name: '{C38F27C2-0DF8-425A-AA80-01DA5CBE6BC4}',
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

export const PanelHarness =
    KDEx.AddRestraintWithText(
        MakeStrap({
            name: '{3AD95579-5641-4CF0-A039-6C7A9C933579}',
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

export const PanelHarnessWithPort =
    KDEx.AddRestraintWithText(
        MakeStrap({
            name: '{BFD88931-19D2-4909-B88C-20E8D08EDFE4}',
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
        shrine: [
            ...baseItem.shrine,
            ItemArchetype.FaceCover,
            BallSocket,
            MaskSocket,
            ...(
                Enum.HasFlag(variant.Component, Component.PlugPort) ?
                    [PlugSocket] :
                    []
            )
        ],
        escapeChance: {
            Remove: 0.7,
            Struggle: 0.05,
            Unlock: 0.44,
            Pick: 0.27,
            Cut: 0.16
        },
    }
}

const defaultMuzzleText = {
    ...KDEx.RestraintText.Default,
    DisplayName: 'Drone Muzzle'
}

export const MetalMuzzle1 =
    KDEx.AddRestraintWithText(
        MakeMuzzle({
            name: '{805F7C18-E33D-4596-9AD6-AFA1A0391A66}',
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

export const MetalMuzzle2 =
    KDEx.AddRestraintWithText(
        MakeMuzzle({
            name: '{5AA74A4B-7F42-4B70-B68F-BA85631A9473}',
            variant: {
                Ball: BallKind.None,
                Strap: { __Type: StrapKindTags.None },
                Muzzle: MuzzleKind.Metal,
                Component:
                    Component.PerioralClip
            }
        }),
        {
            ...defaultMuzzleText,
            FunctionText: 'Metal Muzzle 2'
        }
    )

export const OTN1 =
    KDEx.AddRestraintWithText(
        MakeMuzzle({
            name: '{D61157B2-2A92-4E3F-AA64-0C0B0543CCB9}',
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

export const OTN2 =
    KDEx.AddRestraintWithText(
        MakeMuzzle({
            name: '{BD1559C9-773C-4BE4-9439-5140666771F3}',
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

export const Transparent1 =
    KDEx.AddRestraintWithText(
        MakeMuzzle({
            name: '{74668098-8709-4C77-82BE-5FE53D109D54}',
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

export const Transparent2 =
    KDEx.AddRestraintWithText(
        MakeMuzzle({
            name: '{0377EC29-363A-4280-9E4E-D01189A0B833}',
            variant: {
                Ball: BallKind.None,
                Strap: {
                    __Type: StrapKindTags.Strap,
                    Detail: StrapDetail.None
                },
                Muzzle: MuzzleKind.Transparent,
                Component:
                    Component.PerioralClip
            }
        }),
        {
            ...defaultMuzzleText,
            FunctionText: 'Transparent Muzzle 2'
        }
    )