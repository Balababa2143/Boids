/**
 * The sensory surface: the strength a dimension is currently resolving to, and the channel a
 * morphing item hears about it on.
 *
 * ## What moved out of this module, and where it went
 *
 * This module used to own the limiter store: a hard-coded `ItemArchetype` guard, a getter and a
 * setter per slot, and a `target` that lived in the save. All of that is gone:
 *
 * | Was | Is |
 * | --- | --- |
 * | `GetLimiterStrength(type)` | `Public.Control.Resolve(dimension).Target` |
 * | `SetLimiterStrength(type, value)` | `Public.Control.SetIntent({dimension, intent})`, whose validator decides whether the write is legal |
 * | the archetype guard against three GUIDs | a descriptor lookup, so a dimension this build does not know is a refusal rather than a throw |
 *
 * The applied strength is now **derived**, not stored (`design/spec.md` §6.5): it is a function of
 * the Host's intent and what is worn, so there is no value here that can go stale. That is the
 * whole reason the getter and the setter could leave.
 *
 * ## Why a morph channel remains
 *
 * A losing or partial provider still changes its own model, appearance or pose
 * (`design/spec.md` §6.7, rule 3). This event is that channel, and it is **existing working code**
 * rather than a new mechanism: the visor and gag families already subscribe to it and re-model
 * themselves. What changed is its payload — a dimension rather than an archetype, and the resolved
 * strengths rather than the values a writer was told.
 *
 * ## Time still advances
 *
 * {@link AnnounceRate} ends with `KinkyDungeonAdvanceTime(1)` and re-enters the game's own tick
 * dispatch whenever it is called from inside one. That is deliberate and inherited: see the *"Time
 * advances from inside the game's tick dispatch"* invariant in `AGENTS.md` for what it costs and
 * why the prototype accepted it. Retiring this writer is **Phase 3.1**.
 * @module FactionMachine/MachinePrime/Coordinator/SensoryControl
 */

import * as KDS from 'kd-structured'

/**
 * The payload of {@link EventKeys.DimensionRateUpdate}: which dimension moved, and the strengths
 * either side of the move.
 *
 * Both directions are carried so a subscriber can pick its feedback from the direction of the
 * change as well as from the new value — and so a family whose model changes only at a *crossing*
 * can compare the two rather than guess.
 */
export interface DimensionRateUpdateEventArgs {
    /** The dimension whose applied strength moved. */
    Dimension: string
    /** The applied strength before the move. */
    OldStrength: number
    /** The applied strength after it. */
    NewStrength: number
}

/**
 * The keys the coordinator sends events under on the game's event bus.
 *
 * They are GUIDs because the bus is shared with the game and every other mod, and a handler is
 * registered under its key alone: a name that another mod might also choose would collide at load
 * and crash both. **The value is unchanged from the limiter prototype**, so no handler registration
 * had to move with the rename.
 *
 * A `const enum`, so TypeScript inlines the GUIDs at every use site and there is no `EventKeys`
 * object at runtime: a plain-JavaScript subscriber has to spell the GUID out. It is both the
 * `trigger` a handler registers under and the `Event` a `KinkyDungeonSendEvent` payload carries.
 */
export const enum EventKeys {
    /**
     * Sent after a dimension's applied strength actually changed, which is the signal every morph
     * handler in the machine-prime item set subscribes to. Carries
     * {@link DimensionRateUpdateEventArgs}.
     */
    DimensionRateUpdate = '26228B48-2471-481C-92B7-420F6F5513C9'
}

/**
 * Announces that a dimension's applied strength moved, and lets the game react.
 *
 * **It does not compare against what was there before**, because there is nothing stored to compare
 * against: the applied strength is derived, and a caller that wants to report only real changes
 * compares the resolutions itself. That is the honest shape — a module that kept a shadow copy of
 * the last value would be the cache this refactor exists to delete.
 *
 * @param args.dimension - The dimension that moved.
 * @param args.OldStrength - The strength before the move.
 * @param args.NewStrength - The strength after it.
 */
export const AnnounceRate = (args: {
    readonly dimension: string
    readonly OldStrength: number
    readonly NewStrength: number
}): void => {
    KDS.KinkyDungeonSendEvent({
        Event: EventKeys.DimensionRateUpdate,
        data: {
            Dimension: args.dimension,
            OldStrength: args.OldStrength,
            NewStrength: args.NewStrength
        } satisfies DimensionRateUpdateEventArgs
    })
    KinkyDungeonAdvanceTime(1)
}

/**
 * Reports a dimension change to the player: at most one message and at most one sound, each chosen
 * by the direction of the change and each skipped when the caller did not supply it.
 *
 * The point of passing both directions is that each item supplies its own pair, so the text a
 * player reads matches the morph they are looking at. Only `delta > 0` selects the increase half,
 * so a `delta` of exactly zero counts as a decrease. The sound is skipped entirely when the game
 * has sound disabled, and falls back to the decrease sound if an increase was wanted but no
 * `sfxIncrease` was given.
 *
 * @param args.delta - The change in strength; positive means more severe.
 * @param args.sfxIncrease - Sound file stem for an increase, resolved under the game's audio directory.
 * @param args.sfxDecrease - Sound file stem for a decrease.
 * @param args.messageIncrease - Text message parameters for an increase.
 * @param args.messageDecrease - Text message parameters for a decrease.
 */
export const ShowEffectsOnItemMorph = (args: {
    delta: number,
    sfxIncrease?: string,
    sfxDecrease?: string,
    messageIncrease?: KDS.IKinkyDungeonSendTextMessageParameters
    messageDecrease?: KDS.IKinkyDungeonSendTextMessageParameters
}) => {
    const {
        delta,
        sfxIncrease,
        sfxDecrease,
        messageIncrease,
        messageDecrease
    } = args
    if (delta > 0 && null != messageIncrease) {
        KDS.KinkyDungeonSendTextMessage(messageIncrease)
    }
    else if (null != messageDecrease) {
        KDS.KinkyDungeonSendTextMessage(messageDecrease)
    }

    if (KDSoundEnabled()) {
        if (delta > 0 && null != sfxIncrease) {
            AudioPlayInstantSoundKD(`${KinkyDungeonRootDirectory}Audio/${sfxIncrease}.ogg`)
        }
        else if (null != sfxDecrease) {
            AudioPlayInstantSoundKD(`${KinkyDungeonRootDirectory}Audio/${sfxDecrease}.ogg`)
        }
    }
}
