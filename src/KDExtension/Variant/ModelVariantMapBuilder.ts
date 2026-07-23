import { FromJS, fromJS, isKeyed, Map, Set } from 'immutable'
import { AddModelWithTextThenGetName, ModelText } from '../Model'
import { JSReceiver, VariantKeyOrImmutable, IsComplete, GetVariantIdFromBase, VariantPart, VariantKeyToImmutable, IMVariantPart, GetVariantNameFromBase } from './Common'
import { VariantMap, VariantMapBuilder } from './VariantMapBuilder'
import { ThrowIfNull } from '../../Utilities'
import { NamedVariantMapBuilder } from './NamedVariantMapBuilder'

export const ModelReceiver: JSReceiver =
    (key, value, _path) =>
        key === 'Layers' ?
            value.valueSeq().toSet()
            : isKeyed(value) ? value.toMap() : value.toSet()

export type ModelWithLayerSet =
    Omit<Model, 'Layers'> & {
        Layers: ModelLayer[]
    }

export interface ModelVariant {
    Model: Model,
    TextInfo: ModelText
}

export type ModelVariantMap<VariantKey> = VariantMap<VariantKey, ModelVariant>

export class ModelVariantMapBuilder<VariantKey>
    extends NamedVariantMapBuilder<VariantKey, ModelText, ModelWithLayerSet, ModelVariant> {

    constructor(args: {
        baseId: string,
        baseName?: string,
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