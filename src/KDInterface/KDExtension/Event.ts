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
    if(type in handlerMap)
    {
        throw new Error('Adding event handler.')
    }
    else
    {
        handlerMap[type] = handler
    }
    eventMap[trigger] = handlerMap
    return {
        trigger, type
    } satisfies Partial<KinkyDungeonEvent>
}