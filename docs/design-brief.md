# Boids — Design Brief

> Status: **living document, round 1.** Written during the design discussion between
> Viatas (design) and Baleenie (engineering). It exists to turn a vision into
> decisions; it is not a specification and not a promise.
>
> Every claim carries one of four markers, and the difference matters:
>
> | Marker | Means |
> | --- | --- |
> | **[既有]** | Verified in the base game or in this repo. Cites a file and a line. Not negotiable — this is what the code does today. |
> | **[决定]** | Decided in discussion. Do not silently revisit. |
> | **[提议]** | Baleenie's proposal. Open to disagreement. |
> | **[goal post]** | Deliberately deferred. Recorded so it is not lost, and explicitly **not** in the current scope. |
> | **[待验证]** | Unknown, and known to be unknown. Someone has to look before it can be built on. |

---

## 1. Vision

`Boids` is a content mod for **Kinky Dungeon**. Its subject is **dronification** and
its sub-kinds.

The mod's shape:

- Several **main factions**. Each explores one sub-theme of dronification and owns a
  set of mechanics that fit that theme.
- Each faction ships **outfits** — equipment that serves the kink *and* carries game
  mechanics. The kink comes first; the gameplay must not be an afterthought either.
- Each main faction can branch into **sub-factions**. A sub-faction explores a
  different kind of play and a different relationship pattern. Sub-factions share
  most mechanics and all the outfit art; they do **not** need any in-setting
  administrative relation to each other.

**[决定] The layering.** Discussion settled on three layers, and they are not the
same thing:

| Layer | What it is | Code |
| --- | --- | --- |
| **Outfit layer** | The art and the restraint definitions. Shared across sub-factions. | `Futuristic` |
| **Mechanism layer** | The abstract controller: what is constrained, how much, and how the constraint reaches the game. Shared across sub-factions. | `MachinePrime.Coordinator` |
| **Sub-faction layer** | Story, flavour, progression, which privileges are granted and what they cost. Per sub-faction. | not built yet |

**[提议] The cheapness ordering follows the layers.** With art shared, a new
sub-faction is story plus configuration, not a new art pass. That is what makes the
eventual horizontal expansion (more sub-factions) cheap, while the vertical work
(the mechanism layer) is done once and done properly.

### Scope of this iteration

**[决定]** The current goal is **`MachinePrime`, finished** — not more factions.

**[决定]** Within `MachinePrime`, this iteration designs three things in depth:

1. **Equipment-granted capability** — permanently trading a native ability for a
   version that only works while the right equipment is worn.
2. **Control and the proof of submission** — the player earning their own restraint,
   progressively.
3. **The abstract controller** — `Coordinator` as a constraint model plus a routing
   layer, rather than a bag of hard-coded limiters.

Everything else is **[goal post]**; see §7.

---

## 2. Ground truth: what the base game already gives us

This section exists because the design's cost is dominated by it, and because in
round 1 several assumptions turned out to be wrong in a *useful* direction.

**[既有] The full base-game source is in the submodule**, not just generated typings:
`kd-structured/KinkyDungeon/Game/src/` — 158 `.ts` files, ~8.7 MB. Every claim below
is read from implementation, not from a declaration stub.

### 2.1 There is a real quest system

**[既有]** `KDQuests: Record<string, KDQuest>` (`faction/KinkyDungeonQuest.ts:6`).
The interface (`base/KDTypeDefs.ts:2695`) carries `weight`, `prerequisite`,
`worldgenstart`, `accept`, `oncancel`, `tick`, `text`, `customNPC`, `visible`,
`nocancel`, `tags`. Lifecycle: `KDAddQuest` (`:1144`), `KDRemoveQuest` (`:1131`),
`KDQuestTick` (`:1121`), `KDGetQuestData`/`KDSetQuestData` (`:1257`/`:1262`).

**[既有] There is no registration API.** The base game itself just assigns into the
global and calls `KDAddQuest(name)`; `KinkyDungeonDrawQuest` (`:1174`) iterates the
active list generically, so a mod quest draws correctly with no base-game change.
Active quests live in `KDGameData.Quests` (per save). `KDMaxQuests = 7` (`:1162`).

**[既有] Completion is signalled by flag, not by a completion call:** the built-in
template's `tick` fails the quest when its flag is gone.

> **Consequence:** issue #20 ("a prototype quest line") needs no engine work. It is
> content, and it is the natural home for the ritual in §5.

### 2.2 "Proving you want it" already has a ledger

**[既有]** `KDGameData.Training` is a per-save `Record<string, KDTrainingRecord>`
(`base/KDTypeDefs.ts:4118`) with:

| Field | Meaning |
| --- | --- |
| `turns_trained` | turns in which training was accepted |
| `turns_skipped` | turns in which an opportunity was offered and circumvented |
| `turns_total` | opportunities offered |
| `training_points` / `training_stage` | accumulated progress and its level |
| `best_ratio` | best single-session compliance ratio |

**[既有]** `KDGetTrainingPercentage` (`player/KDTraining.ts:123`) computes
`(turns_trained * 1.11 - turns_skipped) / turns_total`, soft-scaled by
`KDTrainingSoftScale = 10`. `KDTickTraining` (`:206`) is the write; `KDAdvanceTraining`
(`:151`) settles the ledger.

**[既有]** Registered types today are `Heels`, `Corset`, `Gag`, `Senses`
(`KDTrainingTypes`, `:4`) — and **`Senses` already means "training by having your
senses taken away, which yields a bonus"** (`KDSensesTrainingBoost`, `:389`).

> **Consequence:** the base game already models *voluntary compliance under
> progressive restraint*, with a persisted ledger, a progress bar, and a bonus at the
> end. Refusal is not a bug in it; `turns_skipped` is the designed refusal count.
> **[提议]** the "proof of submission" ledger should **reuse this system** rather than
> invent a parallel one.

**[决定] But it is not the controller's memory.** Discussion was explicit: `Training`
models *tolerance built up by practice*, and it is a different object from the
character's **file at the Host** — the record of how far the Host has overridden them
and what resources it has issued. Those are separate (§4).

### 2.3 The sensory limiters already have the right shape

**[既有]** `MachinePrime.Coordinator` stores a **target, not an effect**:
`SensoryLimiter.TargetStrength` 0..1 (`Internal/State.ts:65-96`), read and written by
archetype, not by item (`SensoryControl.ts:71`, `:92`). `SetLimiterStrength` writes,
sends `SensoryLimiterStrengthUpdate {Type, OldStrength, NewStrength}` **only when the
value changed**, and then **always** calls `KinkyDungeonAdvanceTime(1)` (`:106`).

**[既有]** Items join a slot through stamped events, not by calling in: one handler per
archetype, N events (`Public/Event.ts:42-94`, `Public/ItemManagement.ts:28-47`).

### 2.4 The player's derived values are already hookable, one by one

This is the finding that makes the whole controller cheap.

**[既有]** The player has no state object. The base game keeps module-level mutable
globals — `KinkyDungeonStatStamina`, `KinkyDungeonStatWill`, `KinkyDungeonStatMana`,
`KinkyDungeonStatDistraction`, `KinkyDungeonSlowLevel`, `KinkyDungeonSleepiness`, and
so on — recomputed each turn by `KinkyDungeonCalculateStats` /
`KinkyDungeonCalculateSlowLevel` (`player/KinkyDungeonStats.ts:2153`).

**[既有] But almost every derived value is computed through a `calc*` event whose
`data` object a handler may mutate in place.** Verified emitters include:

| Emitter | Trigger | What it decides |
| --- | --- | --- |
| `KinkyDungeonStats.ts:376` | `calcVision` | sight radius |
| `:430` | `calcDeaf` | hearing loss |
| `:450` / `:463` | `calcHearing` / `calcEnemyHearing` | what can be heard |
| `:1574` | `calcMaxStats` | stat ceilings |
| `:1807` | `calcManaPool` | mana pool |
| `:2058` | `calcMiscast` | miscast chance |
| `:2073` | `calcBlind` | blindness |
| `KinkyDungeonMagic.ts:623-659` | `calcStamina`, `calcMana`, `calcEfficientMana`, `beforeCalcMana`, `afterCalcMana` | resource costs |
| `KDTraining.ts:341` / `:370` | `calcCorsetSPRed` / `calcGagRed` | restraint penalties |
| `KinkyDungeonFight.ts:390-416` | `calcCrit`, `calcBindCrit`, `calcSpellAccuracy` | combat rolls |
| `KinkyDungeonRestraints.ts:2418` | `calcEscapePenalty` | escape difficulty |
| `KinkyDungeonGame.ts:4480` | `calcSprint` | sprinting |
| `KinkyDungeonDraw.ts:1010` | `calcSpellRange` | spell reach |

**[既有]** And spell components have their own interception points, with a base-game
precedent: `beforeCalcComp` (`KinkyDungeonEvents.ts:5657`) and `calcComp` (`:5849`)
both let a handler rewrite the `data` object, and the base game's own `Psychokinesis`
trait clears `data.failed = []` at `:5865`. `KinkyDungeoCheckComponents`
(`KinkyDungeonMagic.ts:436`) is the gate, called from
`KinkyDungeonHandleSpellCast` (`:490`).

> **Consequence:** **[提议]** the constraint model does **not** need to own the
> player's numbers. It needs to *register into the game's existing calculation
> events*, one dimension at a time. Each dimension is one small handler, and the
> existing pipeline stays the single source of truth.

**[既有] One dead hook, read and confirmed:** `KinkyDungeonGetPlayerStat(stat, mult)`
(`KinkyDungeonFight.ts:658`) fires a generic `"calcPlayer" + stat` event and returns
the mutated value — and **has zero call sites in the entire base game.** It is not a
usable seam today. Recorded so nobody "discovers" it twice.

