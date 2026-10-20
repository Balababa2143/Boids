/**
 * The code-side record describing a dimension, and the registry it lives in.
 *
 * ## Why descriptors are code and the save is not
 *
 * A descriptor answers *what kind of thing is this dimension*: which group and subsystem own it,
 * which facets it composes, which way its seams move, which seams it uses and in which of the four
 * algebras, whether it has a buff side, what its resolved 0..1 becomes in the engine's own units,
 * which ladder a posture governs, which body-state predicates it answers, and its id. None of that
 * is a number, so none of it belongs in a save — the persisted shape is keyed maps only
 * (`design/spec.md` §6.5). The consequence is the one that matters: **adding a dimension is a code
 * change with an empty-save default.**
 *
 * ## The seams are declared, not bound
 *
 * A `Seam` is a **declared, unbound tool**. Naming it here is what makes a partial implementation loud
 * instead of silent (§6.2): the descriptor says *every* tool the dimension uses, so a phase that binds
 * one of three is visibly incomplete. Binding happens in the phase that owns the subsystem, and
 * `Verified` records whether the trigger named here has been read out of the engine or is still a
 * hope.
 *
 * The `Order` field exists because some perception values are written by an early seam and overwritten
 * by a later one — the descriptor has to be able to say so, and a later phase has to be able to act on
 * it.
 *
 * ## The facets also decide what the Host may ask for
 *
 * A dimension's intent is **a composition of its facets' parameters** (`design/spec.md` §6.5), so this
 * module is where that stops being a claim and becomes a lookup: {@link FacetIntentParameters} is the
 * facet-to-parameter table, {@link IntentParameterNames} answers what one dimension takes, and the
 * write validator refuses anything else. A dimension is therefore *shape-checked by its own
 * descriptor* rather than by a hand-written list that could drift from it.
 * @module KDExtension/Control/Descriptor
 */

import { ThrowIfNull } from '../../Utilities'
import { BodyStateName, IsBodyStateName } from './BodyState'
import {
    CanGrant,
    DimensionGroup,
    DimensionGroups,
    Direction,
    FacetName,
    FacetNames,
    Subsystem,
    Subsystems,
} from './Facet'
import { IsPoseKey, PoseKey } from './Pose'
import { IntentParameter } from './Store'

/**
 * **Which of four algebras a seam speaks**, because the base game has four rather than one.
 *
 * They were found by reading, not assumed (`design/spec.md` §6.2): `calcDeaf` is an **addition**
 * to a pair of accumulators whose weights are themselves part of the payload
 * (`player/KinkyDungeonStats.ts:413-435`); `calcBlind` is an **absolute value** a handler
 * replaces outright (`:2063-2075`); `calcHearing` is a **multiplier**
 * (`effect/KinkyDungeonEvents.ts:7263-7267`).
 *
 * The fourth is the reason this field exists at all: the pose availability functions are **pure
 * functions with no event**, so the only way in is to **replace** their answer by wrapping the
 * global (`Data/Poses.ts:382, :477`). A descriptor that named a trigger and no kind could not
 * tell a phase which of the four it was being asked to write — and a dimension that composes
 * `Posture` has no event to name at all.
 */
export const SeamKind = {
    /** A handler writes an absolute value into the payload's field. */
    Value: 'Value',
    /** A handler adds to an accumulator the payload already carries. */
    Add: 'Add',
    /** A handler multiplies the value the payload carries. */
    Multiply: 'Multiply',
    /**
     * There is no event: the handler **wraps the global** and replaces its answer.
     *
     * `Trigger` still names something, and it is the **name of the function being wrapped** — a
     * descriptor has to be able to say which global, and a bare `Replace` with no target would
     * describe no seam at all.
     */
    Replace: 'Replace',
} as const

/** One seam kind. */
export type SeamKind = typeof SeamKind[keyof typeof SeamKind]

/** Every kind, for a walk that has to cover them rather than sample them. */
export const SeamKinds: readonly SeamKind[] = [
    SeamKind.Value,
    SeamKind.Add,
    SeamKind.Multiply,
    SeamKind.Replace,
]

/** Whether a value is one of the four. */
export const IsSeamKind = (value: unknown): value is SeamKind =>
    typeof value === 'string' && (SeamKinds as readonly string[]).includes(value)

/**
 * One point the game lets a handler intervene at, as a dimension declares it.
 *
 * `Order` is the precedence relative to the game's own writes: a seam that runs before the game's own
 * assignment is not the same adjustment as one that runs after, and the difference is invisible from
 * the handler alone.
 */
