/**
 * The framework both hard light visor families are built from: the blindness a visor contributes,
 * what it declares itself a provider of, and the mapping from a resolved strength to a template. A
 * visor is a provider: it declares that it can move `Sight` by a power, writes that declaration
 * onto its own `item.data` when the game applies it, and then subscribes to the resolution. The
 * blindness it adds is the resolved strength for the dimension rather than its own bid, so several
 * visors can be worn at once and not fight.
 * @module FactionMachine/MachinePrime/Item/Visor/Common
 */

import * as KDS from 'kd-structured'
import * as KDEx from '../../../../KDExtension'
import { KinkyDungeonInventoryEventHandler } from '../../../../KDInterface/Event'
import { Function, ThrowIfNull } from '../../../../Utilities'
import { Inventory as EventCommInv } from '../../../../Common/CommonEvent'
import { Constant, Variant as ModelVariant } from '../../../Futuristic/GlassVisor'
import * as Coordinator from '../../Coordinator'
import { DimensionBidsKey } from '../../Coordinator/Membership'
import { MakeMachinePrimeVariant } from '../Common'
import { HardLightVisor as MorphableVisor, VariantInfo } from './Constant'

/**
 * A hard light visor as it is handed to its variant factory: the glass, the colour choices and how
 * it is worn. `Socketed`, `HideBrows` and `Layering` are either derived or replaced, so each visor
 * omits the ones it derives.
 * @typeParam T - The full model variant whose glass this visor takes.
 * @typeParam Omitted - Fields the family computes for itself, such as the Boids visor's `Level`.
 */
export type VisorVariantOf<T extends ModelVariant, Omitted extends PropertyKey = never> =
    Omit<T, 'Socketed' | 'Layering' | 'HideBrows' | Omitted>

/**
 * A visor is worn one of three ways, and the three differ only in `Layering`: as a goggle (which
 * may sit over the eyes or serve as a blindfold), as a mask, or as a hood over the mask.
 * @typeParam GoggleModel - The family's goggle glass.
 * @typeParam MaskModel - The family's mask glass, shared by `Mask` and `OverMask`.
 * @typeParam Omitted - Forwarded to {@link VisorVariantOf}.
 */
export type VisorVariantSet<
    GoggleModel extends ModelVariant,
    MaskModel extends ModelVariant,
    Omitted extends PropertyKey = never,
> = {
    Goggle: VisorVariantOf<GoggleModel, Omitted> & { Layering: Constant.Layering.Goggle | Constant.Layering.Blindfold }
    Mask: VisorVariantOf<MaskModel, Omitted> & { Layering: Constant.Layering.Mask }
    OverMask: VisorVariantOf<MaskModel, Omitted> & { Layering: Constant.Layering.Hood }
}

/**
 * The id of the dimension a visor moves. A reference to the catalogue entry rather than a second
 * copy of the value: a literal here would keep working after the catalogue moved its names.
 */
export const SightDimension = Coordinator.Catalog.DimensionIdOf(Coordinator.Catalog.DimensionName.Sight)

/**
 * How hard a hard light visor bids for `Sight`, at full strength. The bid is the visor's ceiling;
 * what is actually applied is the router's answer, the strictest of the Host's intent and the
 * strongest bid.
 */
export const VisorSightPower = 1

/**
 * The blindness a worn visor adds, registered on the game's `calcBlind` trigger and inherited by
 * linked items. The value is the resolved severity times six — `Applied`, not the equipment's own
 * capability — where six stretches the 0..1 rate across the game's blindness scale. It raises the
 * existing value rather than replacing it, so a visor never cancels another blindfold.
 */
export const CalcBlind = KDEx.AddEventHandler({
    eventMap: KDEventMapInventory,
    trigger: 'calcBlind',
    type: '7BCC6086-764D-42A6-B92C-93E230E7086F',
    handler: (_e, item, data) => {
        if (item.data?.[MorphableVisor]) {
            const resolved = Coordinator.Resolve(SightDimension).Applied ?? 0
            data['blindness'] = Math.max(data['blindness'], resolved * 6)
        }
    },
    eventData: {
        inheritLinked: true,
    }
})

