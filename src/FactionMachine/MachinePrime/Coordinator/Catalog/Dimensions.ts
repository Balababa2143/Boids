/**
 * The dimension catalogue: one record per dimension, and nothing else decides what exists. Adding a
 * dimension is one record here plus one name in `Name.ts`, because everything else in the control
 * model is total over the registry rather than over a list. A descriptor describes; it does not
 * implement. `Seams` names every tool a dimension uses and the algebra that tool speaks, and
 * `Verified` says whether that tool was read out of the engine or has not been read; binding a seam
 * to a handler is not this file's job.
 * @module FactionMachine/MachinePrime/Coordinator/Catalog/Dimensions
 */

import {
    ArmPoseLadder,
    BodyStateName,
    DimensionDescriptor,
    DimensionGroup,
    Direction,
    EngineIdentity,
    EngineValue,
    FacetName,
    LegPoseLadder,
    RegisterDimension,
    Seam,
    SeamKind,
    Subsystem,
} from '../../../../KDExtension/Control'
import { DimensionIdOf, DimensionName } from './Name'

/** The facets a rate-only dimension composes: it squeezes a value and does nothing else. */
const RateOnly: ReadonlySet<FacetName> = new Set([FacetName.Rate])

/** A dimension that scales a value and can be permitted or refused. */
const RateAndGate: ReadonlySet<FacetName> = new Set([FacetName.Rate, FacetName.Gate])

/** The facets a gate-only dimension composes: it permits or refuses, and scales nothing. */
const GateOnly: ReadonlySet<FacetName> = new Set([FacetName.Gate])

/** A mediated ability: the Host forbids, and equipment re-grants. */
const GateAndWhitelist: ReadonlySet<FacetName> = new Set([FacetName.Gate, FacetName.Whitelist])

/**
 * A body configuration: a set of permitted poses behind the same gate as everything else. It has no
 * rate, because a pose is chosen from a ladder rather than measured.
 */
const PostureAndGate: ReadonlySet<FacetName> = new Set([FacetName.Posture, FacetName.Gate])

/**
 * A seam whose trigger was read out of the engine; the `Handler` is the game's own bucket key where
 * one exists, which is why a descriptor names a string and not a GUID.
 */
const Verified = (Kind: SeamKind, Trigger: string, Handler: string, Order = 0): Seam => ({
    Kind,
    Handler,
    Trigger,
    Order,
    Verified: true,
})

/**
 * A seam whose handler has not been read out of the engine. Nothing may build on one until it is.
 */
const Unverified = (Kind: SeamKind, Trigger: string, Handler: string, Order = 0): Seam => ({
    Kind,
    Handler,
    Trigger,
    Order,
    Verified: false,
})

/** The engine value map for a dimension whose scale has not been read, declared as the identity. */
const Unread = EngineIdentity

/**
 * How blind the wearer is, in the engine's own units. Blindness is an integer ladder capped at 7,
 * so a resolved 1 is the seventh rung and a resolved 0 is sight. `Math.round` rather than
 * `Math.floor`, so the top of the model's range reaches the game's own ceiling.
 */
const BlindLadder: EngineValue = value => Math.round(value * 7)

//#region Sensory

/**
 * How blind the wearer is, which the game calls blindness. `calcBlind` mutates `data.blindness` in
 * place and everything downstream reads the derived `KinkyDungeonBlindLevel`; the second seam is
 * needed because the level is also consumed by `KDSensesTrainingBoost`, which fires `calcGagRed`
 * rather than a senses event.
 */
RegisterDimension({
    Id: DimensionIdOf(DimensionName.Sight),
    Group: DimensionGroup.Constraint,
    Subsystem: Subsystem.Sensory,
    Facets: RateOnly,
    Direction: Direction.Deny,
    BuffSide: false,
    Seams: [
        Verified(SeamKind.Value, 'calcBlind', 'calcBlind'),
        Unverified(SeamKind.Multiply, 'calcGagRed', 'KDSensesTrainingBoost', 1),
    ],
    EngineValue: BlindLadder,
} satisfies DimensionDescriptor)