### 2.5 Every player action funnels through one chokepoint

**[既有]** `KDSendInput(type, data, ...)` (`base/KinkyDungeonInput.ts:1685`) pushes onto
`KinkyDungeonInputQueue` and dispatches through `KDInputTypes` — a plain mutable
`Record<string, (data) => string>` (`:10`) with **85 commands** (measured): `move`,
`doattack`, `tryCastSpell`, `struggle`, `lock`, `pick`, `equip`, `tryOrgasm`, `sleep`,
`interact`, `dialogue`, `commandunlock`, and so on.

**[既有]** The game already exercises this: auto-wait synthesises a no-op `move`
(`base/KinkyDungeon.ts:3210`), and `player/KDAutoStruggle.ts` is **a real utility AI
acting for the player** — `KDAutoStruggleActions` (`:65`) with weights, evaluated at
`:287`, decided at `:337`, executed by sending genuine input at `:73`.

> **Consequence:** **[既有]** "the player loses control of their turn" is a solved
> problem at this one chokepoint, with a worked in-repo example of the game choosing
> and executing an action. And **[提议]** it is also the right granularity for the
> controller's *switch* dimensions: "may the player attack" is a veto here, not a
> stat.

### 2.6 Persistence: three layers, all reachable from a mod

**[既有]** `KinkyDungeonGenerateSaveData` puts the whole live blob on the save
(`base/KinkyDungeon.ts:7292`, `save.KDGameData = KDGameData`), `KinkyDungeonSaveGame`
deep-copies it with `JSON.parse(JSON.stringify(...))` and **no whitelist** (`:7325`),
and load resets to defaults then adopts every key present in the save
(`:7434-7436`, `KDGameData = Object.assign({}, saveData.KDGameData)`).

> **Consequence, verified end to end:** **unknown, mod-added keys on `KDGameData`
> survive save → load.** `item.data` also round-trips, and survives an unlink
> (`KinkyDungeonRestraints.ts:6385`).

**[既有]** New game wipes it all: `KDResetData` (`base/game/KinkyDungeonGame.ts:472`)
rebuilds `KDGameData` from the defaults literal.

**[既有]** `KinkyDungeonNewGamePlus(increaseDiff)` genuinely exists
(`KinkyDungeonGame.ts:406`). It carries only collected/permanent NPCs, the lost-items
chest, and a monotonic difficulty ladder; it also clears seen-entities, the persistent
NPC cache, elevators and deleted IDs.

**[既有] Cross-character persistence is `localStorage`,** which the base game itself
uses for exactly this: `KDUnlockedPerks` (`base/KinkyDungeon.ts:933` / `:956`),
`KDPlayerTitlesUnlocked` (`player/KDPlayerTitles.ts:5`), the lore codex
(`dialogue/KinkyDungeonLore.ts:19`), saved hotbars
(`magic/KinkyDungeonMagic.ts:2572`), consent records (`base/KinkyDungeon.ts:1012`).

> **Consequence:** **[既有]** the mod can persist per-character state in
> `KDGameData.<key>` and cross-character state in `localStorage.<key>`, with no engine
> change. **[决定]** the graduation artifact goes to `localStorage` (§6).

### 2.7 The control-loss levers, enumerated

**[既有]** Ranked by precision, all directly settable:

| Lever | Effect | Site |
| --- | --- | --- |
| veto / synthesise a queued action | exact, per action | `KDSendInput`, `KDInputTypes` (`KinkyDungeonInput.ts:1685`, `:10`) |
| `KDStunTurns(turns, noFlag)` | loses turns; `noFlag` avoids the "in trouble" flag | `KinkyDungeonGame.ts:4166` |
| `KDGameData.MovePoints = -n` | denies movement without denying agency | `KinkyDungeonEnemies.ts:7441` |
| `KinkyDungeonSetFlag("playerStun" / "playerDisabled" / "channeling", n)` | gate-level | `KinkyDungeonEnemies.ts:9032-9054` |
| restraint fields `immobile`, `freeze`, `blindfold`, `hobble`, `blockfeet` | declarative | `KinkyDungeonStats.ts:2153-2182` |
| `KinkyDungeonFastMovePath = [...]` | scripted walking | `base/KinkyDungeon.ts:3168` |
| extend `KDAutoStruggleActions` | full autopilot | `player/KDAutoStruggle.ts:65` |

**[既有] The input set for "stunned" is exactly four levers:**
`KinkyDungeonStatBlind > 0`, flag `playerStun`, `KDGameData.SleepTurns > 0`,
`KinkyDungeonStatFreeze > 0`. "Disabled" adds flag `playerDisabled` and
`KinkyDungeonStatBind`. Note the precedent: flag `channeling` **exempts** the player
from the stun branch — a status that carries you through a turn.

### 2.8 Hypnosis and trance already exist, as UI and as stats

**[既有]** `KDAddHypnoButton` (`restraint/KDHypno.ts:61`) spawns a floating button; the
player clicks it, and only then does it apply. `KDHypnoCallbacks` (`:159`) already
contains `DollAccept` (→ `KDStunTurns(40, true)` plus summoning a `Dressmaker`),
`DollStill`, `DollSilent`. Supporting it: `KDAddTrance`, the `Hypnosis` buff with
`KDMaxHypnosis = 100` (`:14059`), the `NoHypno` stat-choice global opt-out (`:30`), the
`Hypno_Doll` special stat (`KinkyDungeonPlayerEffects.ts:386`), and
`DollMirrorCurse`'s "player is resisting compulsions" state
(`KinkyDungeonEvents.ts:4545`).

> **Consequence:** **[既有]** a suggestion UI where accepting is a click already exists,
> with base-game callbacks that take control away. This is the cheapest honest home for
> the *narrative* half of "the Host overrides you".

### 2.9 Facts that constrain the design

**[既有]** Variant names are `uuidv5(JSON.stringify(variantKey), baseId)` with the key's
fields in literal insertion order. **The variant key is the save format.** Renaming,
adding, removing or reordering a field changes every generated name
(`README.md:235-244`).

**[既有]** `ItemArchetype` is a closed `const enum` of **three** GUIDs
(`MachinePrime/Constant.ts:48-72`), and `ItemRegistry` is hard-coded to those three
(`Internal/State.ts:129-158`). **A new archetype is a state-shape change.**

**[既有]** The coordinator's save round-trip writes `KDGameDataBase[...]`
(`Internal/StateStorage.ts:115`) and reads `KDGameData[...]` (`:106`). Those are
separate objects (`base/KinkyDungeon.ts:595` vs `:893`), so the round-trip does not
close as written — this is issue **#48**, **[待验证]** in-game but **[提议] resolved on
inspection**: write to `KDGameData`, which is what the save actually carries.

**[既有]** `globalThis.KinkyDungeonGenerateSaveData` is captured at *module evaluation*
(`StateStorage.ts:112-116`), so any mod that patches it later wraps *around* Boids.

