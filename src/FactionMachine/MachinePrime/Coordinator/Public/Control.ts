/**
 * The control facade: the Host's dossier, and the resolved answer for a dimension.
 *
 * ## Two halves, and why they are two
 *
 * - **What is recorded** — `SetIntent` and `SetConfig`, the only writes. Each runs its write
 *   validator *before* the write and returns the refusal rather than storing a value the rules
 *   do not allow (`design/spec.md` §6.6). A refusal is a value and not a throw, because these are
 *   the console's entry points and a typo must not be a crash.
 * - **What is resolved** — `Resolve`, which computes the answer from the dossier, the descriptors
 *   and **what is worn right now**. It reads no cached value, so adding or removing an item
 *   changes the answer with nothing to invalidate (§6.12).
 *
 * ## Drivable from the console before any UI exists
 *
 * This is a stated requirement rather than a convenience (§6.7). Every function here takes and
 * returns plain data, so a console session can declare an intent, resolve it, and see what the
 * router decided — which is how the property suite exercises it too.
 * @module FactionMachine/MachinePrime/Coordinator/Public/Control
 */

import {
    Config,
    ControlState,
    DimensionResolution,
    GateIntent,
    GetDimension,
    HasDimension,
    IntentRecord,
    ProviderBid,
    Refused,
    Resolve as ResolveDimension,
    ResolveGrant,
    ToIntent,
    ValidateConfigWrite,
    ValidateIntentWrite,
    WithConfig,
    WithIntent,
    WriteOutcome,
    WriteRefusal,
    Accepted,
} from '../../../../KDExtension/Control'
import { GetState, SetState } from '../Internal/StateStorage'
import { FindProviders as FindWornProviders } from '../Membership'
/**
 * One item's declaration that it can move a dimension, re-exported so a console reader finds the
 * shape on the surface it drives.
 *
 * It is **defined** in `Coordinator/Provider` because the membership walk and this facade must not
 * depend on each other; see that module's header.
 */
export type { ProviderDeclaration } from '../Provider'

/**
 * The Host's dossier for the active character.
 *
 * The live tree, not a copy: every write produces a new tree and swaps this module's reference, so
 * a caller that holds onto the result of a read is holding the state as it was rather than a view
 * that will change under it.
 */
export const GetDossier = (): ControlState => GetState().ActivePC.Control

/**
 * The refusal for an id that is not a dimension this build knows.
 *
 * A dossier can carry an id the catalogue moved, and a console caller can mistype one. Both are the
 * same finding — there is no descriptor, so there are no facets to check a value against — and it
 * is reported rather than thrown, because `GetDimension` throws and a console session should
 * survive a typo.
 */
const UnknownDimension = (dimension: string): WriteRefusal | null => {
    if (dimension.length === 0) {
        return Refused('', 'unknown-dimension', 'No dimension was named.')
    }
    if (!HasDimension(dimension)) {
        return Refused(
            dimension,
            'unknown-dimension',
            `'${dimension}' is not a dimension this build registers, so there are no facets to check it against.`
        )
    }
    return null
}

/**
 * Records the Host's demand for one dimension.
 *
 * The write validators run first, and a refusal is returned **instead of** being stored — which is the
 * whole contract: rejection happens where the value is written rather than as a silent runtime failure
 * six calls later.
 *
 * **The demand is a record, not a value**, because a dimension composes facets (`design/spec.md`
 * §6.5): a rate takes a `Target`, a gate an `Intent`, and a dimension that composes both takes both.
 * A parameter the dimension does not take is refused rather than stored and ignored — so
 * `{ Intent: 'OverrideForbidden' }` for a rate-only `Sight` comes back as a refusal naming `Sight`,
 * while `{ Target: 0.4 }` is how a rate dimension's severity is asked for.
 *
 * An empty record is legal and means the baseline, which is how a demand is removed: there is no
 * separate "unset", because an absent entry and an empty one are the same statement.
 *
 * **The grant is read, never supplied.** A caller cannot hand the validator a capability the
 * equipment does not have: when the demand is `OverrideAllowed`, this function enumerates the worn
 * set once and takes the promise on the dimension's own channel. Every other write leaves the body
 * unread, because the grant has no bearing on it.
 *
 * @param args.dimension - The dimension to write. Must be registered, or the write is refused
 *   rather than stored under an id nothing will ever read.
 * @param args.intent - The demand to record.
 * @returns `Accepted`, or the refusal naming the dimension and the rule.
 */
