/**
 * The shape a dossier is made of.
 *
 * ## Two keyed maps, and nothing else
 *
 * ```ts
 * type ControlState = {
 *     readonly intent: { [D: DimensionId]: Intent }  // the Host's demand; an absent key is the baseline
 *     readonly config: { [D: DimensionId]: Config }  // sparse; semantic extra fields
 * }
 * ```
 *
 * **[决定] `intent` is persisted and an applied strength is not.** The value a seam ultimately
 * receives — the resolved severity — is **derived at runtime** from the intent and the equipment's
 * current capability (`design/spec.md` §6.5, §6.7). It is a computed value, so persisting it would
 * store the answer to a question that has to be re-derived whenever the worn set changes. **The
 * persisted `Target` is the demand; the resolved severity is the outcome.**
 *
 * **[决定] There is no `equipment` key, and there must not be one.** The equipment group's capability
 * is computed at execution time from what is worn (§6.12 clause 4), so a stored ceiling would be a
 * cached answer to a question the worn set can change.
 *
 * **[决定] The baseline is the absence of an entry, not a stored reading.** A dimension with no
 * `intent` entry sits at *every facet parameter at rest* — and that is why removing equipment
 * **releases** an override instead of having to restore a value (invariant 12), and why route 1's
 * clearance has nothing to preserve.
 *
 * ## `Intent` is a composition, and this is the whole point of the section it comes from
 *
 * A dimension is not a number and not a flag: it **composes facets** (`Facet.ts`), so what the Host
 * may demand of it is exactly what those facets take as parameters, and nothing else. The intent is a
 * duct-typed record — a merge of the facets' parameter interfaces, each optional, contributed only
 * where the descriptor declares that facet.
 *
 * That distinction is load-bearing rather than cosmetic. Writing the whole persisted demand as
 * `{ [D]: GateIntent }` — which an earlier draft did, and which this file did until it was corrected —
 * **collapses a rate dimension's intent onto a gate's vocabulary**: `Sight` could be `Free` or
 * forbidden and nothing in between, so *"the Host squeezes sight to 0.4"* had no representation at
 * all. `GateIntent` is one facet's vocabulary, not the type of an intent.
 *
 * ## The maps are sparse on purpose
 *
 * A save written by a build that knew fewer dimensions loads into a build that knows more, and the
 * new dimensions simply read their baseline. **The persisted shape does not change when a dimension
 * is added**, which is the whole reason the descriptors are code-side.
 * @module KDExtension/Control/Store
 */

import { Map as IMMap, Set as ISet, Record as IMRecord, RecordOf } from 'immutable'
import { ConfigField } from './Descriptor'
import { GateIntent, IsGateIntent, StackMode } from './Facet'
import { DimensionId } from './Identity'
import { IsPoseKey, PoseKey } from './Pose'

/**
 * One config field's value.
 *
 * Deliberately **not** `unknown`: `config` holds semantics — which struggle types a gate governs —
 * and never live gameplay state, so the shape is closed over the plain JSON scalars and lists of
 * them. A structure that needs an object belongs in the descriptor (code) or under a per-piece key
 * (the equipment's own record), not in the dossier.
 */
export type ConfigValue = string | number | boolean | null | readonly ConfigValue[]

/** A dimension's semantic extra fields, as they are persisted. */
export type Config = Readonly<Record<string, ConfigValue>>

/**
 * The parameter `Rate` contributes to an intent: **how hard to squeeze**, 0..1.
 *
 * Every in-range number is legal for a `Rate` — a rate is a number (`design/spec.md` §6.6) — so this
 * parameter has no value rules beyond its range, and it is the only place a Host demand can be
 * *continuous*.
 */
export interface IntentRate {
    readonly Target?: number | undefined
}

/**
 * The parameter `Gate` contributes: **which permission**.
 *
 * The field is named `Intent` because the spec names it so (§6.5), and the collision with the
 * enclosing concept is the spec's own: *the Host's demand for a dimension* is a record, and
 * `GateIntent` is the three values one facet of that record can take. `Struggle` is the dimension where
 * both parameters appear together, and it is the reason they have to be separate fields rather than one.
 */
export interface IntentGate {
    readonly Intent?: GateIntent | undefined
}

