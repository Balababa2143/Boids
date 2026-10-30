/**
 * The code-side record describing a dimension, and the registry it lives in.
 *
 * Adding a dimension is a code change with an empty-save default, and its facets decide what the Host
 * may ask of it through {@link FacetIntentParameters}.
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

/** Which of four algebras a seam speaks: the base game's values are not all on one scale. */
export const SeamKind = {
    /** A handler writes an absolute value into the payload's field. */
    Value: 'Value',
    /** A handler adds to an accumulator the payload already carries. */
    Add: 'Add',
    /** A handler multiplies the value the payload carries. */
    Multiply: 'Multiply',
    /** There is no event: the handler wraps the global, and `Trigger` names it. */
    Replace: 'Replace',
} as const

/** One seam kind. */
export type SeamKind = typeof SeamKind[keyof typeof SeamKind]

export const SeamKinds: readonly SeamKind[] = [
    SeamKind.Value,
    SeamKind.Add,
    SeamKind.Multiply,
    SeamKind.Replace,
]

/** Whether a value is one of the four. */
export const IsSeamKind = (value: unknown): value is SeamKind =>
    typeof value === 'string' && (SeamKinds as readonly string[]).includes(value)

/** One point the game lets a handler intervene at, as a dimension declares it. */
export interface Seam {
    /** Which of the four algebras the handler writes in; on a `Replace` seam, `Trigger` names the wrapped global. */
    readonly Kind: SeamKind
    /**
     * The handler's `type` — the key the game looks it up by. A string, so a descriptor can name a
     * base-game handler; on a `Replace` seam it names the module that owns the wrap.
     */
    readonly Handler: string
    /** The trigger the seam hangs on, e.g. `calcBlind` or `getArmsBound` — or, for `Replace`, the wrapped global. */
    readonly Trigger: string
    /**
     * When this seam runs relative to the game's own write for the same value: lower runs earlier, and
     * the game's own write is `0`.
     */
    readonly Order: number
    /** Whether the trigger has been read out of the engine rather than inferred. */
    readonly Verified: boolean
}

/**
 * A semantic extra field a dimension's facets need — which struggle types a gate governs, and so on.
 * The values are `true` because this declares keys; the value lives in the dossier's `config` map.
 */
export type ConfigField = Readonly<Record<string, true>>

/**
 * What a dimension's resolved 0..1 becomes in the engine's own units.
 *
 * The dimension owns the function because no base-game quantity is on the 0..1 scale, and it writes
 * {@link EngineIdentity} rather than leaving the map out. It is not a write rule.
 */
export type EngineValue = (_: number) => number

/** The engine value map for a dimension whose units are the model's own. */
export const EngineIdentity: EngineValue = value => value

/**
 * One dimension, as code describes it. Every field is required, because a descriptor missing one is
 * exactly the silent partial failure this registry exists to prevent.
 */
export interface DimensionDescriptor {
    /** The derived id this dimension is addressed by, in the save and in the console. */
    readonly Id: string
    /** Which of the three operations owns it: squeeze, transfer, or add. */
    readonly Group: DimensionGroup
    /** Which mechanism group it belongs to. */
    readonly Subsystem: Subsystem
    /** The facets it composes, which decide what the Host may demand through {@link FacetIntentParameters}. */
    readonly Facets: ReadonlySet<FacetName>
    /** Which way it can move, recorded rather than assumed: a seam may be one-way even when both are wanted. */
    readonly Direction: Direction
    /**
     * Whether a granting seam exists that could express the inverse of a denial: `Direction: 'deny'`
     * with `BuffSide: true` is refused at registration.
     */
    readonly BuffSide: boolean
    /** Every tool the dimension uses: a partial implementation fails silently, so this is all of them. */
    readonly Seams: readonly Seam[]
    /** The map into the engine's own units. Required exactly when the dimension composes `Rate`. */
    readonly EngineValue?: EngineValue
    /**
     * The poses the dimension governs, and therefore what its `Free` means. Required exactly when it
     * composes `Posture`.
     */
    readonly Ladder?: readonly PoseKey[]
    /**
     * The body-state predicates this dimension answers; declared only where it composes `Gate`, because a
     * predicate is a union of refusals.
     */
    readonly Feeds?: readonly BodyStateName[]
    /** The semantic extra fields its facets need, or `undefined` when it needs none. */
    readonly Config?: ConfigField
}

