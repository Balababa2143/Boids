import * as KDEx from '../../../KDInterface/KDExtension'
import { ItemArchetype } from '../Common'
import { BallKind, Component, MakeItem, MuzzleKind, OralDeviceLinkCategory, StrapKindTags, Variant } from './Common'
import { Category } from './GagMetal'

// /**
//  * Item tag of all mufflers
//  */
// export const Muffler = "{89CB8E40-CDE3-4D12-B24A-150B61C7FF8B}"

/**
 * Socket for muffler, required for mufflers to be equipped.
 */
export const BallSocket = "{C48EFD5E-E76F-4ED5-AEDD-C2110FC09EB4}"

/**
 * Socket for plug, required for plugs to be equipped.
 */
export const PlugSocket = "{2084306E-A3AB-449D-8766-48B5272791FE}"

const MakeMuffler = (args: { name: string, variant: Variant }) => {
    const { name, variant } = args
    const baseItem =
        MakeItem({ name, category: Category.Stuffing, variant })
    return <restraint>{
        ...baseItem,
        shrine: [
            ...baseItem.shrine,
            ItemArchetype.OralDevice,
        ],
        linkCategory: OralDeviceLinkCategory,
        linkSize: 0.7,
    }
}

const MakeBall = (args: { name: string, ball: BallKind }) => {
    const { name, ball } = args
    const variant: Variant = {
        Ball: ball,
        Strap: {
            __Type: StrapKindTags.None
        },
        Muzzle: MuzzleKind.None,
        Component: Component.PerioralClip
    }
    const baseItem =
        MakeMuffler({ name, variant })
    return <restraint>{
        ...baseItem,
        LinkableBy: [
            ...baseItem.LinkableBy ?? [],
            BallSocket,
        ],
        renderWhenLinked: [
            ...baseItem.renderWhenLinked ?? [],
            BallSocket,
        ],
        requireSingleTagToEquip: [
            ...baseItem.requireSingleTagToEquip ?? [],
            BallSocket
        ],
        alwaysInaccessible: true,
        events: [
            ...baseItem.events ?? [],
            {
                trigger: "postRemoval",
                type: "RequireTag",
                requiredTag: BallSocket,
                inheritLinked: true
            }
        ],
        escapeChance: {
            Remove: -1
        }
    }
}

const addBall = (args: {
    name: string,
    ball: BallKind,
    text: KDEx.RestraintText,
    modifyItem?: (_: restraint) => restraint
}) =>
    KDEx.AddRestraintWithTextThenGetName(
        args.modifyItem ? args.modifyItem(MakeBall(args)) : MakeBall(args),
        args.text
    )

const DefaultText: KDEx.RestraintText = {
    ...KDEx.RestraintText.Default,
    DisplayName: 'Drone Muffler',
}

export const NonMuffler =
    addBall({
        name: '{0A5E497E-952F-44F8-905B-DC45C9A746EB}',
        ball: BallKind.None,
        text: {
            ...DefaultText,
            FlavorText: 'NonMuffler'
        },
        modifyItem: r => ({
            ...r,
            linkSize: 0.4,
        })
    })

export const Ball =
    addBall({
        name: '{654C7580-D30C-4C5E-B126-648FE6D2AF27}',
        ball: BallKind.Ball,
        text: {
            ...DefaultText,
            FlavorText: 'Ball'
        }
    })

export const BigBall =
    addBall({
        name: '{BA7C3009-D024-4875-9BE9-6CD3610E8FAF}',
        ball: BallKind.BigBall,
        text: {
            ...DefaultText,
            FlavorText: 'BigBall'
        }
    })

export const Plug = (() => {
    const variant: Variant = {
        Ball: BallKind.None,
        Strap: { __Type: StrapKindTags.None },
        Muzzle: MuzzleKind.None,
        Component: Component.Plug
    }
    const baseItem =
        MakeMuffler({
            name: '{BD587E0A-854F-46FD-88A8-7EE100571E2F}',
            variant
        })
    return KDEx.AddRestraintWithTextThenGetName(
        {
            ...baseItem,
            linkSize: 0.6,
            LinkableBy: [
                ...baseItem.LinkableBy ?? [],
                PlugSocket,
            ],
            renderWhenLinked: [
                ...baseItem.renderWhenLinked ?? [],
                PlugSocket
            ],
            requireSingleTagToEquip: [
                ...baseItem.requireSingleTagToEquip ?? [],
                PlugSocket
            ],
            alwaysInaccessible: false,
            events: [
                ...baseItem.events ?? [],
                {
                    trigger: "postRemoval",
                    type: "RequireTag",
                    requiredTag: PlugSocket,
                    inheritLinked: true
                }
            ]
        },
        {
            ...KDEx.RestraintText.Default,
            DisplayName: 'Drone Plug',
        }
    )
})()