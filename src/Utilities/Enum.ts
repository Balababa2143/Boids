import { PowerSet } from './Seq'

export interface Enum {
    [_: string | number]: string | number
}

export function GetNumericValues<T extends Enum>(enumType: T) {
    return Object
        .values(enumType)
        .filter((v): v is T[keyof T] & number => typeof v === 'number')
}

export function GetStringValues<T extends Enum>(enumType: T) {
    return Object
        .values(enumType)
        .filter((v): v is T[keyof T] & string => typeof v === 'string')
}

export function HasFlag(flagVariable: number, flag: number) {
    return (flag & flagVariable) === flag
}

export function GetSetFlags<T extends Enum>(enumType: T, flagVariable: number) {
    return GetNumericValues(enumType)
        .filter((flag) => (flag & flagVariable) === flag)
        .map((flag) => enumType[flag] as string)
}

export function GetAllFlagsCombination<T extends Enum>(enumType: T) {
    return [...(function* () {
        for (const subset of PowerSet(GetNumericValues(enumType))) {
            let mask = 0
            for (const flag of subset) {
                mask |= flag
            }
            yield mask
        }
    })()]
}

export function IsDefined<T extends Enum>(enumType: T, enumValue: number) {
    return Reflect.has(enumType, enumValue)
}