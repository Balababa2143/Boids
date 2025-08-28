import { ThrowIfNull } from '../Utilities'

export type KDEventMap =
    typeof KDEventMapAlt |
    typeof KDEventMapBuff |
    typeof KDEventMapBullet |
    typeof KDEventMapEnemy |
    typeof KDEventMapFacility |
    typeof KDEventMapGeneric |
    typeof KDEventMapInventory |
    typeof KDEventMapInventoryIcon |
    typeof KDEventMapInventorySelected |
    typeof KDEventMapOutfit |
    typeof KDEventMapSpell |
    typeof KDEventMapWeapon

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

export type ItemEventHandler = (e: KinkyDungeonEvent, item: item, data: {item: item}) => void

export const HandleItemEventWhenItemIsEventSource = (handler: ItemEventHandler) => (
    (e, item, data) => {
        if (ThrowIfNull(item?.id) === ThrowIfNull(data?.item?.id)) {
            handler(e, item, data)
        }
    }
) satisfies ItemEventHandler

export interface KinkyDungeonEventPostRemovalData {
    item: restraint | null
    Character: Character
    keep: boolean
    shrine: boolean
    add?: true
    Link?: true
    dynamic?: true
}