**[既有]** Gag strength is currently a static sum of restraint fields
(`Futuristic/Gag/Common.ts:236-285`); nothing dispatches a `calcGag`-style event
(issue #44), even though `KinkyDungeonGagTotal`
(`KinkyDungeonStats.ts:2209`) is the natural place for one.

**[既有]** The `Deafener` archetype has full schema, guard and round-trip support but
**no item emits it** — `Headphone.ts:105` sets a static `deaf: 2` instead.

### 2.10 Identifier versioning — the target, not the current mess

**[决定] UUIDs serve two purposes here, and only one of them is currently being met:**

| Purpose | Status |
| --- | --- |
| **avoid name collisions** across the game and every other mod | met by construction |
| **carry version information**, so an old id can be recognised and retired programmatically | **not met — this is the design target** |

**[既有] The deterministic chain already works.** `GetVariantIdFromBase`
(`KDExtension/Variant/Common.ts:36-40`) is

```ts
uuidv5(JSON.stringify(variantKey), BaseId)
```

and every variant builder takes a `baseId` (`NamedVariantMapBuilder.ts:21`,
`ModelVariantMapBuilder.ts:68`, `RestraintVariantBuilder.ts:35`). The `uuid` package is
already a dependency and `v5` is already imported. **[既有] So derivation is implemented;
what is missing is that the `baseId`s in use were not themselves derived from anything.**

**[提议] The target design, stated as the thing to build toward** (the design note is
explicit that the current mixed random/derived state is not to be repaired as-is, only
superseded):

1. **One master UUID per mod version.** A new release mints a new master; it is the root
   of the entire namespace.
2. **Everything else derives from it**, deterministically and hierarchically — family →
   variant family → variant key → name — so an id is a *function* of the master and a
   path, not a random draw.
3. **A version table maps master UUID → mod version.** That table is the only thing that
   has to be maintained by hand, and it is small.
4. **Retiring an old version is then mechanical:** every id whose master is not the
   current one is obsolete, with no per-item list to keep.

**[提议] Why this is worth doing before the dimension work, not after.** §B.5 is about to
mint a batch of dimension GUIDs. If they are random, they are permanently unversioned, and
the retirement mechanism will have to be retrofitted around them. If they are derived,
the whole dimension namespace participates in the scheme from its first day.

> **[既有] One consequence worth naming.** A derived id changes when the master changes —
> which means **a version bump renames everything, and therefore invalidates every
> existing save.** That is exactly the "obsolete all old ids" behaviour the design note
> wants, and it is also a save-breaking event. The version table is what makes it a
> *decision* rather than an accident: a release that does not intend to break saves must
> keep its master.
>
> **[待验证]** Whether the naming should be `uuidv5(path, master)` directly, or whether an
> intermediate per-family uuid is wanted so that a family can be re-mastered without
> re-mastering the world. The design note's "hierarchical" wording suggests the latter;
> the implementation cost of each has not been compared.

---

## 3. The abstract controller

**[决定] The shape, in the designer's words:** `Coordinator` records *which aspects of
the character's capability need constraining, and to what degree* — abstractly. The
state machine layer decides how that lands on the character's actual values. A routing
layer then decides how the different pieces of equipment express it (model changes,
appearance, forced pose, and so on).

**[决定] Control is not one number.** Each value the game exposes is constrained
**separately**. The dimensions come in (at least) two kinds:

| Kind | Examples | Natural expression |
| --- | --- | --- |
| **Continuous** | resource pools, hit chance, cast success, move speed, sight radius | a 0..1 strength per dimension, applied at the game's own `calc*` event (§2.4) |
| **Switch** | may attack, may cast a given spell component, may speak, may move | a boolean gate at the action chokepoint (§2.5) |

**[既有] The four requirements stated so far** — two from the original design discussion,
two that only became visible after reading the base game (Appendix A):

| # | Requirement | Source |
| --- | --- | --- |
| 1 | Every constrained value is addressed **separately** | design decision |
| 2 | The persisted state shape does **not** change when a dimension is added | save-format constraint (§2.9) |
| 3 | A descriptor records its **seam family** and its **direction** (grant / deny / both) | A.1, A.7 |
| 4 | A descriptor may name **more than one seam**, with a **priority relative to the game's own writes** | A.8 |
| 5 | A descriptor records whether the dimension has a **buff side**, and a deny-only seam may not claim one | C.3, A.7 |
| 6 | Its `DimensionId` is **derived from the version master**, not random | §2.10, B.5 |

**[提议] The store: a dimension keyed map, `Blinder`/`Deafener`/`Gag` demoted to entries.**

```ts
// Identity of a control dimension. A GUID, like every other cross-boundary name in
// Boids, so two modules can agree on a dimension without agreeing on a spelling.
type DimensionId = string

// What the Host demands of one dimension: a single target in 0..1, where 1 means the
// game's own value is fully the Host's. How a handler reads it is the handler's
// business — exactly the contract SensoryLimiter already has.
type ConstraintTarget = number

type ControlState = {
    readonly [Dimension: DimensionId]: ConstraintTarget
}
```

**Why a generic numeric target and not a per-dimension typed value.** A typed value is
more expressive, but it changes the persisted shape every time a dimension is added —
and requirement 2 says that must not happen. This is not a new idea in this codebase;
`SensoryLimiter` (`Internal/State.ts:65-96`) is already exactly this pattern with exactly
this justification, and its round-trip is pinned by
`test/coordinator-state.property.test.ts`.

**[提议] The change to `ItemArchetype` / `ItemRegistry`.** Today both are closed over
three GUIDs, and `ItemRegistry` names each slot literally (`Internal/State.ts:129-158`),
so `Blinder` carries a `Visor` record and the other two carry a bare `SensoryLimiter` —
a distinction that exists only because a visor was the first item to need one.

Proposal: `ControlState` becomes the map above; `ItemArchetype`'s three members remain
**as dimension IDs**, registered through the same descriptor registry as any future
dimension, rather than as enum members baked into the record shape. The
`RegisteredItems` set per dimension (`:40-63`) is worth keeping as-is — it is the record
of which item currently fills a slot, and `ItemManagement.Register` / `UnRegister`
already write it correctly.

**[既有] The state-shape consequences, named exactly.** These are the files that change,
and the tests that gate them:

| File | Change | Gate |
| --- | --- | --- |
| `Coordinator/Internal/State.ts` | `ItemRegistry` becomes keyed; `Visor`/`Gag` stop being distinct record types | `coordinator-state.property.test.ts` |
| `Coordinator/Constant.ts` | `ItemArchetype` stops being the only source of dimension IDs | — |
| `Coordinator/Public/Event.ts` | unchanged — it already stamps an archetype onto an event | — |
| `Coordinator/SensoryControl.ts` | `ThrowIfNotIsSensoryController` becomes descriptor lookup | — |
| `MachinePrime/index.ts` (public surface) | unchanged, if the namespace shape holds | `public-api.test.ts` |

**[提议] The routing layer, and its one job.** The rule the design conversation asked
for is *one-to-many*: many items may speak to the same dimension, and they must not
fight. That implies three things the router owns:

1. **Which items are providers.** An item declares its dimensions on apply — the same
   stamped-event pattern `RegisterItemOnApply` (`Public/Event.ts:42`) already uses, so
   this is a widening of an existing mechanism, not a new one.
2. **Which provider wins.** The design intent is a resolution rule, not a merge. The
   base game's own `getArmsBound` shows the shape it prefers: handlers bid with a
   **power**, and the highest bid wins unless someone has already forced the result
   (`KinkyDungeonEvents.ts:266-280`). **[提议]** adopt that: a per-dimension winner by
   priority, so a full drone set and a lone visor can both constrain sight without
   summing into nonsense.
3. **How the loser expresses itself.** This is the part the conversation named
   explicitly — the routing layer is what decides that a losing or partial provider
   still changes the model, the appearance, or the pose. The `SensoryLimiterStrengthUpdate`
   event (`SensoryControl.ts:54-61`) is the existing channel for exactly this, and
   `MakeMorphableVisor` (`Item/Visor/Common.ts:204`) is the existing consumer.

**[提议] The escape valve, so the shape never has to change again.** Per-dimension
configuration that is *not* a number — which seams a dimension uses, its direction, its
precedence — belongs in a **code-side descriptor registry**, keyed by `DimensionId`, not
in the save. The save holds only `DimensionId → number`. Adding a dimension is then a
code change with an empty-save default, and the persisted shape is frozen for good.

**[决定] Do this now, not later.** This is the one structural change in the brief that
is expensive to postpone: after release, widening the persisted shape is a save
migration. **[提议]** the window to change it cheaply is *before anyone else has a
save*.

**[既有] The first real customer is already queued.** Issue #40 ("nothing selects a visor
to equip") and #45 ("extendable socketed item selection") are both the routing layer
under different names. `RequireSubItemEvent` (`MachinePrime/Item/Gag.ts:152-194`) is the
working one-case version of it: an item names a socket and a sub-item, with one
hard-coded sub-item and no selection.

**[提议] Build it so it can be driven from the console.** `Coordinator.GetState` and
`SetStateIn` already exist and are property-tested, so a router can be exercised before
any UI exists — which is how the sensory limiters were built, and it worked.

---

## 4. Control, proof, and the Host's file

**[决定] Two separate records, deliberately.**

| Record | Models | Lives in |
| --- | --- | --- |
| **Training** | tolerance built up by practice | `KDGameData.Training` — **reuse it** (§2.2) |
| **The file** | how far the Host has overridden the character, and what it has issued | a new state machine, inside `Coordinator` |

**[提议] Why they must not be merged.** Training is about the character getting used to
restraint; the file is about the Host's *administrative* relation to the character. A
character can be deeply trained and barely overridden, or freshly overridden and
untrained. Merging them would make both unreadable and would tie the pod's progression
to the wrong number.

**[提议] The visible half.** "Control degree" is not one bar, because it is not one
number (§3). Each dimension can present differently — some as a stat readout, some only
through events and dialogue, some through the avatar's own behaviour. **[待定]** which
presentation each dimension gets is a per-dimension design call, not a global one.

**[提议] The submission economy — the point Baleenie pushed back on.** If obedience only
ever costs the player, players will route around it and the content will never be seen.
So: **obedience must buy something visible and specific, and disobedience should be
flavour and narrative, not a numbers tax.** The base game already agrees — `Senses`
training in §2.2 pays out a bonus. Concretely, the rewards are §5's capabilities and the
Host's privileges.

---

## 5. Equipment-granted capability

**[决定] This is not an enable flag.** The designed shape:

1. The player performs something **ritual** — a mini quest — and **permanently gives up
   a native ability**, in exchange for points.
2. Those points buy **the equipment-mediated version** of that ability.
3. The mediated version may be **stronger** than the native one, and may spend a
   **different resource** — not MP or SP, but DP, gold, a token, or a new number.
4. It only works **while the corresponding equipment is worn.**
5. Remove the equipment and the ability is **gone** — not merely disabled.

**[既有/待验证] Cost differs sharply by ability kind**, and this is the important
engineering split:

| Ability kind | Implementation | Verdict |
| --- | --- | --- |
| **Spells** | swap the entry in the flat `KinkyDungeonSpells` list, or gate it through `calcComp` / a component whose `check` inspects worn restraints | **cheap** — but **[既有]** every hotbar stores *indices* into `KinkyDungeonSpells` (`base/KinkyDungeon.ts:7233`, `KinkyDungeonSpellChoices: number[]`), so **splicing the array invalidates every stored index.** Mutate the spell object; do not remove it. |
| **Spell components** | a handler on `calcComp` / `beforeCalcComp` that clears or adds `data.failed` | **cheap**, and idiomatic — base-game `Psychokinesis` does exactly this (§2.4) |
| **Weapon use while bound** | a `getWeapon` handler setting `data.flags.HandsFree`, gated on the equipment | **cheap — and already implemented upstream.** See Appendix C.1: `FloatingWeapon` is a working reference, and four handlers already widen weapon access this way. |
| **Attacks, movement, and other base capabilities** | **injection**: the game must deny the native ability while un-equipped | **deny is uniform, grant is per-ability** — see the policy below |

**[提议] The mechanism, stated as a policy rather than left open.** Appendix A makes the
choice mechanical instead of aesthetic:

> **The native ability is denied at the action chokepoint (§2.5 / A.5). The mediated
> version is granted at the seam the ability actually has (A.2 / A.4).**

Both halves then follow from the inventory rather than from taste:

- **Denying** is uniform and cheap: wrap `KDInputTypes`, which is a plain mutable record,
  and refuse the commands that constitute the ability. Attack, cast, speak, move — one
  mechanism, 85 named commands to choose from, and the game's own `KDAutoStruggle`
  already proves the registry can be driven from the outside.
- **Granting** is per-ability, because that is what the base game allows: `calcDamage`'s
  `canUse` for wielding, `calcVision`'s `blindlevel` for seeing, `calcComp`'s
  `data.failed` for casting, `forceResult = false` for binding.
- **Three abilities cannot be granted at all** — speech, `immobile` movement, and noise
  (A.9). For those the mediated version must be something *else*: a different interaction
  the equipment unlocks, not the ability itself. This is a constraint on the content, and
  it should be respected at design time rather than discovered during implementation.

> **[既有] The pleasant consequence:** "the equipment is what lets you use your own arm"
> is expressible, because the arm is bound by a restraint field that the *game* consults
> inline — and the mediated way out is a granted seam, not a field. The two halves do not
> have to agree on a mechanism, only on a dimension.

**[决定] The buff half, and its cost gradient.** The controller is not debuff-only, and
the design conversation named three kinds of buff with very different prices
(Appendix C.3):

| Kind | Cost | Seam |
| --- | --- | --- |
| **numeric buff** | free | the same `calc*` events as A.2 / A.3, read in the other direction |
| **marking a unit on the map** | cheap, and there is a template | `KDEnemyHasFlag` + a `drawminimap` handler — this is exactly what `calcEscapeKillTarget` and its `EscapeKillMarker` consumer already do (C.3.1) |
| **shared vision** (seeing what an allied doll sees) | real rendering work | `drawminimap` for the map marks, `draw` for the vision-edge arrows (C.3.2) |

> **[既有] The generic callback system the design asked for already exists — it is the
> event bus.** Every mechanic above is a handler on a `calc*` or `draw*` trigger whose
> `data` object the handler may mutate. **[提议]** what Boids should add is not a new
> mechanism but a **convention**: one named payload shape for "a Host-side effect with a
> duration", so that marking, vision-sharing and numeric buffs share an apply / tick /
> expire lifecycle instead of each reinventing one.
>
> **[既有] And §A.7's asymmetry bites here too:** a *deny-only* seam can express a debuff
> but can never express its inverse buff. So a dimension that is meant to have a buff side
> **must** be placed on a seam that grants — which is a selection constraint on the
> dimension list, not an implementation detail.

**[提议] Build the resource first, spend the ritual second.** A new currency that the
mediated abilities consume is the piece that makes "traded away, bought back" legible
to the player. It is also the piece that makes the Host's privileges (§4) concrete.
**[goal post]** the specific currency is not chosen.

**[提议] Do not build the content before the framework.** The designer's stated
preference is a framework into which privileges and narrative fragments are poured
later. Baleenie agrees, with one caveat: a framework with **no** content cannot be
validated. So the iteration should ship the framework plus **one** complete ritual →
capability → privilege chain, end to end, as the proof it works.

---

## 6. Graduation

**[决定] The graduation artifact persists in `localStorage`** — a cross-save archive
that a new character can read. Rationale: §2.6, that is exactly the layer the base game
uses for cross-character unlocks, and it is invisible to `KDResetData`.

**[既有] The base game has no graduation, ascension, retirement or permadeath mechanic.**
Searched for all of those names; the nearest things are `KinkyDungeonNewGamePlus`
(§2.6) and the Collection / "Summit" persistent-NPC roster.

**[既有] And Collection / Summit are *not* a graduation mechanic.** Confirmed by the
designer: they belong to the game's **dom playstyle**. Collection is where NPCs the
player has captured are kept; Summit is a fairly primitive home-base system. So the
earlier `[待验证]` is resolved in the negative — there is no graduation-shaped thing to
reuse, only implementation *patterns* to borrow.

**[决定] The mechanic's name is `Filed`** — an information-technology borrowing, in the
sense of *archived*, *committed to the record*. It carries the flavour the graduation is
meant to have: the doll is not destroyed or promoted, it is **filed**. The name should be
used consistently in text keys, and it fits the versioning scheme of §2.10 better than a
ceremonial word would.

**[提议] Borrow these two patterns from Collection and Summit** — not the systems, the
shapes:

| Borrow | For |
| --- | --- |
| the Collection loop: capture requires beating a strong NPC, and the capture is permanent | **a repeatable quest**: "collect NPCs for the Host". It is self-refreshing content with an existing mechanical idiom, and it gives the faction a reason to keep playing after the main line |
| the Summit pattern: a player-owned space with rooms and contents | **a faction-specific home base** — the room and workshop the Host assigns to the character |

The second one matters more than it looks: §5 wants a framework that content is poured
into later, and a physical space is the cheapest place to put content that does not need a
quest to gate it.

**[goal post] The recording half.** "Record the player's operating habits and freeze
them into a behaviour tree or a small neural net, so a template doll can be pasted at
the level of *behaviour*" is recorded here and **explicitly not in this iteration.**

**[提议] And a cheaper version should be considered before it.** The fantasy that
matters — a new character inherits a template, is progressively rebuilt toward it, and
that constitutes an additional progression axis — does not require learning anything.
A hand-authored template plus the §5 ritual chain delivers most of it. The learning
version is a research project wearing a game feature's clothes, and it should be judged
on its own merits later.

---

## 7. Goal posts (recorded, not in scope)

**[goal post] MachinePrime mechanics not in this iteration:**

- **PC-as-NPC override** (idea 5). The *cheap honest* version is §2.8 — suggestion
  buttons, with accepting costing control, driven by the constraint dimensions of §3.
  The expensive version (真正接 NPC 行为树) additionally requires reimplementing
  decision-making that the base game does not separate from execution: **[既有]**
  `KinkyDungeonEnemyLoop` (`KinkyDungeonEnemies.ts:5350`) both decides *and* executes,
  `AIData` is a module-level singleton reset on entry, and there is **no**
  `KinkyDungeonPlayerAI`.
- **Behaviour-tree / neural-net template recording** (idea 6). §6.
- **The "battery" sub-faction** (forced play, humanoid-as-power-cell).
  **[既有]** the base game's natural home for this is `KDPrisonTypes`
  (`base/KDTypeDefs.ts:4080-4110`): a per-faction **state machine** with `init`,
  per-turn `update`, `finally`, `starting_state` and `default_state`, registered by
  assigning into a global record. `DollShoppe` (~1065 lines) and `DollStorage` are
  worked examples. **[提议]** this is far cheaper than a hostile faction, because it is a
  *stay-and-be-processed* space rather than a target to fight.
- **The sadist-doll sub-faction** (dolls that reprogram restraints to capture others).
  **[既有]** this is closest to the base game's existing hostile factions and should be
  the cheapest of the three.
- **A lock on a weapon.** **[既有]** weapons *are* variant-able, save-persistent, and can
  carry their own `data` and `events` (Appendix C.2) — but they have no `lock`, no `curse`
  and no `struggle` path. "A weapon you cannot put down" is a genuine gap. **[提议]** the
  right shape is a small upstream ask (a weapon-side `lock` field, mirroring the restraint
  one), not a fork of the game's functions. Recorded because the design note raised it and
  the research closed it as *narrow*, not as *needed*.

**[goal post] Other factions:**

- **The charm / hypnosis / marionette faction.** **[既有]** the original author has
  already built part of this — `DollShoppe`, `DollStorage`, `Dollmaker` content,
  the `Doll` start perk, `DollMirrorCurse`, the `Hypno_Doll` stat. It shares §2.8's
  machinery with MachinePrime.

**[goal post] Loose ideas** mentioned but not recorded in detail: **not lost, just not
written down yet.**

---

## 8. Open questions

Ordered by how much downstream work they block.

1. **[提议] ~~The complete inventory of constrainable values.~~** *Answered in Appendix A*
   — every seam family is enumerated and every `data` shape that matters has been read,
   including the two former unknowns. What remains is not the inventory but the
   **dimension list**: choosing, from A's seams, which dimensions `MachinePrime` offers.
   That is a content decision.
2. **[提议] ~~How "permanent native ability loss" is enforced~~.** *Resolved as a policy in
   §5* — deny at the action chokepoint, grant at whatever seam the ability has — with
   three abilities (speech, `immobile` movement, noise) confirmed as ungrantable in A.9.
   What remains is content: choosing what the mediated version of those three *is*.
3. **[决定] The variant-key / dimension-ID freeze point.** *Resolved as a plan in
   Appendix B*: no variant-key fields are added, `ItemRegistry` becomes a keyed
   `ControlState`, `DimensionId → number` is the only persisted form, and the order to do
   it in is B.5. The remaining decision is the **dimension list**, which is content.
4. **[待验证] The identifier scheme's shape** (§2.10). The master-UUID design is decided;
   whether derivation is `uuidv5(path, master)` directly or goes through an intermediate
   per-family id — so a family can be re-mastered without re-mastering the world — has not
   been compared on cost. **This blocks B.5 step 2, and therefore blocks minting.**
5. **[待定] Per-dimension presentation** for "control degree" (§4).
6. **[goal post] The currency** for mediated abilities (§5).
7. **[goal post] A weapon-side `lock`** (§7, C.2) — recorded as a gap, not a plan.

---

## 9. Issue triage, as it relates to this brief

**Blockers for "MachinePrime, finished":**

| # | Why it blocks |
| --- | --- |
| **#48** | The coordinator's save round-trip writes and reads different globals. Until this is resolved, controller state may not survive a save at all. One-name fix, **[待验证]** in-game. |
| **#19** | The set has no control unit. The only writer of limiter strength is a debug `tick` handler (`MachinePrime/Debug.ts:30-42`) that also advances game time from inside tick dispatch. This is exactly what §3 builds. |
| **#40** | Nothing selects a visor to equip; `DebugStart.ts:100-124` hard-codes two. This is the routing layer's first real customer. |
| **#45 / #33** | The socketed-sub-item mechanism works for exactly one case. The generic selection path is §3's router. |

**Finish, not build** (the infrastructure exists and is proven): **#43, #42, #30**
(`Cuff` and `Aroused/Chastity` are the remaining variant-map conversions), **#34, #37**
(morphing exists for visors and gags only), **#29, #9, #28, #3**.

**Not on the critical path:** **#26, #25, #21, #27, #32, #44, #20**.

**Stale:** **#47** — the UMD-promise global is already fixed in code (`README.md:288-292`,
`webpack/verify.ts:77-79`); the issue can be closed.

