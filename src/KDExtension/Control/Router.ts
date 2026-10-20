/**
 * The router: which provider wins a dimension, and what the loser still gets to say.
 *
 * ## The rules, and their status
 *
 * The three resolution rules are **[Decided]** in `design/spec.md` §6.7. They were built as a
 * `[Proposed]` in Phase 1 and **this is their promotion** — which is the only thing that could settle
 * them (`design/README.md`: a step that is built but not promoted is still a `[Proposed]`).
 *
 * 1. **Which items are providers** — an item declares its dimensions on apply, through the same
 *    stamped-event pattern items already use to register with the coordinator.
 * 2. **Which provider wins** — a **bid by power, highest wins**, following the base game's own
 *    `getArmsBound` convention: handlers bid, and the highest bid takes it **unless someone has
 *    already forced the result**. A projector is simply one bidder.
 * 3. **How the loser expresses itself** — a losing or partial provider still changes the model,
 *    appearance or pose through the existing limiter-update event.
 *
 * ## The algebra is per facet, and the facets do different things
 *
 * | Facet | Rule |
 * | --- | --- |
 * | `Rate` | the capability is the aggregate of the bids under the **winning bid's stacking mode**; `Applied` is the Host's demand **clamped to** that capability (`min(demand, capability)`, with an absent demand at 0); the dimension's **engine value** map then turns `Applied` into the number a seam receives |
 * | `Posture` | the capability is the **intersection of every provider's `Allowed`**, or the **ladder** when none speaks; subtract the Host's demand where the gate forbids, and where the gate allows a demand may only restore a pose the capability already contains; **allow wins**, and the result is **never empty** (the sentinel is the one member allowed outside the capability) |
 * | `Gate` | an absent demand reads as `Free`; `OverrideForbidden` engages when the direction can deny, `OverrideAllowed` when it can grant — a gate the seams cannot honour does not engage |
 * | `Whitelist` | nothing: the Host's only lever over it is the gate in front of it |
 *
 * ## One dimension at a time, and nothing cached
 *
 * The router answers for **one dimension per call**, because the dossier is sparse and per
 * dimension: a dimension nobody has expressed an intent for has nothing to resolve, and asking
 * about it would be work with no question behind it.
 *
 * Nothing here reads or writes equipment. The bids are handed in, so the answer is a pure
 * function of what the caller observed — which is what makes "no cached value to invalidate"
 * literally true rather than a promise.
 *
 * **[Decided] There is no contract between dimensions.** The facet interface describes one dimension
 * — its demand, its capability, its resolution — and nothing about any other. A seam may read
 * anything it likes out of the game, including state another dimension of ours is driving, but
 * that is not part of the model, nothing may rely on it, and no test may assert it (§6.7).
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

/**
 * One declaration that an item can move a dimension.
 *
 * The fields are the whole of what a provider says, and `LoserExpresses` is what rule 3 needs
 * to exist at all: a provider that loses the bid is not silent, it is an **appearance**.
 */
export interface ProviderBid {
    /** Which dimension the provider speaks to. */
    readonly Dimension: DimensionId
    /**
     * How much capability it offers. Higher wins, and the winning bid's stacking mode governs the
     * aggregate.
     *
     * There is no scale declared here on purpose: power is only ever compared, so a provider's
     * number means what its family decided it means. The base game's own handlers do the same.
     */
    readonly Power: number
    /**
     * How this bid stacks with the others, when this bid is the one that wins.
     *
     * The base game's own aggregates do not agree with one another, so one combining rule cannot
     * reproduce all three and the rule belongs to the bid rather than to the dimension (§6.7).
     * The **winner's** mode governs the whole aggregate; a loser's is recorded and unused.
     */
    readonly Stack: StackMode
    /**
     * The body configurations this provider can deliver, when it speaks to a posture dimension.
     *
     * **A second axis rather than a second power**, because a posture dimension has no numeric
     * aggregate at all: providers combine by intersection, so a bid's `Allowed` is what it can
     * draw rather than how hard it insists. `undefined` says nothing about body configurations,
     * which is a different statement from *"none are permitted"*.
     *
     * Only a dimension that composes `Posture` reads it.
     */
    readonly Allowed?: readonly PoseKey[]
    /**
     * The abilities this provider can re-grant, when it speaks to a `Whitelist` dimension.
     *
     * The grant half of capability: keys the equipment can give back. Only a dimension that
     * composes `Whitelist` reads it; a posture dimension promises poses through `Allowed` instead.
     * An omission says nothing about abilities, which is a different statement from *"none"*.
     */
    readonly Granted?: readonly CapabilityKey[]
    /**
     * What the provider still contributes when it **loses**.
     *
     * `false` is the honest answer for a provider whose only contribution was the constraint —
     * a blinder that did not win the bid does not dim the screen a little for having tried.
     * `true` says the item changes its model, appearance or pose regardless.
     */
    readonly LoserExpresses: boolean
    /** A readable name, so a console reader and a log line can say which item spoke. */
    readonly Source: string
}

