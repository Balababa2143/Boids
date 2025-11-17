import { FromJS, fromJS, isCollection, Map, mergeDeep, Seq, List as IMList } from 'immutable'
import { DefaultReceiver, IsComplete, JSReceiver, VariantKeyOrImmutable, VariantKeyToImmutable, VariantPart } from './Common'

export type VariantMap<VariantKey, ArcheType> = Map<FromJS<VariantKey>, ArcheType>

export class VariantMapBuilder<VariantKey, WorkingType extends object, ArcheType extends Object = WorkingType> {
    #variantMap: Map<FromJS<VariantKey>, IMList<FromJS<VariantPart<WorkingType>>>>
    protected get _VariantMap() { return this.#variantMap }

    #variantPartFromJS: (js: VariantPart<WorkingType>) => FromJS<VariantPart<WorkingType>>
    protected get _VariantPartFromJS() { return this.#variantPartFromJS }

    #isItemComplete: IsComplete<ArcheType>
    protected get _IsItemComplete() { return this.#isItemComplete }

    constructor(args: {
        receiver?: JSReceiver
        isItemComplete?: IsComplete<ArcheType>,
    } = {}) {
        const {
            receiver = DefaultReceiver,
            isItemComplete = (_ => true) as IsComplete<ArcheType>
        } = args
        this.#variantMap = Map()
        this.#variantPartFromJS = (js) => fromJS(js, receiver) as FromJS<VariantPart<WorkingType>>
        this.#isItemComplete = isItemComplete
    }

    protected _PostProcess(variant: FromJS<VariantKey>, workingItem: FromJS<VariantPart<WorkingType>>): FromJS<ArcheType> {
        return workingItem as FromJS<ArcheType>
    }

    #UpdateVariant(variant: VariantKeyOrImmutable<VariantKey>, updater: (prev: IMList<FromJS<VariantPart<WorkingType>>>) => IMList<FromJS<VariantPart<WorkingType>>>) {
        const immutableVariantKey = VariantKeyToImmutable<VariantKey>(variant)
        const previousParts = this.#variantMap.get(immutableVariantKey) ?? IMList()
        const updatedParts = updater(previousParts)

        this.#variantMap = this.#variantMap.set(
            immutableVariantKey,
            updatedParts
        )
    }

    AddVariantPart(variantKey: VariantKeyOrImmutable<VariantKey>, part: VariantPart<WorkingType>) {
        this.#UpdateVariant(variantKey, previousParts => previousParts.push(this._VariantPartFromJS(part)))
        return this
    }

    AddVariantParts(variantKey: VariantKeyOrImmutable<VariantKey>, parts: Iterable<VariantPart<WorkingType>>) {
        this.#UpdateVariant(variantKey, previousParts =>
            Seq(parts)
                .reduce((prev, part) => prev.push(this._VariantPartFromJS(part)), previousParts)
        )
        return this
    }

    BuildVariantMap(template: VariantPart<WorkingType>): VariantMap<VariantKey, ArcheType> {
        const CheckType = (x) => {
            if (this._IsItemComplete(x)) {
                return x
            }
            else {
                throw new Error('Variant is incomplete', {
                    cause: {
                        template,
                        variant: x
                    }
                })
            }
        }
        const templateValue = this._VariantPartFromJS(template)
        const completeVariantMap =
            this.#variantMap
                .map((parts, key) => {
                    const merged =
                        parts
                            .reduce((prev, part) => mergeDeep(prev, part as any), templateValue)
                    const finalObj = this._PostProcess(key, merged)
                    return CheckType(
                        isCollection(finalObj) ? finalObj.toJS() : finalObj
                    )
                })
        return completeVariantMap
    }

    Clone(): this {
        const other = Object.create(Object.getPrototypeOf(this)) as typeof this
        other.#variantMap = this.#variantMap
        other.#variantPartFromJS = this.#variantPartFromJS
        other.#isItemComplete = this.#isItemComplete
        return other
    }
}