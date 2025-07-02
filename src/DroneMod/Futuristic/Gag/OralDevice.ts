import * as KDEx from '../../../KDInterface/KDExtension'
import { MakeItem } from './Common'
import { BallKind, Category, Component, MuzzleKind, StrapKindTags, Variant } from './GagMetal'

/**
 * Text keys for device identification
 */
export namespace Tag {
    /**
     * Link category for oral devices.
     * Control stacking.
     */
    export const OralDeviceLinkCategory = "{39C79AA5-74A9-4391-8FBA-2B7F23C2D6E0}"

    /**
     * Socket for muffler, required for mufflers to be equipped.
     */
    export const MufflerSocket = "{C48EFD5E-E76F-4ED5-AEDD-C2110FC09EB4}"

    /**
     * Socket for plug, required for plugs to be equipped.
     */
    export const PlugSocket = "{C48EFD5E-E76F-4ED5-AEDD-C2110FC09EB4}"
}

const MakeMuffler = (args: { name: string, ball: BallKind }) => {
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
        MakeItem({ name, category: Category.Gag, variant })
    return <restraint>{
        ...baseItem,
        LinkableBy: [
            ...baseItem.LinkableBy ?? [],
            Tag.MufflerSocket,
        ],
        renderWhenLinked: [
            ...baseItem.renderWhenLinked ?? [],
            Tag.MufflerSocket
        ],
        linkCategory: Tag.OralDeviceLinkCategory,
        linkSize: 0.6,
        // requireSingleTagToEquip: [Tag.MufflerSocket],
        events: [
            ...baseItem.events ?? [],
            {
                trigger: "postRemoval",
                type: "RequireTag",
                requiredTag: Tag.MufflerSocket,
                inheritLinked: true
            }
        ]
    }
}

const addMuffler = (args: {
    name: string,
    ball: BallKind,
    text: KDEx.RestraintText,
    modifyItem?: (_: restraint) => restraint
}) =>
    KDEx.AddRestraintWithText(
        args.modifyItem ? args.modifyItem(MakeMuffler(args)) : MakeMuffler(args),
        args.text
    ).name

const DefaultText: KDEx.RestraintText = {
    ...KDEx.RestraintText.Default,
    DisplayName: 'Drone Muffler',
}

export const NonMuffler =
    addMuffler({
        name: '{0A5E497E-952F-44F8-905B-DC45C9A746EB}',
        ball: BallKind.None,
        text: {
            ...DefaultText,
            FlavorText: 'NonMuffler'
        },
        modifyItem: r => ({
            ...r,
            linkSize: 0.3,
            shrine:[
                ...r.shrine,
                Tag.PlugSocket
            ],
            renderWhenLinked:[
                ...r.renderWhenLinked ?? [],
                Tag.PlugSocket
            ]
        })
    })

export const Ball =
    addMuffler({
        name: '{654C7580-D30C-4C5E-B126-648FE6D2AF27}',
        ball: BallKind.Ball,
        text: {
            ...DefaultText,
            FlavorText: 'Ball'
        }
    })

export const BigBall =
    addMuffler({
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
        Component: (
            // Component.PerioralClip |
            // Component.Panel |
            Component.Plug |
            Component.PlugPort
        )
    }
    const baseItem =
        MakeItem({
            name: '{BD587E0A-854F-46FD-88A8-7EE100571E2F}',
            category: Category.Gag,
            variant
        })
    return KDEx.AddRestraintWithText({
        ...baseItem,
        LinkableBy: [
            ...baseItem.LinkableBy ?? [],
            Tag.PlugSocket,
        ],
        renderWhenLinked: [
            ...baseItem.renderWhenLinked ?? [],
            Tag.PlugSocket
        ],
        linkCategory: Tag.OralDeviceLinkCategory,
        linkSize: 0.6,
        // requireSingleTagToEquip: [Tag.PlugSocket],
        events: [
            ...baseItem.events ?? [],
            {
                trigger: "postRemoval",
                type: "RequireTag",
                requiredTag: Tag.PlugSocket,
                inheritLinked: true
            }
        ]
    }, {
        ...KDEx.RestraintText.Default,
        DisplayName: 'Drone Plug',
    }).name
})()