/**
 * The state a coordinator save is made of, as a tree of Immutable records: `Entry`
 * is one entity and the item registry holding its sensory slots, `ItemRegistry` has
 * one limiter per archetype, and `State` is the active player plus a map of the NPCs
 * the caller tracked.
 *
 * Every record here is built by `DefineStateRecord`, which pairs an Immutable
 * `Record` with a `fromJS` that understands what `toJS()` produced. That pairing is
 * the whole reason the types exist rather than plain objects: a save is the
 * `toJS()` form and the load path has to rebuild an equal tree from it, which
 * `test/coordinator-state.property.test.ts` pins for arbitrary states.
 * @module Boids/MachinePrime/Coordinator/Internal/State
 */

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

/**
 * The fields every item slot has in common: the names of the items registered
 * against it, held as an Immutable set so a repeat registration cannot duplicate one.
 */
export type ItemStateBase = RecordOf<_ItemStateBase>

const _ItemBaseDefault = {
    RegisteredItems: Set()
} satisfies _ItemStateBase

/** Plain field values for an item state, so they can be handed to a record constructor. */
const ItemStateBaseFields = (js: DeepCopy<_ItemStateBase>) => ({
    RegisteredItems: Set(js.RegisteredItems as Iterable<string>),
})

/**
 * The record constructor for an item slot, carrying the `fromJS` that rebuilds one
 * from `toJS()` output. Called with no fields it yields the defaults above.
 */
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

/**
 * An item slot that also carries the strength its sensory limiter targets: a number
 * from 0 to 1, where higher is more severe. 0 is no restriction and 1 is the most
 * the item can impose, and the value is a target rather than an effect — the item
 * turns it into gameplay.
 */
export type SensoryLimiter = RecordOf<_SensoryLimiter>

/** Field values common to every sensory limiter. */
const SensoryLimiterFields = (js: DeepCopy<_SensoryLimiter>) => ({
    ...ItemStateBaseFields(js),
    TargetStrength: js.TargetStrength,
})

/**
 * The record constructor for a sensory limiter slot, defaulting to no restriction at
 * all; its `fromJS` reads the fields plain `toJS()` output holds.
 */
export const SensoryLimiter = DefineStateRecord<_SensoryLimiter>(_SensoryLimiterDefault, SensoryLimiterFields)

interface _Gag extends _SensoryLimiter {

}

const _GagDefault = _SensoryLimiterDefault

/**
 * The gag's slot. It adds no field to a sensory limiter, and shares that record's
 * defaults and field reader, but it has a name of its own so the slot can grow one
 * without disturbing the blinder and deafener slots.
 */
export type Gag = RecordOf<_Gag>

/** The record constructor for the gag slot, and its `fromJS` companion. */
export const Gag = DefineStateRecord<_Gag>(_GagDefault, SensoryLimiterFields)

interface _Visor extends _SensoryLimiter {

}

const _VisorDefault = _SensoryLimiterDefault

/**
 * The blinder's slot, named for the hard-light visor that occupies it. Like the gag
 * it adds no field yet, and shares the sensory limiter defaults and field reader.
 */
export type Visor = RecordOf<_Visor>

/** The record constructor for the blinder slot, and its `fromJS` companion. */
export const Visor = DefineStateRecord<_Visor>(_VisorDefault, SensoryLimiterFields)

interface _ItemRegistry {
    readonly [ItemArchetype.Blinder]: _Visor
    readonly [ItemArchetype.Deafener]: _SensoryLimiter
    readonly [ItemArchetype.Gag]: _Gag
}

/**
 * The three sensory slots of one entity, keyed by the archetype GUID that names them.
 * Addressing a limiter by archetype rather than by item is what lets the coordinator
 * answer for a slot no item currently fills.
 */
export type ItemRegistry = RecordOf<_ItemRegistry>

/**
 * The record constructor for an item registry, seeded with one default limiter per
 * archetype. Its `fromJS` rebuilds each slot through that slot's own `fromJS`, so the
 * blinder comes back a visor rather than a bare sensory limiter.
 */
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

/**
 * One entity the coordinator tracks: its id, and the item registry holding that
 * entity's sensory slots.
 *
 * A default entry mints its `ID` from a uuid v7 at module evaluation, so the default
 * is not reproducible from one run to the next. That is why nothing randomised may be
 * captured from here, and why `test/registration-manifest.test.ts` asserts the
 * coordinator's save slot is absent from the registration manifest.
 */
export type Entry = RecordOf<_Entry>

/**
 * The record constructor for an entry. Called with no fields it falls back to the
 * defaults above, so the id is the uuid minted once at module evaluation; `fromJS`
 * instead restores the id a save carried, which is what keeps a loaded entry
 * identifiable.
 */
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

/**
 * The whole coordinator state: the active player's entry, and a map of NPC entries
 * keyed by id.
 *
 * Nothing in the mod writes `ActiveNPC` yet, so it is an empty map in practice; it is
 * declared and round-tripped anyway, because the record's shape is the shape a save is
 * read back through.
 */
export type State = RecordOf<_State>

/**
 * The record constructor for the state. Called with no fields it falls back to the
 * defaults above — the player entry built at module evaluation, and no NPCs — which
 * is what a coordinator runs on before any save is loaded; `fromJS` rebuilds a whole
 * tree from the `toJS()` form a save holds.
 */
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
