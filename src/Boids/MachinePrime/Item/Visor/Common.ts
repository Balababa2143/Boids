import * as KDS from 'kd-structured'
import * as KDEx from '../../../../KDExtension'
import { KinkyDungeonInventoryEventHandler } from '../../../../KDInterface/Event'
import { Function, ThrowIfNull } from '../../../../Utilities'
import { Inventory as EventCommInv } from '../../../CommonEvent'
import { Constant, Variant as ModelVariant } from '../../../Futuristic/GlassVisor'
import { ItemArchetype } from '../../Constant'
import * as Coordinator from '../../Coordinator'
import { MakeMachinePrimeVariant } from '../Common'
import { HardLightVisor as MorphableVisor, VariantInfo } from './Constant'

/**
 * A hard light visor as it is handed to its variant factory: the glass, the
 * colour choices and how it is worn. `Socketed`, `HideBrows` and `Layering` are
 * either derived or replaced, so each visor omits the ones it derives.
 */
export type VisorVariantOf<T extends ModelVariant, Omitted extends PropertyKey = never> =
    Omit<T, 'Socketed' | 'Layering' | 'HideBrows' | Omitted>

/**
 * A visor is worn one of three ways, and the three differ only in `Layering`:
 * as a goggle (which may sit over the eyes or serve as a blindfold), as a mask,
 * or as a hood over the mask.
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

export const ShouldHideBrows = (strength: number) =>
    HideBrowsThreshold < strength

export const DefaultShowEffectsOnItemMorph = (delta: number) =>
    Coordinator.SensoryControl.ShowEffectsOnItemMorph({
        delta,
        sfxIncrease: 'BeepEngage',
        sfxDecrease: 'BeepEngage',
        messageIncrease: {
            priority: 50,
            text: 'Your hard light visor dims, and your vision becomes more restricted.',
            color: '#a0160a',
            time: 2,
            noDupe: true
        },
        messageDecrease: {
            priority: 50,
            text: 'Your hard light visor clears up, and your vision becomes less restricted.',
            color: '#33c3dd',
            time: 2,
            noDupe: true
        }
    })

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
