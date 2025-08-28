import { MakeEventBuilder, AddEventHandler, HandleItemEventWhenItemIsEventSource } from '../../KDExtension'
import { Function } from '../../Utilities'

export interface SetItemDataOnApplyEventData extends KinkyDungeonEvent {
    Data: Record<string, unknown> | Map<string, unknown>
}

export const SetItemDataOnApply = MakeEventBuilder<SetItemDataOnApplyEventData>()({
    eventTemplate: AddEventHandler({
        eventMap: KDEventMapInventory,
        trigger: 'postApply',
        type: '3A0EC533-6672-4DAF-9E0D-DA4BCD01E187',
        handler: HandleItemEventWhenItemIsEventSource(
            (e, _item, data) => {
                const event = e as SetItemDataOnApplyEventData
                if (event.Data instanceof Map) {
                    const toAssign = data.item.data ?? {}
                    event.Data.entries().forEach(([k, v]) => toAssign[k] = v)
                    data.item.data = toAssign
                }
                else {
                    data.item.data = Object.assign(data.item.data ?? {}, event.Data)
                }
            }
        )
    }),
    processArgs: (data: Record<string, unknown> | Map<string, unknown>) => ({
        Data: data
    })
})

export interface EventWithTags extends KinkyDungeonEvent {
    Tags: Iterable<string>
}

export const AddTags =
    Function.Cached(
        MakeEventBuilder<EventWithTags>()({
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
            processArgs: (tags: Iterable<string>) => ({
                Tags: tags,
            })
        })
    )