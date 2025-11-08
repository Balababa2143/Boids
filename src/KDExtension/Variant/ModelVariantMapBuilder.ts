import { FromJS, fromJS, isKeyed, Map, Set } from 'immutable'
import { ModelText } from '../Model'
import { JSReceiver, VariantKeyOrImmutable, IsComplete, GetVariantNameFromBase, VariantPart } from './Common'
import { VariantMapBuilder } from './VariantMapBuilder'

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

export class ModelVariantMapBuilder<VariantKey> extends VariantMapBuilder<VariantKey, ModelWithLayerSet, ModelVariant>
{
    #GetVariantName: (variantKey: VariantKeyOrImmutable<VariantKey>) => string
    protected get _GetVariantName() { return this.#GetVariantName}
    constructor(args: {
        baseName: string,
        receiver?: JSReceiver,
        isItemComplete?: IsComplete<ModelVariant>,
    }) {
        const args2 = {
            receiver: args.receiver ?? ModelReceiver,
            isItemComplete: args.isItemComplete ?? (maybeModelVariant => ModelVariantMapBuilder.IsItemComplete(maybeModelVariant?.Model)) as IsComplete<ModelVariant>
        }
        super(args2)
        this.#GetVariantName = GetVariantNameFromBase(args.baseName)
    }

    protected _GetTextInfo(variantKey: FromJS<VariantKey>, workingItem: FromJS<Model>): ModelText | undefined {
        return undefined
    }

    protected override _PostProcess(variantKey: FromJS<VariantKey>, workingItem: FromJS<VariantPart<ModelWithLayerSet>>): FromJS<ModelVariant> {
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
        .set('Name', this.#GetVariantName(variantKey))
        const text = this._GetTextInfo(variantKey, completeItem)
        return fromJS({
            Model: completeItem,
            ... text && {TextInfo: text}
        }) as FromJS<ModelVariant>
    }

    protected static IsItemComplete(x: Partial<Model> | undefined): x is Model {
        //TODO: Implement type check
        return true
    }
}