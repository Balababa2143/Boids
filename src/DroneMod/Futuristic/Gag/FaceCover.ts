import * as KDEx from '../../../KDInterface/KDExtension'
import * as Enum from '../../../Utilities/Enum'
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
            BallSocket,
            ...(
                Enum.HasFlag(variant.Component, Component.PlugPort) ?
                    [PlugSocket] :
                    []
            ),
        ]
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