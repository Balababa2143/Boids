/**
 * The router: which provider wins a dimension, what the loser still gets to say, and what the
 * dimension resolves to. The algebra is per facet, and the bids are handed in, so no answer is
 * cached.
 * @module KDExtension/Control/Router
 */

import { BodyStateName, ResolveBodyState } from './BodyState'
import { CapabilityKey } from './Capability'
import { AllDimensions, EngineIdentity, GetDimension } from './Descriptor'
import { CanDeny, CanGrant, FacetName, GateIntent, StackMode } from './Facet'
import { GrantKeys, ResolveGrant } from './Grant'
import { DimensionId } from './Identity'
import { PoseKey } from './Pose'
import {
    AggregateBids,
    Baseline,
    BaselineGate,
    Config,
    ControlState,
    GetConfig,
    GetGateIntent,
    GetPostureDemand,
    GetTargetDemand,
    IntersectPostures,
} from './Store'

/** One declaration that an item can move a dimension. */
export interface ProviderBid {
    /** Which dimension the provider speaks to. */
    readonly Dimension: DimensionId
    /** How much capability it offers: higher wins, and power is only ever compared, so its scale is the family's. */
    readonly Power: number
    /** How this bid stacks when it wins: the winner's mode governs the whole aggregate. */
    readonly Stack: StackMode
    /**
     * The body configurations this provider can deliver, on a posture dimension's own axis; `undefined`
     * says nothing, which differs from "none are permitted".
     */
    readonly Allowed?: readonly PoseKey[]
    /**
     * The abilities this provider can re-grant, when it speaks to a `Whitelist` dimension; an omission
     * differs from "none".
     */
    readonly Granted?: readonly CapabilityKey[]
    /** What the provider still contributes when it loses: `false` when only the constraint was its contribution. */
    readonly LoserExpresses: boolean
    /** A readable name, so a console reader and a log line can say which item spoke. */
    readonly Source: string
}

/**
 * What the router decided about one dimension. A facet the dimension does not compose is absent, so
 * a caller never has to check the descriptor before reading an answer.
 */
export interface DimensionResolution {
    //#region Rate
    /** The Host's demand as recorded, or `undefined` when nothing was demanded: `undefined` and `0` differ. */
    readonly Demand?: number
    /**
     * The severity a seam receives: the demand clamped to what the gear can do, baseline `0` when none was
     * recorded. The recorded demand is left untouched, which lets it wait.
     */
    readonly Applied?: number
    /** The capability the bids aggregate to: an upper bound on `Applied`, never a demand. */
    readonly Ceiling?: number
    /** What the engine actually reads: `Applied` through the dimension's engine value map. A seam reads this field. */
    readonly Projected?: number
    //#endregion

    //#region Posture
    /** The poses the Host asked to remove or restore, or `undefined` when nothing was asked. */
    readonly PostureDemand?: ReadonlySet<PoseKey>
    /** The poses she may take, and the field the route writes into the game's availability functions. Never empty. */
    readonly Posture?: ReadonlySet<PoseKey>
    /**
     * What the worn set can deliver on its own: the intersection of every provider's `Allowed`, or the
     * ladder when none speaks.
     */
    readonly PostureCeiling?: ReadonlySet<PoseKey>
    //#endregion

    //#region Gate
    /** The Host's permission, with an absent demand read as `Free`. */
    readonly Gate?: GateIntent
    /**
     * Whether the injection layer does anything. `Free` means inject nothing, and the restraint
     * template's defaults stay the floor.
     */
    readonly Engaged?: boolean
    //#endregion

    //#region Whitelist
    /**
     * The abilities the worn set can re-grant: a capability rather than a demand, and where the
     * validator's `grants` is read from.
     */
    readonly Granted?: ReadonlySet<CapabilityKey>
    //#endregion

    /** The bid that won, or `null` when no provider spoke to this dimension at all. */
    readonly Winner: ProviderBid | null
    /** The providers that lost, kept so a loser can still express itself. */
    readonly Losers: readonly ProviderBid[]