export interface Seam {
    /**
     * Which of the four algebras the handler writes in.
     *
     * A `Replace` seam is the one kind with no event behind it; its {@link Seam.Trigger} names the
     * global being wrapped rather than a trigger bucket.
     */
    readonly Kind: SeamKind
    /**
     * The handler's `type` — the key the game looks the handler up by in its own event map.
     *
     * It is a string here rather than a GUID literal because a descriptor must be able to name a
     * **base-game** handler as readily as one of ours: `Sight`'s producing seam is the engine's
     * `calcBlind` trigger, not a handler this mod owns. On a `Replace` seam it names the module
     * that owns the wrap instead, since there is no event map to look a handler up in.
     */
    readonly Handler: string
    /** The trigger the seam hangs on, e.g. `calcBlind` or `getArmsBound` — or, for `Replace`, the wrapped global. */
    readonly Trigger: string
    /**
     * When this seam runs relative to the game's own write for the same value. A lower number runs
     * earlier; the game's own write is `0`.
     */
    readonly Order: number
    /**
     * Whether the trigger has been **read out of the engine** rather than inferred from the design.
     *
     * A seam with `Verified: false` is recorded so the descriptor is complete, and it is explicitly
     * marked so no phase can find itself building on a guess. `[To Be Verified]` in `design/spec.md` is the
     * same marker.
     */
    readonly Verified: boolean
}

/**
 * A semantic extra field a dimension's facets need — which struggle types a gate governs, and so on.
 *
 * The values are `true` because this is a **declaration of the keys**, not a default: a descriptor says
 * *the field `Types` belongs to this dimension*, and the value that field carries lives in the
 * dossier's `config` map.
 */
export type ConfigField = Readonly<Record<string, true>>

/**
 * What a dimension's resolved 0..1 becomes **in the engine's own units**.
 *
 * ## Why every `Rate` dimension has to declare one
 *
 * `Rate` is **uniformly 0..1 in the model** — that is what makes one clamp rule and one body of
 * property tests possible — but no base-game quantity is on that scale: blindness is an integer
 * ladder capped at 7, deafness an unbounded weighted sum, a hearing radius a hyperbola that never
 * reaches zero, and a slow level an integer whose `>9` is immobility (`design/spec.md` §6.2,
 * §6.7). So the dimension owns the function that turns its resolved value into what the engine
 * actually reads.
 *
 * **A dimension declares one even when nothing needs converting**, writing
 * {@link EngineIdentity}, rather than leaving it out — the same rule that makes a seam be recorded
 * before it is verified. An omission that reads as working code is the failure this registry
 * exists to prevent, and a later phase must be able to tell *"the map is the identity"* from
 * *"nobody wrote the map"*.
 *
 * It is deliberately **not** a write rule (§6.6): a dimension whose map is lossy, saturating or
 * discontinuous is still a legal dimension, because the map is the engine's shape rather than a
 * constraint on the Host.
 */
export type EngineValue = (_: number) => number

/**
 * The engine value map for a dimension whose units are the model's own.
 *
 * Named rather than written as a lambda at each site so a catalogue reads as *"this one needs no
 * conversion"* instead of as a function nobody can compare.
 */
export const EngineIdentity: EngineValue = value => value

/**
 * One dimension, as code describes it. Every field below is required, because a descriptor missing one
 * is exactly the silent partial failure this registry exists to prevent (`design/spec.md` §6.2).
 */
