export function DeepFreezeInplace<T>(obj: T): Readonly<T> {
    if (Object.isFrozen(obj)) {
        return obj
    }
    else {
        for (const key of Reflect.ownKeys(obj!)) {
            const value = obj![key as keyof typeof obj]
            if (value && !Object.isFrozen(value)) {
                DeepFreezeInplace(value)
            }
        }
        return Object.freeze(obj)
    }
}

export function DeepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj))
}

export function DeepFreezeClone<T>(obj: T): Readonly<T> {
    return DeepFreezeInplace(DeepClone(obj))
}

export interface ModelText {
    DisplayName: string,
    AdditionalTextKey: Record<string, string>
}

export namespace ModelText {
    export const Default: ModelText = DeepFreezeInplace({
        DisplayName: "[Model Name Missing]",
        AdditionalTextKey: {}
    })
}
export const AddModelWithText = (model: Model, text?: ModelText) => {
    if (ModelDefs[model.Name] != null) {
        throw new Error('Adding duplicated model.')
    }
    const reserialized = DeepFreezeClone(model)
    ModelDefs[model.Name] = reserialized
    if (text != null) {
        addTextKey(`m_${model.Name}`, text.DisplayName)
        if (text.AdditionalTextKey != null) {
            for (const textKey in text.AdditionalTextKey) {
                addTextKey(`m_${textKey}`, text.AdditionalTextKey[textKey])
            }
        }
    }
    return reserialized
}

export const AddModelWithTextThenGetName = (model: Model, modelText?: ModelText) =>
    AddModelWithText(model, modelText).Name

export interface RestraintText {
    DisplayName: string
    FlavorText: string
    FunctionText: string
}

export namespace RestraintText {
    export const Default: RestraintText = {
        DisplayName: "[Missing Name]",
        FlavorText: "",
        FunctionText: ""
    }
}

export const AddRestraintWithText = (restraint: restraint, restraintText?: RestraintText) => {
    if (KinkyDungeonRestraintsCache.has(restraint.name)) {
        throw new Error('Adding duplicated restraint.')
    }
    const reserialized = DeepFreezeClone(restraint)
    KinkyDungeonRestraints.push(reserialized)
    KinkyDungeonRestraintsCache.set(reserialized.name, reserialized)
    if (restraintText != null) {
        KinkyDungeonAddRestraintText(
            reserialized.name,
            restraintText.DisplayName,
            restraintText.FlavorText,
            restraintText.FunctionText
        )
    }
    return reserialized
}

export const AddRestraintWithTextThenGetName = (restraint: restraint, restraintText?: RestraintText) =>
    AddRestraintWithText(restraint, restraintText).name

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