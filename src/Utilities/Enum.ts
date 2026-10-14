export interface Enum {
    [_: string | number]: string | number
}

export function HasFlag(flagVariable: number, flag: number) {
    return (flag & flagVariable) === flag
}

export function GetSetFlags<T extends Enum>(enumType: T, flagVariable: number) {
    return Object
        .values(enumType)
        .filter((v): v is T[keyof T] & number => typeof v === 'number')
        .filter((flag) => (flag & flagVariable) === flag)
        .map((flag) => enumType[flag] as string)
}

export function IsDefined<T extends Enum>(enumType: T, enumValue: number) {
    return Reflect.has(enumType, enumValue)
}
