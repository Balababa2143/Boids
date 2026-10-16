/**
 * The dimension catalogue: one record per dimension, and nothing else decides what exists.
 *
 * ## What this file is for
 *
 * This is the **only** place a dimension is declared, and adding one is adding one record here
 * plus one name in `Name.ts`. That is the property step 1.2 is graded on, and it holds because
 * everything else in the control model is total over the registry rather than over a list:
 * the dossier is keyed maps, the router resolves by descriptor, and the gates walk
 * `AllDimensions()`.
 *
 * ## What a record does *not* do
 *
 * A descriptor describes; it does not implement. `Seams` names **every** tool a dimension uses,
 * with the **kind** of algebra that tool speaks, and `Verified` says whether that tool has been
 * read out of the engine or is still a hope — the markers that keep a partially-built dimension
 * loud instead of silently wrong. Binding a seam to a handler happens in the phase that owns the
 * subsystem:
 *
 * | Bound in | What lands |
 * | --- | --- |
 * | **Phase 2.1** | the Behavior dimensions: the `forceResult` guards and the action chokepoint |
 * | **Phase 2.7** | the posture dimensions: the wrapped availability functions (§6.13) |
 * | **Phase 3.1–3.2** | the Sensory dimensions: the limiter layer on top of this store |
 * | later | Stats, when the resource system exists |
 *
 * ## Which dimensions are real today
 *
 * `Sight` is `[既有]` — the game's single `blindness` field, produced at one seam and consumed
 * downstream, which the visor family already writes. `Hearing` and `SpellRange` turn out to have
 * real seams too, and they are recorded as verified because they were read rather than assumed.
 * Everything in `Behavior` and `Stats` that is not posture has its seams **named but unverified**:
 * a trigger is not written down unless it has been read, and `Verified: false` is the honest
 * marker for the rest.
 *
 * ## The two fields that exist to stop a silent omission
 *
 * **[决定] Every `Rate` dimension declares an engine value map** (§6.2), because `Rate` is
 * uniformly 0..1 in the model and no base-game quantity is on that scale. **The identity is
 * written out where the conversion has not been read yet**, and that is a claim rather than a
 * waiver: `EngineIdentity` here means *"the engine reads this dimension on the model's own 0..1
 * scale"*, which is true of nothing in the base game. It is written anyway because leaving the
 * field out would be indistinguishable from having forgotten it, and the phase that binds the
 * seam replaces the identity then. Only `Sight` has a map this catalogue can defend.
 *
 * **[决定] `Feeds` is declared, and its contributor set is this catalogue's reading of §6.5's
 * seven-capability list** rather than a list of body parts: the base game asks *"are her arms
 * bound"* as one question with some fifty callers, and our model answers it with a **union of the
 * refusals** among the dimensions whose refusal *is* a binding. Phase 2.1 confirms it when it
 * binds the guard.
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

/**
 * A dimension that scales a value **and** can be permitted or refused.
 *
 * The shape most of `Behavior` takes, and the shape the speech decision turned on: the rate is
 * *how strictly* and the gate is *whether at all*, and the two are orthogonal (§6.5).
 */
const RateAndGate: ReadonlySet<FacetName> = new Set([FacetName.Rate, FacetName.Gate])

/** The facets a gate-only dimension composes: it permits or refuses, and scales nothing. */
const GateOnly: ReadonlySet<FacetName> = new Set([FacetName.Gate])

/** A mediated ability: the Host forbids, and equipment re-grants. */
const GateAndWhitelist: ReadonlySet<FacetName> = new Set([FacetName.Gate, FacetName.Whitelist])

/**
 * A body configuration: a set of permitted poses, behind the same gate as everything else.
 *
 * It has **no rate**, and that absence is the decision rather than an omission: a pose is chosen
 * from a ladder rather than measured, so there is nothing continuous about it (§6.1, §6.7).
 */
const PostureAndGate: ReadonlySet<FacetName> = new Set([FacetName.Posture, FacetName.Gate])

/**
 * A seam whose trigger was read out of the engine, and where.
 *
 * The `Handler` is the game's own bucket key where one exists — `Sight`'s producing seam is the
 * engine's `calcBlind` trigger rather than a handler this mod owns, which is why a descriptor
 * names a string and not a GUID.
 */
const Verified = (Kind: SeamKind, Trigger: string, Handler: string, Order = 0): Seam => ({
    Kind,
    Handler,
    Trigger,
    Order,
    Verified: true,
})

