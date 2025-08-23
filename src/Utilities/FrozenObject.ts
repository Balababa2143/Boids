type KeyPathMap<T, PKs extends (keyof any)[] = []> =
    T extends object ?
    {
        [Key in keyof Required<T>]: [[...PKs, Key], T[Key]] | KeyPathMap<T[Key], [...PKs, Key]>
    }[keyof Required<T>] :
    never

export type KeyPath<T> =
    T extends object ?
    {
        [Key in keyof Required<T>]: [Key] | [Key, ...KeyPath<T[Key]>]
    }[keyof Required<T>] :
    never

export type PropAtPath<T, Path extends readonly any[]> =
    Path extends [infer K, ...infer Rest]
        ? K extends keyof T
            ? Rest extends []
                ? T[K]
                : PropAtPath<T[K], Rest>
            : never
        : T

type TypeOrPartial<T> =
    T extends object ?
    (T extends ArrayLike<unknown> ? T : Partial<T>) :
    T;

export const CopyAssign =
    <T extends Readonly<object>>
        (target: T, newProps: Partial<T>): T =>
        Object.freeze({
            ...target,
            ...newProps
        })

export const CopySetIn =
    <T, Path extends KeyPath<T>> 
    (target: T, keyPath: Path, value: PropAtPath<T, Path>): T => {
    const [head, ...tail] = keyPath

    if (tail.length === 0) {
        return Object.freeze({
            ...target,
            [head]: value
        })
    }
    else {
        const tail2 = tail as KeyPath<T[typeof head]>
        const value2 = value as PropAtPath<T[typeof head], typeof tail2>
        const oldHead = target[head]
        if (null != oldHead && typeof oldHead === 'object') {
            return Object.freeze({
                ...target,
                [head]: CopySetIn(oldHead, tail2 , value2)
            })
        }
        else {
            return Object.freeze({
                ...target,
                [head]: CopySetIn({} as T[typeof head], tail2, value2)
            })
        }
    }
}