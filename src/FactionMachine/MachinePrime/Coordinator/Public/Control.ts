/**
 * The control facade: the Host's dossier, and the resolved answer for a dimension. `SetIntent` and
 * `SetConfig` are the only writes, and each runs its validator before the write and returns the
 * refusal rather than storing a value the rules do not allow — a refusal is a value and not a
 * throw, because these are console entry points. `Resolve` computes the answer from the dossier,
 * the descriptors and what is worn right now, so there is no cached value to invalidate.
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
 * shape on the surface it drives. It is defined in `Coordinator/Provider` because the membership
 * walk and this facade must not depend on each other.
 */
export type { ProviderDeclaration } from '../Provider'

/**
 * The Host's dossier for the active character: the live tree, not a copy, so a caller holding a
 * read result holds the state as it was.
 */
export const GetDossier = (): ControlState => GetState().ActivePC.Control

/**
 * The refusal for an id that is not a dimension this build knows, reported rather than thrown
 * because `GetDimension` throws.
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
 * Records the Host's demand for one dimension. The write validators run first, and a refusal is
 * returned instead of the value being stored. The demand is a record rather than a value, because a
 * dimension composes facets: a parameter the dimension does not take is refused rather than stored
 * and ignored, and an empty record means the baseline, which is how a demand is removed. The grant
 * is read, never supplied: an `OverrideAllowed` demand makes this enumerate the worn set once and
 * take the promise on the dimension's own channel.
 * @param args.dimension - The dimension to write. Must be registered, or the write is refused.
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
    // Read the promise only where one is being made: a rate or posture demand does not walk the
    // body, and a malformed intent is left to the validator.
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
            // Canonicalised through the same reader the load path uses, so a caller cannot smuggle
            // a parameter the validator never saw into a save.
            WithIntent(state.ActivePC.Control, dimension, ToIntent(intent))
        )
    )
    return Accepted
}

/**
 * Records the semantic extra fields a dimension's facets need. The same contract as
 * {@link SetIntent}: a field the descriptor does not declare is refused rather than stored where
 * nothing will read it.
 * @param args.dimension - The dimension the config belongs to.
 * @param args.config - The fields to record; an empty object clears them, which is how a config is
 *   removed.
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
 * Every provider bid the worn set is declaring right now. Re-exported so a caller resolving several
 * dimensions per event can walk the body once and pass the same list to each resolution.
 * @returns The bids, in wear order, which is the tie-break for equal power.
 */
export const FindProviders = (): readonly ProviderBid[] => FindWornProviders()

/**
 * Resolves one dimension: the Host's demand, what the equipment offers, and which provider won. The
 * bids are enumerated fresh from the worn set unless the caller supplies them, so the answer is a
 * function of the body as it is.
 * @param dimension - The dimension to resolve. Must be registered — `GetDimension` throws for one
 *   that is not.
 * @param bids - The bids to resolve against. Omitted means "ask the body".
 */
export const Resolve = (
    dimension: string,
    bids?: readonly ProviderBid[]
): DimensionResolution => ResolveDimension(dimension, GetDossier(), bids ?? FindWornProviders())
