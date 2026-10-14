import { DeepCopy, Record, RecordOf, Set, Map } from 'immutable'
import { v7 as NewUUID } from 'uuid'
import { ItemArchetype } from '../../Constant'

/**
 * Creates an Immutable Record type together with a `fromJS` that rebuilds it from
 * `toJS()` output.
 *
 * The `fromJS` half matters more than it looks. It has to construct from *plain*
 * field values: Immutable v5 Records expose their fields as prototype accessors,
 * so spreading one yields `{ _values: [...] }` and every spread field silently
 * falls back to its default. That is why the readers below return plain objects
 * rather than records.
 */
const DefineStateRecord =
    <Fields extends object>(
        defaults: Fields,
        readFields: (js: DeepCopy<Fields>) => Partial<Fields>,
    ) => {
        const record = Record<Fields>(defaults)
        return Object.assign(record, {
            fromJS: (js: DeepCopy<Fields>) => record(readFields(js)),
        })
    }

interface _ItemStateBase {
    readonly RegisteredItems: Set<string>
}

export type ItemStateBase = RecordOf<_ItemStateBase>

const _ItemBaseDefault = {
    RegisteredItems: Set()
} satisfies _ItemStateBase

/** Plain field values for an item state, so they can be handed to a record constructor. */
const ItemStateBaseFields = (js: DeepCopy<_ItemStateBase>) => ({
    RegisteredItems: Set(js.RegisteredItems as Iterable<string>),
})

export const ItemStateBase = DefineStateRecord<_ItemStateBase>(_ItemBaseDefault, ItemStateBaseFields)

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

export const SensoryLimiter = DefineStateRecord<_SensoryLimiter>(_SensoryLimiterDefault, SensoryLimiterFields)

interface _Gag extends _SensoryLimiter {

}

const _GagDefault = _SensoryLimiterDefault

export type Gag = RecordOf<_Gag>

export const Gag = DefineStateRecord<_Gag>(_GagDefault, SensoryLimiterFields)

interface _Visor extends _SensoryLimiter {

}

const _VisorDefault = _SensoryLimiterDefault

export type Visor = RecordOf<_Visor>

export const Visor = DefineStateRecord<_Visor>(_VisorDefault, SensoryLimiterFields)

interface _ItemRegistry {
    readonly [ItemArchetype.Blinder]: _Visor
    readonly [ItemArchetype.Deafener]: _SensoryLimiter
    readonly [ItemArchetype.Gag]: _Gag
}

export type ItemRegistry = RecordOf<_ItemRegistry>

export const ItemRegistry = DefineStateRecord<_ItemRegistry>(
    {
        [ItemArchetype.Blinder]: Visor(),
        [ItemArchetype.Deafener]: SensoryLimiter(),
        [ItemArchetype.Gag]: Gag(),
    },
    js => ({
        [ItemArchetype.Blinder]: Visor.fromJS(js[ItemArchetype.Blinder] as any),
        [ItemArchetype.Deafener]: SensoryLimiter.fromJS(js[ItemArchetype.Deafener] as any),
        [ItemArchetype.Gag]: Gag.fromJS(js[ItemArchetype.Gag] as any),
    }),
)

interface _Entry {
    readonly ID: string
    readonly Items: _ItemRegistry
}

/**
 * A new entry gets a fresh id.
 *
 * `ID` has to be a plain enumerable value: `Record(defaultValues)` derives the
 * record's key list from the enumerable own properties of `defaultValues`, so
 * installing it with a non-enumerable getter -- as this used to -- left `ID` out
 * of the schema entirely. It was then absent from `toJS()`, silently ignored by
 * the constructor, and impossible for `Entry.fromJS` to restore.
 */
const EntryDefault: _Entry = {
    ID: NewUUID(),
    Items: ItemRegistry(),
}

export type Entry = RecordOf<_Entry>

export const Entry = DefineStateRecord<_Entry>(
    EntryDefault,
    js => ({
        ID: js.ID,
        Items: ItemRegistry.fromJS(js.Items as any),
    }),
)

interface _State {
    readonly ActivePC: _Entry
    readonly ActiveNPC: Map<string, _Entry>
}

export type State = RecordOf<_State>

export const State = DefineStateRecord<_State>(
    {
        ActivePC: Entry(),
        ActiveNPC: Map(),
    },
    js => ({
        ActivePC: Entry.fromJS(js.ActivePC as any),
        ActiveNPC: Map<string, _Entry>(js.ActiveNPC as any).map(Entry.fromJS),
    }),
)
