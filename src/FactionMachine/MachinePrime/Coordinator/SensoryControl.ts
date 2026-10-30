/**
 * The sensory surface: the strength a dimension is currently resolving to, and the channel a
 * morphing item hears about it on. The applied strength is derived from the Host's intent and what
 * is worn, so there is no value here that can go stale; the morph channel exists because a losing
 * or partial provider still changes its own model, appearance or pose.
 * @module FactionMachine/MachinePrime/Coordinator/SensoryControl
 */

import * as KDS from 'kd-structured'

/**
 * The payload of {@link EventKeys.DimensionRateUpdate}: which dimension moved, and the strengths
 * either side of the move. Both directions are carried so a subscriber can pick its feedback from
 * the direction of the change, and so a family whose model changes only at a crossing can compare
 * the two.
 */
export interface DimensionRateUpdateEventArgs {
    Dimension: string
    OldStrength: number
    NewStrength: number
}

/**
 * The keys the coordinator sends events under on the game's event bus. They are GUIDs because the
 * bus is shared with the game and every other mod, and a handler is registered under its key alone:
 * a name another mod also chose would collide at load. A `const enum`, so TypeScript inlines the
 * GUIDs at every use site and there is no `EventKeys` object at runtime: a plain-JavaScript
 * subscriber has to spell the GUID out.
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
 * Announces that a dimension's applied strength moved, and lets the game react. It compares nothing
 * against what was there before: the applied strength is derived, so a caller that wants to report
 * only real changes compares the resolutions itself. Ends with `KinkyDungeonAdvanceTime(1)`, so it
 * must never be called from inside a tick handler: that re-enters the game's own dispatch.
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
 * by the direction of the change and each skipped when the caller did not supply it. Only
 * `delta > 0` selects the increase half, so a `delta` of exactly zero counts as a decrease, and the
 * sound falls back to the decrease one if an increase was wanted but no `sfxIncrease` was given.
 * @param args.delta - The change in strength; positive means more severe.
 * @param args.sfxIncrease - Sound file stem for an increase, under the game's audio directory.
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
