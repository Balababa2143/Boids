/**
 * The framework both hard light visor families are built from: the blindness a visor
 * contributes, the item data a morph needs in order to be repeatable, and the mapping
 * from a limiter strength to a template.
 *
 * `Boids.ts` and `Dollmaker.ts` differ in their glass and in how they read a strength;
 * everything else is shared here, and a third family supplies its own
 * `GetTemplateForStrength` to `MakeMorphableVisor` rather than copying this file.
 * @module FactionMachine/MachinePrime/Item/Visor/Common
 */

import * as KDS from 'kd-structured'
import * as KDEx from '../../../../KDExtension'
import { KinkyDungeonInventoryEventHandler } from '../../../../KDInterface/Event'
import { Function, ThrowIfNull } from '../../../../Utilities'
import { Inventory as EventCommInv } from '../../../../Common/CommonEvent'
import { Constant, Variant as ModelVariant } from '../../../Futuristic/GlassVisor'
import { ItemArchetype } from '../../Constant'
import * as Coordinator from '../../Coordinator'
import { MakeMachinePrimeVariant } from '../Common'
import { HardLightVisor as MorphableVisor, VariantInfo } from './Constant'

/**
 * A hard light visor as it is handed to its variant factory: the glass, the
 * colour choices and how it is worn. `Socketed`, `HideBrows` and `Layering` are
 * either derived or replaced, so each visor omits the ones it derives.
 *
 * @typeParam T - The full model variant whose glass this visor takes.
 * @typeParam Omitted - Fields the family computes for itself, such as the Boids
 * visor's `Level`.
 */
export type VisorVariantOf<T extends ModelVariant, Omitted extends PropertyKey = never> =
    Omit<T, 'Socketed' | 'Layering' | 'HideBrows' | Omitted>

/**
 * A visor is worn one of three ways, and the three differ only in `Layering`:
 * as a goggle (which may sit over the eyes or serve as a blindfold), as a mask,
 * or as a hood over the mask.
 *
 * This is what a family exports after narrowing its glass, so a caller picks the shape
 * it wants to wear and gets the layering that shape is allowed to have.
 *
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
 * The blindness a worn visor adds, registered on the game's `calcBlind` trigger and
 * inherited by linked items.
 *
 * Only items carrying the `HardLightVisor` data key take part, so the handler is safe
 * to put on any variant. The contribution is the blinder limiter's strength times six,
 * which stretches the limiter's 0..1 range across the game's blindness scale — a stack
 * of ordinary blindfolds reaches 12 on that scale and the game's own Dollmaker mask
 * contributes 5 — and it raises the existing value rather than replacing it, so a visor
 * never cancels another blindfold.
 */
export const CalcBlind = KDEx.AddEventHandler({
    eventMap: KDEventMapInventory,
    trigger: 'calcBlind',
    type: '7BCC6086-764D-42A6-B92C-93E230E7086F',
    handler: (_e, item, data) => {
        if (item.data?.[MorphableVisor]) {
            data['blindness'] = Math.max(data['blindness'], Coordinator.SensoryControl.GetLimiterStrength(ItemArchetype.Blinder) * 6)
        }
    },
    eventData: {
        inheritLinked: true,
    }
})

/**
 * The events every morphable visor carries whatever its glass: the blindness above, the
 * blinder archetype tag and the coordinator registration that goes with it, and the
 * item data the morph handlers read.
 *
 * Everything needed to re-model the item later is put on `item.data` here:
 * `HardLightVisor` marks the item as one of ours, and `VariantInfo` keeps the caller's
 * glass choices so a template can be rebuilt without knowing which restraint name the
 * item was equipped as.
 *
 * @param visorVariant - The partial variant the factory was called with, stored on the
 * item as `VariantInfo` and read back whenever the limiter moves.
 * @returns A new event list, ready to be spread into a variant's `events`.
 */
export const MorphableVisorCommonEvents = (visorVariant: Partial<ModelVariant>) => [
    CalcBlind,
    EventCommInv.AddTags([ItemArchetype.Blinder]),
    Coordinator.RegisterItemOnApply(ItemArchetype.Blinder),
    Coordinator.UnRegisterItemOnRemoval(ItemArchetype.Blinder),
    EventCommInv.SetItemDataOnApply({
        [MorphableVisor]: 1,
        [VariantInfo]: visorVariant
    }),
] satisfies KinkyDungeonEvent[]

const HideBrowsThreshold = 0.6667 as const

/**
 * Whether a visor at this limiter strength covers the brows, the threshold sitting at
 * two thirds.
 *
 * A brow change is a change of model rather than of layer filter, so
 * {@link HandleBlindLimiterStrengthUpdate} uses this predicate as its trigger and only
 * re-morphs the visor when the flag flips. The Boids visor derives its own `HideBrows`
 * from its quantised level rather than through this function, so the two are not the
 * same test across the whole range.
 *
 * @param strength - Blinder limiter strength, 0 to 1.
 * @returns Whether the glass hides the brows at that strength.
 */