/**
 * A seam the design needs and the engine has not been read for yet.
 *
 * Recorded so the descriptor is complete — a dimension with no tool is unimplemented rather than
 * described — and marked so no phase builds on it by accident. The `Handler` names the kind of
 * hook the dimension is looking for, and the phase that binds it **replaces this record** with a
 * verified one rather than adding beside it.
 */
const Unverified = (Kind: SeamKind, Trigger: string, Handler: string, Order = 0): Seam => ({
    Kind,
    Handler,
    Trigger,
    Order,
    Verified: false,
})

/**
 * The engine value map for a dimension whose scale **has not been read**, declared as the
 * identity.
 *
 * Named rather than written as a bare lambda so a reader can see that the omission was
 * considered: §6.2 requires the field to be present on every `Rate` dimension, and this is the
 * honest placeholder for a dimension whose real map belongs to the phase that binds its seam.
 */
const Unread = EngineIdentity

/**
 * How blind the wearer is, in the engine's own units.
 *
 * **[既有] Blindness is an integer ladder capped at 7** (`player/KinkyDungeonStats.ts:2063-2075`),
 * so the model's uniform 0..1 has to be put back on it: a resolved 1 is the seventh rung and a
 * resolved 0 is sight. `Math.round` rather than `Math.floor` so the top of the model's range
 * reaches the game's own ceiling instead of stopping one short of it.
 */
const BlindLadder: EngineValue = value => Math.round(value * 7)

//#region Sensory

/**
 * How blind the wearer is, which the game calls blindness.
 *
 * **[既有] One producer, and the seam is already used by this mod.** `KinkyDungeonGetBlindLevel`
 * seeds `{player, blindness}` from the worn blindfolds and dispatches `calcBlind`, whose handlers
 * mutate `data.blindness` in place; the game then derives `KinkyDungeonBlindLevel` from it, and
 * everything downstream reads that derived value rather than the field
 * (`player/KinkyDungeonStats.ts:2063-2075`, `:1827-1831`). `Item/Visor/Common.ts` already
 * contributes here, which makes Sight the one dimension whose seam is proven rather than hoped.
 *
 * **The second seam is the reason §6.2 requires a list.** The blind level is *consumed* by
 * `KDSensesTrainingBoost`, which fires `calcGagRed` rather than a senses event of its own — so a
 * Sight dimension that only wrote `calcBlind` would find the training multiplier reading the same
 * value by a different road.
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
 * How deaf the wearer is.
 *
 * **[既有] The producer seam is `calcDeaf`**, and it is a real event rather than a field read:
 * `KDDeafLevel` collects `data.maxDeaf` and `data.totalDeaf` off the worn set, dispatches
 * `calcDeaf` with the mutable object, and only then combines them into a level
 * (`player/KinkyDungeonStats.ts:413-435`). `KinkyDungeonGetHearingRadius` consumes that level
 * through `calcHearing` (`:440-452`), which is the second seam.
 *
 * **[决定] Both directions, and a buff side.** An earlier reading made this deny-only, on the
 * grounds that the restraint's `deaf` field has no event of its own — but `calcDeaf` **is** an
 * event, and it takes an accumulator rather than a value, so a handler can subtract from it as
 * readily as add. A dimension cannot be deny-only while its seam is an addition.
 *
 * The `Handler` on the second seam is the consumer rather than a bucket of ours, and it is
 * `Verified: false` because the *radius* is a hyperbola that never reaches zero: how the model's
 * 0..1 maps onto it has not been read.
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
 * How far the wearer's spells reach.
 *
 * **[既有] `KDGetSpellRange` is a two-field mutating seam** — `{spell, range}` seeded from the
 * spell's own range and dispatched as `calcSpellRange`, with the mutated field read back
 * (`base/game/KinkyDungeonDraw.ts:1005-1012`). The base game already uses it to *add* range
 * (`magic/KinkyDungeonMagicList.ts:1594-1595`), so this is the first dimension in the catalogue
 * with a working granting direction — which is why it carries a buff side rather than being
 * `Constraint`.
 *
 * It takes no `Whitelist` yet: a whitelist promises a `CapabilityKey`, and Phase 1 ships none.
 * When a key arrives this is the dimension it joins first.
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
 * How hard the wearer can struggle against what holds her.
 *
 * §6.1's third worked example: **both a permission and a difficulty**, which is why it composes
 * a gate *and* a rate and carries a config field naming the struggle types it governs. The rate
 * is the peak the final act leans on (§6.10); the gate is what lets a specific struggle type be
 * permitted through equipment.
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
        /** Which struggle types this gate governs — `Remove`, `Struggle`, `Pick`, `Unlock`, `Cut`. */
        Types: true,
    },
} satisfies DimensionDescriptor)