/**
 * How deaf the wearer is. `calcDeaf` takes an accumulator rather than a value, so a handler can
 * subtract from it as readily as add, which is why this dimension has both directions. The consumer
 * seam is unverified because how the model's 0..1 maps onto the hearing radius has not been read.
 */
RegisterDimension({
    Id: DimensionIdOf(DimensionName.Hearing),
    Group: DimensionGroup.Constraint,
    Subsystem: Subsystem.Sensory,
    Facets: RateOnly,
    Direction: Direction.Both,
    BuffSide: true,
    Seams: [
        Verified(SeamKind.Add, 'calcDeaf', 'KDDeafLevel'),
        Unverified(SeamKind.Multiply, 'calcHearing', 'KinkyDungeonGetHearingRadius', 1),
    ],
    EngineValue: Unread,
} satisfies DimensionDescriptor)

/**
 * How far the wearer's spells reach. `KDGetSpellRange` is a two-field mutating seam
 * (`{spell, range}`), and the game already uses it to add range, which is why this dimension has a
 * buff side. It takes no `Whitelist`.
 */
RegisterDimension({
    Id: DimensionIdOf(DimensionName.SpellRange),
    Group: DimensionGroup.Buff,
    Subsystem: Subsystem.Sensory,
    Facets: RateOnly,
    Direction: Direction.Both,
    BuffSide: true,
    Seams: [
        Verified(SeamKind.Add, 'calcSpellRange', 'AddRange'),
    ],
    EngineValue: Unread,
} satisfies DimensionDescriptor)

//#endregion

//#region Behavior

/**
 * How hard the wearer can struggle against what holds her. Both a permission and a difficulty,
 * hence a gate and a rate: the gate lets a struggle type be permitted through equipment, and the
 * config names the types it governs.
 */
RegisterDimension({
    Id: DimensionIdOf(DimensionName.Struggle),
    Group: DimensionGroup.Constraint,
    Subsystem: Subsystem.Behavior,
    Facets: RateAndGate,
    Direction: Direction.Both,
    BuffSide: true,
    Seams: [
        Unverified(SeamKind.Value, 'Escape', 'KDSuccessRemove'),
        Unverified(SeamKind.Value, 'Struggle', 'KinkyDungeonStruggle'),
    ],
    EngineValue: Unread,
    Config: {
        /**
         * Which struggle types this gate governs — `Remove`, `Struggle`, `Pick`, `Unlock`, `Cut`.
         */
        Types: true,
    },
} satisfies DimensionDescriptor)

/**
 * Whether the wearer can speak, and how strictly her mouth is filled. Speech has no granting seam —
 * the gag helpers read the restraint's own fields inline — so the only way to gate it is the action
 * chokepoint, and the direction is deny-only.
 */
RegisterDimension({
    Id: DimensionIdOf(DimensionName.Speech),
    Group: DimensionGroup.Substitution,
    Subsystem: Subsystem.Behavior,
    Facets: RateAndGate,
    Direction: Direction.Deny,
    BuffSide: false,
    Seams: [
        Unverified(SeamKind.Value, 'KDInputTypes', 'KDSendInput'),
    ],
    EngineValue: Unread,
} satisfies DimensionDescriptor)

/**
 * Whether the wearer can move, and how far. `immobile`-based movement is read inline with no seam,
 * and movement has levers the chokepoint does not cover — `KDGameData.MovePoints`, the `playerStun`
 * flag — so the descriptor names more than one tool. A rate as well as a gate, or a hobble would be
 * inexpressible.
 */
RegisterDimension({
    Id: DimensionIdOf(DimensionName.Movement),
    Group: DimensionGroup.Substitution,
    Subsystem: Subsystem.Behavior,
    Facets: RateAndGate,
    Direction: Direction.Deny,
    BuffSide: false,
    Seams: [
        Unverified(SeamKind.Value, 'move', 'KDSendInput'),
        Unverified(SeamKind.Value, 'tick', 'KDGameData.MovePoints', 1),
    ],
    EngineValue: Unread,
} satisfies DimensionDescriptor)