---

## 10. What this brief does not do

- It does not specify the controller's final state shape. §3 proposes a direction and
  states the precondition for freezing it.
- It does not pick a currency, a Host name, or any sub-faction's fiction.
- It does not estimate schedule. The scope is "1–3, done properly", and round 1's
  finding is that this is larger than it first looked.

---

# Appendix A — The constrainable-value inventory

> This answers open question §8.1, which the designer named as the precondition for
> freezing the controller's shape. It is a **working inventory**, produced by reading
> the base-game implementation. It is dense on purpose: it is a reference, not prose.
>
> Every row is a **[既有]** fact unless marked otherwise. "Bidirectional?" asks the
> question the whole controller depends on — see A.5.

## A.1 The five mechanism families

A control dimension reaches the game through one of five seams. Which seam it uses is
determined by what the game exposes for that value, not by preference.

| Family | Seam | Can it *grant*, or only *deny*? |
| --- | --- | --- |
| **1. Single-stage value** | a `calc*` event where the handler's output **is** the returned value | **both** |
| **2. Multi-stage value** | a `calc*` event whose output is further scaled downstream | **influence only** |
| **3. Switch (broad)** | a `forceResult`-style override | **both** |
| **4. Switch (action)** | veto or synthesise at `KDSendInput` | **both** |
| **5. Declarative field** | `immobile` / `freeze` / `hobble` / … on a restraint | **deny only** |