/** Which intent parameters each facet contributes, in the order {@link IntentParameterNames} reports. */
export const FacetIntentParameters: {
    readonly [F in FacetName]: readonly IntentParameter[]
} = {
    /** A rate takes the Host's demand for how hard to squeeze: the one continuous parameter. */
    [FacetName.Rate]: ['Target'],
    /** A posture takes which body configurations are permitted; an absent one is the whole ladder. */
    [FacetName.Posture]: ['Allowed'],
    /** A gate takes which permission: `Free`, forbidden, or allowed through the equipment. */
    [FacetName.Gate]: ['Intent'],
    /** A whitelist contributes nothing to an intent: which keys equipment re-grants is the equipment's declaration. */
    [FacetName.Whitelist]: [],
}

/**
 * The intent parameters a dimension takes, from the facets it composes.
 *
 * @returns The parameter names, in facet order; empty is impossible, because registration refuses a
 *   descriptor that composes no facet at all.
 */
export const IntentParameterNames = (descriptor: DimensionDescriptor): readonly IntentParameter[] =>
    FacetNames
        .filter(facet => descriptor.Facets.has(facet))
        .flatMap(facet => FacetIntentParameters[facet])

/** Whether a dimension takes a given intent parameter: the test the write validator runs. */
export const TakesIntentParameter = (
    descriptor: DimensionDescriptor,
    parameter: string
): boolean => (IntentParameterNames(descriptor) as readonly string[]).includes(parameter)

/** The registry, keyed by id. A `Map` rather than an object literal: the key is a derived UUID. */
const Dimensions = new Map<string, DimensionDescriptor>()

/**
 * Refuses a descriptor that does not describe a dimension: registering one throws at load, as the model
 * and restraint registries do for a duplicate.
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
    // A dimension that cannot grant has no keys to carry, so a whitelist on it would be a promise
    // with nothing behind it.
    if (descriptor.Facets.has(FacetName.Whitelist) && !CanGrant(descriptor.Direction)) {
        throw new Error(
            `Boids control: '${descriptor.Id}' composes a whitelist but is ${descriptor.Direction}-only, ` +
            'so there is no ability it could ever grant.'
        )
    }
    // A deny-only seam can never express the inverse of a denial.
    if (descriptor.BuffSide && !CanGrant(descriptor.Direction)) {
        throw new Error(
            `Boids control: '${descriptor.Id}' claims a buff side but is ${descriptor.Direction}-only, ` +
            'and a deny-only seam can never express its inverse.'
        )
    }
    // Every `Rate` dimension declares an engine value map and no other dimension does, so an absent
    // map on a rate dimension is a dimension nobody finished describing.
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
    // facet with no baseline.
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
        // `Posture` is the one facet with no event behind it, so it needs a `Replace` seam.
        if (!descriptor.Seams.some(seam => seam.Kind === SeamKind.Replace)) {
            throw new Error(
                `Boids control: '${descriptor.Id}' composes a posture but names no Replace seam. ` +
                'The pose availability functions are pure functions with no event, so wrapping one ' +
                'is the only way in and a set with nowhere to go is unimplemented.'
            )
        }
    }
    // A body-state predicate is a union of refusals, and only a gate can be refused.
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
 * Registration is a one-shot, throw-on-duplicate side effect at module evaluation: a duplicate id
 * would silently shadow the first record.
 *
 * @returns The stored descriptor, so a catalogue can bind its constant to what the registry holds.
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
 * A lookup for an id nobody registered throws rather than answering `undefined`, so a finding off a save
 * is handled explicitly. {@link HasDimension} is the test for that.
 */
export const GetDimension = (id: string): DimensionDescriptor =>
    ThrowIfNull(
        Dimensions.get(id),
        `Boids control: no dimension is registered under '${id}'.`
    )

/** Whether a dimension is registered. The question to ask about a value that came from a save. */
export const HasDimension = (id: string): boolean => Dimensions.has(id)

/** Every registered dimension, in registration order. */
export const AllDimensions = (): readonly DimensionDescriptor[] => [...Dimensions.values()]
