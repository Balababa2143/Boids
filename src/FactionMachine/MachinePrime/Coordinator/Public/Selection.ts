/**
 * Choosing *which* provider to put on the body — the half of §6.7 that is not the router.
 *
 * ## Why this is not the router
 *
 * The router answers **one dimension at a time**: given a dimension, the Host's demand for it, and
 * every bid, which bid wins and what the loser still gets to say. It cannot answer "*which of these
 * two visors should she wear*", because that is a question about a whole set of dimensions at once
 * and the router has no notion of an item that covers several of them.
 *
 * So selection is a **predicate over candidates**, and it is deliberately thin: it asks the router
 * about each candidate's dimensions and keeps the ones the Host's demand can be honoured on. The
 * value of writing it down rather than inlining it in a demo is that it is the shape any later
 * caller needs — a quest choosing a piece from a class, the projection layer choosing a stage, a
 * debug entry point choosing a visor — and it is drivable from the console, which is what §6.7
 * requires of everything in this layer.
 *
 * ## What it does not do yet
 *
 * It does not read the *bid power* to rank candidates against each other, because in this delivery
 * a candidate's own bid is only ever compared with another worn item's, and two candidates are by
 * definition not both worn. Ranking becomes meaningful the moment gear can be offered in tiers, which
 * is Phase 4's ladder.
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
 * Picks a candidate whose covered dimensions the Host's demand can actually be honoured on.
 *
 * **The rule is a filter, not a ranking**, and it is stated as one so it cannot pretend to be more:
 * a candidate qualifies when the router engages at least one of its dimensions, and the first
 * qualifying candidate is returned. Order is the caller's, and a caller that cares about order says
 * so by the order it passes.
 *
 * The fallback is deliberate and spelled out rather than hidden: **when no candidate covers an
 * engaged dimension, the first one is returned anyway.** That is the right answer for a caller
 * presenting a set that has to contain something — a demo that equips a full outfit — because
 * equipping a piece while the Host is not engaged is harmless: `Free` means the controller injects
 * nothing, so the piece is worn and the game behaves exactly as it would with no mod installed. A
 * caller that needs strict refusal asks {@link WhichQualify} instead and gets an empty list.
 *
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
 * Every candidate whose covered dimensions the Host's demand can be honoured on.
 *
 * A candidate qualifies when **at least one** of its dimensions resolves as engaged. An empty list
 * is a real answer — it means the Host is not currently interested in anything on offer — and it is
 * distinguishable from "there were no candidates", which is why the caller sees the list rather than
 * a single value.
 *
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
 * Every candidate's dimensions, resolved. Exported because a console reader wants exactly this: what
 * each option *would* do under the current demand, before anything is equipped.
 *
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
 * One dimension's resolution, with an unknown dimension reported rather than thrown.
 *
 * A candidate may name a dimension this build does not know — a family written against a newer
 * catalogue, or a typo in a table. `Resolve` throws for that, and a selection helper is the wrong place
 * for a throw: the honest answer is that the candidate's dimension resolves to nothing the Host is
 * engaged with, so it simply does not qualify.
 *
 * The fallback is **empty rather than baseline**, and that is the difference from
 * `BaselineResolution`: an unregistered dimension has no facets, so there is nothing to report a
 * baseline *of*. A caller reading `Engaged` off it sees `undefined`, which is false in every test
 * that matters and does not pretend to be an answer about a dimension that does not exist.
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
