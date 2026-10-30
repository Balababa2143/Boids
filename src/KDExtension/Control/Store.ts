/**
 * The persisted control state: a per-dimension demand, and a per-dimension set of extra fields.
 * @module KDExtension/Control/Store
 */

import { Map as IMMap, Set as ISet, Record as IMRecord, RecordOf } from 'immutable'
import { ConfigField } from './Descriptor'
import { GateIntent, IsGateIntent, StackMode } from './Facet'
import { DimensionId } from './Identity'
import { IsPoseKey, PoseKey } from './Pose'

/** One config field's value. */
export type ConfigValue = string | number | boolean | null | readonly ConfigValue[]

/** A dimension's semantic extra fields, as they are persisted. */
export type Config = Readonly<Record<string, ConfigValue>>

/** The parameter `Rate` contributes to an intent: how hard to squeeze, 0..1. */
export interface IntentRate {
    readonly Target?: number | undefined
}

/**
 * The parameter `Gate` contributes: which permission applies.
 *
 * The field is called `Intent` because the enclosing record is the demand; `GateIntent` is the three
 * values this one facet of it can take.
 */
export interface IntentGate {
    readonly Intent?: GateIntent | undefined
}

/**
 * The parameter `Whitelist` contributes: none.
 *
 * What a whitelist re-grants is the equipment's declaration, read from what is worn, so the Host's
 * only lever over it is the gate in front of it.
 */
export interface IntentWhitelist { }

/** The parameter `Posture` contributes: which body configurations are permitted, by pose. */
export interface IntentPosture {
    readonly Allowed?: readonly PoseKey[] | undefined
}

/** The parameters a composed demand can carry: the union of every facet's own. */
export interface IntentParameters extends IntentRate, IntentPosture, IntentGate, IntentWhitelist { }

/** The Host's demand as a plain record, which is the shape a caller writes and reads. */
export type IntentRecord = IntentParameters

/** One intent parameter's name. */
export type IntentParameter = keyof IntentParameters

/** One intent parameter's value, as a caller supplies it in a plain record. */
export type IntentValue = number | GateIntent | ISet<PoseKey>

/**
 * The Host's demand for one dimension, held as a `Map` so that it compares by content at every
 * depth: the save round trip asserts `fromJS(toJS(x))` equals `x`, and an Immutable `Record`'s
 * equality does not recurse into a plain object in one of its fields.
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
 * What the Host demands of this character on this attempt.
 *
 * Immutable, so a value a caller is holding is never edited under it.
 */
export type ControlState = RecordOf<_ControlState>

/** Coerces one persisted `config` value, dropping what the shape cannot carry. */
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
 * Reads one persisted `Target`, or `undefined` when it is not a number in 0..1.
 *
 * An unusable value is dropped rather than clamped: a clamp would turn a corrupt save into a valid
 * but unintended demand.
 */
const ReadRateDemand = (value: unknown): number | undefined =>
    typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 1
        ? value
        : undefined

/**
 * Reads one persisted `Allowed`, keeping the members this build knows and dropping the rest.
 *
 * The reading is per member: one pose this build cannot express would otherwise lose the whole set.
 * An empty set is kept rather than read as an absence — "permit nothing" is a demand, and an absent
 * `Allowed` is the ladder.
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
 * Reads one persisted intent record, keeping only what the shape can carry.
 *
 * Which fields are read is fixed here rather than narrowed by the descriptor: this is the load path,
 * and a dimension whose facets changed between releases would otherwise lose its stored parameters
 * before any migration could see them.
 */
export const ReadIntent = (value: unknown): Intent | undefined => {
    if (value == null || typeof value !== 'object' || Array.isArray(value)) {
        return undefined
    }
    // One `get` covers both shapes that reach here: a live dossier's `Map`, and a save's plain record.
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
 * Unchecked: the write validator decides whether the parameters are ones the dimension takes, so a
 * caller hears a refusal naming its own parameter instead of finding its record emptied.
 */
export const ToIntent = (value: unknown): Intent =>
    ReadIntent(value) ?? IMMap<IntentParameter, IntentValue>()

/** A canonical `Intent` as a plain record, the inverse of {@link ToIntent}. */
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
    // An array rather than the canonical `Set`: `ReadPostureDemand` accepts both, so the round trip is
    // exact either way.
    const allowed = intent.get('Allowed')
    if (allowed instanceof ISet) {
        record.Allowed = [...allowed]
    }
    return record
}

