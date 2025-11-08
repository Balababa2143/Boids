import { FromJS, fromJS, isImmutable, isKeyed } from 'immutable'
import { ArrayElement } from '../../Utilities'
import { v5 as uuidv5 } from 'uuid'

export type JSReceiver = Parameters<typeof fromJS>[1]

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

export const GetVariantNameFromBase =
    <Variant>
    (BaseName: string) =>
    (variantKey: VariantKeyOrImmutable<Variant>) =>
        uuidv5(JSON.stringify(isImmutable(variantKey) ? variantKey.toJS() : variantKey), BaseName)