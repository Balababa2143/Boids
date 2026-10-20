/**
 * The write rules: what the Host may record, and what is refused rather than stored.
 *
 * ## Rejection happens at write time, never as a silent runtime failure
 *
 * This is the whole point of having facets (`design/spec.md` §6.6): a facet is a rule about what a
 * value means, so it can be checked where the value is *written* rather than where it is read six
 * calls later, by which point the caller has forgotten what it asked for and the only symptom is
 * gameplay that does not respond.
 *
 * ## A refusal is a value, not an exception
 *
 * The controls are drivable from the console, and a console typo must not be a crash. Every validator
 * returns a {@link WriteRefusal} naming the dimension and saying what was wrong, and the caller
 * decides how loudly to say it. This is the same shape the load gate's refusals take (§4.4) and for
 * the same reason: a refusal nobody can act on is indistinguishable from a bug.
 *
 * ## What is validated is an **intent record**, not a value
 *
 * A dimension's demand is a composition of its facets' parameters (§6.5), so the first rule is a shape
 * rule and the rest are per parameter: a rate's `Target` has a range, a gate's `Intent` has three
 * values. That ordering matters — *"does this dimension take this parameter at all"* has to be
 * answered before *"is this parameter's value any good"*, or a write is refused for the wrong reason.
 * @module KDExtension/Control/Validator
 */

import { Set as ISet } from 'immutable'
import { CapabilityKey, CapabilityKeys } from './Capability'
import { CanGrant, FacetName, GateIntent, IsGateIntent } from './Facet'
import { DimensionDescriptor, IntentParameterNames, TakesIntentParameter } from './Descriptor'
import { IsPoseKey } from './Pose'
import { ConfigFits, Config, ControlState, Intent, IntentRecord } from './Store'

/**
 * Why a write was refused, in words a console reader can act on.
 *
 * The value is returned rather than thrown so the caller chooses the volume — a console entry point
 * prints it, and a game path might show it as a status line.
 */
export interface WriteRefusal {
    readonly kind: 'refused'
    /** The dimension the write was about, so a report can name it. */
    readonly Dimension: string
    /** Which rule refused it. */
    readonly Rule:
        | 'unknown-dimension'
        | 'bad-intent'
        | 'undeclared-parameter'
        | 'bad-rate'
        | 'bad-posture'
        | 'unknown-intent'
        | 'not-grantable'
        | 'ungrantable-key'
        | 'undeclared-config'
    /** One sentence, in the validator's own words. */
    readonly Reason: string
}

/** A write the rules allow. */
export interface WriteAccepted {
    readonly kind: 'accepted'
}

/** The answer to "may this be written?". */
export type WriteOutcome = WriteAccepted | WriteRefusal

/**
 * The answer to a write. `Accepted` is a shared value rather than a fresh object, because the
 * accepting case carries nothing to distinguish one acceptance from another.
 */
export const Accepted: WriteAccepted = { kind: 'accepted' }

/** A refusal, with its reason carried through verbatim. */
export const Refused = (
    dimension: string,
    rule: WriteRefusal['Rule'],
    reason: string
): WriteRefusal => ({ kind: 'refused', Dimension: dimension, Rule: rule, Reason: reason })

/**
 * Replaces one dimension's intent in a dossier, **without checking the rules**.
 *
 * The checked path is {@link ValidateIntentWrite}; this is the write it guards, kept separate so a
 * migration or a reset can put a value back without re-litigating it.
 */
export const WithIntent = (
    state: ControlState,
    dimension: string,
    intent: Intent
): ControlState => state.set('intent', state.intent.set(dimension, intent))
/** The same, for a dimension's semantic extra fields. */
export const WithConfig = (
    state: ControlState,
    dimension: string,
    config: Config
): ControlState => state.set('config', state.config.set(dimension, config))

