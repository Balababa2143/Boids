import { DeepCopy, Record, RecordOf, Set, Map } from 'immutable'
import { v7 as NewUUID } from 'uuid'
import { ItemArchetype } from '../../Constant'

interface _ItemStateBase {
    readonly RegisteredItems: Set<string>
}

export type ItemStateBase = RecordOf<_ItemStateBase>

/**
 * Extracts an item state's field values as a plain object.
 *
 * `fromJS` has to produce plain values instead of spreading an existing Record:
 * Immutable v5 Records expose their fields as prototype accessors, so
 * `{ ...record }` yields `{ _values: [...] }`. Every spread field then silently
 * falls back to its default rather than being carried over.
 */
const ItemStateBaseFields = (js: DeepCopy<_ItemStateBase>) => ({
    RegisteredItems: Set(js.RegisteredItems as Iterable<string>),
})

const _ItemBaseDefault = {
    RegisteredItems: Set()
} satisfies _ItemStateBase

export const ItemStateBase = Object.assign(
    Record<_ItemStateBase>(_ItemBaseDefault),
    {
        fromJS: (js: DeepCopy<_ItemStateBase>) => ItemStateBase(ItemStateBaseFields(js))
    }
)

interface _SensoryLimiter extends _ItemStateBase {
    /**
     * Value between 0.0 to 1.0,
     * higher means more severe
     */
    TargetStrength: number
}

const _SensoryLimiterDefault = {
    ..._ItemBaseDefault,
    TargetStrength: 0
} satisfies _SensoryLimiter

export type SensoryLimiter = RecordOf<_SensoryLimiter>

/** Field values common to every sensory limiter. */
const SensoryLimiterFields = (js: DeepCopy<_SensoryLimiter>) => ({
    ...ItemStateBaseFields(js),
    TargetStrength: js.TargetStrength,
})

export const SensoryLimiter = Object.assign(
    Record<_SensoryLimiter>(_SensoryLimiterDefault),
    {
        fromJS: (js: DeepCopy<_SensoryLimiter>) => SensoryLimiter(SensoryLimiterFields(js))
    }
)

interface _Gag extends _SensoryLimiter {

}

const _GagDefeult = _SensoryLimiterDefault

export type Gag = RecordOf<_Gag>

export const Gag = Object.assign(
    Record<_Gag>(_GagDefeult),
    {
        fromJS: (js: DeepCopy<_Gag>) => Gag(SensoryLimiterFields(js))
    }
)

interface _Visor extends _SensoryLimiter {

}

const _VisorDefsult = _SensoryLimiterDefault

export type Visor = RecordOf<_Visor>

export const Visor = Object.assign(
    Record<_Visor>(_VisorDefsult),
    {
        fromJS: (js: DeepCopy<_Visor>) => Visor(SensoryLimiterFields(js))
    }
)

interface _ItemRegistry {
    readonly [ItemArchetype.Blinder]: _Visor
    readonly [ItemArchetype.Deafener]: _SensoryLimiter
    readonly [ItemArchetype.Gag]: _Gag
}

export type ItemRegistry = RecordOf<_ItemRegistry>

export const ItemRegistry = Object.assign(
    Record<_ItemRegistry>({
        [ItemArchetype.Blinder]: Visor(),
        [ItemArchetype.Deafener]: SensoryLimiter(),
        [ItemArchetype.Gag]: Gag(),
    }),
    {
        fromJS: (js: DeepCopy<_ItemRegistry>) =>
            ItemRegistry({
                [ItemArchetype.Blinder]: Visor.fromJS(js[ItemArchetype.Blinder] as any),
                [ItemArchetype.Deafener]: SensoryLimiter.fromJS(js[ItemArchetype.Deafener] as any),
                [ItemArchetype.Gag]: Gag.fromJS(js[ItemArchetype.Gag] as any),
            })
    }
)

interface _Entry {
    readonly ID: string
    readonly Items: _ItemRegistry
}

/**
 * A new entry gets a fresh id.
 *
 * `ID` has to be a plain enumerable value: Immutable's `Record(defaultValues)`
 * derives the record's key list from the enumerable own properties of
 * `defaultValues`, so installing it with a non-enumerable getter -- as this used
 * to -- left `ID` out of the schema entirely. It was then absent from `toJS()`,
 * silently ignored by the constructor, and impossible for `Entry.fromJS` to
 * restore.
 */
const EntryDefault: _Entry = {
    ID: NewUUID(),
    Items: ItemRegistry(),
}

export type Entry = RecordOf<_Entry>

export const Entry = Object.assign(
    Record<_Entry>(EntryDefault),
    {
        fromJS: (js: DeepCopy<_Entry>) =>
            Entry({
                ID: js.ID,
                Items: ItemRegistry.fromJS(js.Items as any)
            })
    }
)

interface _State {
    readonly ActivePC: _Entry
    readonly ActiveNPC: Map<string, _Entry>
}

export type State = RecordOf<_State>

export const State = Object.assign(
    Record<_State>({
        ActivePC: Entry(),
        ActiveNPC: Map()
    }),
    {
        fromJS: (js: DeepCopy<_State>) =>
            State({
                ActivePC: Entry.fromJS(js.ActivePC as any),
                ActiveNPC: 
                    Map<string, _Entry>(js.ActiveNPC as any).map(Entry.fromJS)
            })
    }
)