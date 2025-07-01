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

export function DeepFreezeClone<T>(obj: T): Readonly<T> {
    if (Object.isFrozen(obj)) {
        return obj!
    }
    // else: obj is not null, undefined, or primitive
    else {
        const newObj = Object.getPrototypeOf(obj!).constructor() as T
        for (const key of Reflect.ownKeys(obj!) as (keyof T)[]) {
            const value = obj[key]
            const newValue =
                (value && !Object.isFrozen(value)) ?
                    DeepFreezeClone(value) as typeof value :
                    value
            newObj[key] = newValue
        }
        return Object.freeze(newObj)
    }
}

export function DeepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj))
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
    if (KinkyDungeonRestraints.some(r => r.name === restraint.name)) {
        throw new Error('Adding duplicated restraint.')
    }
    const reserialized = DeepFreezeClone(restraint)
    KinkyDungeonRestraints.push(reserialized)
    if (restraintText != null) {
        KinkyDungeonAddRestraintText(
            reserialized.name,
            restraintText.DisplayName,
            restraintText.FlavorText,
            restraintText.FunctionText)
    }
    return reserialized
}