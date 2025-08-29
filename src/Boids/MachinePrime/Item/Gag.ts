import * as KDS from 'kd-structured'
import * as Futuristic from '../../Futuristic'
import * as Coordinator from '../Coordinator'
import * as KDEx from '../../../KDExtension'
import { Invnetory as EventCommInv } from '../../CommonEvent'
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

export const MorphOnTargetedGagStrengthUpdate = {
    ...KDEx.AddEventHandler({
        eventMap: KDEventMapInventory,
        trigger: Coordinator.SensoryControl.EventKeys.SensoryLimiterStrengthUpdate,
        type: '2C8CA1C4-48E1-4E38-9019-15715FB80692',
        handler: (e, item, data: Coordinator.SensoryControl.LimiterStrengthUpdateEventArgs) => {
            if (data.Type === ItemArchetype.Gag) {
                SetGagModelByStrength(item, data.NewStrength)
                Coordinator.SensoryControl.ShowEffectsOnItemMorph({
                    delta: data.NewStrength - data.OldStrength,
                    sfxIncrease: SFX.InflateLockSfx.sfx,
                    sfxDecrease: SFX.InflateLockSfx.sfxRemove,
                    messageIncrease: {
                        priority: 50 - 5,
                        text: 'The muffler in your mouth inflates.',
                        color: '#a0160a',
                        time: 2,
                        noDupe: true
                    },
                    messageDecrease: {
                        priority: 50 - 5,
                        text: 'The muffler in your mouth deflates.',
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
            Coordinator.Eventhandler.RegisterItemOnApply(ItemArchetype.Gag),
            Coordinator.Eventhandler.UnRegisterItemOnRemoval(ItemArchetype.Gag),
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
            Coordinator.Eventhandler.RegisterItemOnApply(ItemArchetype.Gag),
            Coordinator.Eventhandler.UnRegisterItemOnRemoval(ItemArchetype.Gag),
        ]
    })

export const NonMuffler = MakeMuffler(Futuristic.Gag.Muffler.NonMuffler)

export const Ball = MakeMuffler(Futuristic.Gag.Muffler.Ball)

export const BigBall = MakeMuffler(Futuristic.Gag.Muffler.BigBall)

//TODO: implement an extenable socketed item selection system

const AddWeakerParams: Partial<KDS.IKDEquipInventoryVariantParameters> = {
    Tightness: 10,
    Bypass: true,
    Deep: true,
    Lock: 'Cyber3',
}

export interface RequireSubItemEvent extends KinkyDungeonEvent {
    Socket: string,
    ItemTag: string,
    SubItem: KDRestraintVariant
}

const HasTag = (item: item | null, tag: string) =>
    KinkyDungeonPlayerTags.get(tag) ||
    (null != item && KDRestraint(item)?.shrine?.includes(tag))

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

export const SetGagStrength = (value?: number) =>
    Coordinator
        .SensoryControl
        .SetLimiterStrength(ItemArchetype.Gag, value ?? Math.random())