/**
 * Whether the wearer can attack, and how hard. The chokepoint denies and the game's own combat
 * seams can grant, hence the buff side. The rate exists because the game pays for melee accuracy
 * and damage separately from whether a blow is possible.
 */
RegisterDimension({
    Id: DimensionIdOf(DimensionName.Attack),
    Group: DimensionGroup.Substitution,
    Subsystem: Subsystem.Behavior,
    Facets: RateAndGate,
    Direction: Direction.Both,
    BuffSide: true,
    Seams: [
        Unverified(SeamKind.Value, 'attack', 'KDSendInput'),
        Unverified(SeamKind.Value, 'beforePlayerAttack', 'beforePlayerAttack', 1),
    ],
    EngineValue: Unread,
    Feeds: [BodyStateName.ArmsBound],
} satisfies DimensionDescriptor)

/**
 * Whether the wearer can cast, and how well. The rate exists because the spell components are
 * conditional on the bindings rather than blocked by them: the `Arms` and `Legs` components are
 * dropped, which changes what a cast costs and does.
 */
RegisterDimension({
    Id: DimensionIdOf(DimensionName.Casting),
    Group: DimensionGroup.Substitution,
    Subsystem: Subsystem.Behavior,
    Facets: RateAndGate,
    Direction: Direction.Both,
    BuffSide: true,
    Seams: [
        Unverified(SeamKind.Value, 'tryCastSpell', 'KDSendInput'),
        Unverified(SeamKind.Multiply, 'calcEfficientMana', 'calcEfficientMana', 1),
    ],
    EngineValue: Unread,
    Feeds: [BodyStateName.ArmsBound],
} satisfies DimensionDescriptor)

/**
 * Whether the wearer can use what her hands hold. A gate and a whitelist: the Host forbids unaided
 * use and equipment re-grants it; the whitelist is empty because no key is grantable.
 */
RegisterDimension({
    Id: DimensionIdOf(DimensionName.WeaponUse),
    Group: DimensionGroup.Substitution,
    Subsystem: Subsystem.Behavior,
    Facets: GateAndWhitelist,
    Direction: Direction.Both,
    BuffSide: true,
    Seams: [
        Unverified(SeamKind.Value, 'offhandswitch', 'KDSendInput'),
        Unverified(SeamKind.Value, 'switchWeapon', 'KDSendInput', 1),
        Unverified(SeamKind.Value, 'getHandsBound', 'getHandsBound', 2),
    ],
    Feeds: [BodyStateName.ArmsBound, BodyStateName.HandsBound],
} satisfies DimensionDescriptor)

/**
 * Whether the wearer can get out of what she is in. Callers short-circuit on
 * `forceResult != undefined`, which is why `forceResult = false` is the direction that grants. It
 * feeds the arms-bound and hands-bound predicates as well as being a dimension, because the two
 * globals it names are the game's own questions about the body as a whole.
 */
RegisterDimension({
    Id: DimensionIdOf(DimensionName.Escape),
    Group: DimensionGroup.Substitution,
    Subsystem: Subsystem.Behavior,
    Facets: GateOnly,
    Direction: Direction.Both,
    BuffSide: true,
    Seams: [
        Unverified(SeamKind.Value, 'getArmsBound', 'getArmsBound'),
        Unverified(SeamKind.Value, 'getHandsBound', 'getHandsBound', 1),
        Unverified(SeamKind.Value, 'curseUnlock', 'KinkyDungeonCurseUnlock', 2),
    ],
    Feeds: [BodyStateName.ArmsBound, BodyStateName.HandsBound],
} satisfies DimensionDescriptor)