export const ShouldHideBrows = (strength: number) =>
    HideBrowsThreshold < strength

/**
 * The wording this module's morph reports, registered in the mod's own text group.
 *
 * The engine draws these strings but never looks them up: the handler hands the message
 * system a value that is already resolved, which is what puts this wording on the mod's side
 * of the boundary rule.
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
 * The feedback every visor gives when its model changes: a beep and a message saying
 * the glass dimmed or cleared, the message chosen by the sign of the change.
 *
 * This is the default `ShowEffect` of {@link HandleBlindLimiterStrengthUpdate}; a
 * family that wants different wording passes its own function of the same shape.
 *
 * @param delta - Change in limiter strength; positive dims, anything else clears.
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
 * Builds the inventory handler that reacts to a blinder limiter update on behalf of one
 * visor family.
 *
 * The result ignores updates aimed at the other limiters, calls `args.DoMorph` only
 * when {@link ShouldHideBrows} changes value, and always reports the change through
 * `args.ShowEffect`. The model therefore follows the coarse crossings that predicate
 * marks rather than every step of the limiter.
 *
 * @param args - The two things a family gets to decide: how the item is re-modelled,
 * and what the wearer is told about it.
 * @param args.DoMorph - Re-models the item at its new strength.
 * @param args.ShowEffect - Reports the change; {@link DefaultShowEffectsOnItemMorph}
 * unless the family passes its own.
 * @returns A handler for the `SensoryLimiterStrengthUpdate` event the coordinator sends
 * on its inventory event map.
 */
export const HandleBlindLimiterStrengthUpdate =
    (args: {
        DoMorph: KinkyDungeonInventoryEventHandler<Coordinator.SensoryControl.LimiterStrengthUpdateEventArgs>,
        ShowEffect: typeof DefaultShowEffectsOnItemMorph
    }) =>
        ((e, item, data: Coordinator.SensoryControl.LimiterStrengthUpdateEventArgs) => {
            if (data.Type === ItemArchetype.Blinder) {
                if (ShouldHideBrows(data.OldStrength) !== ShouldHideBrows(data.NewStrength)) { // XOR
                    args.DoMorph(e, item, data)
                }
                args.ShowEffect(data.NewStrength - data.OldStrength)
            }
        }) satisfies KinkyDungeonInventoryEventHandler<Coordinator.SensoryControl.LimiterStrengthUpdateEventArgs>

/**
 * The two hard light visors differ only in their glass, in how they turn a
 * limiter strength into a template, and in whether their morph reaches linked
 * items. The registration events, the blindness contribution, the morph trigger
 * and its feedback are the same, and the morph and the variant factory have to
 * agree on the template, so both are built together.
 *
 * The morph handler is registered as this function is called — that is, at module
 * evaluation — so `args.Type` must be a GUID no other handler in the game or in another
 * mod uses; registration throws on a duplicate rather than replacing anything. The
 * variant factory is cached by value, so calling it again with an equal partial variant
 * returns the same object.
 *
 * @param args - What distinguishes this family. Only `Type` and
 * `GetTemplateForStrength` are mandatory; the rest is documented where it is declared.
 * @returns The registered morph event, and the factory that turns a partial variant
 * into a machine-prime restraint variant.
 */
export const MakeMorphableVisor =
    <ItemVariant extends Partial<ModelVariant>>(args: {
        /** GUID of the strength update handler this visor registers. */
        Type: string
        GetTemplateForStrength: (partialVariant: ItemVariant, strength: number) => string
        /**
         * Events placed between the shared ones and the morph handler. The
         * Dollmaker visor recalculates its filter ahead of the morph.
         */
        Events?: KinkyDungeonEvent[]
        /**
         * The Boids visor lets its morph reach linked items, the Dollmaker visor
         * does not. Preserved as found; the difference is not explained anywhere.
         */
        InheritLinked?: boolean
    }) => {
        const MorphOnBlindLimiterStrengthUpdate =
            KDEx.AddEventHandler({
                eventMap: KDEventMapInventory,
                trigger: Coordinator.SensoryControl.EventKeys.SensoryLimiterStrengthUpdate,
                type: args.Type,
                ... args.InheritLinked && {
                    eventData: {
                        inheritLinked: true,
                    }
                },
                handler: HandleBlindLimiterStrengthUpdate({
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
                        Coordinator.SensoryControl.GetLimiterStrength(ItemArchetype.Blinder)
                    ),
                    events: [
                        ...MorphableVisorCommonEvents(partialVariant),
                        ...args.Events ?? [],
                        MorphOnBlindLimiterStrengthUpdate,
                    ]
                })
        )

        return {
            MorphOnBlindLimiterStrengthUpdate,
            Variant,
        }
    }