    /** The semantic extra fields the dimension declared, or `{}`. */
    readonly Config: Config
}

/** The one dimension nobody registered a descriptor for, refused rather than guessed at. */
export class UnknownDimensionError extends Error {
    readonly Dimension: DimensionId

    constructor(dimension: DimensionId) {
        super(
            `Boids control: no dimension is registered under '${dimension}', so the router cannot ` +
            'resolve it. A dossier carrying an id this build does not know is a finding, not a zero.'
        )
        this.name = 'UnknownDimensionError'
        this.Dimension = dimension
    }
}

/**
 * Resolves one dimension against the Host's demand and the bids it was handed.
 *
 * The winner is decided first, because its stacking mode governs the aggregate a rate resolves against;
 * losers are reported, never instructed.
 *
 * @param bids - Bids for other dimensions are ignored rather than refused, so a caller may pass a whole
 *   list.
 * @throws {UnknownDimensionError} When the dimension is not registered.
 */
export const Resolve = (
    dimension: DimensionId,
    state: ControlState,
    bids: Iterable<ProviderBid>
): DimensionResolution => {
    const descriptor = GetDimension(dimension)
    const config = GetConfig(state, dimension)

    const forThisDimension: ProviderBid[] = []
    for (const bid of bids) {
        if (bid.Dimension === dimension) {
            forThisDimension.push(bid)
        }
    }

    const winner = forThisDimension.reduce<ProviderBid | null>(
        (best, bid) => (best == null || bid.Power > best.Power ? bid : best),
        null
    )
    const losers = forThisDimension.filter(bid => bid !== winner)

    const resolution: MutableResolution = {
        Winner: winner,
        Losers: losers,
        Config: config,
    }

    //#region Rate
    if (descriptor.Facets.has(FacetName.Rate)) {
        // The mode is the winner's; a dimension nobody bid on takes `Max`.
        const capability = Clamp01(
            AggregateBids(forThisDimension, winner?.Stack ?? StackMode.Max).get(dimension) ?? Baseline
        )
        Object.assign(resolution, ResolveNumeric(GetTargetDemand(state, dimension), capability))
        // A seam reads `Projected`; a reader that wants the model's answer reads `Applied`.
        resolution.Projected = (descriptor.EngineValue ?? EngineIdentity)(resolution.Applied ?? Baseline)
    }
    //#endregion

    //#region Posture
    if (descriptor.Facets.has(FacetName.Posture)) {
        Object.assign(resolution, ResolvePosture(descriptor.Ladder ?? [], state, dimension, forThisDimension))
    }
    //#endregion

    //#region Gate
    if (descriptor.Facets.has(FacetName.Gate)) {
        const demand = GetGateIntent(state, dimension)
        const gate = demand ?? BaselineGate

        // A permit is only expressible where the dimension can grant and the worn set still
        // promises something on its channel, so that promise is read at every resolution.
        resolution.Gate = gate
        resolution.Engaged =
            (gate === GateIntent.OverrideForbidden && CanDeny(descriptor.Direction))
            || (gate === GateIntent.OverrideAllowed && CanGrant(descriptor.Direction)
                && ResolveGrant(descriptor, forThisDimension).size > 0)
    }
    //#endregion

    //#region Whitelist
    if (descriptor.Facets.has(FacetName.Whitelist)) {
        resolution.Granted = GrantKeys(dimension, forThisDimension)
    }
    //#endregion

    return resolution
}

/** A resolution being assembled facet by facet, before it is handed back read-only. */
type MutableResolution = {
    -readonly [K in keyof DimensionResolution]: DimensionResolution[K]
}

/** An `Applied` of zero is a real answer rather than a missing one, so the two are defined. */
const IsDefined = <T>(value: T | undefined): value is T => value !== undefined

/**
 * Resolves a `Rate` against the strongest bid.
 *
 * Capability bounds the demand and the recorded demand is kept, so a demand made before the gear can
 * honour it waits. The field is reported only when the Host asked, keeping "nothing demanded" distinct
 * from "a demand of zero".
 */