/**
 * What the router decided about one dimension.
 *
 * ## Per-facet, because an intent is per-facet
 *
 * Every facet is reported whether or not the dimension composes it, because a caller that has to check
 * the descriptor before it can read an answer is a caller that will forget to. A dimension that
 * composes no `Rate` has no `Demand`, `Applied`, `Ceiling` or `Projected`; one that composes no
 * `Posture` has no `PostureDemand`, `PostureCeiling` or `Posture`; one that composes no `Gate` has no
 * `Gate` and no `Engaged` — **the fields are the facets'**, which is the same statement the persisted
 * intent makes.
 */
export interface DimensionResolution {
    //#region Rate — present only for a dimension that composes `Rate`
    /**
     * The Host's demand, as recorded, or `undefined` when nothing was demanded.
     *
     * `undefined` and `0` are different answers and the difference is the baseline's whole point: an
     * absence of a demand is *an absence of effect*, while a demand of 0 is a Host who explicitly asked
     * for none.
     */
    readonly Demand?: number
    /**
     * The severity a seam actually receives: **the Host's demand clamped to what the gear can do.**
     * That is `min(demand, capability)`; with no recorded demand it is the baseline `0`, because
     * capability is what the controller *can* do rather than an instruction to do it. The recorded
     * demand is left untouched, which is what lets it *wait* for gear that can honour it
     * (`design/spec.md` §6.5).
     */
    readonly Applied?: number
    /** The capability the bids aggregate to: an upper bound on `Applied`, never a demand. */
    readonly Ceiling?: number
    /**
     * **What the engine actually reads**: `Applied` through the dimension's own engine value map.
     *
     * Blindness is an integer ladder capped at 7 and a slow level is an integer whose `>9` is
     * immobility, so `Applied` is the model's answer and this is the game's (§6.2, §6.7). A seam
     * reads this field and never `Applied`.
     */
    readonly Projected?: number
    //#endregion

    //#region Posture — present only for a dimension that composes `Posture`
    /** The poses the Host asked to remove or restore, or `undefined` when nothing was asked. */
    readonly PostureDemand?: ReadonlySet<PoseKey>
    /**
     * **The poses she may take**, and the field the route writes into the game's availability
     * functions. Never empty (invariant 23).
     */
    readonly Posture?: ReadonlySet<PoseKey>
    /**
     * What the worn set can deliver on its own: the intersection of every provider's `Allowed`, or
     * the dimension's ladder when no provider speaks of body configurations at all.
     */
    readonly PostureCeiling?: ReadonlySet<PoseKey>
    //#endregion

    //#region Gate — present only for a dimension that composes `Gate`
    /** The Host's permission, with an absent demand read as `Free`. */
    readonly Gate?: GateIntent
    /**
     * Whether the injection layer should do anything at all.
     *
     * **`Free` means inject nothing**, so this is not "inject zero": the restraint template's own
     * defaults are always the floor and the controller adds on top of them. A `false` here says *the
     * controller contributes no effect*, which is a different statement from *the value is zero*.
     */
    readonly Engaged?: boolean
    //#endregion

    //#region Whitelist — present only for a dimension that composes `Whitelist`
    /**
     * The abilities the worn set can re-grant, as a union of every bid's `Granted`.
     *
     * A capability, not a demand: it is what a write of `OverrideAllowed` promises, and the field
     * the validator's `grants` argument is read from. Empty when no provider offers one, which is
     * different from *the dimension cannot grant* — the descriptor's direction says that.
     */
    readonly Granted?: ReadonlySet<CapabilityKey>
    //#endregion

