/**
 * Machine-prime gags: a face cover is equipped with a ball socket, that socket installs a muffler
 * under it, and the muffler's own declared appearance then decides which of its three models is
 * drawn. `MakeGagVariantWithBallSocket` is the entry point a consumer calls; the rest of the module
 * is the machinery behind it and the three mufflers it can install. A muffler is a provider: it
 * declares on apply what it can move, and re-models itself from its own declaration rather than
 * from a number a writer handed it. A gag is four demands — `Speech`, `Casting`, `Interaction` and
 * `Noise` — and how large it looks is not one of them, so a small ball on a strict mechanism is
 * expressible.
 * @module FactionMachine/MachinePrime/Item/Gag
 */

import * as KDS from 'kd-structured'
import * as Futuristic from '../../Futuristic'
import * as Coordinator from '../Coordinator'
import * as KDEx from '../../../KDExtension'
import { Inventory as EventCommInv } from '../../../Common/CommonEvent'
import { AppearanceKey, DimensionBidsKey, GagInstalledTag } from '../Coordinator/Membership'
import { MakeMachinePrimeVariant } from './Common'
import { SFX } from '../../Futuristic/Common'

/**
 * The dimensions a muffler moves. Speech rather than "gag": a gag is one way of taking speech away,
 * and the dimension is the ability, so a second family can move the same dimension without sharing
 * anything with this file.
 */
const { Casting, Interaction, Noise, Speech } = Coordinator.Catalog.DimensionName
export const SpeechDimension = Coordinator.Catalog.DimensionIdOf(Speech)

/**
 * How hard the muffler bids for the severity of `Speech`. The bid is a ceiling: how far it actually
 * gets is the router's answer from the Host's demand and every other provider's bid.
 */
export const MufflerSpeechPower = 1

/**
 * How full the muffler is declared to look, separately from how hard it bids. Letting the look
 * follow the bid is what the base game's single `gag` property does, and why a bigger ball there is
 * necessarily a stricter one. Declaring the two apart is what makes a small ball on a strict
 * mechanism expressible, as two item variants rather than two demands.
 */
export const MufflerSizePower = 1

/** Below this the mouth is covered but nothing is in it. */
const SmallestSizedModel = 0.33

/** Above this the largest model is worn. */
const LargestSizedModel = 0.66

const SetGagModelBySize = (item: item, size: number) => {
    const morph = variant => KDS.KDMorphToInventoryVariant({
        item: item,
        variant,
        forceMorph: true,
    })
    if (size < SmallestSizedModel) {
        morph(NonMuffler)
    }
    else if (size > LargestSizedModel) {
        morph(BigBall)
    }
    else {
        morph(Ball)
    }
}

/**
 * How large the muffler should be drawn: its own declared appearance, read off the item. A
 * declaration that is missing reads as 0, which is the perioral clip with no ball: an item whose
 * appearance nobody stated should look like it is doing nothing, not like it is doing the most.
 */
const MufflerSize = (item: item): number => {
    const declared = item?.data?.[AppearanceKey]
    return typeof declared === 'number' && Number.isFinite(declared) ? declared : 0
}

/**
 * The wording this module's morph reports, registered in the mod's own text group: the engine draws
 * these strings but never looks them up.
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
 * The morph handler every muffler carries: on a `Speech` rate update it re-models the item, and
 * reports the change with text and sound. The model it moves to is the item's own declared
 * appearance, which does not change when the rate does, so what this tracks is whether the drawn
 * model matches the declaration. Appearance is banded — below 0.33 no ball, above 0.66 the big one,
 * in between the small one — so the model changes only at those two crossings. The handler is
 * registered here at module evaluation, so its GUID has to stay unique across the game and every
 * other mod; `inheritLinked` puts the event on items linked under the host as well.
 */