export const SetIntent = (args: {
    readonly dimension: string
    readonly intent: IntentRecord
}): WriteOutcome => {
    const { dimension, intent } = args

    const unknown = UnknownDimension(dimension)
    if (unknown != null) {
        return unknown
    }

    const descriptor = GetDimension(dimension)
    // Read the promise only where a promise is being made. A rate or posture demand does not need
    // the worn set walked, and a malformed intent (including `null`) is left to the validator rather
    // than throwing on the gate lookup.
    const grants = intent?.Intent === GateIntent.OverrideAllowed
        ? ResolveGrant(descriptor, FindWornProviders())
        : new Set<string>()
    const outcome = ValidateIntentWrite(descriptor, intent, grants)
    if (outcome.kind === 'refused') {
        return outcome
    }

    const state = GetState()
    SetState(
        state.setIn(
            ['ActivePC', 'Control'],
            // Converted to the store's canonical form through the same reader the load path uses, so a
            // caller cannot smuggle a parameter the validator's type did not mention into a save.
            WithIntent(state.ActivePC.Control, dimension, ToIntent(intent))
        )
    )
    return Accepted
}

/**
 * Records the semantic extra fields a dimension's facets need.
 *
 * The same contract as {@link SetIntent}: a field the descriptor does not declare is refused
 * rather than stored where nothing will read it.
 *
 * @param args.dimension - The dimension the config belongs to.
 * @param args.config - The fields to record. An empty object clears them, which is how a config is
 *   removed — there is no separate "unset", because a dimension with no entry reads the baseline.
 */
export const SetConfig = (args: {
    readonly dimension: string
    readonly config: Config
}): WriteOutcome => {
    const { dimension, config } = args

    const unknown = UnknownDimension(dimension)
    if (unknown != null) {
        return unknown
    }

    const outcome = ValidateConfigWrite(GetDimension(dimension), config)
    if (outcome.kind === 'refused') {
        return outcome
    }

    const state = GetState()
    SetState(
        state.setIn(['ActivePC', 'Control'], WithConfig(state.ActivePC.Control, dimension, config))
    )
    return Accepted
}

/**
 * Every provider bid the worn set is declaring right now.
 *
 * The enumeration `Resolve` performs itself when it is handed no bids, re-exported so a console
 * caller — or the seam layer that resolves several dimensions per event — can walk the body **once**
 * and pass the same list to each resolution.
 *
 * @returns The bids, in wear order. The order is the tie-break for equal power.
 */
export const FindProviders = (): readonly ProviderBid[] => FindWornProviders()

/**
 * Resolves one dimension: the Host's demand, what the equipment offers, and which provider won.
 *
 * The bids are enumerated fresh from the worn set unless the caller supplies them, so the answer is
 * a function of the body as it is. A caller that needs answers for several dimensions should call
 * the published {@link FindProviders} once and pass the result to each `Resolve`, rather than pay
 * for a worn-set walk per dimension.
 *
 * @param dimension - The dimension to resolve. Must be registered — `GetDimension` throws for one
 *   that is not, because a resolution of an unknown dimension would have to invent its facets.
 * @param bids - The bids to resolve against. Omitted means "ask the body".
 */
export const Resolve = (
    dimension: string,
    bids?: readonly ProviderBid[]
): DimensionResolution => ResolveDimension(dimension, GetDossier(), bids ?? FindWornProviders())
