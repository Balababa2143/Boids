import Immutable from 'immutable'

declare module 'immutable' {
  /**
   * @ignore
   *
   * Used to convert deeply all immutable types to a plain TS type.
   * Using `unknown` on object instead of recursive call as we have a circular reference issue
   */
  export type DeepCopyEx<T> =
    T extends Record<infer R>
      ? // convert Record to DeepCopy plain JS object
        {
          [key in keyof R]: ContainObject<R[key]> extends true
            ? DeepCopyEx<R[key]>
            : R[key]
        }
      : T extends MapOf<infer R>
        ? // convert MapOf to DeepCopy plain JS object
          {
            [key in keyof R]: ContainObject<R[key]> extends true
              ? DeepCopyEx<R[key]>
              : R[key]
          }
        : T extends Collection.Keyed<infer KeyedKey, infer V>
          ? // convert KeyedCollection to DeepCopy plain JS object
            {
              [key in KeyedKey extends PropertyKey
                ? KeyedKey
                : string]: V extends object ? DeepCopyEx<V> : V
            }
          : // convert IndexedCollection or Immutable.Set to DeepCopy plain JS array
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            T extends Collection<infer _, infer V>
            ? Array<DeepCopyEx<V>>
            : T extends string | number // Iterable scalar types : should be kept as is
              ? T
              : T extends Iterable<infer V> // Iterable are converted to plain JS array
                ? Array<DeepCopyEx<V>>
                : T extends object // plain JS object are converted deeply
                  ? {
                      [ObjectKey in keyof T]: ContainObject<
                        T[ObjectKey]
                      > extends true
                        ? DeepCopyEx<T[ObjectKey]>
                        : T[ObjectKey]
                    }
                  : // other case : should be kept as is
                    T
    type KeyPathEx<T> =
        T extends (infer U)[] ?
            ([number] | [number, ...KeyPathEx<U>])
            : T extends object ?
                {
                    [Key in keyof Required<T>]: [Key] | [Key, ...KeyPathEx<T[Key]>]
                }[keyof Required<T>]
                : never

    type PropAtPath<T, Path extends readonly any[]> =
        Path extends [infer K, ...infer Rest] ?
        T extends any ?
            K extends keyof T ?
                Rest extends [] ? 
                    T[K]
                    : PropAtPath<T[K], Rest>
                : never
            : never
        : T

    type KeyValue<T extends object> = {
        [Key in keyof T]: [Key, T[Key]]
    }[keyof T];

    type TypeOrPartial<T> =
        T extends object ?
        (T extends ArrayLike<any> ? T : Partial<T> | Iterable<KeyValue<T>>) :
        T;

    type RecordFieldOf<T extends object, K extends keyof T> =
        Extract<KeyValue<T>, [K, any]>[1]

    interface Record<TProps extends object> {
        setIn<Path extends KeyPathEx<TProps>, Prop extends PropAtPath<TProps, Path>>(keyPath: Path, value: Prop): this;
        updateIn<Path extends KeyPathEx<TProps>, Prop extends PropAtPath<TProps, Path>>(
            keyPath: Path,
            updater: (value: Prop) => Prop
        ): this
        mergeIn<Path extends KeyPathEx<TProps>, Prop extends TypeOrPartial<PropAtPath<TProps, Path>>>(
            keyPath: Path, ...collections: Array<Prop>): this;
        mergeDeepIn<Path extends KeyPathEx<TProps>, Prop extends TypeOrPartial<PropAtPath<TProps, Path>>>(
            keyPath: Path,
            ...collections: Array<Prop>
        ): this

        /**
         * @alias removeIn
         */
        deleteIn<Path extends KeyPathEx<TProps>>(keyPath: Path): this
        removeIn<Path extends KeyPathEx<TProps>>(keyPath: Path): this
        toJS() : DeepCopyEx<TProps>
    }
}