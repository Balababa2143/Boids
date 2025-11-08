import { v5 as uuidv5 } from 'uuid'
import { Collection, FromJS, fromJS, isCollection, isImmutable, isKeyed, Map, mergeDeep, Seq, Set, List as IMList } from 'immutable'
import { ArrayElement, ArrayPropertyKeys } from '../Utilities'


import { IRestraintText } from './Restraint'
import { ModelText } from './Model'

export type ArraySemanticsSet = true
export type ArraySemanticsTuple = false

export type ArraySemantics =
    ArraySemanticsSet | ArraySemanticsTuple

export const ArraySemantics = {
    Set: true,
    Tuple: false
} as const

export const RestraintArraySemantics = {
    'requireAllTagsToEquip': ArraySemantics.Set,
    'specStruggleTypes': ArraySemantics.Set,
    'alwaysDressModel': ArraySemantics.Set,
    'shrine': ArraySemantics.Set,
    'Color': ArraySemantics.Tuple,
    'factionColor': ArraySemantics.Tuple,
    'Modules': ArraySemantics.Tuple,
    'remove': ArraySemantics.Set,
    'strictnessZones': ArraySemantics.Set,
    'removeShrine': ArraySemantics.Set,
    'linkedVibeTags': ArraySemantics.Set,
    'requireSingleTagToEquip': ArraySemantics.Set,
    'noRenderPose': ArraySemantics.Set,
    'renderWhenLinked': ArraySemantics.Set,
    'LinkableBy': ArraySemantics.Set,
    'renderExcept': ArraySemantics.Set,
    'alwaysEscapable': ArraySemantics.Set,
    'addPose': ArraySemantics.Set,
    'linkCategories': ArraySemantics.Tuple,
    'linkSizes': ArraySemantics.Tuple,
    'events': ArraySemantics.Set,
    'addTag': ArraySemantics.Set,
    'hideTags': ArraySemantics.Set,
    'ignoreMinLevelTags': ArraySemantics.Set,
    'ignoreFloorTags': ArraySemantics.Set,
    'addPoseIfTopLevel': ArraySemantics.Set,
    'ignoreMaxLevelTags': ArraySemantics.Set,
    'forbidPose': ArraySemantics.Set,
    'removePose': ArraySemantics.Set
} satisfies Record<ArrayPropertyKeys<restraint>, ArraySemantics>

export type JSReceiver = Parameters<typeof fromJS>[1]

export const DefaultReceiver: JSReceiver =
    (_key, value, _path) =>
        isKeyed(value) ? value.toMap() : value.toSet()

export const ModelReceiver: JSReceiver =
    (key, value, _path) =>
        key === 'Layers' ?
            value.valueSeq().toSet()
            : isKeyed(value) ? value.toMap() : value.toSet()

export const RestraintReceiver: JSReceiver =
    (key, value, _path) => {
        if (isKeyed(value)) {
            return value.toMap()
        }
        else {
            const semantic: ArraySemantics | undefined = RestraintArraySemantics[key]
            if (null != semantic && semantic) { // true = Set
                return value.toSet()
            }
            else {
                return value.toList()
            }
        }
    }

export type IsComplete<T> =
    (x: Partial<T>) => x is T

export type VariantPart<T extends object> = {
    [K in keyof T]?:
        T[K] extends infer Elm ?
            Elm extends readonly unknown[] ?
                Iterable<ArrayElement<Elm>>
                : Elm extends object ?
                    VariantPart<Elm>
                    : Elm
            : never
}

export type ModelWithLayerSet =
    Omit<Model, 'Layers'> & {
        Layers: ModelLayer[]
    }