/**
 * Whether the Host may record this intent for this dimension.
 *
 * ## The rules, and which of them §6.6 names
 *
 * | Rule | What it refuses |
 * | --- | --- |
 * | **(shape)** | a parameter the dimension's facets do not take — `{ Intent }` on a rate-only `Sight`, `{ Target }` on a gate-only `Movement` |
 * | **Rate** | a `Target` that is not a number in 0..1, since a rate's range is the only thing a rate forbids. The **engine value** map is deliberately not a write rule: it is the descriptor's, and a dimension whose map is lossy, saturating or discontinuous is still a legal dimension |
 * | **Posture** | an `Allowed` member that is not a pose this build knows, or is a real pose the dimension's ladder does not govern. Duplicates collapse |
 * | **Gate** | an `Intent` outside the three values, and `OverrideAllowed` where the equipment cannot promise the ability **on that dimension's own grant channel** |
 * | **Whitelist** | a granted key outside the closed `CapabilityKey` union |
 *
 * **(shape) is the rule that makes the rest meaningful**, and it is the one an enum-typed intent could
 * not express: a dimension is *shape-checked by its own descriptor*, so the Host cannot demand a
 * permission of a dimension that has no permission and cannot leave a rate demand on one that has no
 * rate. It is refused rather than stored and ignored, because a stored parameter nothing reads is the
 * kind of state that looks load-bearing for years after it stopped being (§6.6).
 *
 * ## The two grant channels, and why the Gate rule is stated over the channel
 *
 * Invariant 6 — *`OverrideAllowed` requires equipment capability* — is a rule about a dimension's
 * **grant channel**, and there are two (§6.4): a `Whitelist` dimension promises abilities by key, and
 * a `Posture` dimension promises body configurations by pose. Stating the rule as *"the whitelist is
 * non-empty"* would make `OverrideAllowed` unreachable for every posture dimension until the first
 * capability key exists, which is neither what invariant 6 says nor what §6.13 needs. So `grants`
 * carries the promise **on the channel the dimension actually has** and only that one is checked.
 *
 * ## The rule that is *not* here, and why
 *
 * §6.6 lists *"`Free` may not carry a non-zero squeezed `Target`"*, and a write is genuinely the wrong
 * place for it: `Free` is the gate facet's value, the `Target` is the rate facet's, and **the resolved
 * severity is the demand clamped to what is worn** — so no single write can establish what `Free`
 * will resolve to. It is asserted as a **property over every resolution** in
 * `test/control-router.test.ts`, which is the honest home for a rule about all of them.
 *
 * @param descriptor - The dimension being written. Its facets and direction decide which rules apply.
 * @param intent - The demand being written. May be empty, which clears the dimension back to its
 *   baseline — and that is how a demand is removed, since there is no separate "unset".
 * @param grants - What the equipment currently promises for this dimension, **on that dimension's own
 *   grant channel** (§6.4): capability keys for a `Whitelist` dimension, poses for a `Posture` one,
 *   and nothing at all for a dimension with neither. Read from what is worn, never stored — which is
 *   what makes "the Host cannot promise a substitute the equipment does not offer" a fact about now
 *   rather than about a cached answer.
 *
 *   Its type is `ReadonlySet<string>` rather than `ReadonlySet<CapabilityKey>` **because the channel
 *   is the dimension's, not the validator's**: a posture dimension's promise is a set of poses, so a
 *   parameter typed as capability keys would make every legal posture write a compile error. The
 *   closure of `CapabilityKey` is enforced where a key is declared
 *   (`Capability/GrantCapableDimensions`) and tested here at run time for the dimensions that have
 *   that channel.
 */
