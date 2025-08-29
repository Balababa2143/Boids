import { fromJS, FromJS, Map } from 'immutable'

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
        let Cache = Map<FromJS<Key>, Value>()
        const ret = (key: Key) => {
            const valueCompareKey = fromJS(key)
            if (Cache.has(valueCompareKey)) {
                return Cache.get(valueCompareKey)
            }
            else {
                const newValue = func(key)
                Cache = Cache.set(valueCompareKey, newValue)
                return newValue
            }
        }
        ret[CacheKeyFuncSymbol] = fromJS
        Object.defineProperty(ret, CacheSymbol, {
            get: () => Cache
        })
        return ret as typeof func
    }