const ResolveNumeric = (
    demand: number | undefined,
    capability: number
): Partial<DimensionResolution> => ({
    ...(IsDefined(demand) ? { Demand: Clamp01(demand) } : {}),
    Applied: Math.min(Clamp01(demand ?? Baseline), capability),
    Ceiling: capability,
})

/**
 * Resolves a `Posture` against the same bids, on its own axis.
 *
 * The capability is the intersection of every provider that speaks of body configurations, or the ladder
 * when none does. The demand moves that set down under `OverrideForbidden` only.
 *
 * The result is never empty: the game indexes the available set at `[0]`, so the answer falls back to
 * the ladder's first member.
 *
 * @param bids - The bids that spoke to this dimension, already filtered.
 */
const ResolvePosture = (
    ladder: readonly PoseKey[],
    state: ControlState,
    dimension: DimensionId,
    bids: readonly ProviderBid[]
): Partial<DimensionResolution> => {
    const ceiling = IntersectPostures(bids, dimension) ?? new Set(ladder)
    const demand = GetPostureDemand(state, dimension)
    const gate = GetGateIntent(state, dimension) ?? BaselineGate

    let allowed = new Set(ceiling)
    // The demand moves the set down and nowhere else: under `Free` and `OverrideAllowed` the
    // capability stands.
    if (demand != null && gate === GateIntent.OverrideForbidden) {
        for (const pose of demand) {
            allowed.delete(pose)
        }
    }

    const fallback = ladder[0]
    if (allowed.size === 0 && fallback !== undefined) {
        allowed = new Set([fallback])
    }

    return {
        ...(demand != null ? { PostureDemand: demand } : {}),
        PostureCeiling: ceiling,
        Posture: allowed,
    }
}

/** `v` inside 0..1, so a bid or a demand outside the scale is clamped rather than propagated. */
const Clamp01 = (v: number): number => Math.min(1, Math.max(Baseline, v))

/**
 * The resolution of a dimension nothing has been asked of and nothing is worn for: it agrees with
 * `Resolve` by construction, so a caller that wants a shape before it has a dossier can get one.
 */
export const BaselineResolution = (dimension: DimensionId): DimensionResolution => {
    const descriptor = GetDimension(dimension)
    const resolution: MutableResolution = {
        Winner: null,
        Losers: [],
        Config: {},
    }
    if (descriptor.Facets.has(FacetName.Rate)) {
        resolution.Applied = Baseline
        resolution.Ceiling = Baseline
        resolution.Projected = (descriptor.EngineValue ?? EngineIdentity)(Baseline)
    }
    if (descriptor.Facets.has(FacetName.Posture)) {
        // The baseline of a posture is the whole ladder, not the empty set: an unconstrained body
        // may take any of its poses, so releasing is not restoring.
        const ladder = new Set(descriptor.Ladder ?? [])
        resolution.PostureCeiling = ladder
        resolution.Posture = ladder
    }
    if (descriptor.Facets.has(FacetName.Gate)) {
        resolution.Gate = BaselineGate
        resolution.Engaged = false
    }
    if (descriptor.Facets.has(FacetName.Whitelist)) {
        resolution.Granted = new Set<CapabilityKey>()
    }
    return resolution
}

/**
 * Every body-state predicate, answered from the whole registry: a union of the refusals among the
 * dimensions that declared they feed it, computed over `AllDimensions()` rather than a contributor list.
 *
 * @param resolutions - What each dimension resolved to, keyed by id. A dimension with no entry is read
 *   as its baseline.
 */
export const ResolveBodyStateFrom = (
    name: BodyStateName,
    resolutions: ReadonlyMap<DimensionId, DimensionResolution>
): boolean =>
    ResolveBodyState(
        name,
        AllDimensions().map(descriptor => {
            const resolution = resolutions.get(descriptor.Id)
            return {
                Feeds: descriptor.Feeds,
                Engaged: resolution?.Engaged,
                Gate: resolution?.Gate,
            }
        })
    )
