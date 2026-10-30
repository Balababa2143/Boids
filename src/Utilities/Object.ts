export function DeepFreezeInplace<T>(obj: T): Readonly<T> {
    if (Object.isFrozen(obj)) {
        return obj
    }
    else {
        for (const key of Reflect.ownKeys(obj!)) {
            const value = obj![key as keyof typeof obj]
            if (value && !Object.isFrozen(value)) {
                DeepFreezeInplace(value)
            }
        }
        return Object.freeze(obj)
    }
}

export function DeepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj))
}

export function DeepFreezeClone<T>(obj: T): Readonly<T> {
    return DeepFreezeInplace(DeepClone(obj))
}

export function ThrowIfNull<T>(value: T | null | undefined, errorMessage?: string): T {
    if (value === null || value === undefined) {
        throw new ReferenceError(errorMessage)
    }
    return value;
}

export type WithDefault<Base extends object, Default> =
    Omit<Base, keyof Default> & Partial<Default>

export type Intersection<T extends unknown[]> =
    T extends [infer Head, ...infer Tail] ?
    Head & Intersection<Tail> :
    unknown // Base case for empty array

export type IntersectionTo<Target, T extends unknown[]> =
    Intersection<T> extends Target ? unknown : 'Intersection Constraint Mismatch'

export type ArrayPropertyKeys<T extends object> = {
    [K in keyof Required<T>]: 
        Required<T>[K] extends infer Elm ?
            Elm extends readonly unknown[] ?
                K
                : never
            : never
}[keyof Required<T>]

export type ArrayElement<T> = T extends (infer U)[] ? U : never

export type KeyPath<T> =
        T extends (infer U)[] ?
            ([number] | [number, ...KeyPath<U>])
            : T extends object ?
                {
                    [Key in keyof Required<T>]: [Key] | [Key, ...KeyPath<T[Key]>]
                }[keyof Required<T>]
                : never

export type PropAtPath<T, Path extends readonly any[]> =
        Path extends [infer K, ...infer Rest] ?
        T extends any ?
            K extends keyof T ?
                Rest extends [] ? 
                    T[K]
                    : PropAtPath<T[K], Rest>
                : never
            : never
        : T