/**
 * The events every morphable visor carries whatever its glass: the blindness above, the item data
 * the morph handlers read, and the declaration that makes it a provider of `Sight`. `VariantInfo`
 * keeps the caller's glass choices, so a template can be rebuilt without knowing which restraint
 * name the item was equipped as. The declaration is written through the shared item-data stamp: the
 * coordinator reads the value back off the worn set, so the item never calls it.
 * @param visorVariant - The partial variant the factory was called with, stored on the item as
 *   `VariantInfo`.
 * @returns A new event list, ready to be spread into a variant's `events`.
 */
export const MorphableVisorCommonEvents = (visorVariant: Partial<ModelVariant>) => [
    CalcBlind,
    EventCommInv.SetItemDataOnApply({
        [MorphableVisor]: 1,
        [VariantInfo]: visorVariant,
        [DimensionBidsKey]: [
            {
                Dimension: SightDimension,
                Power: VisorSightPower,
                LoserExpresses: true,
            },
        ],
    }),
] satisfies KinkyDungeonEvent[]

const HideBrowsThreshold = 0.6667 as const

/**
 * Whether a visor at this strength covers the brows, the threshold sitting at two thirds.
 * {@link HandleBlindRateUpdate} uses it as its trigger, so the visor is re-morphed only when the
 * flag flips. The Boids visor derives its own `HideBrows` from its quantised level instead, so the
 * two are not the same test across the whole range.
 * @param strength - The applied strength for the dimension, 0 to 1.
 * @returns Whether the glass hides the brows at that strength.
 */
export const ShouldHideBrows = (strength: number) =>
    HideBrowsThreshold < strength

/**
 * The wording this module's morph reports, registered in the mod's own text group: the engine draws
 * these strings but never looks them up.
 */
const MorphMessagePaths = {
    Dims: ['FactionMachine', 'MachinePrime', 'Visor', 'Dims'],
    Clears: ['FactionMachine', 'MachinePrime', 'Visor', 'Clears'],
} as const satisfies Record<string, readonly string[]>

KDEx.RegisterModString({
    Path: MorphMessagePaths.Dims,
    Local: 'Your hard light visor dims, and your vision becomes more restricted.',
    Slot: 'Message',
})
KDEx.RegisterModString({
    Path: MorphMessagePaths.Clears,
    Local: 'Your hard light visor clears up, and your vision becomes less restricted.',
    Slot: 'Message',
})

/**
 * The feedback every visor gives when its model changes: a beep and a message saying the glass
 * dimmed or cleared, chosen by the sign of the change. The default `ShowEffect` of
 * {@link HandleBlindRateUpdate}.
 * @param delta - Change in applied strength; positive dims, anything else clears.
 */
export const DefaultShowEffectsOnItemMorph = (delta: number) =>
    Coordinator.SensoryControl.ShowEffectsOnItemMorph({
        delta,
        sfxIncrease: 'BeepEngage',
        sfxDecrease: 'BeepEngage',
        messageIncrease: {
            priority: 50,
            text: KDEx.GetModText(MorphMessagePaths.Dims),
            color: '#a0160a',
            time: 2,
            noDupe: true
        },
        messageDecrease: {
            priority: 50,
            text: KDEx.GetModText(MorphMessagePaths.Clears),
            color: '#33c3dd',
            time: 2,
            noDupe: true
        }
    })

