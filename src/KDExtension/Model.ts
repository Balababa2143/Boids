import { DeepFreezeClone } from '../Utilities'
import { ModelNameKey, RegisterEngineSlot, ResolveText } from './Text'
import type { TextParams } from './Text'

/**
 * The text one model declares: the name the wardrobe draws, and any extra keys its layers or
 * categories need.
 */
export interface ModelText {
    /** The model's name, registered as `m_<model>`. */
    DisplayName: string
    /**
     * Extra text, registered as `m_<key>` — the engine's own `AddModel(Model, Strings)`
     * convention (`Data/Models.ts:98-105`), whose record keys are bare names such as
     * `<model>_l_<layer>` or `c_<category>`.
     */
    AdditionalTextKey?: Record<string, string>
    /** This model's path in the text trees; absent means the trees cannot serve it. */
    Path?: readonly string[]
    /** Values for a tree entry's `${Param}` placeholders. */
    Params?: TextParams
}

/**
 * Registers a model and, when given text, the keys the engine reads for its name.
 *
 * The name goes through the same cascade a restraint's does, so a tree can supply a model's
 * name at a shared path and a specific variant can override it. A model declares no
 * `Source`, so a name resolves to a value; the deferred form cannot arise here, and is
 * handled only because the registration helper handles both.
 *
 * The extra keys are written as declared rather than resolved: they are addressed per layer
 * or per category, which the engine looks up by a name it builds itself
 * (`Data/Utils.ts:55-72`), and no tree path describes them.
 *
 * @param model - The model to add.
 * @param text - Optional text: the model's name, and any additional keys.
 * @throws {Error} If a model with the same name already exists.
 */
export const AddModelWithText = (model: Model, text?: ModelText) => {
    if (ModelDefs[model.Name] != null) {
        throw new Error('Adding duplicated model.')
    }
    const reserialized = DeepFreezeClone(model)
    ModelDefs[model.Name] = reserialized
    if (text != null) {
        RegisterEngineSlot({
            Key: ModelNameKey(model.Name),
            Slot: 'ModelName',
            Resolution: ResolveText({ Path: text.Path, Name: text.DisplayName, Params: text.Params }).Name,
        })
        if (text.AdditionalTextKey != null) {
            for (const textKey in text.AdditionalTextKey) {
                RegisterEngineSlot({
                    Key: `m_${textKey}`,
                    Slot: 'ModelExtra',
                    Resolution: { kind: 'value', Value: text.AdditionalTextKey[textKey], Source: 'local' },
                })
            }
        }
    }
    return reserialized
}

export const AddModelWithTextThenGetName = (model: Model, modelText?: ModelText) =>
    AddModelWithText(model, modelText).Name