/**
 * Whether the wearer can reach her own arousal. The movable mechanism is the player tags:
 * `KinkyDungeonUpdateRestraints` dispatches `updatePlayerTags`, so a handler of ours runs
 * afterwards. Deny-only, because withdrawing a tag the game already set is a less certain route
 * than writing one in.
 */
RegisterDimension({
    Id: DimensionIdOf(DimensionName.Arousal),
    Group: DimensionGroup.Substitution,
    Subsystem: Subsystem.Behavior,
    Facets: GateOnly,
    Direction: Direction.Deny,
    BuffSide: false,
    Seams: [
        Verified(SeamKind.Add, 'updatePlayerTags', 'AddTags'),
    ],
} satisfies DimensionDescriptor)

/**
 * Whether the wearer can block. The game pays for blocking separately from whether a weapon may be
 * used, so a restraint that leaves the hands free and the forearms busy is expressible only if
 * blocking is asked about on its own.
 */
RegisterDimension({
    Id: DimensionIdOf(DimensionName.Defense),
    Group: DimensionGroup.Substitution,
    Subsystem: Subsystem.Behavior,
    Facets: RateAndGate,
    Direction: Direction.Both,
    BuffSide: true,
    Seams: [
        Unverified(SeamKind.Value, 'calcBlock', 'KDBlockLevel'),
    ],
    EngineValue: Unread,
    Feeds: [BodyStateName.ArmsBound],
} satisfies DimensionDescriptor)

/**
 * What the wearer's hands do to the world: doors, picking things up, locks, and — through the gag
 * bundle — eating and drinking. One question, "may her hands act on the world"; both seams are
 * unverified.
 */
RegisterDimension({
    Id: DimensionIdOf(DimensionName.Interaction),
    Group: DimensionGroup.Substitution,
    Subsystem: Subsystem.Behavior,
    Facets: RateAndGate,
    Direction: Direction.Both,
    BuffSide: true,
    Seams: [
        Unverified(SeamKind.Value, 'KDInputTypes', 'KDSendInput'),
        Unverified(SeamKind.Value, 'useItem', 'KDItemInteraction', 1),
    ],
    EngineValue: Unread,
    Feeds: [BodyStateName.ArmsBound, BodyStateName.HandsBound],
} satisfies DimensionDescriptor)

/**
 * Which configurations the wearer's arms may take. The availability functions are pure, so the seam
 * is the wrapped global, and `Ladder` is the only description of what this dimension governs. The
 * gate sits beside the posture because the game's own tag cascade is consulted only when it is
 * `Free`.
 */
RegisterDimension({
    Id: DimensionIdOf(DimensionName.PoseArms),
    Group: DimensionGroup.Substitution,
    Subsystem: Subsystem.Behavior,
    Facets: PostureAndGate,
    Direction: Direction.Both,
    BuffSide: true,
    Seams: [
        Verified(SeamKind.Replace, 'KDGetAvailablePosesArms', 'PoseRoute'),
    ],
    Ladder: ArmPoseLadder,
    Feeds: [BodyStateName.ArmsBound],
} satisfies DimensionDescriptor)

/**
 * Which configurations the wearer's legs may take. Its refusal reaches furthest outside the
 * controller: the answer is also read as `legBondage`, which drives the helpless melee branch.
 */
RegisterDimension({
    Id: DimensionIdOf(DimensionName.PoseLegs),
    Group: DimensionGroup.Substitution,
    Subsystem: Subsystem.Behavior,
    Facets: PostureAndGate,
    Direction: Direction.Both,
    BuffSide: true,
    Seams: [
        Verified(SeamKind.Replace, 'KDGetAvailablePosesLegs', 'PoseRoute'),
    ],
    Ladder: LegPoseLadder,
} satisfies DimensionDescriptor)

/**
 * How much noise the wearer makes. Both the shout and moan radii derive from the gag total, so a
 * muffler bids here as well as on `Speech`. Deny-only, and never a `CapabilityKey`: the seam fires
 * after the decision, so a voice cannot be given back.
 */