/**
 * The parameter `Whitelist` contributes: **nothing, and that is the design rather than an omission.**
 *
 * A whitelist lists what **equipment** can re-grant. Which keys those are is the equipment's
 * declaration, read from what is worn and never the Host's demand (§6.12 clause 4), so the Host's only
 * lever over a whitelist is the gate in front of it — *"you may have it back, through the gear"* — and
 * the gear decides which abilities that covers. A `Granted` here would be the Host promising a
 * capability the equipment may not offer, which is the write §6.6 refuses.
 *
 * It is declared as an empty interface rather than omitted so the merge reads as one term per facet,
 * and so a reader can see that the omission was considered.
 */
export interface IntentWhitelist { }

/**
 * The parameter `Posture` contributes: **which body configurations are permitted**, by pose.
 *
 * It is the one parameter whose value is a **set** rather than a number or one of three names,
 * because a body configuration is chosen from a ladder rather than measured (§6.5, §6.13). An
 * absent `Allowed` is not "nothing permitted": it is *the Host asked for nothing*, which means the
 * ladder — the same absence-versus-value distinction {@link IntentGate}'s `undefined` draws, and
 * the reason the parameter is a permitted set rather than a list of refusals.
 */
export interface IntentPosture {
    readonly Allowed?: readonly PoseKey[] | undefined
}

/** The parameters a composed demand can carry: the union of every facet's own. */
export interface IntentParameters extends IntentRate, IntentPosture, IntentGate, IntentWhitelist { }

/**
 * The Host's demand, as a caller writes and reads it: a plain record of the parameters its facets take.
 *
 * This is the shape `design/spec.md` §6.5 states, and the shape a console session types. It is
 * **not** the shape the store holds — see {@link Intent} — but it is the shape everything outside the
 * mechanism speaks, because forcing every caller to build an Immutable collection to state a demand
 * would make the console entry point unpleasant for no benefit.
 */
export type IntentRecord = IntentParameters

/** One intent parameter's name. */
export type IntentParameter = keyof IntentParameters

/**
 * One intent parameter's value, as a caller supplies it in a plain record.
 *
 * The three shapes are the three facets' own: a number for a `Rate`, one of three names for a
 * `Gate`, and a set of poses for a `Posture`. `Whitelist` contributes none.
 */
export type IntentValue = number | GateIntent | ISet<PoseKey>

/**
 * The Host's demand for one dimension: **a merge of the parameter interfaces its facets contribute**,
 * each optional.
 *
 * ## Why this is a `Map` and not a plain record
 *
 * The record a caller writes and the value a save round-trips through both have to be **the same kind
 * of thing**, or `fromJS(toJS(x))` cannot be `is()`-equal to `x` — which
 * `test/coordinator-state.property.test.ts` asserts and which the whole save path rests on. An
 * Immutable `Record`'s equality does not recurse into a plain object held in one of its fields, so a
 * demand stored as `{ Target: 1 }` and rebuilt as one compares unequal to itself even though both
 * serialise identically. A `Map` is the value that compares by content at every depth.
 *
 * **A plain record is still what a caller writes** — {@link ToIntent} takes one — because that is the
 * shape §6.5 states and the shape a console session types. The conversion happens once, at the write,
 * and the store only ever holds the canonical form.
 *
 * Every field is optional because a dimension composes only the facets it needs: `Sight` carries a
 * `Target` and cannot carry an `Intent`, `Speech` the reverse, and `Struggle` carries both. A parameter
 * outside a dimension's facets is **refused at write time** rather than stored and ignored (§6.6).
 */
export type Intent = IMMap<IntentParameter, IntentValue>

/** The Host's demand, keyed by dimension. Sparse: an absent key is the baseline. */
export type IntentMap = ReadonlyMap<DimensionId, Intent>

/** The semantic extra fields, keyed by dimension. */
export type ConfigMap = ReadonlyMap<DimensionId, Config>

interface _ControlState {
    readonly intent: IMMap<DimensionId, Intent>
    readonly config: IMMap<DimensionId, Config>
}

/**
 * The dossier: what the Host demands of this character on this attempt.
 *
 * Nothing about the equipment is in here (§6.12, clause 4), and nothing about quests is either —
 * knowledge and keys are the other half of the coordinator's state (§7.1) and route 1 keeps them.
 *
 * ### Immutable, because every write has to produce a comparable tree
 *
 * A dossier is read by the router on every resolution and written by a console or a quest, so the two
 * must not see each other's half-finished edits. An Immutable record gives that for free: a write
 * produces a new tree and the module swaps its reference, so a caller holding the result of a read is
 * holding the state as it was.
 */
export type ControlState = RecordOf<_ControlState>

