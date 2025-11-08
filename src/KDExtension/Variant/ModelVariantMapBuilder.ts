import { FromJS, fromJS, isKeyed, Map, Set } from 'immutable'
import { AddModelWithTextThenGetName, ModelText } from '../Model'
import { JSReceiver, VariantKeyOrImmutable, IsComplete, GetVariantNameFromBase, VariantPart, VariantKeyToImmutable } from './Common'
import { VariantMap, VariantMapBuilder } from './VariantMapBuilder'
import { ThrowIfNull } from '../../Utilities'

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

export class ModelVariantMapBuilder<VariantKey> extends VariantMapBuilder<VariantKey, ModelWithLayerSet, ModelVariant> {
    #GetVariantName: (variantKey: VariantKeyOrImmutable<VariantKey>) => string
    protected get _GetVariantName() { return this.#GetVariantName }

    #textInfoMap: Map<FromJS<VariantKey>, ModelText>
    protected get _TextInfoMap() { return this.#textInfoMap }

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
        this.#textInfoMap = Map()
    }

    public AddText(variantKey: VariantKeyOrImmutable<VariantKey>, text: ModelText) {
        this.#textInfoMap = this.#textInfoMap.set(VariantKeyToImmutable(variantKey), text)
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
        return fromJS({
            Model: completeItem,
            ... this._TextInfoMap.has(variantKey) && { TextInfo: this._TextInfoMap.get(variantKey) }
        }) as FromJS<ModelVariant>
    }

    protected static IsItemComplete(x: Partial<Model> | undefined): x is Model {
        //TODO: Implement type check
        return true
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
    return {
        ValidVariantMap: validVariantMap,
        GetVariant:
            (variant: VariantKeyOrImmutable<VariantKey>) => ThrowIfNull(validVariantMap.get(VariantKeyToImmutable<VariantKey>(variant)))
    }
}