    /** The bid that won, or `null` when no provider spoke to this dimension at all. */
    readonly Winner: ProviderBid | null
    /**
     * The providers that lost, kept so rule 3 has somewhere to land.
     *
     * A loser whose `LoserExpresses` is true still changes its own appearance; the router
     * reports rather than instructs, because *how* a family expresses a loss is the family's.
     */
    readonly Losers: readonly ProviderBid[]

    /** The semantic extra fields the dimension declared, or `{}`. */
    readonly Config: Config
}

/**
 * The one dimension nobody registered a descriptor for, refused rather than guessed at.
 *
 * A dossier can carry an id this build does not know — the catalogue moved, or another release
 * wrote it. Resolving it would mean inventing facets, so the router refuses and hands the caller
 * an id it can name in a log line.
 */
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
 * The order is fixed and it matters: the winner is decided first, because **the winning bid's
 * stacking mode governs the aggregate** and the aggregate is what the rate resolves against. The
 * posture region then reads the same bids on its own axis and ignores the winner entirely, because
 * a body configuration has nothing for a `Power` bid to compare (§6.7).
 *
 * **This function only *reports*** the losers rather than instructing them, because how a family
 * expresses a loss is the family's (rule 3).
 *
 * @param dimension - The dimension to resolve. Must be registered.
 * @param state - The dossier. A dimension with no entry reads its baseline.
 * @param bids - What the caller observed the worn set declaring **for this dimension**. Bids for
 *   other dimensions are ignored rather than refused, so a caller may pass a whole list.
 * @returns The resolution, including the losers for rule 3.
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

    //#region Rate — a squeeze, and the Host has a continuous dial for it
    if (descriptor.Facets.has(FacetName.Rate)) {
        // The mode is the winner's, and a dimension nobody bid on has no mode to take: `Max` is the
        // default the base game's own handlers follow and the one Phase 1 already built (§6.7).
        const capability = Clamp01(
            AggregateBids(forThisDimension, winner?.Stack ?? StackMode.Max).get(dimension) ?? Baseline
        )
        Object.assign(resolution, ResolveNumeric(GetTargetDemand(state, dimension), capability))
        // The engine's own units, through the map the descriptor is required to carry. A seam reads
        // `Projected`; a reader that wants the model's answer reads `Applied`, and the two differ
        // exactly where the engine's scale does.
        resolution.Projected = (descriptor.EngineValue ?? EngineIdentity)(resolution.Applied ?? Baseline)
    }
    //#endregion

    //#region Posture — a set, and the one facet whose baseline is full rather than empty
    if (descriptor.Facets.has(FacetName.Posture)) {
        Object.assign(resolution, ResolvePosture(descriptor.Ladder ?? [], state, dimension, forThisDimension))
    }
    //#endregion

    //#region Gate — a permission, and an absent demand reads as `Free`
    if (descriptor.Facets.has(FacetName.Gate)) {
        const demand = GetGateIntent(state, dimension)
        const gate = demand ?? BaselineGate

        // An absent demand and an explicit `Free` are the same statement, and both mean the injection
        // layer does nothing: the Host is not engaging this dimension, so the restraint template's own
        // defaults are the boundary.
        //
        // `OverrideAllowed` is only expressible where the dimension can actually grant **and the worn
        // set promises something on that dimension's channel** — and the promise is a fact about the
        // body, so it is read at *every* resolution rather than only at the write (§6.4, §6.7). A
        // permit whose gear has left therefore reports the demand it recorded and `Engaged: false`,
        // which is the gate half of the same sentence a rate demand gets: it waits.
        resolution.Gate = gate
        resolution.Engaged =
            (gate === GateIntent.OverrideForbidden && CanDeny(descriptor.Direction))
            || (gate === GateIntent.OverrideAllowed && CanGrant(descriptor.Direction)
                && ResolveGrant(descriptor, forThisDimension).size > 0)
    }
    //#endregion

    //#region Whitelist — a capability, and the only facet with no Host parameter
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

/**
 * An `Applied` of zero is a real answer rather than a missing one, so the two are defined here rather
 * than by truthiness, which would drop a dimension whose baseline is what it resolved to.
 */
const IsDefined = <T>(value: T | undefined): value is T => value !== undefined

