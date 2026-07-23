import { FromJS, fromJS, isImmutable, isKeyed, Map as IMMap } from 'immutable'
import { ArrayElement } from '../../Utilities'
import { v5 as uuidv5 } from 'uuid'

export type JSReceiver = Parameters<typeof fromJS>[1]

export type IMVariantPart<WorkingType extends Object> = FromJS<VariantPart<WorkingType>>

export type VariantPartToIM<WorkingType extends Object> = (js: VariantPart<WorkingType>) => IMVariantPart<WorkingType>

export const DefaultReceiver: JSReceiver =
    (_key, value, _path) =>
        isKeyed(value) ? value.toMap() : value.toSet()

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

export type VariantKeyOrImmutable<VariantKey> = VariantKey | FromJS<VariantKey>

export const VariantKeyToImmutable = 
    <VariantKey>
    (variant: VariantKeyOrImmutable<VariantKey>)  =>
        fromJS(variant, DefaultReceiver) as FromJS<VariantKey>

export const GetVariantIdFromBase =
    <Variant>
    (BaseId: string) =>
    (variantKey: VariantKeyOrImmutable<Variant>) =>
        uuidv5(JSON.stringify(isImmutable(variantKey) ? variantKey.toJS() : variantKey), BaseId)

export const GetVariantNameFromBase =
    <Variant>
    (BaseName: string) =>
    (variantKey: VariantKeyOrImmutable<Variant>) =>
        `${BaseName}: ${JSON.stringify(isImmutable(variantKey) ? variantKey.toJS() : variantKey)}`