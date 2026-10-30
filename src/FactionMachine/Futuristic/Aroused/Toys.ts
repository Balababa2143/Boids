/**
 * The drone toys: a lockable version of the game's prototype egg, and a front and a rear denial
 * plug. The two base-game restraints they derive from are looked up by name at load, before this
 * module's own registrations are appended to that list.
 *
 * A key is part of a persisted identity: the restraint's registered name is derived from it, so
 * renaming a member of `ToyKind` renames a saved item.
 * @module FactionMachine/Futuristic/Aroused/Toys
 */

import { Map as IMMap } from 'immutable'
import { AddRestraintVariantMapToGame, RestraintVariantMapBuilder, VariantPart } from '../../../KDExtension'
import { DerivedVariantBase } from '../../../KDExtension/Release'
import { ThrowIfNull } from '../../../Utilities'
import { ControlledTag } from '../../MachinePrime/Coordinator/Membership'
import { SFX } from '../Common'

/**
 * The base-game restraints these items derive from, looked up because the engine has registered
 * them.
 */
const NippleClamps = ThrowIfNull(
    KinkyDungeonRestraints.find(r => r.name === 'NippleClamps'),
    'Boids: the base-game restraint \'NippleClamps\' is not registered.'
)
const TrapVibe = ThrowIfNull(
    KinkyDungeonRestraints.find(r => r.name === 'TrapVibeProto'),
    'Boids: the base-game restraint \'TrapVibeProto\' is not registered.'
)

/** The three items this family makes. */
export const ToyKind = {
    LockVibe: 'LockVibe',
    DenialPlugF: 'DenialPlugF',
    DenialPlugR: 'DenialPlugR',
} as const

/** One of the three. */
export type ToyKind = typeof ToyKind[keyof typeof ToyKind]

/** Every kind, for a caller that has to walk the family. */
export const ToyKinds: readonly ToyKind[] = Object.values(ToyKind)

/**
 * What the two plugs share: a limited, arousal-mode item that is remotely activatable, keeps itself
 * out of vibe slots, resists struggle more than the average plug, and participates in the control
 * model.
 *
 * The periodic blocks share only their handler shape here; the rolls differ per plug and are
 * declared there, which is what makes the rear plug the milder one.
 */
const ToyBase = {
    inventory: true,
    arousalMode: true,
    weight: 0,
    limited: true,
    minLevel: 0,
    allFloors: true,
    shrine: [
        'Plugs',
        'Vibes',
        'Toys',
        ControlledTag,
    ],
    playerTags: { 'NoVibes': -1000 },
    failSuffix: { 'Struggle': 'Plug' },
    allowRemote: true,
    escapeChance: { ...NippleClamps.escapeChance, 'Struggle': 0.25, Remove: 0.5 },
    ...SFX.InflateLockSfx,
} satisfies Partial<restraint>

/**
 * The per-kind parts: everything that tells one toy from another. The `events` lists are per kind
 * because the toy family's behaviour is its tick handlers; the `vibeStruggle` handler every toy
 * shares is spread in rather than retyped.
 */
const ToyParts: Readonly<Record<ToyKind, VariantPart<restraint>>> = {
    /**
     * A lockable egg in `ItemVulvaPiercings`, the slot of the restraint it derives from. It adopts
     * the nipple clamps' escape chances but keeps the derived restraint's own, lower, struggle
     * chance.
     */
    LockVibe: {
        ...TrapVibe,
        escapeChance: {
            ...NippleClamps.escapeChance,
            Struggle: TrapVibe.escapeChance.Struggle,
        },
    },
    /**
     * The front denial plug, in `ItemVulva`: several denial rolls of differing power with a short
     * cooldown between vibrations.
     */
    DenialPlugF: {
        Group: 'ItemVulva',
        plugSize: 1.5,
        power: 3,
        weight: 2,
        enemyTags: { 'trap': 10, 'maidRestraintsLight': 2, 'genericToys': 2, 'machinePlug': 5, 'toyPleasure': 2 },
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
    },
    /**
     * The rear denial plug, in `ItemButt`: its rolls are rarer, weaker and on a far longer cooldown
     * than the front plug's, so it is the milder of the two.
     */
    DenialPlugR: {
        Group: 'ItemButt',
        plugSize: 2.0,
        power: 5,
        weight: 1,
        enemyTags: { 'genericToys': 1, 'rearToys': 10, 'toyEdgeMid': 2 },
        events: [
            { trigger: 'beforeStruggleCalc', type: 'vibeStruggle', inheritLinked: true },
            { trigger: 'remoteVibe', type: 'RemoteActivatedVibe', power: 2, time: 30, edgeOnly: true },
            { trigger: 'tick', type: 'PeriodicDenial', power: 1, time: 24, edgeOnly: true, cooldown: { 'normal': 50, 'tease': 20 }, chance: 0.015 },
            { trigger: 'tick', type: 'PeriodicDenial', power: 2, time: 16, edgeOnly: true, cooldown: { 'normal': 50, 'tease': 20 }, chance: 0.01 },
        ],
    },
}

/**
 * What each toy says about itself: the name a player reads, the restraint its flavour and function
 * lines come from, and — for the plugs — the line that tells front from back.
 *
 * `Source` is declared rather than read: at module evaluation the engine's text may not have been
 * parsed yet, and a read then registers `[NotFound] …` instead of words.
 */
const ToyText: Readonly<Record<ToyKind, { readonly DisplayName: string, readonly Source: string, readonly FunctionText?: string }>> = {
    LockVibe: {
        DisplayName: 'Lockable Vibe',
        Source: TrapVibe.name,
    },
    DenialPlugF: {
        DisplayName: 'Drone Plug',
        Source: 'TrapPlug3',
        FunctionText: 'Lockable, Front',
    },
    DenialPlugR: {
        DisplayName: 'Drone Plug',
        Source: 'RearVibe1',
        FunctionText: 'Lockable, Back',
    },
}

const builder = new RestraintVariantMapBuilder<ToyKind>({
    baseId: DerivedVariantBase.ToysRestraint,
})

for (const kind of ToyKinds) {
    // `LockVibe` spreads the base-game restraint, so its `name` is overwritten here.
    builder.AddVariantPart(kind, {
        ...ToyParts[kind],
        name: '',
    } satisfies VariantPart<restraint>)
    builder.AddText(kind, ToyText[kind])
}

/**
 * The registered restraint name for each kind, which is what `KinkyDungeonGetRestraintByName`
 * resolves and what the game's equip entry points expect to be handed.
 *
 * A variant name — minted when the game equips a variant — resolves to nothing here, and the equip
 * silently does nothing.
 */
export const ToyRestraints: IMMap<ToyKind, string> =
    AddRestraintVariantMapToGame(builder.BuildVariantMap(ToyBase))

/** The registered restraint for one kind. */
export const GetToy = (kind: ToyKind): string =>
    ThrowIfNull(ToyRestraints.get(kind), `Boids: no restraint was registered for '${kind}'.`)
