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