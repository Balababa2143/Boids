type KeyPathMap<T, PKs extends (keyof any)[] = []> =
    T extends object ?
    {
        [Key in keyof Required<T>]: [[...PKs, Key], T[Key]] | KeyPathMap<T[Key], [...PKs, Key]>
    }[keyof Required<T>] :
    never

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
    <T extends Readonly<unknown>, Path extends KeyPath<T>>
        (target: T, keyPath: Path, value: PropAtPath<T, Path>): T => {
        if (typeof target !== 'object') {
            throw new TypeError('Target is not an object')
        }
        else {
            if (Array.isArray(target)) {
                throw new Error('Not supported')
            }
            else {
                const [head, ...tail] = keyPath
                if (tail.length === 0) {
                    return Object.freeze({
                        ...target,
                        [head]: value
                    })
                }
                else {
                    const oldProp = target[head]
                    if (null != oldProp && typeof oldProp === 'object' && !Array.isArray(oldProp)) {
                        return Object.freeze({
                            ...target,
                            [head]: CopySetIn(oldProp, tail, value)
                        })
                    }
                    else {
                        return Object.freeze({
                            ...target,
                            [head]: CopySetIn({} as typeof oldProp, tail, value)
                        })
                    }
                }
            }
        }
    }