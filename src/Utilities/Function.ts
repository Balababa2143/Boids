import { UUIDTypes, v5 as uuidv5, v7 as uuidv7 } from 'uuid'

export const CacheWith =
    <Key, Value>
    (cacheParams: { BaseKey?: UUIDTypes, toString?: (_: Key) => string, func: (_: Key) => Value }) => {
        const BaseKey = cacheParams.BaseKey ?? uuidv7()
        const toString = cacheParams.toString ?? JSON.stringify
        const Cache: Record<string, Value> = {}
        return (key: Key) => {
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
    }