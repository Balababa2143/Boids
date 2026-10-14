import { fromJS, FromJS, Map } from 'immutable'

/**
 * Marks a function produced by {@link Cached}. Module-private: nothing consumes
 * them, they only exist so that {@link Cached} can smuggle a cache and a key
 * normaliser onto the returned function.
 */
const CacheSymbol = Symbol('CacheSymbol')

const CacheKeyFuncSymbol = Symbol('CacheKeyFunc')

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