## A.2 Family 1 — single-stage value replacement

The event's `data` object **is** the value the function returns. A handler writing it
replaces the result outright. This is the family where capability can be genuinely
granted.

| Value | Trigger | Site | `data` shape | Notes |
| --- | --- | --- | --- | --- |
| blindness | `calcBlind` | `player/KinkyDungeonStats.ts:2073` | `{player, blindness}` | base is `restraint.blindfold` sum `*1.5`; handler **replaces** the return value |
| deafness level | `calcDeaf` | `:430` | `{deaflevel, deafMaxWeight:0.75, deafTotalWeight:0.25, maxDeaf, totalDeaf, restraints}` | **`deaflevel` is assigned by the handler** (`:432`) — `data.deaflevel = max*maxDeaf + total*totalDeaf` |
| hearing radius | `calcHearing` | `:450` | `{entity, noise, base:8, deaflevel, hearingMult}` | `radius = base*5/(5+deaflevel)*hearingMult` |
| sight radius | `calcVision` | `:376`, returns `:383` | `{brightness, blindlevel, blindlevelBonus, noperipheral, blindMult, visionMult, max, min, nightVision, blindRadius}` | handler's `data` **is** the return; see A.8 on why `blindlevel` here outranks the global |
| crit multiplier | `calcCrit` | `fight/KinkyDungeonFight.ts:390` | `{weapon, Damage, accuracy, enemy, basecrit, critmult, critboost}` | `(basecrit+critboost)*critmult` (`:392`) |
| bind crit | `calcBindCrit` | `:405` | same shape, `basecrit: Damage?.bindcrit` | `(basecrit+critboost)*critmult` (`:407`) |
| spell accuracy | `calcSpellAccuracy` | `:416` | `{accuracy, accuracyBonus, accuracyMult}` | `(accuracy+accuracyBonus)*accuracyMult` (`:417`) |
| spell range | `calcSpellRange` | `base/game/KinkyDungeonDraw.ts:1005` | `{spell, range}` | handler's `data` **is** the return (`:1011`) — `range` is replaceable outright |
| display damage (UI only) | `calcDisplayDamage` | `base/game/KinkyDungeonHUD.ts:3059` | — | never affects gameplay |

**[既有] `afterNoise` is *post-decision*, and is not a control seam.** Its `data` carries
`radius`, `x`, `y`, `nosound`, `particle`, `enemiesHeard` (`magic/KinkyDungeonMagic.ts:809`),
but by the time it fires the enemy alert loop has already run (`:793-807`) and
`data.enemiesHeard` is the return value (`:814`). A handler here can suppress the sound
and the shockwave render, and nothing else. Recorded as a **negative** result: it looks
like a noise dimension and is not one.

**[既有] Full read-out of the two former unknowns:** `calcSpellRange` is Family 1 and
grantable; `afterNoise` is neither.

**Precedent in-repo:** `calcBlind` is already used by Boids' visors
(`MachinePrime/Item/Visor/Common.ts:68`) — `data.blindness = Math.max(data.blindness, limiter * 6)`.

## A.3 Family 2 — multi-stage influence

The event output is multiplied, scaled or offset afterwards, so a handler can **influence**
but not **replace**. This distinction is load-bearing and is the single most important
engineering finding of the appendix.

| Value | Trigger | Site | Output is then… |
| --- | --- | --- | --- |
| stat ceilings | `calcMaxStats` | `KinkyDungeonStats.ts:1574` | applied to `KinkyDungeonStat*Max` before return (`:1562-1572`) |
| miscast chance | `calcMiscast` | `:2058` | `Math.max(0, …)` again, then satisfaction subtracted (`:2059-2060`) |
| mana pool regen | `calcManaPool` | `:1807` | consumed a line later by the rate formula (`:1809-1819`) |
| mana cost | `calcMana` | `magic/KinkyDungeonMagic.ts:650` | × `costscale`, + level term, × `efficiency`, then 4 more events (`:650-659`) |
| stamina cost | `calcStamina` | `:623` | × `costscale`, then **4 more events** (`:626-629`) |
| charge cost | `calcCharge` | `:677` | × `costscale`, then 4 more events (`:679-682`) |
| gag penalty mult | `calcGagRed` | `KDTraining.ts:370` | `mult *= exponent ** (level + buff)` (`:373`) |
| corset SP mult | `calcCorsetSPRed` | `:341` | `mult *= exponent ** (level + buff)` (`:344`) |

**[既有]** Four more joined this family once their shapes were read. Each is *influence*,
not replacement, and each has a **knockout field** — one value whose neutral
(multiplier-identity or additive-neutral) setting removes the whole term:

| Value | Trigger | Site | Shape | Knockout field |
| --- | --- | --- | --- | --- |
| evasion / hit chance | `calcEvasion` | `fight/KinkyDungeonFight.ts:490` | `{enemy, isSpell, isMagic, flags:{KDEvasionHands, KDEvasionSight, KDEvasionDeaf, KDEvasionSlow}, cost, forceWeapon, hitmult, stamPenType}` | `hitmult = 1`; or clear the relevant `flags.*` |
| weapon damage / accuracy | `calcDamage`, `calcDamage2` | `:291`, `:294` (same object) | `{flags:{KDDamageHands, KDDamageArms}, accuracyMult, damageMult, weapon, HandsFree, canUse, forceUse, handBondage, armBondage, legBondage, brawler}` | `accuracyMult = 1`, `damageMult = 1`; `canUse = true` bypasses the unwieldy branch (`:296`) |
| escape penalty | `calcEscapePenalty` | `restraint/KinkyDungeonRestraints.ts:2418` | `data` carries `escapePenalty`, `struggleType`, `struggleGroup`, `restraint`, `handsBound`, `handBondage`, `query`, … | `escapePenalty` is read after the event (`:2408` onward) |
| will percent | `calcWillPercent` | `:3739` | `{willPercent, willMult, willPenalty, applier}` | `willMult` (multiplied at `:3741`, clamped at `:3742`) |
| sprint cost | `calcSprint` | `base/game/KinkyDungeonGame.ts:4480` | `{sprintdata, sprintCostMult, cost, boost, sprintCostOverride}` | `sprintCostMult = 0` zeroes the whole cost (`:4482`) |

> **[既有] `calcDamage` and `calcDamage2` receive the *same* object** (`:280-294`), so a
> handler on either sees the other's writes. Treat them as one dimension with two passes,
> not two dimensions.

> **Consequence for the design:** "reduced sight" can be set exactly; "reduced casting
> cost" can only be nudged. A dimension's *expressive range* therefore depends on its
> family, and the router cannot paper over that.

## A.4 Family 3 — switch dimensions via `forceResult`

**[既有] The override pattern exists in the base game**, and it can say *yes* as well as
*no*:

| Check | Trigger | Site | `forceResult` assigned to |
| --- | --- | --- | --- |
| arms bound | `getArmsBound` | `KinkyDungeonRestraints.ts:1754` | `true` (deny) |
| hands bound | `getHandsBound` | `:1646`, `:1683` | `true` (deny) |
| (same, other-character) | `getArmsBound` | `:1855` | `true` (deny) |

The data shape carries `forceResult: any` — default `undefined` — and every consumer
guards with `if (data.forceResult != undefined) return data.forceResult`
(`:1652`, `:1690`, `:1761`, `:1802`, `:1861`).

> **[既有] Therefore `forceResult = false` skips the entire check and returns "not
> bound".** This is a genuine, bidirectional capability gate — and **the base game never
> uses it in that direction.** MachinePrime would be the first. That makes it the highest-
> value seam in the inventory, and also the one with the least precedent to lean on.

