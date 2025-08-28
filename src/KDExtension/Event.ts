import { KDEventMap } from '../KDInterface/Event'
import { Function, ThrowIfNull, WithDefault } from '../Utilities'

export interface IAddEventHandlerParameterPack<EventMap extends KDEventMap, Trigger extends (string & keyof EventMap)> {
    eventMap: EventMap,
    trigger: Trigger,
    type: string, // handler key
    handler: EventMap[Trigger][keyof EventMap[Trigger]]
}

export const AddEventHandler =
    <EventMap extends KDEventMap, Trigger extends (string & keyof EventMap)>
        (args: IAddEventHandlerParameterPack<EventMap, Trigger>) => {
        const {
            eventMap, trigger, type, handler
        } = args
        const handlerMap = eventMap[trigger] ?? {}
        if (type in handlerMap) {
            throw new Error('Duplicate event handler.')
        }
        else {
            handlerMap[type] = handler
        }
        eventMap[trigger] = handlerMap
        return {
            trigger, type,
        } satisfies Partial<KinkyDungeonEvent>
    }

export type ItemEventHandler = (e: KinkyDungeonEvent, item: item, data: { item: item }) => void

export const HandleItemEventWhenItemIsEventSource = (handler: ItemEventHandler) => (
    (e, item, data) => {
        if (ThrowIfNull(item?.id) === ThrowIfNull(data?.item?.id)) {
            handler(e, item, data)
        }
    }
) satisfies ItemEventHandler

export const MakeEventBuilder =
    <EventType extends KinkyDungeonEvent>() =>
        <BuilderArgs, ExtraEventParops extends Partial<KinkyDungeonEvent>>(args: {
            eventTemplate: ReturnType<typeof AddEventHandler>,
            extraEventProps?: ExtraEventParops,
            processArgs: (_: BuilderArgs) => WithDefault<EventType, ExtraEventParops & ReturnType<typeof AddEventHandler>>
        }) => {
            const {
                eventTemplate,
                extraEventProps,
                processArgs
            } = args
            return (builderArgs: BuilderArgs) => ({
                ...eventTemplate,
                ...extraEventProps ?? {},
                ...processArgs(builderArgs)
            })
        }