export const MorphOnSpeechRateUpdate = {
    ...KDEx.AddEventHandler({
        eventMap: KDEventMapInventory,
        trigger: Coordinator.SensoryControl.EventKeys.DimensionRateUpdate,
        type: '2C8CA1C4-48E1-4E38-9019-15715FB80692',
        handler: (_e, item, data: Coordinator.SensoryControl.DimensionRateUpdateEventArgs) => {
            if (data.Dimension === SpeechDimension) {
                SetGagModelBySize(item, MufflerSize(item))
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

/**
 * The event that makes a freshly installed muffler match its declared appearance straight away,
 * rather than arriving at its weakest and catching up on the next update.
 */
const InitGagByStrength = {
    ...KDEx.AddEventHandler({
        eventMap: KDEventMapInventory,
        trigger: 'postApply',
        type: '7BC556D7-A37B-486B-A3B1-923630EDD1FF',
        handler: KDEx.HandleItemEventWhenItemIsEventSource((_e, item, _data) => {
            SetGagModelBySize(item, MufflerSize(item))
        }),
    }),
    inheritLinked: true
} satisfies KinkyDungeonEvent

/**
 * The events every muffler carries: what it declares itself a provider of, what it declares itself
 * to look like, the morph channel it follows, and the one-shot that puts it at the declared
 * appearance when worn. `SetItemDataOnApply` is the shared item-data stamp: the coordinator reads
 * the declaration back off the worn set, so the item never calls it.
 */
const MufflerEvents = [
    InitGagByStrength,
    MorphOnSpeechRateUpdate,
    EventCommInv.SetItemDataOnApply({
        // The base game's `gag` total is a sum with a saturating floor, so two gags are worse than
        // either alone rather than the worse of the two.
        [DimensionBidsKey]: [
            {
                Dimension: SpeechDimension,
                Power: MufflerSpeechPower,
                Stack: 'Sum',
                LoserExpresses: true,
            },
            {
                // The `Verbal` spell component.
                Dimension: Coordinator.Catalog.DimensionIdOf(Casting),
                Power: 1,
                Stack: 'Max',
                LoserExpresses: true,
            },
            {
                // Drinking and eating.
                Dimension: Coordinator.Catalog.DimensionIdOf(Interaction),
                Power: 1,
                Stack: 'Max',
                LoserExpresses: true,
            },
            {
                // The shout and moan radii.
                Dimension: Coordinator.Catalog.DimensionIdOf(Noise),
                Power: 1,
                Stack: 'Max',
                LoserExpresses: true,
            },
        ],
        [AppearanceKey]: MufflerSizePower,
    }),
] satisfies KinkyDungeonEvent[]

const Muffler =
    MakeMachinePrimeVariant({
        template: Futuristic.Gag.Muffler.NonMuffler,
        events: MufflerEvents
    })

const MakeMuffler = (template: string) =>
    MakeMachinePrimeVariant({
        template,
        events: MufflerEvents
    })

/**
 * The muffler at its weakest: the perioral clip of
 * `Boids.FactionMachine.Futuristic.Gag.Muffler.NonMuffler` with no ball in it, drawn while the
 * declared appearance sits below a third. Like its two siblings this is a variant rather than a
 * registered restraint: it is a recipe the game applies when it equips or morphs the item, and its
 * name follows from the variant key.
 */
export const NonMuffler = MakeMuffler(Futuristic.Gag.Muffler.NonMuffler)

/** The muffler with the small ball, worn between the other two. */
export const Ball = MakeMuffler(Futuristic.Gag.Muffler.Ball)

/** The muffler with the big ball, worn above two thirds of the declared range. */
export const BigBall = MakeMuffler(Futuristic.Gag.Muffler.BigBall)

const AddWeakerParams: Partial<KDS.IKDEquipInventoryVariantParameters> = {
    Tightness: 10,
    Bypass: true,
    Deep: true,
    Lock: 'Cyber3',
}

/**
 * The event behind {@link RequireMuffler}: a restraint that exposes a socket asks for a sub-item to
 * be linked under it the moment it is applied. `Socket` is the tag looked for on the applied item,
 * or already on the player; `ItemTag` is the player tag that means a sub-item is installed and
 * suppresses a second one; `SubItem` is the variant to link under the host. Any machine-prime
 * restraint can carry one of these, with its own socket and its own sub-item.
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
 * The handler that fills a socket: when a restraint exposing `Socket` is applied and the player
 * does not yet carry `ItemTag`, the event's `SubItem` is linked under that restraint. A socket
 * counts as exposed either because the applied item's shrine lists it or because the player already
 * carries it as a tag, so a host that is already worn is handled by the same check. The sub-item's
 * `template` names the registered restraint to link; its remaining properties are link parameters
 * spread over the soft defaults — `Tightness: 10`, `Bypass`, `Deep`, lock `Cyber3` — so the
 * sub-item has the last word on anything the two share.
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
 * Wraps a registered face cover as a machine-prime gag that opens a ball socket. This is the entry
 * point of the module: a consumer — or the console — equips the result where it would equip the
 * face cover, and the muffler is linked under it a moment later, already matching the declared
 * appearance.
 * @param template - Name of the registered restraint to build on, such as
 *   `Boids.FactionMachine.Futuristic.Gag.FaceCover.AdvanceHarness`. A restraint name, not a
 *   variant.
 * @returns A machine-prime variant, not a registered restraint: the name the game resolves it by
 *   follows from the variant key, so it is a recipe rather than a new restraint definition.
 */
export const MakeGagVariantWithBallSocket = (template: string) =>
    MakeMachinePrimeVariant(
        {
            template,
            events: [
                {
                    ...RequireMuffler,
                    Socket: Futuristic.Gag.Muffler.BallSocket,
                    ItemTag: GagInstalledTag,
                    inheritLinked: true,
                    SubItem: Muffler,
                } satisfies RequireSubItemEvent as KinkyDungeonEvent
            ]
        }
    )

/**
 * Kept at this path because it is a console entry point
 * (`Boids.FactionMachine.MachinePrime.Item.Gag.SetGagStrength`).
 */
export { SetGagStrength } from '../Debug'
