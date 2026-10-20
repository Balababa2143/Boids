/**
 * The state a coordinator save is made of, as a tree of Immutable records: `Entry` is one entity
 * and the dossier the Host keeps about it, and `State` is the active player plus a map of the
 * NPCs the caller tracked.
 *
 * Every record here is built by `DefineStateRecord`, which pairs an Immutable `Record` with a
 * `fromJS` that understands what `toJS()` produced. That pairing is the whole reason the types
 * exist rather than plain objects: a save is the `toJS()` form and the load path has to rebuild
 * an equal tree from it, which `test/coordinator-state.property.test.ts` pins for arbitrary states.
 *
 * ## What is not in here, and why that is the design
 *
 * **The equipment is not.** Which items are worn is a fact about the game's inventory, read
 * through `KinkyDungeonAllRestraintDynamic()` when a dimension is resolved and never recorded
 * here (`design/spec.md` §6.12, clause 4). That is what makes "no cached value to invalidate"
 * literally true: the last provider for a dimension leaving the body changes the answer with no
 * bookkeeping, and the per-facet **Free state** falls out of it.
 *
 * **A registered-item set is not.** It used to be here — one `RegisteredItems` set per archetype
 * slot — and it is gone with the archetype enum that named the slots. A restraint participates
 * by carrying the membership tag in its template's `shrine` list (§6.12, clause 1), so the set of
 * participants is a property of what is worn rather than a record the mod maintains.
 *
 * @module FactionMachine/MachinePrime/Coordinator/Internal/State
 */

import { DeepCopy, Record, RecordOf, Map as IMMap } from 'immutable'
import { v7 as NewUUID } from 'uuid'
import { ControlState } from '../../../../KDExtension/Control'

/**
 * Creates an Immutable Record type together with a `fromJS` that rebuilds it from `toJS()` output.
 *
 * The `fromJS` half matters more than it looks. It has to construct from *plain* field values:
 * Immutable v5 Records expose their fields as prototype accessors, so spreading one yields
 * `{ _values: [...] }` and every spread field silently falls back to its default. That is why the
 * readers below return plain objects rather than records.
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
 * The container a shell field holds until its own slice fills it.
 *
 * **Shared rather than rebuilt, and that is load-bearing.** Immutable compares two structurally
 * empty plain objects as *different* values (`is({}, {})` is false), while the state round-trip
 * property asserts `.equals`. One frozen value makes "empty" the same value on both sides, so a
 * save that carries `{}` restores to the object it was. The slice that fills a shell replaces it
 * with its own record and reader, and from then on the value compares by content.
 */
const EmptyShell: object = Object.freeze({})

/**
 * Reads one shell field off a save, and answers the shared empty value when it carried nothing.
 *
 * A save is not a trusted input, so anything that is not a plain object is dropped rather than
 * carried into the tree. A non-empty object is passed through for the slice that owns it: this
 * reader knows the shell's *place*, not its shape, which is the whole reason the field exists
 * before its design does.
 */
const ReadShell = <Shell extends object>(value: unknown): Shell =>
    value != null && typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0
        ? EmptyShell as Shell
        : value as Shell

/**
 * The quest metadata **route 1 must not clear**: what the quest allocator reads to place quests —
 * knowledge and keys (blueprints, obtained keys, completion records), not the dossier.
 *
 * An **empty interface** on purpose. It is the save format's skeleton rather than a design: the
 * field exists from this release so that filling it is an addition instead of a migration, and
 * the shape belongs to the slice that authors it. Nothing writes it yet.
 */
interface Quests { }

/**
 * The standing rules the Hive declares — which are **not** Intents and need not map to a
 * dimension (`design/report/Experience design/willing-surrender.md` §7.5).
 *
 * The same shell as {@link Quests}, for the same reason: its own design pass owns the shape, and
 * its **home** is settled here so that pass is not also a persisted-format change. Declared and
 * unwritten, in the same sense the seams are.
 */
interface Rules { }

interface _Entry {
    readonly ID: string
    readonly Control: ControlState
    readonly Quests: Quests
    readonly Rules: Rules
}

/**
 * A new entry gets a fresh id.
 *
 * `ID` has to be a plain enumerable value: `Record(defaultValues)` derives the record's key list
 * from the enumerable own properties of `defaultValues`, so installing it with a non-enumerable
 * getter -- as this once did -- left `ID` out of the schema entirely. It was then absent from
 * `toJS()`, silently ignored by the constructor, and impossible for `Entry.fromJS` to restore.
 */
const EntryDefault: _Entry = {
    ID: NewUUID(),
    Control: ControlState(),
    Quests: EmptyShell,
    Rules: EmptyShell,
}

/**
 * One entity the coordinator tracks: its id, the dossier the Host keeps about it, and the two
 * shells for the parts that are not the dossier — the quest metadata route 1 preserves, and the
 * rules the Hive declares.
 *
 * A default entry mints its `ID` from a uuid v7 at module evaluation, so the default is not
 * reproducible from one run to the next. That is why nothing randomised may be captured from
 * here, and why `test/registration-manifest.test.ts` asserts the coordinator's save slot is
 * absent from the registration manifest.
 */
export type Entry = RecordOf<_Entry>

/**
 * The record constructor for an entry. Called with no fields it falls back to the defaults above,
 * so the id is the uuid minted once at module evaluation; `fromJS` instead restores the id, the
 * dossier and the two shells a save carried, which is what keeps a loaded entry identifiable and
 * what makes the shells round-trip before anything writes them.
 *
 * The `?.` on the nested read is deliberate even though `ControlState.fromJS` already tolerates a
 * missing argument: a save written before the dossier existed carries no `Control` key at all, and
 * `undefined` reaching a reader is a state this has to answer rather than a state to guard against
 * one call site at a time.
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
 *
 * Nothing in the mod writes `ActiveNPC` yet, so it is an empty map in practice; it is declared and
 * round-tripped anyway, because the record's shape is the shape a save is read back through.
 */
export type State = RecordOf<_State>

/**
 * The record constructor for the state. Called with no fields it falls back to the defaults above
 * — the player entry built at module evaluation, and no NPCs — which is what a coordinator runs on
 * before any save is loaded; `fromJS` rebuilds a whole tree from the `toJS()` form a save holds.
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