export interface DimensionDescriptor {
    /** The derived id this dimension is addressed by, in the save and in the console. */
    readonly Id: string
    /** Which of the three operations owns it: squeeze, transfer, or add. */
    readonly Group: DimensionGroup
    /** Which mechanism group it belongs to: they ship separately and in a fixed order. */
    readonly Subsystem: Subsystem
    /**
     * The facets it composes.
     *
     * This is not only a description of *what it constrains* — it is also the set that decides **what
     * the Host may demand of it**, through {@link FacetIntentParameters}. The persisted shape stays
     * uniform regardless.
     */
    readonly Facets: ReadonlySet<FacetName>
    /**
     * Which way it can move. An ability may be one-way at the seam even when the design wants both, so
     * this is recorded rather than assumed.
     */
    readonly Direction: Direction
    /**
     * Whether a granting seam exists that could express the inverse of a denial.
     *
     * A deny-only seam can never express its inverse buff, so a dimension with `Direction: 'deny'` and
     * `BuffSide: true` is a contradiction and is refused at registration.
     */
    readonly BuffSide: boolean
    /** Every tool the dimension uses. A partial implementation fails silently, so this is all of them. */
    readonly Seams: readonly Seam[]
    /**
     * The map that turns a resolved 0..1 into the engine's own units.
     *
     * **Required exactly when the dimension composes `Rate`**, and refused otherwise — see
     * {@link EngineValue} for why the identity is written out rather than left out.
     */
    readonly EngineValue?: EngineValue
    /**
     * The poses the dimension governs, and therefore what its `Free` means.
     *
     * **Required exactly when the dimension composes `Posture`**: a posture dimension whose ladder
     * is empty governs nothing, and one whose ladder is absent cannot be asked *"may she be in
     * this pose?"* at all. Refused at registration rather than checked at every resolution.
     */
    readonly Ladder?: readonly PoseKey[]
    /**
     * The body-state predicates this dimension answers, when it can be refused.
     *
     * *"Are her arms bound"* is **one** question with some fifty callers in the base game, and our
     * model has no dimension that means it: the answer is a union of the refusals among the
     * dimensions that declare they feed it (`design/spec.md` §6.2, §6.7). May be declared only
     * where the dimension composes `Gate`, because the predicate is a union of refusals and only a
     * gate can be refused.
     */
    readonly Feeds?: readonly BodyStateName[]
    /** The semantic extra fields its facets need, or `undefined` when it needs none. */
    readonly Config?: ConfigField
}

/**
 * Which intent parameters each facet contributes.
 *
 * A list rather than a set, because the order is read back by {@link IntentParameterNames} and a reader
 * looking at a console report wants the parameters in the order the facets are declared.
 */
export const FacetIntentParameters: {
    readonly [F in FacetName]: readonly IntentParameter[]
} = {
    /**
     * A rate takes the Host's demand for **how hard to squeeze**.
     *
     * This is the one parameter that is **continuous**, and it is the whole reason an intent cannot be
     * a single enum: writing the persisted demand as a bare `GateIntent` left *"the Host squeezes sight
     * to 0.4"* with no representation at all.
     */
    [FacetName.Rate]: ['Target'],
    /**
     * A posture takes **which body configurations are permitted**, as a set of poses.
     *
     * It is the one parameter whose value is a set rather than a number or one of three names,
     * because a body configuration is chosen from a ladder rather than measured (§6.5, §6.13). An
     * absent one is not "nothing allowed" — it is the ladder's own reading of *nothing was asked*,
     * which is the whole ladder.
     */
    [FacetName.Posture]: ['Allowed'],
    /** A gate takes **which permission**: `Free`, forbidden, or allowed through the equipment. */
    [FacetName.Gate]: ['Intent'],
    /**
     * **A whitelist contributes nothing to an intent.**
     *
     * Which keys equipment can re-grant is the *equipment's* declaration, read from what is worn and
     * never the Host's demand (§6.12 clause 4). So the Host's only lever over a whitelist is the gate
     * in front of it — *"you may have it back, through the gear"* — and the gear decides which
     * abilities that covers. A `Granted` here would be the Host promising a capability the equipment
     * may not offer, which is the write §6.6 refuses.
     */
    [FacetName.Whitelist]: [],
}

/**
 * The intent parameters a dimension **takes**, from the facets it composes.
 *
 * This is the write-side answer to *"may the Host demand this of that dimension?"*, and it is **derived
 * rather than declared** so it cannot disagree with the descriptor. A `Sight` takes `Target` and not
 * `Intent`; a `Speech` the reverse; a `Struggle` takes both, because it composes both.
 *
 * @param descriptor - The dimension to read.
 * @returns The parameter names, in facet order. Empty is impossible for a registered dimension,
 *   because registration refuses a descriptor that composes no facet at all.
 */
export const IntentParameterNames = (descriptor: DimensionDescriptor): readonly IntentParameter[] =>
    FacetNames
        .filter(facet => descriptor.Facets.has(facet))
        .flatMap(facet => FacetIntentParameters[facet])

/**
 * Whether a dimension takes a given intent parameter.
 *
 * The membership test the write validator runs, spelled as its own function so the validator and a
 * console report answer the same question the same way.
 */
export const TakesIntentParameter = (
    descriptor: DimensionDescriptor,
    parameter: string
): boolean => (IntentParameterNames(descriptor) as readonly string[]).includes(parameter)