/**
 * Coerces one persisted `config` value, or reports it as unusable.
 *
 * A save is not a trusted input: a config value can be anything a past build, another mod or a
 * hand-edited file put there. Coercion drops what the shape cannot carry rather than throwing — the
 * coordinator starts on the game's own load path, and a throw there becomes a crash report rather
 * than a message.
 */
const ReadConfigValue = (value: unknown): { readonly ok: true, readonly Value: ConfigValue } | { readonly ok: false } => {
    if (value === null) {
        return { ok: true, Value: null }
    }
    const type = typeof value
    if (type === 'string' || type === 'number' || type === 'boolean') {
        return { ok: true, Value: value as ConfigValue }
    }
    if (Array.isArray(value)) {
        const items: ConfigValue[] = []
        for (const entry of value) {
            const read = ReadConfigValue(entry)
            if (!read.ok) {
                return { ok: false }
            }
            items.push(read.Value)
        }
        return { ok: true, Value: items }
    }
    return { ok: false }
}

const ReadConfig = (value: unknown): Config | undefined => {
    if (value == null || typeof value !== 'object' || Array.isArray(value)) {
        return undefined
    }
    const config: Record<string, ConfigValue> = {}
    for (const [field, entry] of Object.entries(value as Record<string, unknown>)) {
        const read = ReadConfigValue(entry)
        if (read.ok) {
            config[field] = read.Value
        }
    }
    return config
}

/**
 * Reads one persisted `Target`, or reports it as unusable.
 *
 * A `Rate` parameter is a number in 0..1, so a string, a `NaN` or an out-of-range value is not a
 * weaker form of the demand — it is a different kind of thing, and the baseline is the honest answer
 * rather than a clamp. Clamping would turn a corrupt save into a *valid but unintended* demand, which
 * is the failure mode that looks like working code.
 */
const ReadRateDemand = (value: unknown): number | undefined =>
    typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 1
        ? value
        : undefined

/**
 * Reads one persisted `Allowed`, keeping the members this build knows and dropping the rest.
 *
 * A pose off a save is as untrusted as a `Target` and for the same reason, and the coercion is
 * per member rather than all-or-nothing: a save written by a build that governed a pose this one
 * does not would otherwise lose the whole set because of one name. Dropping the unknown member is
 * the honest reading — the set is a permission, and a permission this build cannot express is not
 * a permission it can grant.
 *
 * **An empty set is kept rather than read as an absence.** *"Permit nothing"* is a demand, and an
 * absent `Allowed` is the ladder — so collapsing the two would make the one value the Host can use
 * to ask for nothing unreachable, which is the same absence-versus-zero distinction a `Target`
 * draws.
 *
 * Either shape reaches here: an array, which is what {@link FromIntent} writes and what a plain
 * record a caller typed carries, or the canonical `Set` a live dossier holds.
 */
const ReadPostureDemand = (value: unknown): ISet<PoseKey> | undefined => {
    if (!(value instanceof ISet) && !Array.isArray(value)) {
        return undefined
    }
    const members = value instanceof ISet ? (value as ISet<unknown>) : (value as readonly unknown[])
    return ISet<PoseKey>().withMutations(poses => {
        for (const pose of members) {
            if (IsPoseKey(pose)) {
                poses.add(pose)
            }
        }
    })
}

/**
 * Reads one persisted intent record, keeping only what the shape can carry. *
 * **Which fields are read is fixed here**, and deliberately not narrowed by the descriptor: this is
 * the *load* path, and a dimension whose facets changed between releases would otherwise have its
 * stored parameters dropped by the reader before any migration could see them. The write path is
 * where a parameter the dimension does not take is refused (§6.6), because that is a caller who can
 * be told; a save is not a caller.
 *
 * The `Intent` field is checked with `IsGateIntent` rather than cast, for the same reason a config
 * value is checked: a value off a save is not trusted, and `GateIntent` is a three-member vocabulary
 * that a cast would let anything into.
 */
export const ReadIntent = (value: unknown): Intent | undefined => {
    if (value == null || typeof value !== 'object' || Array.isArray(value)) {
        return undefined
    }
    // Either shape reaches here — the canonical `Map` from a live dossier, or the plain record a save
    // carries — so the reading is expressed as one `get` rather than as two branches that could drift.
    const source: { get: (_: string) => unknown } = value instanceof IMMap
        ? (value as IMMap<string, unknown>)
        : { get: (key: string) => (value as Record<string, unknown>)[key] }
    return IMMap<IntentParameter, IntentValue>().withMutations(intent => {
        const target = ReadRateDemand(source.get('Target'))
        if (target !== undefined) {
            intent.set('Target', target)
        }
        const gate = source.get('Intent')
        if (IsGateIntent(gate)) {
            intent.set('Intent', gate)
        }
        const allowed = ReadPostureDemand(source.get('Allowed'))
        if (allowed !== undefined) {
            intent.set('Allowed', allowed)
        }
    })
}

