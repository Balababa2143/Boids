/**
 * The sensory limiters: how blind a blinder and how muffled a gag leaves the
 * player, read and written by archetype rather than by item.
 *
 * What is stored is a *target*, not an effect. Reading a limiter tells you what the
 * item in that slot has been set to; the item's own `calcBlind` handler or morph
 * handler turns that into gameplay. Writing one is what drives the item set:
 * {@link SetLimiterStrength} stores the value, announces the change on the game's
 * event bus, and advances game time, which is how the worn item gets its chance to
 * react.
 * @module FactionMachine/MachinePrime/Coordinator/SensoryControl
 */

import * as KDS from 'kd-structured'
import { ItemArchetype } from '../Constant'
import { GetState, SetStateIn } from './Internal/StateStorage'

type SensoryController = ItemArchetype.Deafener | ItemArchetype.Blinder | ItemArchetype.Gag

const ThrowIfNotIsSensoryController = (type: ItemArchetype): SensoryController => {
    switch (type) {
        case ItemArchetype.Deafener:
        case ItemArchetype.Blinder:
        case ItemArchetype.Gag:
            return type
        default:
            throw new Error('Invalid sensory controller type')
    }
}

/**
 * The payload of {@link EventKeys.SensoryLimiterStrengthUpdate}: which limiter
 * moved, and the strengths either side of the move, so a subscriber can pick its
 * feedback from the direction of the change as well as the new value.
 */
export interface LimiterStrengthUpdateEventArgs {
    Type: SensoryController
    OldStrength: number
    NewStrength: number
}

/**
 * The keys the coordinator sends events under on the game's event bus.
 *
 * They are GUIDs because the bus is shared with the game and every other mod, and a
 * handler is registered under its key alone: a name that another mod might also
 * choose would collide at load and crash both.
 *
 * A `const enum`, so TypeScript inlines the GUIDs at every use site and there is no
 * `EventKeys` object at runtime: a plain-JavaScript subscriber has to spell the GUID
 * out. It is both the `trigger` a handler registers under and the `Event` a
 * `KinkyDungeonSendEvent` payload carries.
 */
export const enum EventKeys {
    /**
     * Sent after a limiter strength actually changed, which is the signal every
     * morph handler in the machine-prime item set subscribes to. Carries
     * {@link LimiterStrengthUpdateEventArgs}.
     */
    SensoryLimiterStrengthUpdate = '26228B48-2471-481C-92B7-420F6F5513C9'
}

/**
 * Reads the target strength stored for one sensory limiter.
 *
 * @param type - The limiter to read: a `Blinder`, `Deafener` or `Gag`. Any other
 * archetype throws rather than answering about a slot that has no limiter.
 * @returns The stored target, 0 to 1: 0 is no restriction at all, 1 is the most
 * severe the item can make it.
 */
export const GetLimiterStrength = (type: ItemArchetype) =>
    GetState().ActivePC.Items[
        ThrowIfNotIsSensoryController(type)
    ].TargetStrength

/**
 * Writes the target strength of one sensory limiter, in the range 0 to 1, where 0
 * is no restriction at all and 1 is the most severe.
 *
 * A write that changes the value updates the state and sends
 * {@link EventKeys.SensoryLimiterStrengthUpdate} on the game's event bus, which is
 * how the worn item learns it has to morph; a write of the value already stored does
 * neither. Game time advances by one on every call, changed or not — see the
 * "Time advances from inside the game's tick dispatch" invariant in `AGENTS.md`
 * for why that is deliberate and what it costs.
 *
 * @param type - The limiter to write: a `Blinder`, `Deafener` or `Gag`. Any other
 * archetype throws.
 * @param newStrength - The new target. Nothing here clamps it, so keeping it inside
 * 0 to 1 is the caller's job.
 */
export const SetLimiterStrength = (type: ItemArchetype, newStrength: number) => {
    const controllerType = ThrowIfNotIsSensoryController(type)
    const oldStrength = GetLimiterStrength(controllerType)
    if (oldStrength !== newStrength) {
        SetStateIn(['ActivePC', 'Items', controllerType, 'TargetStrength'], newStrength)
        KDS.KinkyDungeonSendEvent({
            Event: EventKeys.SensoryLimiterStrengthUpdate,
            data: {
                Type: controllerType,
                OldStrength: oldStrength,
                NewStrength: newStrength
            } satisfies LimiterStrengthUpdateEventArgs
        })
    }
    KinkyDungeonAdvanceTime(1)
}

/**
 * Reports a limiter change to the player: at most one message and at most one
 * sound, each chosen by the direction of the change and each skipped when the
 * caller did not supply it.
 *
 * The point of passing both directions is that each item supplies its own pair, so
 * the text a player reads matches the morph they are looking at. Only `delta > 0`
 * selects the increase half, so a `delta` of exactly zero counts as a decrease. The
 * sound is skipped entirely when the game has sound disabled, and falls back to the
 * decrease sound if an increase was wanted but no `sfxIncrease` was given.
 *
 * @param args.delta - The change in strength; positive means more severe.
 * @param args.sfxIncrease - Sound file stem for an increase, resolved under the
 * game's audio directory.
 * @param args.sfxDecrease - Sound file stem for a decrease.
 * @param args.messageIncrease - Text message parameters for an increase.
 * @param args.messageDecrease - Text message parameters for a decrease.
 */
export const ShowEffectsOnItemMorph = (args:{
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
    if(delta > 0 && null != messageIncrease){
        KDS.KinkyDungeonSendTextMessage(messageIncrease)
    }
    else if(null != messageDecrease){
        KDS.KinkyDungeonSendTextMessage(messageDecrease)
    }

    if (KDSoundEnabled()) {
        if (delta > 0 && null != sfxIncrease) {
            AudioPlayInstantSoundKD(`${KinkyDungeonRootDirectory}Audio/${sfxIncrease}.ogg`)
        }
        else if(null != sfxDecrease) {
            AudioPlayInstantSoundKD(`${KinkyDungeonRootDirectory}Audio/${sfxDecrease}.ogg`)
        }
    }
}