RegisterDimension({
    Id: DimensionIdOf(DimensionName.Noise),
    Group: DimensionGroup.Constraint,
    Subsystem: Subsystem.Behavior,
    Facets: RateOnly,
    Direction: Direction.Deny,
    BuffSide: false,
    Seams: [
        Unverified(SeamKind.Multiply, 'calcShoutRadius', 'KDNoiseLevel'),
    ],
    EngineValue: Unread,
} satisfies DimensionDescriptor)

//#endregion

//#region Stats

/**
 * The Stats dimensions. Every seam below is `Verified: false`, and no trigger is invented for one.
 */

/** Damage dealt. A buff in the strict sense: it adds something the character did not have. */
RegisterDimension({
    Id: DimensionIdOf(DimensionName.Damage),
    Group: DimensionGroup.Buff,
    Subsystem: Subsystem.Stats,
    Facets: RateOnly,
    Direction: Direction.Both,
    BuffSide: true,
    Seams: [Unverified(SeamKind.Add, 'damage', 'KDBuffDamage')],
    EngineValue: Unread,
} satisfies DimensionDescriptor)

/** Evasion. */
RegisterDimension({
    Id: DimensionIdOf(DimensionName.Evasion),
    Group: DimensionGroup.Buff,
    Subsystem: Subsystem.Stats,
    Facets: RateOnly,
    Direction: Direction.Both,
    BuffSide: true,
    Seams: [Unverified(SeamKind.Multiply, 'calcEvasion', 'calcEvasion')],
    EngineValue: Unread,
} satisfies DimensionDescriptor)

/** Critical chance. */
RegisterDimension({
    Id: DimensionIdOf(DimensionName.Crit),
    Group: DimensionGroup.Buff,
    Subsystem: Subsystem.Stats,
    Facets: RateOnly,
    Direction: Direction.Both,
    BuffSide: true,
    Seams: [Unverified(SeamKind.Multiply, 'crit', 'KDBuffCrit')],
    EngineValue: Unread,
} satisfies DimensionDescriptor)

/** Spell accuracy. */
RegisterDimension({
    Id: DimensionIdOf(DimensionName.SpellAccuracy),
    Group: DimensionGroup.Buff,
    Subsystem: Subsystem.Stats,
    Facets: RateOnly,
    Direction: Direction.Both,
    BuffSide: true,
    Seams: [Unverified(SeamKind.Multiply, 'spellAccuracy', 'KDBuffSpellAccuracy')],
    EngineValue: Unread,
} satisfies DimensionDescriptor)

/** What an action costs in a resource. A squeeze rather than an addition, hence `Constraint`. */
RegisterDimension({
    Id: DimensionIdOf(DimensionName.ResourceCost),
    Group: DimensionGroup.Constraint,
    Subsystem: Subsystem.Stats,
    Facets: RateOnly,
    Direction: Direction.Deny,
    BuffSide: false,
    Seams: [Unverified(SeamKind.Multiply, 'calcEfficientMana', 'calcEfficientMana')],
    EngineValue: Unread,
} satisfies DimensionDescriptor)

/** The ceiling a stat may reach. */
RegisterDimension({
    Id: DimensionIdOf(DimensionName.StatCeiling),
    Group: DimensionGroup.Constraint,
    Subsystem: Subsystem.Stats,
    Facets: RateOnly,
    Direction: Direction.Deny,
    BuffSide: false,
    Seams: [Unverified(SeamKind.Value, 'calcStatCap', 'calcStatCap')],
    EngineValue: Unread,
} satisfies DimensionDescriptor)

/** How far she can sprint. */
RegisterDimension({
    Id: DimensionIdOf(DimensionName.Sprint),
    Group: DimensionGroup.Constraint,
    Subsystem: Subsystem.Stats,
    Facets: RateOnly,
    Direction: Direction.Deny,
    BuffSide: false,
    Seams: [Unverified(SeamKind.Value, 'sprint', 'KDSprint')],
    EngineValue: Unread,
} satisfies DimensionDescriptor)

//#endregion