/**
 * The canonical `Intent` for a plain record a caller wrote.
 *
 * **Unchecked**, because it is the *shape* conversion and not the rule: the write validator is what
 * decides whether the parameters are ones the dimension takes, and this runs beside it rather than
 * instead of it. Keeping the two apart is what lets a caller see a refusal naming its own parameter
 * rather than finding its record silently emptied.
 *
 * A record always becomes a `Map`, even an empty one, so an empty demand is a value rather than an
 * absence and two demands compare like with like.
 */
export const ToIntent = (value: unknown): Intent =>
    ReadIntent(value) ?? IMMap<IntentParameter, IntentValue>()

/**
 * A canonical `Intent` as a plain record, for a caller that wants to read a demand rather than hold it.
 *
 * The inverse of {@link ToIntent}, and the only place the store's representation is turned back into the
 * shape §6.5 states — so a console report, a test's snapshot and a caller's comparison all read the same
 * form without each writing its own conversion.
 */
export const FromIntent = (intent: Intent): IntentRecord => {
    const record: { Target?: number, Allowed?: readonly PoseKey[], Intent?: GateIntent } = {}
    const target = intent.get('Target')
    if (typeof target === 'number') {
        record.Target = target
    }
    const gate = intent.get('Intent')
    if (IsGateIntent(gate)) {
        record.Intent = gate
    }
    // Emitted as an array rather than as the canonical `Set`: this is the shape §6.5 states and
    // the shape a console session types, and `ReadPostureDemand` accepts both, so the round trip
    // is exact either way.
    const allowed = intent.get('Allowed')
    if (allowed instanceof ISet) {
        record.Allowed = [...allowed]
    }
    return record
}

/**
 * Rebuilds the two maps from whatever a save produced.
 *
 * **The coercion is load-bearing, and it is the one trap in this shape.** A Record's `toJS()` does not
 * recurse deeply enough for a `fromJS` that reads nested fields: the value it produces for a field
 * holding an Immutable `Map` is that `Map`, not a plain object — so a reader that expected `{intent,
 * config}` would find neither, and every dimension would silently read its baseline. Converting first
 * is what makes the round trip exact, and it is why this file owns the conversion rather than each
 * call site.
 *
 * A dimension this build does not know is **kept as it is** rather than dropped. Dropping it would
 * lose another release's setting the moment this build saved over the file — and the load gate already
 * refuses a save from a root this build cannot place, so an unknown key here means an id the catalogue
 * moved, which the migration chain is the answer to rather than a silent delete.
 */
const ControlStateFields = (
    untyped?: unknown
): Partial<_ControlState> => {
    const source = PlainValue(untyped) as { readonly intent?: unknown, readonly config?: unknown } | undefined
    const intent = IMMap<DimensionId, Intent>().withMutations(map => {
        const entries = source?.intent
        if (entries == null || typeof entries !== 'object') {
            return
        }
        for (const [dimension, value] of Object.entries(entries as Record<string, unknown>)) {
            const read = ReadIntent(value)
            if (read != null) {
                map.set(dimension, read)
            }
        }
    })

    const config = IMMap<DimensionId, Config>().withMutations(map => {
        const entries = source?.config
        if (entries == null || typeof entries !== 'object') {
            return
        }
        for (const [dimension, value] of Object.entries(entries as Record<string, unknown>)) {
            const read = ReadConfig(value)
            if (read != null) {
                map.set(dimension, read)
            }
        }
    })

    return { intent, config }
}

/** One field value with any Immutable collection flattened, so a reader sees plain values. */
const PlainValue = (value: unknown): unknown => {
    if (Array.isArray(value)) {
        return value.map(PlainValue)
    }
    if (value != null && typeof value === 'object' && typeof (value as { toJS?: unknown }).toJS === 'function') {
        return PlainValue((value as { toJS: () => unknown }).toJS())
    }
    return value
}

