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

export function NotNull<T>(obj: T | null | undefined): obj is T {
    return null == obj
}

export function ThrowIfNull<T>(value: T | null | undefined, errorMessage?: string): T {
    if (value === null || value === undefined) {
        throw new ReferenceError(errorMessage)
    }
    return value;
}

export type WithDefault<Base extends object, Default extends Partial<Base>> = Omit<Base, keyof Default> & Partial<Default>

export type UnionTo<Target, Tuple extends readonly unknown[]> =
    Tuple[number] extends Target ? unknown : 'Union Constraint Mismatch'

export type Intersection<T extends unknown[]> =
    T extends [infer Head, ...infer Tail] ?
    Head & Intersection<Tail> :
    unknown // Base case for empty array

export type IntersectionTo<Target, T extends unknown[]> =
    Intersection<T> extends Target ? unknown : 'Intersection Constraint Mismatch'

export type ArrayProperties<T> = Pick<T, {
  [K in keyof T]: T[K] extends any[] ? K : never
}[keyof T]>

export const SetProps =
    <T extends object>
    () =>
        <Key extends keyof T>
        (key: Key) =>
            (value: T[Key]) =>
                <Template extends Partial<T>>
                (template: Template) => ({
                    ...template,
                    [key]: value
                } as Template & Pick<Required<T>, Key>)

export const MergeProps =
    <T extends object>
    () =>
        <Props extends Partial<T>>
        (props: Props)  =>
            <Template extends Partial<T>>
            (template: Template) => ({
                ...template,
                ...props
            })