**[既有] A second pattern, `getWeapon` (`effect/KinkyDungeonEvents.ts:341`):** handlers set
`data.flags.treatAsHandsBound = true` (":342 `TreatAsBound`", ":347 `NoTwoHanded`"), and
`KinkyDungeonCanUseWeapon` (`KinkyDungeonStats.ts:1584`) reads those flags plus
`KinkyDungeonIsHandsBound` / `KinkyDungeonIsArmsBound`.

> **[既有] Watch the polarity.** The weapon path only ever sets these flags to `true`;
> setting them to `false` does not grant anything, because the surrounding expression
> already consults the real bound state. **This is a deny-only seam**, unlike
> `forceResult`.

## A.5 Family 4 — the action chokepoint

**[既有]** `KDSendInput` → `KDInputTypes`, **85 commands** (measured, `base/KinkyDungeonInput.ts:10`).
This is where *broad* switches belong: "may attack", "may cast", "may speak", "may move".

| Deny as | Veto command |
| --- | --- |
| attacking | `doattack`, `dospecial`, `docapture` |
| casting | `tryCastSpell`, `spellCastFromBook`, `upcast` |
| speaking / interacting | `dialogue`, `talk`, `interact` |
| freeing yourself | `struggle`, `struggleCurse`, `pick`, `unlock`, `hack`, `commandunlock` |
| dressing / equipment | `equip`, `equipRestraintGeneric`, `quickRestraint`, `dress`, `drop` |
| arousal / relief | `tryOrgasm`, `tryPlay` |
| moving | `move`, `movestairs`, `setMoveDirection` |

**[既有]** `KDInputTypes` is a plain mutable record, so a wrapper is a one-line
assignment per command, and the game's own `KDAutoStruggle` already demonstrates
*synthesising* input rather than vetoing it (`player/KDAutoStruggle.ts:73`).

## A.6 Family 5 — declarative restraint fields

**[既有] Deny-only, and this is a real limitation.** A restraint field can take a
capability away; **no field grants one.**

| Field | Type | Effect | Read at |
| --- | --- | --- | --- |
| `bindarms` | `boolean` | arms bound | `KDTypeDefs.ts:488` |
| `bindhands` | `number` | hands bound (fed into `KDHandBondageTotal`) | `:492` |
| `blockfeet` | `boolean` | feet blocked | `:500` |
| `hobble` | `number` | slows, floors at 2 | `:496` |
| `heelpower` | `number` | heel penalty | `:498` |
| `immobile` | `boolean` | **`SlowLevel += 100`** | `:588` |
| `freeze` | `boolean` | `SlowLevel = max(2, …)` | `:586` |
| `blindfold` | `number` | blindness | `:506` |
| `deaf` | `number` | deafness | `:466` |
| `gag` | `number` | gag total | `:504` |
| `corset` | `number` | SP cost | `:464` |
| `chastity` / `chastitybra` | `boolean` | blocks arousal | `:462`, `:480` |

All of these are consumed by `KinkyDungeonCalculateSlowLevel`
(`player/KinkyDungeonStats.ts:2153`), `KinkyDungeonGagTotal` (`:2209`), `KDDeafLevel`
(`:413`) and `KinkyDungeonGetBlindLevel` (`:2063`).

## A.7 The asymmetry, stated once

This is the finding that should shape §3 and §5:

1. **A `calc*` handler can only move the value it is handed.** For the multi-stage family
   (A.3) that means *influence*; for the single-stage family (A.2) it means *replacement*.
2. **`forceResult` is bidirectional** (A.4) — but on a narrow set of checks, and with no
   base-game precedent for the *granting* direction.
3. **`treatAs*Bound` and the declarative fields are deny-only** (A.4, A.6).
4. **`Senses` training is the base game's own proof that "restraint → benefit" works**
   (§2.2) — implemented as `calcGagRed` / `calcCorsetSPRed`-style multipliers plus a
   **division** at the consumption site (`data.blindMult *= 1 / KDSensesTrainingBoost(entity)`,
   `KinkyDungeonStats.ts:372`).

> **[提议] Design consequence.** §5's "the mediated version may be *stronger* than the
> native one" is achievable, but **which seam** delivers it is per-ability. A dimension
> whose only seam is deny-only cannot express "better than native" at all. The inventory
> above should therefore be treated as an **input to the dimension list**, not a
> formality: some dimensions the designer wants may need a seam that does not exist yet,
> and that is a decision to make before the state shape is frozen.
>
> **[既有]** The shape pass is done for this family. Two rows remain unread
> (`afterNoise`, `calcSpellRange`) and are marked as such; everything else above was
> read from its definition.

## A.8 Seam precedence: which hook actually decides

Reading the shapes turned up one thing that a router cannot be designed without.

**[既有] Some values are written by an early seam and *overwritten by a later one*.**
Blindness is the worked example, and it has two separate seams that look
interchangeable and are not:

| Step | Site | What happens |
| --- | --- | --- |
| 1 | `KinkyDungeonStats.ts:1827` | `blind = max(KinkyDungeonBlindLevelBase, KinkyDungeonGetBlindLevel())` — the **`calcBlind`** seam lives inside this call (`:2073`) |
| 2 | `:1829` | `KinkyDungeonBlindLevel = min(KDBlindnessCap, blind)` |
| 3 | `:1831` | if `StatBlind > 0`, floor `KinkyDungeonBlindLevel` at 6 |
| 4 | `:376` / `:383` | `calcVision` reads `KinkyDungeonBlindLevel` into `data.blindlevel`, a handler may rewrite it, and `data` **is** the vision radius |

So the **`calcBlind`** seam *does* propagate — it feeds step 2 — **except** that step 3
overrides it. A handler that reduces `data.blindness` cannot unblind a `StatBlind`
player. A **`calcVision`** handler writing `data.blindlevel = 0` can, because it is the
last write before the value is used.

**[既有] The same seam has a second consumer**, and this is the part worth flagging:
`KDTickSensesTraining` (`base/game/KinkyDungeonGame.ts:3847`) computes
`trainingLevel = KinkyDungeonBlindLevel + KDDeafLevel()` (`:3848`) and uses the global
directly at `:3865`. So **the global blind level is load-bearing for `Senses`
training** — the one base-game system §2.2 wants to reuse.

> **[既有] A live hazard in that function, found while reading it.** `KDTickTraining`
> (`player/KDTraining.ts:206`) does `turns_total += total` and
> `KDGetTrainingPercentage` divides by `turns_total`. At `:3865` the call passes
> `total = KDSensesTrainingMult` for a *blind* player and `total = 1 + KinkyDungeonBlindLevel*.1`
> for a sighted one — so a sighted player with blind level 0 contributes a **nonzero**
> total. The division is safe as written, but only because of that `1 +`. **[待验证]** what
> `KDSensesTrainingMult` is, and whether it can reach 0.

> **[既有] `KinkyDungeonGetBlindLevel()` has a second call site**
> (`effect/KinkyDungeonEvents.ts:13283`, a `< 1` gate), and
> `KinkyDungeonGetHearingRadius()` has four (`KinkyDungeonEnemies.ts:9802`, `:9855`,
> `:9869`, `:9904`). So "unblind" and "undeafen" are not one decision even now — they
> are sets of seams that must agree.
>
> **[提议] Router consequence.** A dimension descriptor needs more than a seam family
> and a direction. It needs a **priority relative to the game's own writes**, and the
> router must be able to name more than one seam for one dimension. "Sight" is not one
> hook; it is `calcBlind` + `calcVision` (with `StatBlind` able to veto the first), and a
> partial implementation silently fails. "Senses training" is a *third* consumer of the
> same global.

## A.9 Capability recipes — does the granting direction actually work?

This is the direct answer to §5's open question, dimension by dimension. Each row is a
mechanism that would **grant** something the game normally denies.

| Want | Seam | Mechanically | Verdict |
| --- | --- | --- | --- |
| see while blindfolded | `calcVision` | write `data.blindlevel = 0`, `data.blindlevelBonus = 0` | **works** — `data` is the return |
| use a two-handed weapon while bound | `getWeapon` | set `flags.treatAsHandsBound = false` | **no** — the surrounding expression also consults the real bound state (§A.4) |
| ignore binding for one weapon | `calcDamage` | push `canUse: true`, `forceUse: true` | **works** — `:296` branches on `data.canUse` |
| ignore blindness in an attack roll | `calcEvasion` | `data.flags.KDEvasionSight = false` | **works** — the penalty is inside that flag (`:516`) |
| ignore slowness in an attack roll | `calcEvasion` | `data.flags.KDEvasionSlow = false` | **works** (`:518`) |
| not be bound, at all | `getArmsBound` / `getHandsBound` | `data.forceResult = false` | **works** — the guard is `!= undefined` (§A.4), with **no base-game precedent** |
| ignore gag for speech | `KinkyDungeonCanTalk` | *(no seam)* | **does not exist** — `CanTalk` (`:2241`) reads restraint fields directly and dispatches no event |
| cast a `Verbal` spell while gagged | `calcComp` / `beforeCalcComp` | clear `data.failed` | **works** — base-game `Psychokinesis` precedent (§2.4) |
| walk while `immobile` | `KinkyDungeonCalculateSlowLevel` | *(no seam)* | **does not exist** — `:2155` reads `KDRestraint(r).immobile` directly; the only answer is `getHandsBound`-style fields the restraint itself does not carry |
| sprint while slowed | `calcSprint` | `data.sprintCostMult = 0`, or `data.cost = 0` | **works** (§A.3) |
| resist the Host's will check | `calcWillPercent` | `data.willMult = 0` | **works** — multiplies the whole thing to 0 (`:3741`) |
| out-range a normal caster | `calcSpellRange` | write `data.range` | **works** — `data` is the return (`KinkyDungeonDraw.ts:1011`) |
| be heard less | `afterNoise` | — | **does not exist** — the seam fires *after* the alert loop (§A.2) |