/**
 * The registry, keyed by id.
 *
 * A `Map` rather than an object literal: the key is a derived UUID, and an object literal would order
 * an integer-like key ahead of its neighbours and invite the belief that key order means something. It
 * does not — a descriptor is looked up, never iterated by position.
 */
const Dimensions = new Map<string, DimensionDescriptor>()

/**
 * Refuses a descriptor that does not describe a dimension.
 *
 * These are authoring mistakes rather than player-facing states, so registering one throws at load —
 * the same call `AddModelWithText` and `AddRestraintWithText` already make for a duplicate.
 * `test/control-descriptor.test.ts` runs the same validation over the whole registry, so a violation is
 * also a red test rather than only a load failure.
 */
export const ValidateDescriptor = (descriptor: DimensionDescriptor): void => {
    if (descriptor.Id.length === 0) {
        throw new Error('Boids control: a dimension descriptor must carry an id.')
    }
    if (!DimensionGroups.includes(descriptor.Group)) {
        throw new Error(`Boids control: '${descriptor.Id}' has an unknown group.`)
    }
    if (!Subsystems.includes(descriptor.Subsystem)) {
        throw new Error(`Boids control: '${descriptor.Id}' has an unknown subsystem.`)
    }
    for (const facet of descriptor.Facets) {
        if (!FacetNames.includes(facet)) {
            throw new Error(`Boids control: '${descriptor.Id}' composes an unknown facet.`)
        }
    }
    if (descriptor.Facets.size === 0) {
        throw new Error(
            `Boids control: '${descriptor.Id}' composes no facet, so there is nothing to constrain.`
        )
    }
    // A dimension that cannot grant has no keys to carry, so a whitelist on it is a promise
    // with nothing behind it. `OverrideAllowed` would then be accepted for an ability the
    // equipment cannot offer, which §6.4 makes a hard refusal rather than a runtime surprise.
    if (descriptor.Facets.has(FacetName.Whitelist) && !CanGrant(descriptor.Direction)) {
        throw new Error(
            `Boids control: '${descriptor.Id}' composes a whitelist but is ${descriptor.Direction}-only, ` +
            'so there is no ability it could ever grant.'
        )
    }
    // A deny-only seam can never express the inverse of a denial, so a buff side on one is a
    // claim the dimension cannot keep (§6.2, §C.3).
    if (descriptor.BuffSide && !CanGrant(descriptor.Direction)) {
        throw new Error(
            `Boids control: '${descriptor.Id}' claims a buff side but is ${descriptor.Direction}-only, ` +
            'and a deny-only seam can never express its inverse.'
        )
    }
    // Every `Rate` dimension declares an engine value map and no other dimension does. The identity
    // is written out rather than left out (§6.2), so an absent map on a rate dimension is a
    // dimension nobody finished describing, and a map on a dimension with no rate is a conversion
    // with nothing to convert.
    if (descriptor.Facets.has(FacetName.Rate) && descriptor.EngineValue == null) {
        throw new Error(
            `Boids control: '${descriptor.Id}' composes a rate but declares no engine value map. ` +
            'Write `EngineIdentity` when nothing needs converting rather than leaving it out.'
        )
    }
    if (!descriptor.Facets.has(FacetName.Rate) && descriptor.EngineValue != null) {
        throw new Error(
            `Boids control: '${descriptor.Id}' declares an engine value map but composes no rate, ` +
            'so there is no resolved 0..1 for it to convert.'
        )
    }
    // A posture dimension's ladder is what its `Free` means, so an absent or empty one leaves the
    // facet with no baseline and the router with nothing to intersect (§6.1, §6.7).
    if (descriptor.Facets.has(FacetName.Posture)) {
        const ladder = descriptor.Ladder
        if (ladder == null || ladder.length === 0) {
            throw new Error(
                `Boids control: '${descriptor.Id}' composes a posture but declares no ladder, so ` +
                'there is no pose it governs and no `Free` value for it to rest at.'
            )
        }
        for (const pose of ladder) {
            if (!IsPoseKey(pose)) {
                throw new Error(
                    `Boids control: '${descriptor.Id}' has '${String(pose)}' on its ladder, which is ` +
                    'not a pose this build knows.'
                )
            }
        }
        if (new Set(ladder).size !== ladder.length) {
            throw new Error(
                `Boids control: '${descriptor.Id}' names a pose on its ladder twice, so its ` +
                'baseline set and its ladder disagree about how large it is.'
            )
        }
        // `Posture` is the one facet with no event behind it, so a dimension that composes it has
        // no seam at all unless it names a `Replace` one (§6.2, §6.13).
        if (!descriptor.Seams.some(seam => seam.Kind === SeamKind.Replace)) {
            throw new Error(
                `Boids control: '${descriptor.Id}' composes a posture but names no Replace seam. ` +
                'The pose availability functions are pure functions with no event, so wrapping one ' +
                'is the only way in and a set with nowhere to go is unimplemented.'
            )
        }
    }
    // A body-state predicate is a union of refusals, and only a gate can be refused (§6.2).
    if (descriptor.Feeds != null) {
        if (!descriptor.Facets.has(FacetName.Gate)) {
            throw new Error(
                `Boids control: '${descriptor.Id}' feeds a body-state predicate but composes no ` +
                'gate, and a predicate is a union of refusals rather than of values.'
            )
        }
        for (const predicate of descriptor.Feeds) {
            if (!IsBodyStateName(predicate)) {
                throw new Error(
                    `Boids control: '${descriptor.Id}' feeds '${String(predicate)}', which is not a ` +
                    'body-state predicate this build knows.'
                )
            }
        }
    }
    if (descriptor.Seams.length === 0) {
        throw new Error(
            `Boids control: '${descriptor.Id}' names no seam. A dimension with no tool is not ` +
            'implemented, it is unimplemented — say which seam it will use even when the trigger ' +
            'is not verified yet.'
        )
    }
    const seamKeys = new Set<string>()
    for (const seam of descriptor.Seams) {
        if (!SeamKinds.includes(seam.Kind)) {
            throw new Error(
                `Boids control: '${descriptor.Id}' has a seam of an unknown kind, so no phase can ` +
                'tell which of the four algebras it is being asked to write.'
            )
        }
        if (seam.Handler.length === 0 || seam.Trigger.length === 0) {
            throw new Error(
                `Boids control: '${descriptor.Id}' has a seam with no handler or no trigger.`
            )
        }
        const key = `${seam.Trigger}\u0000${seam.Handler}`
        if (seamKeys.has(key)) {
            throw new Error(
                `Boids control: '${descriptor.Id}' names the seam '${seam.Handler}' on ` +
                `'${seam.Trigger}' twice.`
            )
        }
        seamKeys.add(key)
    }
    if (descriptor.Config != null) {
        for (const field of Object.keys(descriptor.Config)) {
            if (field.length === 0) {
                throw new Error(`Boids control: '${descriptor.Id}' declares an empty config field.`)
            }
        }
    }
}

