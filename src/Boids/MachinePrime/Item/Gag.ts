import * as KDS from 'kd-structured'
import * as Futuristic from '../../Futuristic'
import * as Coordinater from '../Coordinater'
import * as KDEx from '../../../KDExtension'
import { Invnetory as EventCommInv } from '../../CommonEvent'
import { ItemArchetype } from '../Constant'
import { MakeMachinePrimeVariant } from './Common'


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
        trigger: Coordinater.SensoryControl.EventKeys.SensoryLimiterStrengthUpdate,
        type: '2C8CA1C4-48E1-4E38-9019-15715FB80692',
        handler: (e, item, data: Coordinater.SensoryControl.LimiterStrengthUpdateEventArgs) => {
            if (data.Type === ItemArchetype.Gag) {
                SetGagModelByStrength(item, data.NewStrength)
                if (KDSoundEnabled()) {
                    if (data.NewStrength > data.OldStrength) {
                        AudioPlayInstantSoundKD(`${KinkyDungeonRootDirectory}Audio/MechPumpUp.ogg`)
                        KDS.KinkyDungeonSendTextMessage({
                            priority: 5,
                            text: 'Muffler inflates',
                            color: '#d66c21',
                            time: 2,
                            // noPush: true
                        })
                    }
                    else {
                        AudioPlayInstantSoundKD(`${KinkyDungeonRootDirectory}Audio/MechPumpRelease.ogg`)
                        KDS.KinkyDungeonSendTextMessage({
                            priority: 5,
                            text: 'Muffler deflates',
                            color: '#33c3dd',
                            time: 2,
                            // noPush: true
                        })
                    }
                }
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
            const strength = Coordinater.SensoryControl.GetLimiterStrength(ItemArchetype.Gag)
            SetGagModelByStrength(item, strength)
        }),
    }),
    inheritLinked: true
} satisfies KinkyDungeonEvent

const Muffler =
    MakeMachinePrimeVariant({
        template: Futuristic.Gag.Muffler.NonMuffler,
        events: [
            Coordinater.Event.RegisterItemOnApply(ItemArchetype.Gag),
            Coordinater.Event.UnRegisterItemOnRemoval(ItemArchetype.Gag),
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
            Coordinater.Event.RegisterItemOnApply(ItemArchetype.Gag),
            Coordinater.Event.UnRegisterItemOnRemoval(ItemArchetype.Gag),
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
    Coordinater
        .SensoryControl
        .SetLimiterStrength(ItemArchetype.Gag, value ?? Math.random())