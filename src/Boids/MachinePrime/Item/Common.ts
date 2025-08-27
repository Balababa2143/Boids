import * as KDS from 'kd-structured'
import * as Futuristic from '../../Futuristic'
import * as Coordinater from '../Coordinater'
import { AddEventHandler, KinkyDungeonEventPostRemovalData, OnPostApplyWhenItemIsEventSource } from '../../../KDExtension'
import { Function, IntersectionTo, WithDefault } from '../../../Utilities'
import { ItemArchetype, MachinePrimeVariantBase } from '../Constant'

export const MakeMachinePrimeVariant =
    <VariantParts extends unknown[] & IntersectionTo<WithDefault<KDRestraintVariant, typeof MachinePrimeVariantBase>, VariantParts>>
        (...variantParts: VariantParts): KDRestraintVariant =>
        Object.assign({}, MachinePrimeVariantBase, ...variantParts)

const MakeEventBuilder =
    <BuilderArgs>(args: {
        eventTemplate: ReturnType<typeof AddEventHandler>,
        extraEventProps: Partial<KinkyDungeonEvent>,
        processArgs: (_: BuilderArgs) => object
    }) => {
        const {
            eventTemplate,
            extraEventProps,
            processArgs
        } = args
        return Function.CacheWith({
            func: (builderArgs: BuilderArgs) => ({
                ...eventTemplate,
                ...extraEventProps,
                ...processArgs(builderArgs)
            } as KinkyDungeonEvent)
        })
    }

export interface EventWithTags extends KinkyDungeonEvent {
    Tags: string[]
}

export const MakeAddTagsEvent = MakeEventBuilder({
    eventTemplate: AddEventHandler({
        eventMap: KDEventMapInventory,
        trigger: 'updatePlayerTags',
        type: '53660F42-1DC0-474D-A819-938E39015046',
        handler: (e, _, data: { tags: typeof KinkyDungeonPlayerTags, player: typeof KinkyDungeonPlayerEntity }) => {
            const event = e as EventWithTags
            for (const tag of event.Tags) {
                data.tags.set(tag, true)
            }
        },
    }),
    extraEventProps: {
        inheritLinked: true
    },
    processArgs: (tags: string[]) => ({
        Tags: tags
    } satisfies Partial<EventWithTags>)
})

export interface EventWithItemArchetype extends KinkyDungeonEvent {
    ItemArchetype: ItemArchetype
}

export const MakeRegisterItemOnApplyEvent = MakeEventBuilder({
    eventTemplate: AddEventHandler({
        eventMap: KDEventMapInventory,
        trigger: 'postApply',
        type: '84E37F14-A8F7-4D5B-9B38-C0F89ECC4C2C',
        handler: OnPostApplyWhenItemIsEventSource(
            (e, item, _data) => {
                const event = e as EventWithItemArchetype
                Coordinater.Register({
                    restraint: item,
                    type: event.ItemArchetype
                })
            }
        )
    }),
    extraEventProps: {
        inheritLinked: true
    },
    processArgs: (itemArcheType: ItemArchetype) => ({
        ItemArchetype: itemArcheType
    } satisfies Partial<EventWithItemArchetype>)
})

export const MakeUnRegisterItemOnRemovalEvent = MakeEventBuilder({
    eventTemplate: AddEventHandler({
        eventMap: KDEventMapInventory,
        trigger: 'postApply',
        type: '5588B613-0A09-4383-983F-21FF7036755C',
        handler: (e, item, data: KinkyDungeonEventPostRemovalData) => {
            const event = e as EventWithItemArchetype
            Coordinater.Register({
                restraint: item,
                type: event.ItemArchetype
            })
        } 
    }),
    extraEventProps: {
        inheritLinked: true
    },
    processArgs: (itemArcheType: ItemArchetype) => ({
        ItemArchetype: itemArcheType
    } satisfies Partial<EventWithItemArchetype>)
})