export const ValidateIntentWrite = (
    descriptor: DimensionDescriptor,
    intent: IntentRecord,
    grants: ReadonlySet<string>
): WriteOutcome => {
    //#region (shape) — the dimension's own facets decide what it may be asked for
    if (intent == null || typeof intent !== 'object' || Array.isArray(intent)) {
        return Refused(
            descriptor.Id,
            'bad-intent',
            `The demand for '${descriptor.Id}' is not an intent record.`
        )
    }
    for (const parameter of Object.keys(intent)) {
        if (!TakesIntentParameter(descriptor, parameter)) {
            const takes = IntentParameterNames(descriptor)
            return Refused(
                descriptor.Id,
                'undeclared-parameter',
                `'${descriptor.Id}' does not take an intent parameter '${parameter}'. It takes: ` +
                `${takes.length === 0 ? 'nothing' : takes.join(', ')}.`
            )
        }
    }
    //#endregion

    //#region Rate — every in-range number is legal
    if (intent.Target !== undefined) {
        if (typeof intent.Target !== 'number' || !Number.isFinite(intent.Target)) {
            return Refused(
                descriptor.Id,
                'bad-rate',
                `The demand for '${descriptor.Id}' is not a number, and a rate is a number.`
            )
        }
        if (intent.Target < 0 || intent.Target > 1) {
            return Refused(
                descriptor.Id,
                'bad-rate',
                `'${descriptor.Id}' was demanded at ${intent.Target}, outside the rate's range of 0 to 1.`
            )
        }
    }
    //#endregion

    //#region Posture — every member has to be a pose this dimension actually governs
    if (intent.Allowed !== undefined) {
        if (!Array.isArray(intent.Allowed) && !(intent.Allowed instanceof ISet)) {
            return Refused(
                descriptor.Id,
                'bad-posture',
                `The postures permitted for '${descriptor.Id}' are not a set of poses, and a body ` +
                'configuration is chosen from a set rather than measured.'
            )
        }
        const ladder = descriptor.Ladder ?? []
        for (const pose of intent.Allowed as Iterable<unknown>) {
            if (!IsPoseKey(pose)) {
                return Refused(
                    descriptor.Id,
                    'bad-posture',
                    `'${String(pose)}' is not a pose this build knows, so there is nothing it could permit.`
                )
            }
            if (!ladder.includes(pose)) {
                return Refused(
                    descriptor.Id,
                    'bad-posture',
                    `'${descriptor.Id}' does not govern the pose '${pose}', so demanding it would be a ` +
                    'permission the dimension has no ladder entry for. It governs: ' +
                    `${ladder.length === 0 ? 'nothing' : ladder.join(', ')}.`
                )
            }
        }
    }
    //#endregion

    //#region Gate — the three values, then what the equipment can promise on this dimension's channel
    if (intent.Intent !== undefined) {
        if (!IsGateIntent(intent.Intent)) {
            return Refused(
                descriptor.Id,
                'unknown-intent',
                `'${String(intent.Intent)}' is not one of the three gate values, so there is nothing it could mean.`
            )
        }

        if (intent.Intent === GateIntent.OverrideAllowed) {
            // "Allow" is a promise about a specific capability, so with no capability there is nothing
            // to promise. A dimension that cannot grant at all is the same finding one step earlier.
            if (!CanGrant(descriptor.Direction)) {
                return Refused(
                    descriptor.Id,
                    'not-grantable',
                    `'${descriptor.Id}' is ${descriptor.Direction}-only, so the Host can never promise a ` +
                    'substitute through equipment for it.'
                )
            }
            if (grants.size === 0) {
                return Refused(
                    descriptor.Id,
                    'not-grantable',
                    `'${descriptor.Id}' has no equipment that can offer a substitute for it on its own ` +
                    'grant channel, so `OverrideAllowed` would be a promise with nothing behind it.'
                )
            }
        }
    }
    //#endregion

    //#region Whitelist — a granted key has to be one this build can keep, and only a whitelist has keys
    //
    // The channel test is the whole reason this is guarded rather than run unconditionally: a
    // posture dimension's promise is a set of **poses**, so running a capability-key test over it
    // would refuse every legal `OverrideAllowed` for one.
    if (descriptor.Facets.has(FacetName.Whitelist)) {
        for (const granted of grants) {
            if (!CapabilityKeys.has(granted as CapabilityKey)) {
                return Refused(
                    descriptor.Id,
                    'ungrantable-key',
                    `'${granted}' is not an ability this mod can grant, so equipment cannot offer it.`
                )
            }
        }
    }
    //#endregion

    return Accepted
}

/**
 * Whether the Host may record these semantic extra fields for this dimension.
 *
 * A field the descriptor does not declare is a semantic the dimension does not carry: storing it
 * would put a value in the dossier that nothing will ever read, which is the kind of state that
 * looks load-bearing for years after it stopped being.
 */
export const ValidateConfigWrite = (
    descriptor: DimensionDescriptor,
    config: Config
): WriteOutcome => {
    if (!ConfigFits(config, descriptor.Config)) {
        const declared = descriptor.Config == null ? 'none' : Object.keys(descriptor.Config).join(', ')
        return Refused(
            descriptor.Id,
            'undeclared-config',
            `'${descriptor.Id}' declares no such config field. It declares: ${declared}.`
        )
    }
    return Accepted
}
