/**
 * Choosing which provider to put on the body: a predicate over candidates rather than a router. The
 * router answers one dimension at a time, given a demand and every bid; it cannot answer which of
 * two visors to wear, because that is a question about a set of dimensions at once.
 * @module FactionMachine/MachinePrime/Coordinator/Public/Selection
 */

import { DimensionResolution } from '../../../../KDExtension/Control'
import { Resolve } from './Control'

/** One thing that could be equipped, described by the dimensions it would cover. */
export interface SelectableProvider {
    /** A readable name, so a caller can log or display what it picked. */
    readonly Source: string
    /** The dimensions this candidate would be a provider of. */
    readonly Dimensions: readonly string[]
}

/**
 * Picks a candidate whose covered dimensions the Host's demand can actually be honoured on. The
 * rule is a filter, not a ranking: a candidate qualifies when the router engages at least one of
 * its dimensions, and the first qualifying candidate is returned, so order is the caller's. When no
 * candidate covers an engaged dimension, the first one is returned anyway — equipping while the
 * Host is not engaged injects nothing. A caller that needs strict refusal asks {@link WhichQualify}
 * instead and gets an empty list.
 * @param candidates - What could be equipped, in the caller's own preference order.
 * @returns The chosen candidate, or `null` when there were none.
 */
export const SelectProvider = <Candidate extends SelectableProvider>(
    candidates: readonly Candidate[]
): Candidate | null => {
    const qualifying = WhichQualify(candidates)
    if (qualifying.length > 0) {
        return qualifying[0]
    }
    return candidates.length > 0 ? candidates[0] : null
}

/**
 * Every candidate whose covered dimensions the Host's demand can be honoured on. A candidate
 * qualifies when at least one of its dimensions resolves as engaged. An empty list is a real answer
 * — the Host is not interested in anything on offer — and differs from "there were no candidates",
 * which is why the caller sees a list rather than a single value.
 * @param candidates - What could be equipped.
 * @returns The qualifying candidates, in the order they were passed.
 */
export const WhichQualify = <Candidate extends SelectableProvider>(
    candidates: readonly Candidate[]
): Candidate[] =>
    candidates.filter(candidate =>
        candidate.Dimensions.some(dimension => ResolutionOf(dimension).Engaged)
    )

/**
 * Every candidate's dimensions, resolved: what each option would do under the current demand,
 * before anything is equipped.
 * @param candidates - What could be equipped.
 * @returns One entry per candidate, carrying the resolution of each dimension it would cover.
 */
export const DescribeCandidates = <Candidate extends SelectableProvider>(
    candidates: readonly Candidate[]
): readonly { readonly candidate: Candidate, readonly resolutions: readonly DimensionResolution[] }[] =>
    candidates.map(candidate => ({
        candidate,
        resolutions: candidate.Dimensions.map(ResolutionOf),
    }))

/**
 * One dimension's resolution, with an unknown dimension reported rather than thrown. `Resolve`
 * throws for a dimension this build does not know, and a selection helper is the wrong place for a
 * throw: the candidate simply does not qualify. The fallback is empty rather than baseline, because
 * an unregistered dimension has no facets, so there is nothing to report a baseline of.
 */
const ResolutionOf = (dimension: string): DimensionResolution => {
    try {
        return Resolve(dimension)
    }
    catch {
        return {
            Winner: null,
            Losers: [],
            Config: {},
        }
    }
}