/**
 * Builds the control-state Record type together with the `fromJS` that rebuilds it from the
 * `toJS()` form a save holds.
 *
 * ## Why `fromJS` returns a **constructed** Record rather than a field bag
 *
 * A `Record` factory's `fromJS` has to hand back a complete value, and that value has to be the Record
 * itself — not a plain object of field values. The difference is not cosmetic: a nested Record stored
 * as a plain object has no `toJS()`, so the *parent's* `toJS()` cannot recurse into it and a state
 * that looked loaded is not round-trippable. Reading and constructing are two steps, and a shape that
 * skips the second is the one that fails `fromJS(toJS(x))` — which is exactly why that property exists.
 *
 * The coercion in {@link ControlStateFields} has the matching job in the other direction: a Record's
 * `toJS()` does not recurse deep enough for this reader, so the field bag it is handed can hold an
 * Immutable `Map` where a plain object was expected.
 */
const DefineControlState = () => {
    const record = IMRecord<_ControlState>({ intent: IMMap(), config: IMMap() })
    return Object.assign(record, {
        fromJS: (js?: unknown): ControlState =>
            record(ControlStateFields(js)) as ControlState,
    })
}

/**
 * The record constructor for a dossier. Called with no fields it is **empty** — every dimension
 * at its baseline — and its `fromJS` rebuilds the two maps from what a save carried.
 */
export const ControlState = DefineControlState()

/**
 * The baseline severity: **no effect at all**.
 *
 * 0 is the baseline rather than a magic number, and it is why `Free` means "inject nothing" rather
 * than "inject zero": the restraint template's own defaults are always the floor, and the controller
 * adds on top of them rather than replacing them.
 */
export const Baseline = 0

/** The baseline gate: the Host is not engaging this dimension. */
export const BaselineGate: GateIntent = GateIntent.Free

/**
 * One dimension's whole intent record, defaulting to the baseline.
 *
 * The default is not a fallback for a missing feature — it is the design: an absent entry and an
 * explicitly empty one are the same statement, and only one of them is worth writing down.
 */
export const GetIntent = (state: ControlState, dimension: DimensionId): Intent =>
    state.intent.get(dimension) ?? IMMap<IntentParameter, IntentValue>()

/**
 * One dimension's **rate demand**, or `undefined` when the Host has not asked for one.
 *
 * `undefined` and `0` are different answers and the difference is the baseline's whole point: nothing
 * demanded is an *absence of effect*, while a demand of 0 is a Host who explicitly asked for none.
 * Only one of those can be released by removing equipment.
 */
export const GetTargetDemand = (state: ControlState, dimension: DimensionId): number | undefined => {
    const target = state.intent.get(dimension)?.get('Target')
    return typeof target === 'number' ? target : undefined
}

/**
 * One dimension's **gate demand**, or `undefined` when the Host has not asked for one.
 *
 * `undefined` reads as `Free` at the point of resolution, not here: keeping the absence visible is what
 * lets a caller tell "the Host said nothing" from "the Host said `Free`", which is the same distinction
 * {@link GetTargetDemand} draws.
 */
export const GetGateIntent = (state: ControlState, dimension: DimensionId): GateIntent | undefined => {
    const gate = state.intent.get(dimension)?.get('Intent')
    return IsGateIntent(gate) ? gate : undefined
}

/**
 * One dimension's **posture demand**, or `undefined` when the Host has not asked for one.
 *
 * The same absence-versus-empty distinction {@link GetTargetDemand} draws between nothing and
 * zero, one facet over: `undefined` is *nothing was asked*, which resolves to the dimension's
 * **ladder**, while an empty set is *the Host asked for no pose at all* — a real demand, and the
 * one the router's non-empty sentinel exists to answer (§6.7, invariant 23).
 *
 * **The conversion is the read boundary, and it is deliberate.** The store holds an Immutable
 * `Set` because `fromJS(toJS(x))` has to compare equal to `x` (see {@link Intent}), while every
 * mechanism above it speaks the plain `ReadonlySet` shape §6.5 states — so the swap happens once,
 * here, rather than each caller meeting two set types it has to tell apart.
 */
export const GetPostureDemand = (state: ControlState, dimension: DimensionId): ReadonlySet<PoseKey> | undefined => {
    const allowed = state.intent.get(dimension)?.get('Allowed')
    return allowed instanceof ISet ? new Set<PoseKey>(allowed) : undefined
}

/** One dimension's semantic extra fields. An absent declaration is an empty one. */
export const GetConfig = (state: ControlState, dimension: DimensionId): Config =>
    state.config.get(dimension) ?? {}

/**
 * Whether a config object declares only fields the dimension actually has.
 *
 * A field the descriptor does not declare is a semantic the dimension does not carry, so the write is
 * refused rather than stored where nothing will ever read it.
 */
