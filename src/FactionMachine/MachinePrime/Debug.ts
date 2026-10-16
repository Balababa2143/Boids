/**
 * Development-only drivers and console entry points.
 *
 * This module exists so prototype scaffolding lives in one obviously-named place
 * instead of being mixed into the item modules. `MachinePrime/index.ts` exports it as
 * `Boids.FactionMachine.MachinePrime.Debug`, and it is evaluated for its side effects
 * like every other registration module.
 *
 * The random `tick` driver below is, for now, the *only* input to the sensory
 * limiters: `Coordinator/SensoryControl.GetLimiterStrength` is read by
 * `Item/Visor/Common.CalcBlind` to scale blindness, and the visor and gag morph
 * handlers subscribe to strength-change events. It is therefore load-bearing
 * placeholder code rather than leftover debris, and must not simply be deleted —
 * replacing it is what #19 (drone set state machine) and #40 (visor selection) are
 * for. It registers on the same event GUID as before, so relocating it changes no
 * behaviour.
 */

import { AddEventHandler } from '../../KDExtension'
import { ItemArchetype } from './Constant'
import { SetLimiterStrength } from './Coordinator/SensoryControl'

/**
 * Randomly nudges the gag and blinder limiters, roughly 45% of ticks in total.
 *
 * Note that `SetLimiterStrength` advances game time by one, and this handler runs
 * inside the game's own tick dispatch, so each firing re-enters time advancement.
 * That is pre-existing behaviour and deliberately preserved.
 */
AddEventHandler({
    eventMap: KDEventMapGeneric,
    trigger: 'tick',
    type: '90F84036-7836-473E-BE57-14009ABE6158',
    handler() {
        if (Math.random() < 0.25) {
            SetLimiterStrength(ItemArchetype.Gag, Math.random())
        }
        else if (Math.random() < 0.2) {
            SetLimiterStrength(ItemArchetype.Blinder, Math.random())
        }
    },
})

/** Sets the blinder strength, or picks a random one when no value is given. */
export const SetBlindStrength = (value?: number) =>
    SetLimiterStrength(ItemArchetype.Blinder, value ?? Math.random())

/** Sets the gag strength, or picks a random one when no value is given. */
export const SetGagStrength = (value?: number) =>
    SetLimiterStrength(ItemArchetype.Gag, value ?? Math.random())
