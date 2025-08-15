import * as KDS from "kd-structured"
import * as Futuristic from '../Futuristic'
import { AddEventHandler, EquipInventoryVariantMergeEvents } from "../../KDInterface/KDExtension"
import { MakeMachinePrimeVariant } from "./Common"

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

export const MachinePrimeMufflerTag = '{9CFEB9C7-071B-49A5-A434-480C40C92F12}'

export interface AddTagsEvent extends KinkyDungeonEvent {
    Tags: string[]
}

export const AddTags = AddEventHandler({
    eventMap: KDEventMapInventory,
    trigger: 'updatePlayerTags',
    type: '{53660F42-1DC0-474D-A819-938E39015046}',
    handler(e, _, data: { tags: typeof KinkyDungeonPlayerTags, player: typeof KinkyDungeonPlayerEntity }) {
        // console.log('add tag')
        const event = e as AddTagsEvent
        for (const tag of event.Tags) {
            data.tags.set(tag, true)
        }
    },
})

export const RequireSubItem = AddEventHandler({
    eventMap: KDEventMapInventory,
    trigger: 'postApply',
    type: '{23AD0A99-32DC-4CAA-95C4-34C7E3B02EDB}',
    handler(e, _, data: KDEventData_PostApply) {
        const event = e as RequireSubItemEvent
        if (
            null != data.item &&
            KDRestraint(data.item)?.shrine?.includes(event.Socket) &&
            !KinkyDungeonPlayerTags.get(event.ItemTag)
        ) {
            // console.info('require sub item entered')
            // console.info('event', e)
            // console.info('item', item)
            // console.info('data', data)
            const { template: restraintName, ...subItemVariantProperties } = event.SubItem
            KDS.KDLinkUnder({
                ...AddWeakerParams,
                ...subItemVariantProperties,
                restraint: KinkyDungeonGetRestraintByName(restraintName),
            })
        }
    }
})

export const AddGag = (restraint: string) =>
    EquipInventoryVariantMergeEvents({
        ...AddWeakerParams,
        variant: MakeMachinePrimeVariant({
            template: restraint,
            events: [
                {
                    ...RequireSubItem,
                    Socket: Futuristic.Gag.Muffler.BallSocket,
                    ItemTag: MachinePrimeMufflerTag,
                    inheritLinked: true,
                    SubItem: MakeMachinePrimeVariant({
                        template: Futuristic.Gag.Muffler.NonMuffler,
                        events: [
                            {
                                ...AddTags,
                                Tags: [MachinePrimeMufflerTag],
                                inheritLinked: true
                            } satisfies AddTagsEvent as KinkyDungeonEvent
                        ]
                    }),
                } satisfies RequireSubItemEvent as KinkyDungeonEvent
            ]
        })
    })