export const ConfigFits = (config: Config, declared: ConfigField | undefined): boolean => {
    const fields = Object.keys(config)
    if (fields.length === 0) {
        return true
    }
    if (declared == null) {
        return false
    }
    return fields.every(field => declared[field] === true)
}

/**
 * The capability the worn set offers for each dimension, from a list of bids.
 *
 * ## Why the mode belongs to the bid
 *
 * **[既有] The base game's own aggregates do not agree with one another** (§6.7): a `gag` is a sum
 * with a saturating floor, a blind level a count and a maximum at once, a deaf level a weighted
 * maximum plus a weighted sum. One combining rule cannot reproduce all three, so **the winning
 * bid's {@link StackMode} governs that dimension's aggregate** and this function is total over the
 * modes rather than over one.
 *
 * | Mode | The capability |
 * | --- | --- |
 * | `Max` | the highest bid's power — the default, and the base game's own `getArmsBound` convention |
 * | `Sum` | the sum of every bid's power — the `gag`, and a blind level's count half |
 *
 * **There is no `Count` mode**, and that is a statement about the equipment this mod builds rather
 * than a simplification: a count aggregates the *number* of contributing items, which only means
 * anything if a piece's contribution is a fixed step — and a piece here declares a **power**, so
 * two pieces of a kind are stronger because their powers add. A count is a sum in which every
 * contributor bids the same step, so a family that wants one writes the step.
 *
 * The result is **not clamped here**: the router clamps, exactly as it does for a Host demand, so
 * the arithmetic and the rule about the range stay in one place each. The dimension's engine value
 * map is what turns the clamped aggregate into the number the engine reads.
 *
 * This is a pure function of the bids, which is the point: there is nothing to invalidate, because
 * there is nothing cached.
 *
 * @param bids - What the caller observed the worn set declaring. Entries for the same dimension may
 *   repeat, and their order is the tie-break for equal power under `Max`.
 * @param mode - How they stack. **The winning bid's mode**, decided by the router before this
 *   runs — so it is an argument here rather than a field read off each bid, and one call cannot
 *   mix two rules.
 * @returns The capability per dimension. A dimension nobody bid on is absent rather than zero.
 */
export const AggregateBids = (
    bids: Iterable<{ readonly Dimension: DimensionId, readonly Power: number }>,
    mode: StackMode
): ReadonlyMap<DimensionId, number> => {
    const aggregate = new Map<DimensionId, number>()
    for (const bid of bids) {
        const held = aggregate.get(bid.Dimension)
        if (mode === StackMode.Sum) {
            aggregate.set(bid.Dimension, (held ?? 0) + bid.Power)
            continue
        }
        if (held == null || bid.Power > held) {
            aggregate.set(bid.Dimension, bid.Power)
        }
    }
    return aggregate
}

/**
 * One dimension's permitted poses from what the worn set declared.
 *
 * **An intersection, and the reason is the art** (§6.7): a pose is a sprite variable, and an item
 * that does not allow a pose may not carry the variable for it at all — so permitting a pose the
 * worn set cannot draw would produce a state the renderer cannot represent. The worn set's
 * capability is therefore what **all** of its providers can deliver.
 *
 * A provider that declares no `Allowed` at all is **not consulted**: it says nothing about body
 * configurations, which is a different statement from *"nothing is permitted"*, and reading the
 * silence as a refusal would make every provider that only bids on a rate empty the ladder.
 *
 * @param bids - What the caller observed the worn set declaring. Entries for other dimensions are
 *   ignored, so a caller may pass a whole list.
 * @param dimension - The posture dimension to intersect for.
 * @returns The intersection, or `undefined` when **no** bid spoke to it — which the router reads
 *   as the dimension's ladder (§6.7).
 */
export const IntersectPostures = (
    bids: Iterable<{ readonly Dimension: DimensionId, readonly Allowed?: readonly PoseKey[] | undefined }>,
    dimension: DimensionId
): ReadonlySet<PoseKey> | undefined => {
    let intersection: Set<PoseKey> | undefined
    for (const bid of bids) {
        if (bid.Dimension !== dimension || bid.Allowed === undefined) {
            continue
        }
        if (intersection === undefined) {
            intersection = new Set(bid.Allowed)
            continue
        }
        const declared = new Set(bid.Allowed)
        for (const pose of intersection) {
            if (!declared.has(pose)) {
                intersection.delete(pose)
            }
        }
    }
    return intersection
}