/**
 * Rebuilds the two maps from whatever a save produced.
 *
 * The flattening is load-bearing: a Record's `toJS()` leaves a nested `Map` in place, so a reader
 * that does not flatten first finds no entries and every dimension reads its baseline.
 *
 * A dimension this build does not know is kept rather than dropped, or another release's setting
 * would be lost the moment this build saved over the file.
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
 * Builds the control-state `Record` type with the `fromJS` that rebuilds it from a save.
 *
 * `fromJS` has to hand back a constructed Record rather than a field bag: a nested Record left as a
 * plain object has no `toJS()`, and the round trip fails.
 */
const DefineControlState = () => {
    const record = IMRecord<_ControlState>({ intent: IMMap(), config: IMMap() })
    return Object.assign(record, {
        fromJS: (js?: unknown): ControlState =>
            record(ControlStateFields(js)) as ControlState,
    })
}

/**
 * The record constructor for a dossier. Called with no fields it is empty — every dimension at its
 * baseline — and its `fromJS` rebuilds the two maps from what a save carried.
 */
export const ControlState = DefineControlState()

/**
 * The baseline severity: no effect at all.
 *
 * 0 is the floor the restraint template's own defaults sit at, and the controller adds on top of them
 * rather than replacing them.
 */
export const Baseline = 0

/** The baseline gate: the Host is not engaging this dimension. */
export const BaselineGate: GateIntent = GateIntent.Free

/** One dimension's intent record, empty when the Host has said nothing. */
export const GetIntent = (state: ControlState, dimension: DimensionId): Intent =>
    state.intent.get(dimension) ?? IMMap<IntentParameter, IntentValue>()

/**
 * One dimension's rate demand, or `undefined` when none was made.
 *
 * `undefined` and `0` differ: nothing demanded is an absence, zero is a demand for no effect.
 */
export const GetTargetDemand = (state: ControlState, dimension: DimensionId): number | undefined => {
    const target = state.intent.get(dimension)?.get('Target')
    return typeof target === 'number' ? target : undefined
}

/**
 * One dimension's gate demand, or `undefined` when none was made.
 *
 * `undefined` reads as `Free` at resolution rather than here, so a caller can still tell "the Host
 * said nothing" from "the Host said `Free`".
 */
export const GetGateIntent = (state: ControlState, dimension: DimensionId): GateIntent | undefined => {
    const gate = state.intent.get(dimension)?.get('Intent')
    return IsGateIntent(gate) ? gate : undefined
}

/**
 * One dimension's posture demand, or `undefined` when none was made.
 *
 * An empty set is a demand for no pose; `undefined` leaves the dimension's ladder in place. The set
 * is copied out, so a caller never holds the stored value.
 */
export const GetPostureDemand = (state: ControlState, dimension: DimensionId): ReadonlySet<PoseKey> | undefined => {
    const allowed = state.intent.get(dimension)?.get('Allowed')
    return allowed instanceof ISet ? new Set<PoseKey>(allowed) : undefined
}

/** One dimension's semantic extra fields. An absent declaration is an empty one. */
export const GetConfig = (state: ControlState, dimension: DimensionId): Config =>
    state.config.get(dimension) ?? {}

/**
 * Whether a config object declares only fields the dimension has.
 *
 * A field the descriptor does not declare is refused rather than stored where nothing will read it.
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
 * The base game's own aggregates combine differently per kind, so the winning bid's {@link StackMode}
 * governs a dimension's aggregate. The result is not clamped here: the router clamps, and the
 * dimension's engine value map turns the aggregate into the number a seam reads.
 *
 * @param bids - What the caller observed the worn set declaring. One dimension may appear more than
 *   once, and their order breaks a tie of equal power under `Max`.
 * @param mode - How they stack, decided by the router — so one call cannot mix two rules.
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
 * One dimension's permitted poses, intersected across the bids that declare them.
 *
 * An item that does not allow a pose may not carry the sprite variable for it, so the capability is
 * what every declaring provider can deliver. A provider that declares no `Allowed` is not consulted:
 * silence is not a refusal, or every provider bidding only on a rate would empty the ladder.
 *
 * @param bids - What the caller observed. Entries for other dimensions are ignored.
 * @returns The intersection, or `undefined` when no bid spoke to this dimension.
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