/**
 * Resolves a `Rate` against the strongest bid.
 *
 * **Capability bounds the intent, and the intent is kept.** `Applied` is the demand clamped to what
 * the worn set can do; with nothing demanded it is the baseline 0. That is what lets a demand recorded
 * before the equipment that can honour it exists *wait* instead of being discarded: it is remembered,
 * and the moment gear arrives that reaches it, the outcome rises to meet it.
 *
 * The demand is reported **only when the Host actually asked for something**, so a caller can tell
 * *nothing demanded* from *a demand of zero* — the same distinction the store draws, and the reason the
 * field is absent rather than zero.
 *
 * @param demand - What the Host asked for, or `undefined` for nothing.
 * @param capability - The strongest bid any provider made, already clamped.
 * @returns The fields to merge into the resolution; the demand field is omitted when there is none.
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
 * ## The demand moves the set down, and only down
 *
 * The worn set's capability is the **intersection** of every provider that speaks of body
 * configurations, or the dimension's **ladder** when none does. The Host's demand then moves that
 * set **down**: the poses it names are removed under `OverrideForbidden`, and under `Free` or
 * `OverrideAllowed` the answer is the capability itself.
 *
 * **There is no add-half, and retiring it was a decision rather than a simplification.** A demand is
 * clamped to the capability, and the capability *is* the whole permitted set — so *restore a pose the
 * capability already contains* had nothing to do, and a branch that says nothing is worse than no
 * branch. What a permit actually does is **engage the route** (§6.13 rule 2): a non-`Free` gate writes
 * this set over the game's own answer, and *that* is where a re-grant happens (`design/spec.md` §6.7).
 *
 * ## Never empty, and the sentinel is the ladder's own head
 *
 * The game indexes the available set at `[0]` (`player/KinkyDungeonDress.ts:714`), so an empty one
 * hands `undefined` to the renderer — and under intersection an empty set is **easy to reach**,
 * since two items that each deliver one pose need only disagree. So the result falls back to
 * **`Ladder[0]`**, which is the game's own sentinel for the same reason: the base game's cascade
 * falls back through `DefaultStand`, `DefaultKneel` and finally `Hogtie`
 * (`Data/Poses.ts:459-467`), and every ladder in this build is ordered so its first member is the
 * pose that cascade reaches for. Invariant 23's non-emptiness is enforced here rather than trusted;
 * §6.13 rule 4 applies the game's sentinel too, after both operations, so the two agree.
 *
 * @param ladder - The poses the dimension governs, from its descriptor. Never empty: registration
 *   refuses a posture dimension without one.
 * @param state - The dossier.
 * @param dimension - The dimension to resolve.
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
    // The demand moves the set **down** and nowhere else (§6.7) — under `Free` and under
    // `OverrideAllowed` the answer is the capability itself. A permit's effect is the route's, not a
    // set operation here.
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
 * The resolution of a dimension **nothing has been asked of and nothing is worn for**.
 *
 * An empty dossier and an empty body agree with `Resolve` by construction — both read the baseline —
 * so a caller that wants a shape before it has a dossier does not have to invent one. It is reported
 * per facet like any other resolution: a `Rate` dimension gets `Applied` and `Projected` of the
 * baseline, a `Posture` dimension gets its ladder, and a `Gate` dimension gets `Free` and no
 * engagement.
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
        // The baseline of a posture is the **whole ladder**, not the empty set: an unconstrained
        // body may take any of its poses (§6.5). This is the one facet where "nothing imposed" is a
        // full value rather than an empty one, and it is why removing the last covering item
        // releases the set instead of having to restore it.
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
 * Every body-state predicate, answered from the whole registry.
 *
 * *"Are her arms bound"* is **one** question with some fifty callers in the base game, and our
 * model has no dimension that means it (§6.5). So the answer is a **union of the refusals** among
 * the dimensions that declared they feed it — a compatibility shim rather than a dimension
 * (glossary). It is computed over `AllDimensions()` rather than over a list of contributors,
 * because the contributor set is exactly the descriptors that declared it and a second list would
 * be a second place for that to be wrong.
 *
 * It is declared here and **not bound**: the seam that answers the game is the `forceResult` guard,
 * and that is Phase 2.1's.
 *
 * @param name - The predicate to answer.
 * @param resolutions - What each dimension resolved to, keyed by id. A dimension with no entry is
 *   read as its baseline, which is the same defaulting the dossier does.
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
