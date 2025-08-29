import { v4 as uuidv4, v5 as uuidv5 } from 'uuid'

export const CacheSymbol = Symbol('CacheSymbol')

export const CacheKeyFuncSymbol = Symbol('CacheKeyFunc')

type Func<T, R> = (_: T) => R

export interface CachedFunc<T, R> extends Func<T, R> {
    [CacheKeyFuncSymbol]: Func<T, string>
    [CacheSymbol]: Record<string, R>
}

export const IsCachedFunc =
    <T, R>
        (f: Func<T, R>): f is CachedFunc<T, R> =>
        CacheSymbol in f && CacheKeyFuncSymbol in f

export const Cached =
    <Key, Value>
    (func: (_: Key) => Value) => {
        const BaseKey = uuidv4()
        const Cache = new Map<string, Value>()
        const ret = (key: Key) => {
            const stringKey = JSON.stringify(key)
            const convertedKey = uuidv5(stringKey, BaseKey)
            if (Cache.has(convertedKey)) {
                return Cache.get(convertedKey)
            }
            else {
                const newValue = func(key)
                Cache.set(convertedKey, newValue)
                return newValue
            }
        }
        ret[CacheKeyFuncSymbol] = toString
        ret[CacheSymbol] = Cache
        return ret as typeof func
    }