/**
 * Registers one dimension, and returns the descriptor it stored.
 *
 * Registration is a **one-shot, throw-on-duplicate side effect** at module evaluation, the same
 * contract the model and restraint registries carry: a dimension registered twice is a catalogue error,
 * and a duplicate id would otherwise silently shadow the first record.
 *
 * @param descriptor - The dimension. Every field of §6.2 is required; see {@link DimensionDescriptor}.
 * @returns The stored descriptor, so a catalogue can bind its own constant to what the registry
 *   actually holds rather than to the literal it wrote.
 */
export const RegisterDimension = (descriptor: DimensionDescriptor): DimensionDescriptor => {
    ValidateDescriptor(descriptor)
    if (Dimensions.has(descriptor.Id)) {
        throw new Error(
            `Boids control: the dimension '${descriptor.Id}' is already registered. Two ` +
            'descriptors under one id would shadow each other in the dossier.'
        )
    }
    Dimensions.set(descriptor.Id, descriptor)
    return descriptor
}

/**
 * One dimension, by id.
 *
 * A lookup for an id nobody registered throws rather than answering `undefined`: every caller either
 * holds an id that came out of this registry, or holds a value off a save, and in the second case a
 * dimension this build does not know is a finding the caller has to handle explicitly rather than a
 * `null` to pipe onward. {@link HasDimension} is the test for that.
 */
export const GetDimension = (id: string): DimensionDescriptor =>
    ThrowIfNull(
        Dimensions.get(id),
        `Boids control: no dimension is registered under '${id}'.`
    )

/** Whether a dimension is registered. The question to ask about a value that came from a save. */
export const HasDimension = (id: string): boolean => Dimensions.has(id)

/**
 * Every registered dimension, in registration order.
 *
 * Registration order is the order a catalogue wrote its records, which is the order a reader expects to
 * see them in; nothing in the mechanism depends on it.
 */
export const AllDimensions = (): readonly DimensionDescriptor[] => [...Dimensions.values()]