**[既有] Three of these are hard negatives, and they matter** — two for the same reason
and one for a different one:

- `KinkyDungeonCanTalk` and the `immobile` path have **no event seam at all**; they read
  restraint definitions directly, at the point of use. For those the only options are the
  action chokepoint (A.5), or a restraint that does not carry the field in the first
  place.
- `afterNoise` **has** a seam but fires too late. This is a distinct failure mode worth
  naming: the seam exists, the shape looks right, and the decision has already been made.

> **[既有] The emerging rule.** A value is granted-eable when the game asks *"may I?"*
> through an event **whose result is still ahead of it**. It is granted-**un**eable when
> the game reads a restraint field inline, *or* when the event fires after the decision.
> The inventory above is therefore also a list of **where the base game accidentally
> hard-coded a decision** — and each of those is a candidate for an upstream patch
> request, or for a workaround at the chokepoint.

## A.10 What this appendix changes

- **§8.1 is answered.** Every seam family is enumerated, every `data` shape that matters
  has been read, and the two former unknowns are resolved — `calcSpellRange` is grantable,
  `afterNoise` is not.
- **§3 gains a third requirement, not just a second.** A dimension descriptor must record
  its **seam family**, its **direction** (grant / deny / both), and its **precedence
  relative to the game's own writes** — and it may need **more than one seam** (A.8).
- **§5's open question is now half-answered with evidence.** Switch-type abilities have
  a working grant path (`forceResult = false`, `calcDamage.canUse`, the action
  chokepoint). Three specific abilities — speech, `immobile`-based movement, and noise —
  have no usable seam, and that is a real design constraint rather than an unknown.
- **[提议] One upstream ask is now concrete.** `KinkyDungeonCanTalk` dispatching a
  `calcGag`-style event would be the same shape as the twenty events the game already
  dispatches, and it would make gag-mediated capability grantable instead of hard-coded.
  Issue **#44** is already recorded as "modify base game and add event to calculate gag
  level" — this appendix gives it a specific justification.

---

# Appendix B — The save-format freeze point

> This answers open question §8.3, the one item in the brief that is **cheaper now than
> at any later time**. There are three separate persisted surfaces and they are not the
> same decision.

## B.1 The three surfaces

| Surface | What persists | Why it is a format |
| --- | --- | --- |
| **Variant key** | `uuidv5(JSON.stringify(variantKey), baseId)` | the key's fields, in literal insertion order, *are* the restraint name stored in a save (§2.9) |
| **Coordinator state** | `KDGameData['68C84945-…']` | written wholesale into the save and adopted on load (§2.6) |
| **GUID registry** | every handler `type`, in-game *and* across every other mod | `AddEventHandler` throws on a duplicate at load (`KDExtensions/Event.ts:19-21`) |

## B.2 Measured: the GUID namespace is clean today

**[既有] Measured over `src/`:** 117 distinct GUID string literals, **117 distinct**,
zero duplicates. The load-bearing ones:

| GUID | Role | Site |
| --- | --- | --- |
| `8D4A3F0D-…` | `MachinePrimeItemPrefix` — a **field of every variant key**, so it is inside every generated restraint name | `MachinePrime/Constant.ts:22` |
| `7F7A268D-…` / `31E7AC3B-…` / `62EE228F-…` | `ItemArchetype.Blinder` / `.Deafener` / `.Gag` | `:52`, `:67`, `:72` |
| `68C84945-…` | the coordinator's key inside `KDGameData` | `Coordinator/Internal/StateStorage.ts:24` |
| `4F575103-…` / `A2C4BB95-…` | item-data keys `HardLightVisor` / `VariantInfo` | `Item/Visor/Constant.ts:14`, `:23` |
| `6C035995-…`, `8B3D8FF7-…`, `74E4E3B1-…`, `6972C883-…` | the four link sockets — these are `shrine` **tags**, matched by string equality | `Futuristic/Link/Socket.ts:16-34` |
| 12 handler `type`s | registered at load, throw on duplicate | see the manifest |

**[既有] Uniqueness is currently maintained by discipline, not by a check.** No test
collects the GUID literals and asserts distinctness. The registration manifest would
catch a duplicate *handler type*, but nothing catches a duplicated `shrine` tag (two
sockets quietly becoming one joint) or a duplicated item-data key.

> **[提议] Turn the measurement into a test.** Collect every GUID literal under `src/`,
> group, and fail on any duplicate — the same shape as `self-check.test.ts`, and it costs
> almost nothing. This is worth doing **before** the dimension GUIDs land, because those
> are the ones that will be minted in bulk.

## B.3 The variant-key decision

**[既有] The machine-prime variant key currently carries one field:** `prefix`
(`MachinePrimeVariantBase`, `Constant.ts:34-36`). Every machine-prime restraint name is
`uuidv5('{"prefix":"8D4A3F0D-…"}', baseId)` — the item-specific fields live in the
template the variant points at, not in the key.

**[既有] The `Futuristic` keys carry far more**, and they are the ones at risk:
`GlassVisor` enumerates 32 keys over `{Socketed × HideBrows × Colorize × Level × Layering}`
with integer enum values inside (`Futuristic/GlassVisor/Variant.ts:254-303`).

> **[提议] The rule, stated once so it can be enforced: a field may enter a variant key
> only if the game must resolve an *existing save* to a different item because of it.**
> Everything else belongs in the template, or in `item.data` — which is where
> `VariantInfo` already puts the partial variant (`Item/Visor/Constant.ts:23`) and which
> survives both save and unlink.
>
> Under that rule: **the dimension design adds zero variant-key fields.** A dimension is
> a coordinator-state concept and an item-data concept, not an identity. Items that
> provide a dimension say so in `item.data` and in their events, exactly as
> `HardLightVisor` and `VariantInfo` already do.

**[既有] Avoiding a key change is worth real money here**, because `Colorize` and `Level`
are *already* in the `GlassVisor` key. Adding a field now would be a save migration;
adding a field **after** the dimension work would have been a save migration *plus* a
rename of every visor. The window is what makes this cheap, not the change itself.

## B.4 The coordinator-state decision

**[既有] Today the state is `ActivePC.Items` keyed by the three `ItemArchetype` GUIDs,
each slot a `SensoryLimiter`-shaped record** (`Internal/State.ts:129-158`). Adding a
dimension means editing `ItemRegistry`, which is a state-shape change.

**[提议] Replace it with the keyed map from §3, in one step, before release.** Concretely:

```ts
// Before                          // After
type ItemRegistry = {               type ControlState = {
    [Blinder]:  Visor                    readonly [Dimension: DimensionId]: ConstraintTarget
    [Deafener]: SensoryLimiter       }
    [Gag]:      Gag
}
```

**[既有] The migration cost of doing it now is zero saves.** No released build has a
coordinator save in the wild; `test/registration-manifest.test.ts:89-105` already asserts
the coordinator's save key is **absent** from the registration manifest, precisely so the
shape is not accidentally frozen.

**[提议] Migrate nothing, and say so explicitly.** A `fromJS` that recognises the old
three-slot shape is not worth writing for a format nobody has. If a save cannot be
understood, the coordinator should fall back to defaults and say so in the log — the
existing `SetState`-drops-equals-no-op behaviour (`StateStorage.ts:53-59`) already gives
the right precedent for "a write that changes nothing is not a write".

## B.5 The freeze checklist

The concrete list, in the order that keeps each step cheap:

1. **[既有] Fix #48 first.** Write and read the same global (`KDGameData`). Until this is
   settled, "what does the coordinator persist" has no verified answer, and freezing a
   shape that does not round-trip is worse than not freezing it.
2. **[提议] Settle the identifier scheme** (§2.10) **before minting anything.** The master
   UUID and the derivation path decide what every future id is; a dimension GUID minted
   randomly now is permanently unversioned, and the retirement mechanism would have to be
   retrofitted around it.
3. **[提议] Add the GUID-uniqueness test** (§B.2) — before minting the dimension GUIDs.
4. **[提议] Mint the dimension GUIDs** *derived from the master*, and register `Blinder` /
   `Deafener` / `Gag` as the first three entries of the same registry.
5. **[提议] Replace `ItemRegistry` with `ControlState`** in one change, regenerate the
   manifest (`UPDATE_REGISTRATION_MANIFEST=1`), and review the diff.
6. **[提议] Add no variant-key fields** (§B.3), and write the rule into the README's
   invariants list so the next person does not have to rediscover it.
7. **[既有] Keep `DimensionId → number` as the only persisted form.** Everything else —
   seams, direction, precedence, buff side, presentation — is code-side configuration, so
   no future dimension can ever be a save migration again.

## B.6 What this appendix does not decide

- **Which dimensions exist.** That is §8.1's remaining half and it is a content decision,
  not an engineering one: the seams are now enumerated, and picking from them is the
  designer's call.
- **The values.** A dimension's target range and what 0.5 means for it are per-dimension
  design, and belong with the dimension they describe.
- **Whether `Deafener` should finally be wired** (`ItemArchetype.Deafener` has full
  schema and no item — `Constant.ts:56-67`). It is an obvious first customer for the
  keyed store, and an obvious first test of whether the store is worth its keep.

---

# Appendix C — Weapon capability, and the buff half

> Raised by the designer after the first draft: two weapon-related abilities, a buff half
> for the state machine, and a shared-vision mechanic. Researched the same way as
> Appendix A — from base-game implementation.

## C.1 Headline: the weapon case does **not** need a core-logic override

The design note said the game "implemented lockable *equipment*, not lockable *weapons*",
and proposed either a custom path or a function-override mod if the custom path proved
hacky. **[既有] The research says neither is necessary**, and the reason is that the base
game already has *four* working handlers for exactly this problem.

