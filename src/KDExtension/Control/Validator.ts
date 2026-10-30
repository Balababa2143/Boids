/**
 * The write rules: what the Host may record, and what is refused rather than stored.
 *
 * A refusal is a value rather than an exception, and the shape rule runs before any of a record's
 * values.
 * @module KDExtension/Control/Validator
 */

import { Set as ISet } from 'immutable'
import { CapabilityKey, CapabilityKeys } from './Capability'
import { CanGrant, FacetName, GateIntent, IsGateIntent } from './Facet'
import { DimensionDescriptor, IntentParameterNames, TakesIntentParameter } from './Descriptor'
import { IsPoseKey } from './Pose'
import { ConfigFits, Config, ControlState, Intent, IntentRecord } from './Store'

/**
 * Why a write was refused, in words a console reader can act on: returned rather than thrown, so the
 * caller chooses the volume.
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

/** The answer to a write. Accepting carries nothing, so one shared value serves. */
export const Accepted: WriteAccepted = { kind: 'accepted' }

/** A refusal, with its reason carried through verbatim. */
export const Refused = (
    dimension: string,
    rule: WriteRefusal['Rule'],
    reason: string
): WriteRefusal => ({ kind: 'refused', Dimension: dimension, Rule: rule, Reason: reason })

/**
 * Replaces one dimension's intent in a dossier without checking the rules: the write
 * {@link ValidateIntentWrite} guards, so a migration or a reset can put a value back without
 * re-litigating it.
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
 * The shape rule runs first, so no value is judged against a facet the dimension lacks. A rate's
 * `Target` is 0..1, an `Allowed` member is a pose the dimension's own ladder governs, and
 * `OverrideAllowed` needs a promise on the dimension's grant channel.
 *
 * @param intent - The demand being written. An empty record clears the dimension to its baseline.
 * @param grants - The promise on the dimension's own grant channel — keys for a `Whitelist`
 *   dimension, poses for a `Posture` one — which is why it is a set of strings.
 */
export const ValidateIntentWrite = (
    descriptor: DimensionDescriptor,
    intent: IntentRecord,
    grants: ReadonlySet<string>
): WriteOutcome => {
    //#region (shape)
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

    //#region Rate
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

    //#region Posture
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

    //#region Gate
    if (intent.Intent !== undefined) {
        if (!IsGateIntent(intent.Intent)) {
            return Refused(
                descriptor.Id,
                'unknown-intent',
                `'${String(intent.Intent)}' is not one of the three gate values, so there is nothing it could mean.`
            )
        }

        if (intent.Intent === GateIntent.OverrideAllowed) {
            // "Allow" is a promise about a capability, so with no capability there is nothing to promise.
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

    //#region Whitelist
    //
    // The channel test is why this is guarded rather than run unconditionally: a posture dimension's
    // promise is a set of poses, so a capability-key test over it would refuse every legal write.
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
 * Whether the Host may record these semantic extra fields for this dimension: a field the descriptor
 * does not declare is a semantic the dimension does not carry.
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
