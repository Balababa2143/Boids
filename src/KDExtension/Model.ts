import { DeepFreezeInplace, DeepFreezeClone } from '../Utilities'

export interface ModelText {
    DisplayName: string,
    AdditionalTextKey?: Record<string, string>
}

export namespace ModelText {
    export const Default: ModelText = DeepFreezeInplace({
        DisplayName: '[Model Name Missing]',
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