**[既有] `FloatingWeapon` is a real, complete ability tree** in the base game:

| Piece | Site |
| --- | --- |
| the passive skill | `magic/KinkyDungeonMagicList.ts:1213` — `type: "passive"`, `mixedPassive: true`, `manacost: 0`, `components: []` |
| its three events | `:1221` `HandsFree`/`getWeapon`, `:1222` `FloatingWeapon`/`calcDamage2`, `:1223` `FloatingWeapon`/`draw` |
| the tree above it | `Psychokinesis` `:1227`, `RecoverObject` `:1243`, `TelekineticSlash` `:1252`, `KineticLance` `:1260`, `Sagitta` `:1270`, `KineticMastery` `:1235` |

**[既有] The `calcDamage2` handler is the whole trick, and it is nine lines**
(`effect/KinkyDungeonEvents.ts:6914-6925`):

```
if (!data.IsSpell && !data.forceUse && (data.flags.KDDamageHands || data.flags.KDDamageArms)) {
    if (!KinkyDungeonCanUseWeapon(true, undefined, data.weapon) && … ) {
        data.canUse = true;
        data.flags.KDDamageHands = false;
        data.flags.KDDamageArms = false;
        data.accuracyMult = 0;   // ← note: zero, a deliberate heavy penalty
    }
}
```

**[既有] The `getWeapon` event already has four handlers that widen weapon access** —
`HandsFree` (`:6928`), `UnconventionalWarfare` (`:6933`), `GuerillaFighting` (`:6939`), and
the commented-out `TreatAsBound` sibling. They all do the same thing: set
`data.flags.HandsFree = true`. `KinkyDungeonCanUseWeapon` (`player/KinkyDungeonStats.ts:1584`)
then reads `flags.HandsFree` **first**, before it consults the real bound state —
which is exactly the "grant" direction that §A.4 said was missing from
`treatAsHandsBound`.

> **[既有] So the answer to "can a bound character wield a normal weapon because of
> equipment" is yes, today, via `getWeapon` + `calcDamage2`, and `FloatingWeapon` is a
> working reference implementation.** The two design directions both land on the same
> seam:
>
> | Direction | Implementation |
> | --- | --- |
> | **equipment-mediated weapon use** (the "restraint prosthesis" idea) | register a `getWeapon` handler that sets `flags.HandsFree`, gated on the restraint being worn, with `mult` chosen rather than copied |
> | **a special weapon usable while fully bound** (the "hovering mechanical fist") | give the weapon the `telekinetic` flag (`base/KDTypeDefs.ts:1623-1624`, "Can be used with Floating weapon even with no hands") and gate the same handler on it |

**[既有] `accuracyMult = 0` in the base-game handler is a design choice, not a
requirement** — it is the price Floating Weapon charges. Boids would set its own.

> **[既有] One caveat found in the same handler:** `KinkyDungeonCanUseWeapon` takes no
> `query` parameter, so a `getWeapon` handler that emits a failure message cannot be
> suppressed during a UI query. `FloatingWeapon`'s own handler sidesteps this by checking
> mana; a Boids handler should avoid side effects for the same reason.

## C.2 Weapons *are* variant-able and save-persistent

**[既有]** The note's premise is half right and the good half is worth stating.

| Surface | Restraints | Weapons |
| --- | --- | --- |
| deterministic-name registry | `KinkyDungeonRestraintVariants` | **[既有]** `KinkyDungeonWeaponVariants` (`item/KinkyDungeonInventory.ts:121`) |
| per-instance inventory record | `item` | **[既有]** yes — `KDGiveWeaponVariant` (`:3587`) adds `{name, id, type: Weapon, data, events, quantity}` |
| resolvable by variant | `KDRestraint` (`restraint/KinkyDungeonRestraints.ts:273`) | **[既有]** `KinkyDungeonWeaponVariants[item.inventoryVariant \|\| item.inventoryAs \|\| item.name]` (`:145`) |
| persisted | `save.inventoryVariants` | **[既有]** `save.weaponVariants` (`base/KinkyDungeon.ts:7252`, restored `:7450`) |
| carries `events` | yes | **[既有]** yes — merged onto the weapon at `fight/KinkyDungeonFight.ts:310-312` |
| carries `data` | yes | **[既有]** yes — `KDGiveWeaponVariant` takes `data` |

So **a weapon can be a variant, can hold a `data` bag, can carry its own events, and
those events fire during combat** (`:3610`, `:3634`, `:3973`).

**[既有] What weapons genuinely lack** is the restraint `item`-level machinery: there is
no `lock`, no `curse`, no `struggle` path, and no `KDRestraintPropsBase` field set. So
"a weapon you cannot put down" is not expressible today — but "a weapon that is an
instance with its own identity, data and behaviour" already is.

> **[提议] The conclusion is therefore narrower than the note assumed.** Nothing in C.1
> or C.2 needs a core-logic override, and **nothing needs to be split into a separate mod
> that patches the game.** If a *lock* on a weapon is wanted, that is a real gap — and the
> right shape for it is a small upstream ask (a weapon-side `lock` field), not a fork of
> the game's functions. `[goal post]` until someone wants it badly enough.

## C.3 The buff half of the state machine

**[决定]** The controller is not debuff-only. It carries a buff half, and the two differ
in cost:

| Kind | Cost | Seam |
| --- | --- | --- |
| **numeric buff** | cheap | the same `calc*` events as A.2/A.3, read in the other direction |
| **marking a unit on the map** | cheap, and there is a template | `KDEnemyHasFlag` + `drawminimap` |
| **shared vision** | cheap enough to be real, but it is rendering work | `drawminimap` + `draw` |

### C.3.1 Marking units — the `calcEscapeKillTarget` pattern, confirmed

**[既有] The deprecated seam works exactly as imagined.** `KinkyDungeonEscapeList.ts:77-88`:

```
let data = {enemy: enemytype.name, number: enemynumber};
KinkyDungeonSendEvent("calcEscapeKillTarget", data);   // handlers may rewrite both fields
let ens = KinkyDungeonSummonEnemy(point.x, point.y, data.enemy, 1, 2.9);
KinkyDungeonSetEnemyFlag(ens[0], "killtarget", -1);    // ← the mark
```

and the mark is then drawn by a **minimap handler** (`effect/KinkyDungeonEvents.ts:12794-12807`)
that scans `KDMapData.Entities` for the flag and draws a filled circle on the minimap
canvas.

> **[既有] This is the generic pattern the note asked for, and it is already three pieces:
> a `calc*` event to let handlers decide *what*, `KinkyDungeonSetEnemyFlag` to mark it,
> and a `drawminimap` handler to render it.** A Boids "the Host tagged this unit" buff
> needs no new machinery.

**[既有] `KinkyDungeonSetEnemyFlag` / `KDEnemyHasFlag` exist** (`enemy/KinkyDungeonEnemies.ts`),
with `KinkyDungeonSendEvent("calcEscapeKillTarget", data)` dispatching from
`map/KinkyDungeonEscapeList.ts:78` and the built-in consumer at
`restraint/KinkyDungeonRestraintsList.ts:2963` / `:2993` (`DollmakerMask`).

### C.3.2 Shared vision — feasible, and here is the exact seam

**[既有] `drawminimap` fires with the projection already computed**
(`base/KinkyDungeonVision.ts:1069`):

```
KinkyDungeonSendEvent("drawminimap", {update, x, y, w, h, scale})   // x,y = camera origin
```

and the built-in `QuestMarker` handler (`effect/KinkyDungeonEvents.ts:12772-12792`)
demonstrates the whole idiom: iterate `KDMapData.Entities`, test bounds with
`(enemy.x - data.x + .5) * data.scale`, then draw directly onto the `kdminimap` canvas.
**[既有] So "mark what an allied doll can see, on the minimap" is a copy of an existing
handler with a different predicate.**

**[既有] The vision-edge arrow has no built-in helper.** No `KDPositionOnScreenEdge` or
equivalent was found. But the `draw` event fires every frame and `FloatingWeapon`'s
`draw` handler (`:7344-7355`) shows the pattern: compute a screen position and call
`KDDraw` onto `kdcanvas`. An off-screen indicator is a direction vector plus a boundary
clamp — real but ordinary rendering work, and **[提议] the first genuinely *new* rendering
in this design.**

### C.3.3 The generic callback system the note asked for

> **[既有] It already exists, and it is the event bus.** Every mechanic in C.3 is a handler
> on a `calc*` or `draw*` trigger whose `data` object the handler may mutate, dispatched
> from inside the game's own loop. Appendix A calls this "the best surface in the game",
> and C.3 does not need anything beyond it.
>
> **[提议] What Boids should add is not a new callback system but a *convention* on top of
> this one:** a single named payload shape for "a Host-side effect with a duration", so
> that marking, vision-sharing and numeric buffs share a lifecycle (apply / tick / expire)
> instead of each reinventing one. That is a design decision for §3, not a new mechanism.

## C.4 What this appendix changes

- **§5's "spells are cheap, everything else is expensive" split is wrong in the useful
  direction.** Weapon capability is *cheap*: the seams exist, a reference implementation
  ships with the game, and the grant direction works because `flags.HandsFree` is read
  before the real bound state.
- **The "separate override mod" idea from the design note is dropped**, on evidence. It is
  marked `[goal post]` only for the one thing that genuinely is missing — a *lock* on a
  weapon.
- **§4 gains a buff half with a cost gradient** (C.3): numeric buffs are free, unit marking
  has a template, shared vision is real rendering work.
- **§3's dimension descriptors must distinguish debuff from buff**, because a buff is the
  same seam read in the opposite direction — and §A.7's asymmetry means a *deny-only* seam
  can express a debuff but never its inverse buff.
