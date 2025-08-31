import { FromJS, fromJS, isCollection, isKeyed, isList, isMap, isSet, Map, mergeDeep, Seq } from 'immutable'
import { ArrayElement, ArrayPropertyKeys } from '../Utilities'

import VariantTypeSuite from './VariantTypesSuite'
import { createCheckers, CheckerT } from 'ts-interface-checker'
import { IRestraintText } from './Restraint'
const {
    Model: ModelChecker,
    ModelLayer: ModelLayerChecker,
    restraint: RestraintChecker
} = createCheckers(VariantTypeSuite) as {
    Model: CheckerT<Model>
    ModelLayer: CheckerT<ModelLayer>
    restraint: CheckerT<restraint>
}

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

export const GetVariantKey = 
    <Variant>
    (variant: Variant)  =>
        fromJS(variant, DefaultReceiver) as FromJS<Variant>

export class VariantBuilder<Variant, ArcheType extends object> {
    #variantMap: Map<FromJS<Variant>, FromJS<VariantPart<ArcheType>>>
    #fromJS: (js: VariantPart<ArcheType>) => FromJS<VariantPart<ArcheType>>
    #getVariantValueDependentParts?: (variantValue: FromJS<Variant>) => Iterable<VariantPart<ArcheType>>
    constructor(
        receiver: JSReceiver = DefaultReceiver,
        getVariantValueDependentParts?: (variantValue: FromJS<Variant>) => Iterable<VariantPart<ArcheType>>
    ) {
        this.#variantMap = Map()
        this.#fromJS = (js) => fromJS(js, receiver) as FromJS<VariantPart<ArcheType>>
        this.#getVariantValueDependentParts = getVariantValueDependentParts
    }

    Add(variant: Variant, parts: Iterable<VariantPart<ArcheType>>) {
        const variantValue = GetVariantKey(variant)
        const mergedParts =
            Seq(parts)
                .map(this.#fromJS)
                .concat(
                    this.#getVariantValueDependentParts ?
                        this.#getVariantValueDependentParts(variantValue)
                        : []
                )
                .reduce((merged, part) => mergeDeep(merged, part as any), this.#fromJS({} as VariantPart<ArcheType>))

        this.#variantMap = this.#variantMap.set(
            variantValue,
            mergedParts
        )
    }

    BuildVariantMap(template: VariantPart<ArcheType>, isComplete = (_ => true) as IsComplete<ArcheType>) {
        const CheckType = (x) => {
            if (isComplete(x)) {
                return x as ArcheType
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
        const templateValue = fromJS(template)
        const completeVariantMap =
            this.#variantMap
                .map(mergedParts => {
                    const templated = mergeDeep(templateValue, mergedParts as any)
                    return CheckType(
                        isCollection(templated) ? templated.toJS() : templated
                    )
                })
        return completeVariantMap
    }
}

export interface RestraintVariant {
    Restraint: restraint,
    TextInfo: IRestraintText
}

export const IsRestraintVariantComplete =
    (v: VariantPart<RestraintVariant>): v is RestraintVariant =>
        RestraintChecker.test(v.Restraint)