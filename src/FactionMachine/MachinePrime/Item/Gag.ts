/**
 * Machine-prime gags: a face cover is equipped with a ball socket, that socket installs
 * a muffler under it, and the coordinator's gag limiter then decides how far the
 * muffler inflates.
 *
 * `MakeGagVariantWithBallSocket` is the entry point a consumer calls; the rest of the
 * module is the machinery behind it and the three mufflers it can install.
 * @module FactionMachine/MachinePrime/Item/Gag
 */

import * as KDS from 'kd-structured'
import * as Futuristic from '../../Futuristic'
import * as Coordinator from '../Coordinator'
import * as KDEx from '../../../KDExtension'
import { Inventory as EventCommInv } from '../../../Common/CommonEvent'
import { ItemArchetype } from '../Constant'
import { MakeMachinePrimeVariant } from './Common'
import { SFX } from '../../Futuristic/Common'


const SetGagModelByStrength = (item: item, strength: number) => {
    const morph = variant => KDS.KDMorphToInventoryVariant({
        item: item,
        variant,
        forceMorph: true,
    })
    if (strength < 0.33) {
        morph(NonMuffler)
    }
    else if (strength > 0.66) {
        morph(BigBall)
    }
    else {
        morph(Ball)
    }
}

/**
 * The wording this module's morph reports, registered in the mod's own text group: the engine
 * draws these strings but never looks them up, because the handler hands the message system a
 * value that is already resolved.
 */
const MorphMessagePaths = {
    Inflates: ['FactionMachine', 'MachinePrime', 'Gag', 'Inflates'],
    Deflates: ['FactionMachine', 'MachinePrime', 'Gag', 'Deflates'],
} as const satisfies Record<string, readonly string[]>

KDEx.RegisterModString({
    Path: MorphMessagePaths.Inflates,
    Local: 'The muffler in your mouth inflates.',
    Slot: 'Message',
})
KDEx.RegisterModString({
    Path: MorphMessagePaths.Deflates,
    Local: 'The muffler in your mouth deflates.',
    Slot: 'Message',
})

/**
 * The morph handler every muffler carries: on a gag limiter update it re-models the
 * item, and reports the change with text and sound.
 *
 * Strength is banded rather than continuous — below 0.33 the muffler carries no ball,
 * above 0.66 the big one, and in between the small one — so the model changes only at
 * those two crossings. The handler is registered here at module evaluation, so its GUID
 * has to stay unique across the game and every other mod, and `inheritLinked` puts the
 * event on items linked under the host as well.
 */
export const MorphOnTargetedGagStrengthUpdate = {
    ...KDEx.AddEventHandler({
        eventMap: KDEventMapInventory,
        trigger: Coordinator.SensoryControl.EventKeys.SensoryLimiterStrengthUpdate,
        type: '2C8CA1C4-48E1-4E38-9019-15715FB80692',
        handler: (_e, item, data: Coordinator.SensoryControl.LimiterStrengthUpdateEventArgs) => {
            if (data.Type === ItemArchetype.Gag) {
                SetGagModelByStrength(item, data.NewStrength)
                Coordinator.SensoryControl.ShowEffectsOnItemMorph({
                    delta: data.NewStrength - data.OldStrength,
                    sfxIncrease: SFX.InflateLockSfx.sfx,
                    sfxDecrease: SFX.InflateLockSfx.sfxRemove,
                    messageIncrease: {
                        priority: 50 - 5,
                        text: KDEx.GetModText(MorphMessagePaths.Inflates),
                        color: '#a0160a',
                        time: 2,
                        noDupe: true
                    },
                    messageDecrease: {
                        priority: 50 - 5,
                        text: KDEx.GetModText(MorphMessagePaths.Deflates),
                        color: '#33c3dd',
                        time: 2,
                        noDupe: true
                    }
                })
            }
        },
    }),
    inheritLinked: true
} satisfies KinkyDungeonEvent

const InitGagByStrength = {
    ...KDEx.AddEventHandler({
        eventMap: KDEventMapInventory,
        trigger: 'postApply',
        type: '7BC556D7-A37B-486B-A3B1-923630EDD1FF',
        handler: KDEx.HandleItemEventWhenItemIsEventSource((_e, item, _data) => {
            const strength = Coordinator.SensoryControl.GetLimiterStrength(ItemArchetype.Gag)
            SetGagModelByStrength(item, strength)
        }),
    }),
    inheritLinked: true
} satisfies KinkyDungeonEvent

const Muffler =
    MakeMachinePrimeVariant({
        template: Futuristic.Gag.Muffler.NonMuffler,
        events: [
            Coordinator.RegisterItemOnApply(ItemArchetype.Gag),
            Coordinator.UnRegisterItemOnRemoval(ItemArchetype.Gag),
            InitGagByStrength,
            MorphOnTargetedGagStrengthUpdate,
            EventCommInv.AddTags([ItemArchetype.Gag]),
        ]
    })

