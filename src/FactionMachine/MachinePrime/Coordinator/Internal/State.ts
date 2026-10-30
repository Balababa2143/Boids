/**
 * The state a coordinator save is made of, as a tree of Immutable records: `Entry` is one entity
 * and the dossier the Host keeps about it, and `State` is the active player plus a map of the NPCs
 * the caller tracked. Which items are worn is not recorded here; it is read from
 * `KinkyDungeonAllRestraintDynamic()` when a dimension is resolved, so there is no cached
 * capability to invalidate.
 * @module FactionMachine/MachinePrime/Coordinator/Internal/State
 */

import { DeepCopy, Record, RecordOf, Map as IMMap } from 'immutable'
import { v7 as NewUUID } from 'uuid'
import { ControlState } from '../../../../KDExtension/Control'

/**
 * Creates an Immutable Record type together with a `fromJS` that rebuilds it from `toJS()` output.
 * The reader must return plain field values: spreading an Immutable v5 Record yields
 * `{ _values: [...] }`, so a spread field silently falls back to its default.
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

/**
 * The container a shell field holds until its own slice fills it. Shared rather than rebuilt:
 * Immutable compares two structurally empty plain objects as different values, and the state round
 * trip asserts `.equals`, so "empty" has to be one value on both sides.
 */
const EmptyShell: object = Object.freeze({})

/**
 * Reads one shell field off a save, answering the shared empty value when it carried nothing that
 * is a plain object.
 */
const ReadShell = <Shell extends object>(value: unknown): Shell =>
    value != null && typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0
        ? EmptyShell as Shell
        : value as Shell

/**
 * The quest metadata the load path must not clear: what the quest allocator reads to place quests —
 * knowledge and keys (blueprints, obtained keys, completion records), not the dossier. An empty
 * interface on purpose: the field exists so that filling it is an addition rather than a migration.
 */
interface Quests { }

/**
 * The standing rules the Hive declares, which are not intents and need not map to a dimension.
 * The same shell as {@link Quests}: its home is settled here rather than in the catalogue.
 */
interface Rules { }

interface _Entry {
    readonly ID: string
    readonly Control: ControlState
    readonly Quests: Quests
    readonly Rules: Rules
}

/**
 * A new entry gets a fresh id. `ID` has to be a plain enumerable value: `Record(defaultValues)`
 * derives the record's key list from the enumerable own properties, so a non-enumerable getter
 * leaves `ID` out of the schema and out of `toJS()`.
 */
const EntryDefault: _Entry = {
    ID: NewUUID(),
    Control: ControlState(),
    Quests: EmptyShell,
    Rules: EmptyShell,
}

/**
 * One entity the coordinator tracks: its id, the dossier the Host keeps about it, and the two
 * shells for the parts that are not the dossier. A default entry mints its `ID` at module
 * evaluation, so the default is not reproducible from one run to the next and nothing randomised
 * may be captured from here.
 */
export type Entry = RecordOf<_Entry>

/**
 * The record constructor for an entry: no fields falls back to the defaults above; `fromJS`
 * restores the id, the dossier and the two shells a save carried. The `?.` on the nested read is
 * deliberate: a save written before a field existed carries no key for it at all.
 */
export const Entry = DefineStateRecord<_Entry>(
    EntryDefault,
    js => ({
        ID: js.ID,
        Control: ControlState.fromJS(js?.Control),
        Quests: ReadShell<Quests>(js?.Quests),
        Rules: ReadShell<Rules>(js?.Rules),
    }),
)

interface _State {
    readonly ActivePC: _Entry
    readonly ActiveNPC: IMMap<string, _Entry>
}

/**
 * The whole coordinator state: the active player's entry, and a map of NPC entries keyed by id.
 * `ActiveNPC` is round-tripped even when nothing writes it, because the record's shape is the shape
 * a save is read back through.
 */
export type State = RecordOf<_State>

/**
 * The record constructor for the state: no fields falls back to a player entry built at module
 * evaluation and no NPCs; `fromJS` rebuilds a whole tree from the `toJS()` form a save holds.
 */
export const State = DefineStateRecord<_State>(
    {
        ActivePC: Entry(),
        ActiveNPC: IMMap(),
    },
    js => ({
        ActivePC: Entry.fromJS(js.ActivePC as any),
        ActiveNPC: IMMap<string, _Entry>(js.ActiveNPC as any).map(Entry.fromJS),
    }),
)