/**
 * Builds the inventory handler that reacts to a `Sight` strength update on behalf of one visor
 * family. It ignores updates aimed at other dimensions, calls `args.DoMorph` only when
 * {@link ShouldHideBrows} changes value, and always reports the change through `args.ShowEffect`.
 * @param args - The two things a family decides: how the item is re-modelled, and what the wearer
 *   is told.
 * @param args.DoMorph - Re-models the item at its new strength.
 * @param args.ShowEffect - Reports the change; {@link DefaultShowEffectsOnItemMorph} unless the
 *   family passes its own.
 * @returns A handler for the `DimensionRateUpdate` event the coordinator sends on its inventory
 *   event map.
 */
export const HandleBlindRateUpdate =
    (args: {
        DoMorph: KinkyDungeonInventoryEventHandler<Coordinator.SensoryControl.DimensionRateUpdateEventArgs>,
        ShowEffect: typeof DefaultShowEffectsOnItemMorph
    }) =>
        ((e, item, data: Coordinator.SensoryControl.DimensionRateUpdateEventArgs) => {
            if (data.Dimension === SightDimension) {
                if (ShouldHideBrows(data.OldStrength) !== ShouldHideBrows(data.NewStrength)) { // XOR
                    args.DoMorph(e, item, data)
                }
                args.ShowEffect(data.NewStrength - data.OldStrength)
            }
        }) satisfies KinkyDungeonInventoryEventHandler<Coordinator.SensoryControl.DimensionRateUpdateEventArgs>

/**
 * Builds one visor family: its morph handler and the factory that turns a partial variant into a
 * machine-prime restraint variant. The families differ only in their glass, in how they turn a
 * strength into a template, and in whether their morph reaches linked items; everything else is
 * shared, so both are built here. The morph handler is registered as this function is called — at
 * module evaluation — so `args.Type` must be a GUID no other handler in the game or in another mod
 * uses: registration throws on a duplicate.
 * @param args - What distinguishes this family. Only `Type` and `GetTemplateForStrength` are
 *   mandatory.
 * @returns The registered morph event, and the variant factory.
 */
export const MakeMorphableVisor =
    <ItemVariant extends Partial<ModelVariant>>(args: {
        /** GUID of the strength update handler this visor registers. */
        Type: string
        GetTemplateForStrength: (partialVariant: ItemVariant, strength: number) => string
        /**
         * Events placed between the shared ones and the morph handler; the Dollmaker visor
         * recalculates its filter ahead of the morph.
         */
        Events?: KinkyDungeonEvent[]
        /** The Boids visor lets its morph reach linked items, the Dollmaker visor does not. */
        InheritLinked?: boolean
    }) => {
        const MorphOnBlindRateUpdate =
            KDEx.AddEventHandler({
                eventMap: KDEventMapInventory,
                trigger: Coordinator.SensoryControl.EventKeys.DimensionRateUpdate,
                type: args.Type,
                ... args.InheritLinked && {
                    eventData: {
                        inheritLinked: true,
                    }
                },
                handler: HandleBlindRateUpdate({
                    DoMorph: (_e, item, data) => {
                        const partialVariant = ThrowIfNull<ItemVariant>(item.data?.[VariantInfo])
                        const template = args.GetTemplateForStrength(partialVariant, data.NewStrength)
                        KDS.KDMorphToInventoryVariant({
                            item,
                            variant: {
                                ...item,
                                template,
                                events: item.events ?? []
                            },
                            forceMorph: true
                        })
                    },
                    ShowEffect: DefaultShowEffectsOnItemMorph
                })
            })

        const Variant = Function.Cached(
            (partialVariant: ItemVariant) =>
                MakeMachinePrimeVariant({
                    template: args.GetTemplateForStrength(
                        partialVariant,
                        // The level the factory picks is the one the dimension currently resolves
                        // to, so a
                        // visor equipped under an existing demand arrives already matching it.
                        Coordinator.Resolve(SightDimension).Applied ?? 0
                    ),
                    events: [
                        ...MorphableVisorCommonEvents(partialVariant),
                        ...args.Events ?? [],
                        MorphOnBlindRateUpdate,
                    ]
                })
        )

        return {
            MorphOnBlindRateUpdate,
            Variant,
        }
    }