const MakeMuffler = (template: string) =>
    MakeMachinePrimeVariant({
        template,
        events: [
            MorphOnTargetedGagStrengthUpdate,
            EventCommInv.AddTags([ItemArchetype.Gag]),
            Coordinator.RegisterItemOnApply(ItemArchetype.Gag),
            Coordinator.UnRegisterItemOnRemoval(ItemArchetype.Gag),
        ]
    })

/**
 * The muffler at its weakest: the perioral clip of
 * `Boids.FactionMachine.Futuristic.Gag.Muffler.NonMuffler` with no ball in it, worn while
 * the gag limiter sits below a third.
 *
 * Like its two siblings this is a variant rather than a registered restraint, so it is
 * a recipe the game applies when it equips or morphs the item, and its name follows
 * from the variant key.
 */
export const NonMuffler = MakeMuffler(Futuristic.Gag.Muffler.NonMuffler)

/** The muffler with the small ball, worn between the other two. */
export const Ball = MakeMuffler(Futuristic.Gag.Muffler.Ball)

/** The muffler with the big ball, worn above two thirds of the limiter's range. */
export const BigBall = MakeMuffler(Futuristic.Gag.Muffler.BigBall)

//TODO: implement an extenable socketed item selection system

const AddWeakerParams: Partial<KDS.IKDEquipInventoryVariantParameters> = {
    Tightness: 10,
    Bypass: true,
    Deep: true,
    Lock: 'Cyber3',
}

/**
 * The event behind `RequireMuffler`: a restraint that exposes a socket asks for a
 * sub-item to be linked under it the moment it is applied.
 *
 * `Socket` is the tag looked for on the applied item, or already on the player;
 * `ItemTag` is the player tag that means a sub-item is installed and suppresses a
 * second one; and `SubItem` is the variant to link under the host. It is the extension
 * point of this module — any machine-prime restraint can carry one of these, with its
 * own socket and its own sub-item, instead of a muffler.
 */
export interface RequireSubItemEvent extends KinkyDungeonEvent {
    Socket: string,
    ItemTag: string,
    SubItem: KDRestraintVariant
}

const HasTag = (item: item | null, tag: string) =>
    KinkyDungeonPlayerTags.get(tag) ||
    (null != item && KDRestraint(item)?.shrine?.includes(tag))

/**
 * The handler that fills a socket: when a restraint exposing `Socket` is applied and
 * the player does not yet carry `ItemTag`, the event's `SubItem` is linked under that
 * restraint.
 *
 * A socket counts as exposed either because the applied item's shrine lists it or
 * because the player already carries it as a tag, so a host that is already worn is
 * handled by the same check as the host being applied.
 *
 * The sub-item's `template` names the registered restraint to link; its remaining
 * properties are link parameters spread over the soft defaults — `Tightness: 10`,
 * `Bypass`, `Deep`, lock `Cyber3` — so the sub-item has the last word on anything the
 * two share.
 */
export const RequireMuffler = KDEx.AddEventHandler({
    eventMap: KDEventMapInventory,
    trigger: 'postApply',
    type: '23AD0A99-32DC-4CAA-95C4-34C7E3B02EDB',
    handler: (e, _item, data: KDEventData_PostApply) => {
        const event = e as RequireSubItemEvent
        if (
            HasTag(data?.item, event.Socket) &&
            !KinkyDungeonPlayerTags.get(event.ItemTag)
        ) {
            const { template: restraintName, ...subItemVariantProperties } = event.SubItem
            KDS.KDLinkUnder({
                ...AddWeakerParams,
                ...subItemVariantProperties,
                restraint: KinkyDungeonGetRestraintByName(restraintName),
            })
        }
    }
})

/**
 * Wraps a registered face cover as a machine-prime gag that opens a ball socket.
 *
 * This is the entry point of the module: a consumer — or the console — equips the
 * result where it would equip the face cover, and the muffler is linked under it a
 * moment later, already matching the current limiter strength.
 *
 * @param template - Name of the registered restraint to build on, such as
 * `Boids.FactionMachine.Futuristic.Gag.FaceCover.AdvanceHarness`. A restraint name,
 * not a variant.
 * @returns A machine-prime variant, not a registered restraint: the name the game
 * resolves it by follows from the variant key, so it is a recipe rather than a new
 * restraint definition.
 */
export const MakeGagVariantWithBallSocket = (template: string) =>
    MakeMachinePrimeVariant(
        {
            template,
            events: [
                {
                    ...RequireMuffler,
                    Socket: Futuristic.Gag.Muffler.BallSocket,
                    ItemTag: ItemArchetype.Gag,
                    inheritLinked: true,
                    SubItem: Muffler,
                } satisfies RequireSubItemEvent as KinkyDungeonEvent
            ]
        }
    )

/**
 * Kept at this path because it is a console entry point
 * (`Boids.FactionMachine.MachinePrime.Item.Gag.SetGagStrength`); the implementation now
 * lives with the rest of the development scaffolding.
 */
export { SetGagStrength } from '../Debug'