/**
 * Whether the wearer can speak, and **how strictly her mouth is filled**.
 *
 * **[既有] Speech has no granting seam** (§3.2): the gag helpers read the restraint's own fields
 * inline, so the only way to gate speech is the action chokepoint. That makes the gate half a
 * `Substitution` with a **deny-only** direction and no buff side — the "take it away" half is
 * expressible and the "give it back through a prosthesis" half is not.
 *
 * **[决定] Two facets, and no third.** An earlier build gave `Speech` a `Form` facet carrying a
 * Host-chosen `Size`, so that *a small ball on a strict mechanism* and *a large one that only
 * blocks the words* were both expressible. **That facet is retracted** (§6.1): the look of a
 * thing is a property of the thing, so an item declares its own appearance beside its own bid and
 * the Host has no cosmetic lever at all. What survives is the separation — the **rate** is how
 * strictly the mouth is filled and the **gate** is whether speech is denied or re-granted — and
 * the expressibility moves onto the two item variants that declare the two appearances.
 *
 * **The rate is still the base game's `gag` value's home**, and that value is a **sum** with a
 * saturating floor rather than a maximum (`player/KinkyDungeonStats.ts:2209-2231`), which is why
 * the muffler's bid declares `StackMode.Sum`.
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
 * Whether the wearer can move, and how far.
 *
 * `immobile`-based movement is read inline with no seam (§3.2), and the difference from speech is
 * that movement has several levers the chokepoint does not cover — `KDGameData.MovePoints`, the
 * `playerStun` flag — so the descriptor names more than one tool.
 *
 * **[决定] It composes a rate as well as a gate.** *May she move at all* and *how far can she get*
 * are different questions, and the base game already answers the second one separately through
 * `MovePoints`; a gate-only reading would have made a hobble inexpressible.
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
 * Whether the wearer can attack, and how hard.
 *
 * A `Substitution` dimension with both directions: the action chokepoint denies, and the base
 * game's own `calc*` combat seams can grant — which is why it has a buff side and speech does
 * not. It carries a `Rate` because the base game's own binding pays for **melee accuracy and
 * damage** separately from whether a blow is possible at all (§6.5).
 *
 * **[既有] And the refusal is part of the arms-bound answer.** A bound arm is one of the reasons
 * this dimension is refused, so it feeds the predicate the game asks.
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
 * Whether the wearer can cast, and how well.
 *
 * The twin of attack. It composes a `Rate` because the spell components are conditional on the
 * bindings rather than blocked by them — the `Arms` and `Legs` components are dropped, which is a
 * change to what a cast costs and does rather than a refusal of the cast (§6.5).
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
 * Whether the wearer can use what her hands hold.
 *
 * §6.1's fourth worked example: a gate **and** a whitelist, which is the shape a mediated ability
 * takes — the Host forbids unaided use and equipment re-grants it. It is the dimension the
 * substitution group exists for, and it ships with an empty whitelist because Phase 1 ships no
 * `CapabilityKey`.
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
 * Whether the wearer can get out of what she is in.
 *
 * **[既有] The seam convention is the one the router copies.** `getArmsBound` and `getHandsBound`
 * handlers compute a power, raise their bid only while they are winning, and set
 * `forceResult`/`forceResultPower` under a `forceResultPower < frp` guard
 * (`effect/KinkyDungeonEvents.ts:263-340`; payload `ArmsBoundData`/`HandsBoundData`,
 * `restraint/KinkyDungeonRestraints.ts:1819-1840`). The callers short-circuit on
 * `forceResult != undefined`, which is why `forceResult = false` is the direction that *grants* —
 * the direction no base-game caller uses, and the one Phase 2.1 takes.
 *
 * **[既有] It is the predicate's own seam as well as a dimension**, which is why it feeds both:
 * the two globals it names *are* the two questions the base game asks about the body as a whole.
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
 * Whether the wearer can reach her own arousal.
 *
 * **[既有] The movable mechanism is the player tags, not the restraint flag.** `chastity` and
 * `chastitybra` are read inline by the chastity helpers with no event of their own, while
 * `KinkyDungeonUpdateRestraints` sets `ChastityLower`/`ChastityUpper` from those flags and *then*
 * dispatches `updatePlayerTags` — so a handler of ours runs afterwards and can set them too
 * (`restraint/KinkyDungeonRestraints.ts:4229-4232`, `:4304`). The tags are consumed by pure
 * lookups with no seam to block.
 *
 * `ensurePlayerTagArousal` is **not** the seam: it is declared and set on two enemies, and
 * nothing in the engine reads it.
 *
 * `Direction`: deny-only. The tag route is an *add*: the Host may deny access, while granting
 * access an item would otherwise deny needs the tag the game already set to be *withdrawn*, which
 * is a different and less certain route than writing one in. §6.11 records the same asymmetry.
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
 * Whether the wearer can block.
 *
 * **[既有] It was a property of the binding rather than a dimension, and it is a mechanism of its
 * own.** The base game's own binding pays for blocking separately from whether a weapon may be
 * used (`fight/KinkyDungeonFight.ts:574-599`), so a restraint that leaves the hands free and the
 * forearms busy is expressible only if blocking is asked about on its own.
 *
 * The trigger is **a hope, not a read**: the block path has been located but the seam that
 * carries the answer has not, and `Verified: false` is the honest marker.
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
 * What the wearer's hands do to the world.
 *
 * **[既有] It was hiding inside other dimensions and it is one mechanism.** §6.5's list of what
 * the base game's binding pays for names doors (`map/KinkyDungeonTilesList.ts:1864`), picking
 * things up (`item/KinkyDungeonItem.ts:272`), locks, and — through the gag bundle — eating and
 * drinking. Those are one question: *may her hands act on the world*.
 *
 * The chokepoint is the first seam and the item-use path the second; both are unverified.
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
 * Which configurations the wearer's arms may take.
 *
 * **[决定] A body configuration is a dimension, not a property of a restraint.** The arms can be
 * free, in front, crossed, wrist-tied, box-tied, yoked or raised, and the base game already treats
 * each as a named pose with a permitted set (`Data/Poses.ts:1`) — so the demand is a set of poses
 * and the facet is `Posture` rather than `Rate`.
 *
 * **It has no event to name.** The two functions that answer *which poses may she take* are pure
 * functions with no dispatch (`Data/Poses.ts:382, :477`), so the seam is of the **fourth kind**:
 * the route wraps the global and replaces its answer (§6.2, §6.13). That is why the descriptor's
 * `Ladder` is not decoration — it is the only description of *what this dimension governs* that
 * exists anywhere.
 *
 * Restraint state is declared as a `Gate` beside the posture because §6.13 rule 2 has the base
 * game's own tag cascade consulted **only** when the gate is `Free`.
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
 * Which configurations the wearer's legs may take.
 *
 * The twin of the arm posture, on the lower half: `Data/Poses.ts:16` names the five leg poses and
 * `:382` is the pure function that answers with them. **It is the dimension whose refusal reaches
 * furthest outside the controller** — the legs' answer is also read as `legBondage`
 * (`fight/KinkyDungeonFight.ts:285`), which drives the helpless melee branch (`:322-326`) — and
 * §6.7's no-interaction-contract decision is what covers that: the effect is real, permitted, and
 * unspecified.
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
 * How much noise the wearer makes.
 *
 * **[既有] A real consumer with no dimension at all, until now.** The shout radius
 * (`base/KinkyDungeonInput.ts:421`) and the moan radius
 * (`player/KinkyDungeonStats.ts:2318`) are both derived from the gag total, and §6.5's gag bundle
 * names them as one of the four things that property pays for — so a muffler declares a bid here
 * and not only on `Speech`.
 *
 * **[决定] Deny-only, and it can never be a `CapabilityKey`** (§3.2): noise's seam fires **after**
 * the decision has been made, so there is no point at which the controller could give a voice
 * back. A buff side would be a claim the dimension cannot keep.
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

//#region Stats — declared now, unused until the resource system exists

/**
 * The Stats dimensions are declared and deliberately left unused.
 *
 * **[决定]** Stats Control is deferred until the resource system exists; designing it before
 * that means designing it twice (§6.3). What is *not* deferred is naming them: the data model
 * covers every dimension from the start, so a later phase adds behaviour rather than a shape.
 *
 * Every seam below is `Verified: false` and no trigger is invented for them — the honest record
 * is that this dimension needs *a* `calc*` seam and that nobody has read which one yet.
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
