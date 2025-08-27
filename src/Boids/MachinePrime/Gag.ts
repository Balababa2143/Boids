import * as KDS from 'kd-structured'
import * as Futuristic from '../Futuristic'
import { AddEventHandler, OnPostApplyWhenItemIsEventSource } from '../../KDExtension'
import { ItemArchetype, MakeMachinePrimeVariant } from './Common'
import * as Coordinater from './Coordinater'

const AddWeakerParams: Partial<KDS.IKDEquipInventoryVariantParameters> = {
    Tightness: 10,
    Bypass: true,
    Deep: true,
    Lock: 'Cyber3',
}

export interface AddTagsEvent extends KinkyDungeonEvent {
    Tags: string[]
}

export const AddTags = AddEventHandler({
    eventMap: KDEventMapInventory,
    trigger: 'updatePlayerTags',
    type: '53660F42-1DC0-474D-A819-938E39015046',
    handler: (e, _, data: { tags: typeof KinkyDungeonPlayerTags, player: typeof KinkyDungeonPlayerEntity }) => {
        const event = e as AddTagsEvent
        for (const tag of event.Tags) {
            data.tags.set(tag, true)
        }
    },
})

export interface RequireSubItemEvent extends KinkyDungeonEvent {
    Socket: string,
    ItemTag: string,
    SubItem: KDRestraintVariant
}

const HasTag = (item: item | null, tag: string) =>
    KinkyDungeonPlayerTags.get(tag) ||
    (null != item && KDRestraint(item)?.shrine?.includes(tag))

export const RequireSubItem = AddEventHandler({
    eventMap: KDEventMapInventory,
    trigger: 'postApply',
    type: '23AD0A99-32DC-4CAA-95C4-34C7E3B02EDB',
    handler: (e, _, data: KDEventData_PostApply) => {
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

export const RegisterGag = {
    ...AddEventHandler({
        eventMap: KDEventMapInventory,
        trigger: 'postApply',
        type: '84E37F14-A8F7-4D5B-9B38-C0F89ECC4C2C',
        handler: OnPostApplyWhenItemIsEventSource((e, item, data) =>{
            // console.info('Boids: postApply', e, item, data)
            Coordinater.Register({
                restraint: item,
                type: ItemArchetype.Gag
            })
        })
    }),
    inheritLinked: true
} satisfies KinkyDungeonEvent

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

const MorphOnTargetedGagStrengthUpdate = {
    ...AddEventHandler({
        eventMap: KDEventMapInventory,
        trigger: Coordinater.Gag.EventKeys.TargetGagStrengthUpdate,
        type: '2C8CA1C4-48E1-4E38-9019-15715FB80692',
        handler: (e, item, data: Coordinater.Gag.TargetGagStrengthUpdateEventArgs) => {
            SetGagModelByStrength(item, data.NewStrength)
            if (KDSoundEnabled()) {
                if (data.NewStrength > data.OldStrength) {
                    AudioPlayInstantSoundKD(`${KinkyDungeonRootDirectory}Audio/MechPumpUp.ogg`)
                    KDS.KinkyDungeonSendTextMessage({
                        priority: 5,
                        text: 'Muffler inflates',
                        color: '#d66c21',
                        time: 1,
                        noPush: true
                    })
                }
                else {
                    AudioPlayInstantSoundKD(`${KinkyDungeonRootDirectory}Audio/MechPumpRelease.ogg`)
                    KDS.KinkyDungeonSendTextMessage({
                        priority: 5,
                        text: 'Muffler deflates',
                        color: '#33c3dd',
                        time: 1,
                        noPush: true
                    })
                }
            }
        },
    }),
    inheritLinked: true
} satisfies KinkyDungeonEvent

const InitGagByStrength = {
    ...AddEventHandler({
        eventMap: KDEventMapInventory,
        trigger: 'postApply',
        type: '2C8CA1C4-48E1-4E38-9019-15715FB80692',
        handler: OnPostApplyWhenItemIsEventSource((e, item, data) => {
            const strength = Coordinater.GetState().ActivePC.Items[ItemArchetype.Gag].TargetGagStrength
            // console.info('Boids: postApply InitGagByStrength', strength)
            SetGagModelByStrength(item, strength)
        }),
    }),
    inheritLinked: true
} satisfies KinkyDungeonEvent

const Muffler =
    MakeMachinePrimeVariant({
        template: Futuristic.Gag.Muffler.NonMuffler,
        events: [
            RegisterGag,
            InitGagByStrength,
            MorphOnTargetedGagStrengthUpdate,
            {
                ...AddTags,
                Tags: [ItemArchetype.Gag],
                inheritLinked: true
            } satisfies AddTagsEvent as KinkyDungeonEvent
        ]
    })

const MakeMuffler = (template: string) =>
    MakeMachinePrimeVariant({
        template,
        events: [
            MorphOnTargetedGagStrengthUpdate,
            {
                ...AddTags,
                Tags: [ItemArchetype.Gag],
                inheritLinked: true
            } satisfies AddTagsEvent as KinkyDungeonEvent
        ]
    })

export const NonMuffler = MakeMuffler(Futuristic.Gag.Muffler.NonMuffler)

export const Ball = MakeMuffler(Futuristic.Gag.Muffler.Ball)

export const BigBall = MakeMuffler(Futuristic.Gag.Muffler.BigBall)

export const MakeGagVariantWithBallSocket = (template: string) =>
    MakeMachinePrimeVariant(
        {
            template,
            events: [
                {
                    ...RequireSubItem,
                    Socket: Futuristic.Gag.Muffler.BallSocket,
                    ItemTag: ItemArchetype.Gag,
                    inheritLinked: true,
                    SubItem: Muffler,
                } satisfies RequireSubItemEvent as KinkyDungeonEvent
            ]
        }
    )