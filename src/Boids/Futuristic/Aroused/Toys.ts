/**
 * The drone toys: a lockable version of the game's prototype egg, and a front and
 * a rear denial plug. The two base-game restraints the items are derived from are
 * looked up by name from `KinkyDungeonRestraints` at load, before this module's own
 * registrations are appended to that list.
 *
 * Each export is the registered restraint's name, a generated GUID, and each item
 * gets its display text as a side effect of the initialiser.
 * @module Boids/Futuristic/Aroused/Toys
 */

import * as KDEx from '../../../KDExtension'
import { SFX } from '../Common'


const NippleClamps = <restraint>KinkyDungeonRestraints.find(r => r.name === 'NippleClamps')
const TrapVibe = <restraint>KinkyDungeonRestraints.find(r => r.name === 'TrapVibeProto')


/**
 * A lockable egg, shown as "Lockable Vibe" in `ItemVulvaPiercings`, the slot of the
 * base game restraint it is derived from. It adopts the nipple clamps' escape
 * chances but keeps the derived restraint's own struggle chance, which is lower, so
 * struggle is the approach it resists hardest.
 */
export const LockVibe =
    KDEx.AddRestraintWithTextThenGetName(
        {
            ...TrapVibe,
            name: '1AB75038-8339-4124-AD71-5F88F2DF5BFF',
            escapeChance: {
                ...NippleClamps!.escapeChance,
                Struggle: TrapVibe!.escapeChance.Struggle
            }
        },
        {
            DisplayName: 'Lockable Vibe',
            FlavorText: TextProvider.instance.getText(`Restraint${TrapVibe.name}Desc`),
            FunctionText: TextProvider.instance.getText(`Restraint${TrapVibe.name}Desc2`)
        }
    )

/**
 * The front denial plug, shown as "Drone Plug" in `ItemVulva`. It is a limited item,
 * so an enemy needs it in stock or the unlimited tag to apply it, and its player tag
 * keeps it out of vibe slots. Its `tick` handlers give it several denial rolls of
 * differing power and a short cooldown between vibrations, and it accepts remote
 * activation.
 */
export const DenialPlugF =
    KDEx.AddRestraintWithTextThenGetName(
        {
            inventory: true,
            arousalMode: true,
            name: '9CEB10C8-EE87-4AD9-99E2-D7216FB4CF40',
            Group: 'ItemVulva',
            plugSize: 1.5,
            power: 3,
            weight: 2,
            failSuffix: { 'Struggle': 'Plug' },
            limited: true,
            escapeChance: { ...NippleClamps.escapeChance, 'Struggle': 0.25, Remove: 0.5 },
            enemyTags: { 'trap': 10, 'maidRestraintsLight': 2, 'genericToys': 2, 'machinePlug': 5, 'toyPleasure': 2 },
            playerTags: { 'NoVibes': -1000 },
            minLevel: 0,
            allFloors: true,
            shrine: ['Plugs', 'Vibes', 'Toys'],
            // linkedVibeTags: ['plugs'],
            allowRemote: true,
            events: [
                { trigger: 'beforeStruggleCalc', type: 'vibeStruggle', inheritLinked: true },
                { trigger: 'remoteVibe', type: 'RemoteActivatedVibe', power: 4, time: 5, edgeOnly: true },
                { trigger: 'tick', type: 'PeriodicDenial', power: 1, time: 13, edgeOnly: true, cooldown: { 'normal': 15, 'tease': 10 }, chance: 0.01 },
                { trigger: 'tick', type: 'PeriodicDenial', power: 2, time: 10, edgeOnly: true, cooldown: { 'normal': 15, 'tease': 10 }, chance: 0.0125 },
                { trigger: 'tick', type: 'PeriodicDenial', power: 3, time: 7, edgeOnly: true, cooldown: { 'normal': 15, 'tease': 10 }, chance: 0.015 },
                { trigger: 'tick', type: 'PeriodicDenial', power: 4, time: 4, edgeOnly: true, cooldown: { 'normal': 15, 'tease': 10 }, chance: 0.0075 },
                { trigger: 'tick', type: 'PeriodicDenial', power: 5, time: 6, edgeOnly: true, cooldown: { 'normal': 15, 'tease': 10 }, chance: 0.0375 },
                { trigger: 'tick', type: 'PeriodicTeasing', power: 5, time: 3, edgeOnly: false, cooldown: { 'normal': 15, 'tease': 10 }, chance: 0.00125 },
            ],
            ...SFX.InflateLockSfx,
        },
        {

            DisplayName: 'Drone Plug',
            FlavorText: TextProvider.instance.getText(`Restraint${'TrapPlug3'}Desc`),
            FunctionText: 'Lockable, Front',
        }
    )

/**
 * The rear denial plug, shown as "Drone Plug" in `ItemButt`. Also limited and
 * remotely activatable, but its two `tick` handlers roll less often, at lower power
 * and with a far longer cooldown between vibrations than the front plug's, so it is
 * the milder of the two.
 */
export const DenialPlugR =
    KDEx.AddRestraintWithTextThenGetName(
        {
            inventory: true,
            arousalMode: true,
            name: '9D1BF9D4-C99D-4BA8-A25B-2A89FF8C2B8D',
            Group: 'ItemButt',
            plugSize: 2.0,
            power: 5,
            weight: 1,
            escapeChance: { ...NippleClamps.escapeChance, 'Struggle': 0.25, Remove: 0.5 },
            enemyTags: { 'genericToys': 1, 'rearToys': 10, 'toyEdgeMid': 2 },
            limited: true,
            playerTags: { 'NoVibes': -1000 },
            minLevel: 0,
            allFloors: true,
            shrine: ['Plugs', 'Vibes', 'Toys'],
            failSuffix: { 'Struggle': 'Plug' },
            // linkedVibeTags: ['plugs'],
            allowRemote: true,
            events: [
                { trigger: 'beforeStruggleCalc', type: 'vibeStruggle', inheritLinked: true },
                { trigger: 'remoteVibe', type: 'RemoteActivatedVibe', power: 2, time: 30, edgeOnly: true },
                { trigger: 'tick', type: 'PeriodicDenial', power: 1, time: 24, edgeOnly: true, cooldown: { 'normal': 50, 'tease': 20 }, chance: 0.015 },
                { trigger: 'tick', type: 'PeriodicDenial', power: 2, time: 16, edgeOnly: true, cooldown: { 'normal': 50, 'tease': 20 }, chance: 0.01 },
            ],
            ...SFX.InflateLockSfx,
        },
        {
            DisplayName: 'Drone Plug',
            FlavorText: TextProvider.instance.getText(`Restraint${'RearVibe1'}Desc`),
            FunctionText: 'Lockable, Back',
        }
    )