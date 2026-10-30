/**
 * The mouth-filling half of the gag family: the socket tags a face cover exposes, and the mufflers,
 * balls and plug that need one of those tags worn before they can go on.
 *
 * Everything here is registered under `Category.Stuffing`, wearing no strap or muzzle and drawing
 * only what its variant asks for — the item is what sits in the mouth, and the face cover it hangs
 * from supplies the socket it mounts on.
 *
 * Because a socket is also the tag the item requires, a `postRemoval` `RequireTag` event drops the
 * item as soon as nothing worn carries its socket any more.
 * @module FactionMachine/Futuristic/Gag/Muffler
 */

import * as KDEx from '../../../KDExtension'
import { BallKind, Component, MakeItem, MuzzleKind, OralDeviceLinkCategory, StrapKindTags, Variant } from './Common'
import { Category } from './GagMetal'


/**
 * The tag a face cover puts in its `shrine` to say it can carry something in the mouth, and that
 * the ball varieties — including the empty `NonMuffler` — require through
 * `requireSingleTagToEquip`.
 */
export const BallSocket = 'C48EFD5E-E76F-4ED5-AEDD-C2110FC09EB4'

/**
 * The tag a face cover with a plug port puts in its `shrine`, and that `Plug` requires through
 * `requireSingleTagToEquip`.
 */
export const PlugSocket = '2084306E-A3AB-449D-8766-48B5272791FE'

const MakeMuffler = (args: { name: string, variant: Variant }) => {
    const { name, variant } = args
    const baseItem =
        MakeItem({ name, category: Category.Stuffing, variant })
    return <restraint>{
        ...baseItem,
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
                trigger: 'postRemoval',
                type: 'RequireTag',
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
    
    DisplayName: 'Drone Muffler',
}

/**
 * The empty muffler: no ball, so the only gag is the clip that holds it.
 *
 * Its `linkSize` of 0.4 is the lightest on the ball socket, which is what leaves room for a plug
 * under `OralDeviceLinkCategory`.
 */
export const NonMuffler =
    addBall({
        name: '0A5E497E-952F-44F8-905B-DC45C9A746EB',
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

/**
 * The normal ball with the teeth overlay. `alwaysInaccessible`, so it cannot be reached while
 * covered.
 */
export const Ball =
    addBall({
        name: '654C7580-D30C-4C5E-B126-648FE6D2AF27',
        ball: BallKind.Ball,
        text: {
            ...DefaultText,
            FlavorText: 'Ball'
        }
    })

/**
 * The large ball: it hides the mouth and forces the `FaceBigGag` pose, at the family's `linkSize`
 * 0.7.
 */
export const BigBall =
    addBall({
        name: 'BA7C3009-D024-4875-9BE9-6CD3610E8FAF',
        ball: BallKind.BigBall,
        text: {
            ...DefaultText,
            FlavorText: 'BigBall'
        }
    })

/**
 * The one stuffing item that wears `Component.Plug` rather than a ball, which gives it the plug
 * sprite and the heaviest gag of the four.
 *
 * It hangs on `PlugSocket` instead of `BallSocket`, and unlike the balls it is not
 * `alwaysInaccessible`; its `linkSize` of 0.6 leaves room for the lighter empty muffler.
 */
export const Plug = (() => {
    const variant: Variant = {
        Ball: BallKind.None,
        Strap: { __Type: StrapKindTags.None },
        Muzzle: MuzzleKind.None,
        Component: Component.Plug
    }
    const baseItem =
        MakeMuffler({
            name: 'BD587E0A-854F-46FD-88A8-7EE100571E2F',
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
                    trigger: 'postRemoval',
                    type: 'RequireTag',
                    requiredTag: PlugSocket,
                    inheritLinked: true
                }
            ]
        },
        {
            
            DisplayName: 'Drone Plug',
        }
    )
})()