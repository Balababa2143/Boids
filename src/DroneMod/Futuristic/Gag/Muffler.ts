import * as KDEx from '../../../KDInterface/KDExtension'
import { MakeItem, OralDeviceLinkCategory } from './Common'
import { BallKind, Category, Component, MuzzleKind, StrapKindTags, Variant } from './GagMetal'

/**
 * Item tag of all mufflers
 */
export const Muffler = "{89CB8E40-CDE3-4D12-B24A-150B61C7FF8B}"

/**
 * Socket for muffler, required for mufflers to be equipped.
 */
export const MufflerSocket = "{C48EFD5E-E76F-4ED5-AEDD-C2110FC09EB4}"

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
        shrine:[
            ...baseItem.shrine,
            Muffler,
        ],
        LinkableBy: [
            ...baseItem.LinkableBy ?? [],
            MufflerSocket,
            Muffler,
        ],
        renderWhenLinked: [
            ...baseItem.renderWhenLinked ?? [],
            MufflerSocket,
            Muffler
        ],
        linkCategory: OralDeviceLinkCategory,
        linkSize: 0.7,
        // requireSingleTagToEquip: [
        //     ...baseItem.requireSingleTagToEquip ?? [],
        //     MufflerSocket
        // ],
        // events: [
        //     ...baseItem.events ?? [],
        //     {
        //         trigger: "postRemoval",
        //         type: "RequireTag",
        //         requiredTag: MufflerSocket,
        //         inheritLinked: true
        //     }
        // ]
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
    return MakeMuffler({ name, variant })
}

const addBall = (args: {
    name: string,
    ball: BallKind,
    text: KDEx.RestraintText,
    modifyItem?: (_: restraint) => restraint
}) =>
    KDEx.AddRestraintWithText(
        args.modifyItem ? args.modifyItem(MakeBall(args)) : MakeBall(args),
        args.text
    ).name

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
            // shrine: [
            //     ...r.shrine,
            //     PlugSocket
            // ],
            // renderWhenLinked: [
            //     ...r.renderWhenLinked ?? [],
            //     PlugSocket
            // ]
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
    return KDEx.AddRestraintWithText(
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
            // requireSingleTagToEquip: [
            //     ...baseItem.requireSingleTagToEquip ?? [],
            //     PlugSocket
            // ],
            // events: [
            //     ...baseItem.events ?? [],
            //     {
            //         trigger: "postRemoval",
            //         type: "RequireTag",
            //         requiredTag: PlugSocket,
            //         inheritLinked: true
            //     }
            // ]
        },
        {
            ...KDEx.RestraintText.Default,
            DisplayName: 'Drone Plug',
        }
    )
})()