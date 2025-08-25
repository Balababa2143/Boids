import { UUIDTypes, v5 as uuidv5, v7 as uuidv7 } from 'uuid'

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

export const CacheWith =
    <Key, Value>
    (cacheParams: { BaseKey?: UUIDTypes, toString?: (_: Key) => string, func: (_: Key) => Value }) => {
        const BaseKey = cacheParams.BaseKey ?? uuidv7()
        const toString = cacheParams.toString ?? JSON.stringify
        const Cache: Record<string, Value> = {}
        const ret = (key: Key) => {
            const stringKey = uuidv5(toString(key), BaseKey)
            if (stringKey in Cache) {
                return Cache[stringKey]
            }
            else {
                const newValue = cacheParams.func(key)
                Cache[stringKey] = newValue
                return newValue
            }
        }
        ret[CacheKeyFuncSymbol] = toString
        ret[CacheSymbol] = Cache
        return ret as typeof cacheParams.func
    }