import { FromJS, fromJS, isCollection, mergeDeep, Seq, List as IMList, Map as IMMap } from 'immutable'
import { IMVariantPart, JSReceiver, VariantPart, VariantPartToIM } from './Common'
import { ThrowIfNull } from '../../Utilities'

export type VariantMap<VariantKey, ArcheType> = IMMap<VariantKey, ArcheType>

export class VariantBuilder<WorkingType extends Object> {
    #VariantPartToIM: VariantPartToIM<WorkingType>
    #workingDraft: IMList<IMVariantPart<WorkingType>>

    constructor(variantPartToIM: VariantPartToIM<WorkingType>) {
        this.#VariantPartToIM = variantPartToIM
        this.#workingDraft = IMList()
    }

    Update(update: (prev: IMList<IMVariantPart<WorkingType>>) => IMList<IMVariantPart<WorkingType>>): this{
        this.#workingDraft = update(this.#workingDraft)
        return this
    }

    AddPart(part: VariantPart<WorkingType>): this {
        return this.Update(prev => prev.push(this.#VariantPartToIM(part)))
    }

    AddParts(parts: Iterable<VariantPart<WorkingType>>): this {
        return this.Update(prev =>
            Seq(parts)
                .map(this.#VariantPartToIM)
                .reduce((acc, newPart) => acc.push(newPart), prev)
        )
    }

    Build(template: IMVariantPart<WorkingType>): IMVariantPart<WorkingType> {
        return this.#workingDraft
            .reduce((acc, part) => mergeDeep(acc, part as any), template)
    }
}

export class VariantMapBuilder<VariantKey, WorkingType extends object, ArcheType extends Object = WorkingType> {
    #variantMap: IMMap<VariantKey, VariantBuilder<WorkingType>>
    protected get _VariantMap() { return this.#variantMap }
    protected set _VariantMap(newVal: IMMap<VariantKey, VariantBuilder<WorkingType>>) {
        if(this.#variantMap !== newVal)
        {
            this.#variantMap = newVal
        }
    }

    #variantPartToIM: (js: VariantPart<WorkingType>) => IMVariantPart<WorkingType>
    protected get _VariantPartToIM() { return this.#variantPartToIM }

    constructor(receiver?: JSReceiver) {
        this.#variantMap = IMMap()
        this.#variantPartToIM = (js) => fromJS(js, receiver) as IMVariantPart<WorkingType>
    }

    protected /* virtual */ _DoFinalizeWorkingDraft(workingDraft: IMVariantPart<WorkingType>, _variantKey: VariantKey): FromJS<Partial<ArcheType>> {
        return workingDraft as unknown as FromJS<Partial<ArcheType>>
    }

    #FinalizeWorkingItem(workingDraft: IMVariantPart<WorkingType>, variantKey: VariantKey): ArcheType {
        const finalDraft = this._DoFinalizeWorkingDraft(workingDraft, variantKey)
        return (isCollection(finalDraft) ? finalDraft.toJS() : finalDraft) as ArcheType
    }

    WithVariant(variantKey: VariantKey, doWork: (variantBuilder: VariantBuilder<WorkingType>) => VariantBuilder<WorkingType>): this {
        const builder =
            this._VariantMap.has(variantKey) ?
            ThrowIfNull(this._VariantMap.get(variantKey), 'VariantBuilder should have been initialized') :
            (() => {
                const newBuilder = new VariantBuilder<WorkingType>(this._VariantPartToIM)
                this._VariantMap = this._VariantMap.set(variantKey, newBuilder)
                return newBuilder
            })()
        doWork(builder)
        return this
    }

    AddVariantPart(variantKey: VariantKey, part: VariantPart<WorkingType>) {
        return this.WithVariant(variantKey, (variantBuilder) => variantBuilder.AddPart(part))
    }

    AddVariantParts(variantKey: VariantKey, parts: Iterable<VariantPart<WorkingType>>) {
        return this.WithVariant(variantKey, (variantBuilder) => variantBuilder.AddParts(parts))
    }

    BuildVariantMap(template: VariantPart<WorkingType>): VariantMap<VariantKey, ArcheType> {
        const IMTemplate = this._VariantPartToIM(template)
        const completeVariantMap =
            this.#variantMap
                .map((variantBuilder, _) => variantBuilder.Build(IMTemplate))
                .map((v, k) => this.#FinalizeWorkingItem(v, k))
        return completeVariantMap
    }

}