export const ModelWithLayerSetToModel =
    (modelValue: FromJS<VariantPart<ModelWithLayerSet>>) =>
    modelValue.update(
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

export type VariantKeyOrImmutable<VariantKey> = VariantKey | FromJS<VariantKey>

export const VariantKeyToImmutable = 
    <VariantKey>
    (variant: VariantKeyOrImmutable<VariantKey>)  =>
        fromJS(variant, DefaultReceiver) as FromJS<VariantKey>

export class VariantMapBuilder<VariantKey, WorkingType extends object, ArcheType extends Object = WorkingType> {
    #variantMap: Map<FromJS<VariantKey>, Immutable.List<FromJS<VariantPart<WorkingType>>>>
    protected get _VariantMap() { return this.#variantMap }

    #variantPartFromJS: (js: VariantPart<WorkingType>) => FromJS<VariantPart<WorkingType>>
    protected get _VariantPartFromJS() {return this.#variantPartFromJS}

    #isItemComplete: IsComplete<ArcheType>
    protected get _IsItemComplete() {return this.#isItemComplete}

    constructor(args:{
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

    #UpdateVariant(variant: VariantKeyOrImmutable<VariantKey>, updater: (prev: IMList<FromJS<VariantPart<WorkingType>>>) => IMList<FromJS<VariantPart<WorkingType>>>)
    {
        const immutableVariantKey = VariantKeyToImmutable<VariantKey>(variant)
        const previousParts = this.#variantMap.get(immutableVariantKey) ?? IMList()
        const updatedParts = updater(previousParts)

        this.#variantMap = this.#variantMap.set(
            immutableVariantKey,
            updatedParts
        )
    }

    AddVariantPart(variantKey: VariantKeyOrImmutable<VariantKey>, part: VariantPart<WorkingType>)
    {
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

    BuildVariantMap(template: VariantPart<WorkingType>): Map<FromJS<VariantKey>, ArcheType> {
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
                        .reduce((prev, part) =>mergeDeep(prev, part as any), templateValue)
                    const finalObj = this._PostProcess(key, merged)
                    return CheckType(
                        isCollection(finalObj) ? finalObj.toJS() : finalObj
                    )
                })
        return completeVariantMap
    }
}

export interface ModelVariant {
    Model: Model,
    TextInfo: ModelText
}

export interface RestraintVariant {
    Restraint: restraint,
    TextInfo: IRestraintText
}

export const GetVariantNameFromBase =
    <Variant>
    (BaseName: string) =>
    (variantKey: VariantKeyOrImmutable<Variant>) =>
        uuidv5(JSON.stringify(isImmutable(variantKey) ? variantKey.toJS() : variantKey), BaseName)

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

export class RestraintVariantMapBuilder<VariantKey> extends VariantMapBuilder<VariantKey, restraint, RestraintVariant>
{
    #GetVariantName: (variantKey: VariantKeyOrImmutable<VariantKey>) => string
    protected get _GetVariantName() { return this.#GetVariantName}

    #textInfoMap: Map<FromJS<VariantKey>, IRestraintText>
    protected get _TextInfoMap() { return this.#textInfoMap }

    constructor(args: {
        baseName: string,
        receiver?: JSReceiver,
        isItemComplete?: IsComplete<RestraintVariant>,
    }) {
        const args2 = {
            receiver: args.receiver ?? ModelReceiver,
            isItemComplete: args.isItemComplete ?? (maybeComplete => RestraintVariantMapBuilder.IsItemComplete(maybeComplete?.Restraint)) as IsComplete<RestraintVariant>
        }
        super(args2)
        this.#GetVariantName = GetVariantNameFromBase(args.baseName)
        this.#textInfoMap = Map()
    }

    public AddText(variantKey: VariantKeyOrImmutable<VariantKey>, text: IRestraintText)
    {
        this.#textInfoMap = this.#textInfoMap.set(VariantKeyToImmutable(variantKey), text)
    }

    protected override _PostProcess(variantKey: FromJS<VariantKey>, workingItem: FromJS<VariantPart<restraint>>): FromJS<RestraintVariant> {
        const completeItem = 
            workingItem
            .set('name', this.#GetVariantName(variantKey))
        return fromJS({
            Restraint: completeItem,
            ... this._TextInfoMap.has(variantKey) && {TextInfo: this._TextInfoMap.get(variantKey)}
        }) as FromJS<RestraintVariant>
    }

    protected static IsItemComplete(x: Partial<restraint> | undefined): x is restraint {
        //TODO: Implement type check
        return true
    }
}