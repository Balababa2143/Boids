import { FromJS, fromJS, isKeyed, Map, Set } from 'immutable'
import { AddModelWithTextThenGetName, ModelText } from '../Model'
import { JSReceiver, IMVariantPart } from './Common'
import { VariantMap } from './VariantMapBuilder'
import { NamedVariantMapBuilder } from './NamedVariantMapBuilder'

/**
 * A {@link JSReceiver} for models: `Layers` becomes an Immutable `Set`, other keyed collections `Map`s,
 * indexed ones `Set`s.
 */
export const ModelReceiver: JSReceiver =
    (key, value, _path) =>
        key === 'Layers' ?
            value.valueSeq().toSet()
            : isKeyed(value) ? value.toMap() : value.toSet()

/** A game {@link Model} whose `Layers` is a plain array, used while a variant is being built. */
export type ModelWithLayerSet =
    Omit<Model, 'Layers'> & {
        Layers: ModelLayer[]
    }

/** A complete model variant: the game {@link Model} and the {@link ModelText} it registers. */
export interface ModelVariant {
    /** The fully constructed game model. */
    Model: Model,
    /** Text metadata for the model: the display name and any extra keys. */
    TextInfo: ModelText
}

/** A variant key's {@link ModelVariant} map. */
export type ModelVariantMap<VariantKey> = VariantMap<VariantKey, ModelVariant>

/**
 * Builds a {@link ModelVariantMap} by accumulating model data and text, then finalizing each entry
 * into a complete {@link ModelVariant}.
 *
 * @typeParam VariantKey - The key type used to identify each variant.
 */
export class ModelVariantMapBuilder<VariantKey>
    extends NamedVariantMapBuilder<VariantKey, ModelText, ModelWithLayerSet, ModelVariant> {

    constructor(args: {
        baseId: string,
        baseName?: string,
        baseText?: Partial<ModelText>,
        receiver?: JSReceiver
    }) {
        args.receiver = args.receiver ?? ModelReceiver
        super(args)
    }
    protected override _DoFinalizeWorkingDraft(workingItem: IMVariantPart<ModelWithLayerSet>, variantKey: VariantKey) : FromJS<Partial<ModelVariant>> {
        const completeItem = workingItem.update(
            'Layers',
            (ls) =>
                Map(
                    (ls as Set<FromJS<ModelLayer>>)
                        .map(ls => {
                            const name = ls.get('Name')
                            return [name, ls]
                        })
                )
        )
            .set('Name', this._GetVariantId(variantKey))
        return fromJS({
            Model: completeItem,
            ... this._GetTextInfo(variantKey)
        })
    }
}

/**
 * Registers every model variant through {@link AddModelWithTextThenGetName}.
 *
 * @returns An Immutable `Map` of variant keys to registered model names.
 */
export function AddModelVariantMapToGame<VariantKey>(variantMap: ModelVariantMap<VariantKey>) {
    const validVariantMap =
        variantMap.map(({ Model, TextInfo }) =>
            AddModelWithTextThenGetName(
                Model,
                TextInfo
            )
        )
    return validVariantMap
}