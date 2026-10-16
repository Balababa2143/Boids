# Boids — Design Brief

> **Status: FROZEN — 2026-10-16.** The design discussion is closed and this document is a
> **historical record**. It is kept because it holds the reasoning and the base-game
> citations, which the spec and the dev-plan deliberately do not repeat.
>
> **Do not edit the body of this document to record a change.** A design change goes to a
> GitHub issue; when it is decided, it lands in `docs/spec.md` (§4's version table and the
> migration chain carry it to saves) and its work is scheduled in `docs/dev-plan.md`. This
> file may then gain a dated note in [Appendix E — Frozen record](#appendix-e--frozen-record)
> saying *which issue changed what*. **The reasoning stays as it was reasoned; only the
> record accretes.**
>
> It was written during the design discussion between Viatas (design) and Baleenie
> (engineering). It is not a specification and not a promise.
>
> Every claim carries one of six markers, and the difference matters:
>
> | Marker | Means |
> | --- | --- |
> | **[既有]** | Verified in the base game or in this repo. Cites a file and a line. Not negotiable — this is what the code does today. |
> | **[决定]** | Decided in discussion. Do not silently revisit. |
> | **[提议]** | Baleenie's proposal. Open to disagreement. **A built `[提议]` is still a `[提议]` until it is explicitly promoted.** |
> | **[待定]** | Deliberately open. Listed in `spec` §12. |
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

**[决定] And one thing in depth that is the inverse of all three: the way back out.** The
progression above is only one direction, and the mod's subject — **voluntary** descent —
does not survive without the other one. So the iteration also designs **reversibility, the
two exit routes out of the final act, and the two points of no return** (§6.0). This was
added last, after the forward design was settled, and it changed two earlier decisions
rather than only appending to them.

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
global and calls `KDAddQuest(name)`; `KinkyDungeonDrawQuest` (`:1165`) iterates the
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
`Record<string, (data) => string>` (`:10`) with **86 commands** (measured): `move`,
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
**no item emits it** — `Headphone.ts:106` sets a static `deaf: 2` instead.

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

**[决定] The construction:**

```ts
uuidv5(`Boids.MachinePrime.Item.Foo${JSON.stringify(variantKey)}`, MOD_ROOT_UUID)
//      └─ the namespaced name is the VALUE ─┘                └─ the root is the NAMESPACE ─┘
```

The namespaced name is the first argument, the variant-key suffix is optional, and **no
separate version field is serialised** — the root UUID *is* the version carrier, because the
version table maps it to a release.

> **[既有] One implementation trap, measured — and it is the argument order itself.**
> `uuid`'s signature is `v5(value, namespace)`, so the **second** argument is the namespace,
> and it must parse as a UUID: `v35.js:15-21` calls `parse()`, and `parse.js:3-6` does
> `throw TypeError('Invalid UUID')` for anything else.
>
> **The construction was originally written here with the arguments the other way round** —
> `uuidv5(MOD_ROOT_UUID, 'Boids.MachinePrime.Item.Foo')` — which passes the namespaced
> string as the namespace and **throws**. It has been corrected above. The repository's
> working call has this order already (`src/KDExtension/Variant/Common.ts:40`), and a
> well-meant "simplification" that swaps the two is the single easiest way to break every
> identifier in the mod.

**[决定] Store the path, compute the UUID.** The save carries the **namespaced name**
(plus the variant key and the root it was minted under), not the derived UUID. Then:

1. **The id is recomputed at load**, using the version table to resolve the saved root.
   A derived id is *computed*, not *remembered*, and computed ids cannot drift.
2. **The stored path is version-independent**, so "what this item was" stays readable
   across arbitrary version changes.
3. **Recomputation is a free integrity check** — a mismatch means corruption or tampering.
4. **Migrations then only handle semantic change** (rename, split, merge), because a pure
   version change recomputes by itself. That is a far smaller and rarer set.

**[决定] The version table needs a home, and that is a follow-up decision.** Only the root
carries version information, so *something* must map root → release at load time. Three
candidate placements, with different failure modes:

| Placement | Strength | Cost |
| --- | --- | --- |
| a **code-side constant** table shipped with the mod | nothing to maintain externally; evolves with the release | a new release knows the old roots, but an *old* release cannot know a new one — and migration needs the forward direction |
| a **`localStorage`** table shared by every release | accumulates naturally, readable by all versions | must be maintained and de-duplicated; lost if the player clears site data |
| **table in code + root recorded in the save** | simplest, and the root alone localises the release | if the root is lost from a save, its ids cannot be recomputed |

### 2.10.1 The migration chain

**[决定] A version-numbered chain of migration functions, one per release.** The plan, in
the designer's words:

1. The save records the version (or root) it was written under.
2. A **gate** on the load path detects a mismatch and walks the chain from the save's
   version forward to the current one.
3. **One migration function exists per version**, written when that version ships.
   **An empty body is the normal case** — most versions change nothing; the slot exists so
   the chain's indices stay fixed.
4. **A release with a breaking change fills its slot with a refusal**: it declines to load
   that save rather than corrupting it.

> **[既有] Where the gate can and cannot go, measured.** `KinkyDungeonLoadGame` dispatches
> `beforeLoadGame` at `base/KinkyDungeon.ts:7368` — **before** the save string is
> decompressed at `:7369-7371` and parsed at `:7373`. So a handler on `beforeLoadGame`
> **cannot see the save's version**. Two viable doors:
>
> | Door | Gives | Costs |
> | --- | --- | --- |
> | wrap `KinkyDungeonLoadGame` itself | the raw string, so version can be read and the load allowed or refused | a monkey-patch, but **with precedent** — `StateStorage.ts:112-116` already wraps `KinkyDungeonGenerateSaveData` |
> | read `localStorage.getItem('KinkyDungeonSave')` inside `beforeLoadGame` | earliest possible refusal, no wrapping | cannot reach `loadedsaveslots`, which is where multi-slot saves live |
>
> **[决定] And refusal must not hang or crash the game.** The designer's requirement. The
> mechanism that makes it safe: **[既有] unknown keys on `KDGameData` survive save → load**
> (§2.6 — `JSON.stringify` with no whitelist, then `Object.assign` on the way back), so a
> `BoidsSaveVersion` key rides along in the blob. On mismatch the gate should **return
> cleanly with a message**, not throw — a throw inside `KinkyDungeonLoadGame` walks into
> the game's own crash-report path (`base/KinkyDungeonErrors.ts`).

**[既有] The natural version key already exists:** `Asset/mod.json`'s `modbuild` field
(currently `"0.4.0"`, `Asset/mod.json:5`), which the build stamps from `package.json`'s
`version` (`README.md:127-128`).

**[提议] Why this is worth doing before the dimension work, not after.** §B.5 is about to
mint a batch of dimension GUIDs. If they are random, they are permanently unversioned, and
the retirement mechanism will have to be retrofitted around them. If they are derived,
the whole dimension namespace participates in the scheme from its first day.

> **[既有] One consequence worth naming.** A derived id changes when the master changes —
> so **a version bump renames everything and invalidates every existing save**, unless the
> migration chain carries it. That is the behaviour the design wants, and the chain is what
> makes it survivable rather than fatal. The version table is what makes it a *decision*
> rather than an accident: a release that does not intend to break saves must
> **keep its master.**
>
> **[待验证] The remaining open piece is the version table's home** (§2.10, the table
> above), because that is what the load-time recomputation depends on. The construction
> itself is settled; where the root → release mapping lives is not.

---

## 3. The abstract controller

**[决定] The shape, in the designer's words:** `Coordinator` records *which aspects of
the character's capability need constraining, and to what degree* — abstractly. The
state machine layer decides how that lands on the character's actual values. A routing
layer then decides how the different pieces of equipment express it (model changes,
appearance, forced pose, and so on).

**[决定] Control is not one number.** Each value the game exposes is constrained
**separately**.

### 3.1 Three data models, composed from facets

**[决定] The designer's structure, after reviewing Appendix A:** the controller is built
as **three subsystems**, and the split follows the *mechanism*, not the body part.
Appendix A's five families map onto them, with Family 5 demoted from "a family" to a
**layer underneath all three**.

| Subsystem | Owns | Appendix A families |
| --- | --- | --- |
| **Sensory Control** | the perception values | A.2's *sense* half — `calcBlind`, `calcVision`, `calcDeaf`, `calcHearing`, `calcSpellRange` |
| **Stats Control** | the multipliers and rates | A.2's *multiplier* half as absorbed into A.3 — `calcDamage`, `calcEvasion`, `calcCrit`, `calcSpellAccuracy`, `calcMana`, `calcStamina`, `calcMaxStats`, `calcWillPercent`, `calcSprint`, … |
| **Behavior Control** | the action gates | A.4 + A.5 — `forceResult` overrides and the `KDSendInput` chokepoint |

**[决定] But each subsystem has its *own* data model, and they are not variants of one
shape.** The designer's correction, and the reason it matters:

| Group | What it is | Intent | Capability |
| --- | --- | --- | --- |
| **Constraint** (Sensory, and behaviour strength) | how hard the Host squeezes a value | `number` 0..1 | `number` 0..1 — the ceiling this equipment can reach |
| **Substitution** (prosthesis / spell generator) | **taking away an ability the character already has, and re-granting it through another carrier** | the `Gate` enum below | **a whitelist of `CapabilityKey`s the equipment can substitute** |
| **Buff** | **giving the character something it never had** | which buffs are wanted | which buffs the equipment offers, and their ceiling |

> **[决定] The three are separate because Substitution and Buff are different operations:**
> Substitution is a **transfer** (take away, re-grant elsewhere), Buff is an **addition**.
> One is conservative, the other is a gain, and merging them was an error in an earlier
> draft of this section.
>
> *(Naming: this group was called **Override** in earlier drafts. That collided with the
> gate's two non-free values, `OverrideForbidden` and `OverrideAllowed`, so the group was
> renamed **Substitution** and the old name retired — see `spec` §5.)*

### 3.1.1 Facets, because the categories genuinely overlap

**[决定] A dimension may carry several semantics at once, so it composes facets rather
than picking a category.** The designer's own example: **struggle** is simultaneously
*a permission* ("may the wearer try at all") and *a difficulty* (how hard it is). Any
single-category scheme loses one of them.

```ts
interface Identity  { Id: DimensionId }
interface Rate      { Target: number; Ceiling: number }            // suppression strength
interface Gate      { Intent: GateIntent }                         // permission
interface Whitelist { Granted: ReadonlySet<CapabilityKey> }        // substitution: re-granted abilities

type Sight     = Identity & Rate
type Speech    = Identity & Gate
type Struggle  = Identity & Gate & Rate & { Types: StruggleType[] }  // both, plus an extra field
type WeaponUse = Identity & Gate & Whitelist
```

> **[决定] There is no `Capability: boolean` on `Gate`.** Whether the equipment can offer a
> substitute is exactly *whether the dimension's `Whitelist` is non-empty*, so a boolean
> would be a second source of truth for the same fact. *(Earlier drafts of this section had
> one; it was removed — see `spec` §6.1.)*

**[决定] Facets live in the type system and in a code-side descriptor registry; the
persisted shape stays uniform.** This is the important split:

```ts
type ControlState = {
    readonly target:    { [D: DimensionId]: number }   // suppression / gate strength; 0 = no injection
    readonly equipment: { [D: DimensionId]: number }   // this equipment's ceiling
    readonly config:    { [D: DimensionId]: Config }   // sparse; semantic extra fields
}
```

**Why the storage is not per-dimension typed.** A per-dimension saved shape changes every
time a dimension grows an extra field. Keeping the storage uniform and the semantics in
the registry is what lets §3.3's promise hold — *the persisted shape never changes again* —
while the type layer stays expressive. The migration chain (§2.10, A3) is the backstop,
not the everyday mechanism.

**[决定] `config` is persisted** (the designer's call: *"it will very likely be used"*).
It holds **semantics only** — which struggle types a gate governs, and so on — never
live gameplay state; "which options are currently open" belongs to progress, not to the
controller. That is why it can stay sparse and stable.

### 3.1.2 The `Gate` enum, and what each value means in code

| Value | Meaning | In code |
| --- | --- | --- |
| **Free** | neither the restraint layer nor the substitution layer is engaged | **the injection layer injects nothing at all.** The character's behavioural boundary is whatever the `restraint` template's own defaults say — the game's rules, unmodified |
| **OverrideForbidden** | the Host applies the restraint effect | the injection layer denies |
| **OverrideAllowed** | the Host re-grants an ability **through the equipment** | the injection layer grants, **but only from the equipment's `Granted` whitelist** |

> **[决定] Free means "inject nothing", so the three layers compose rather than replace.**
> The `restraint` template's defaults are always the floor; the controller adds on top.
> This is also how §3.2's Family-5 decision lands: equipment ships at a loose baseline,
> and with no injection that baseline *is* the behaviour.

**[决定] And one hard rule follows, which is an assertion rather than a hope:** *if the
equipment does not offer a substitute capability, the Host cannot set `OverrideAllowed`
for it at all.* "Allow" is a promise **about a specific capability**; with no capability
there is nothing to promise. The router must reject the write rather than let it fail
silently later.

> **[既有] That rule gives `CapabilityKey` a precise boundary, derived from A.9:** speech,
> `immobile`-based movement and noise **have no event seam at all**, so they can *never* be
> granted. They must therefore **never appear in any `CapabilityKey` set**. **[提议]** make
> `CapabilityKey` a closed union so that trying is a **compile error**, not a design
> review.

### 3.2 Scope, and the phasing the designer chose

**[决定] Build the data model for every variable; implement few of them.** The controller
stores all dimensions, **most unused**, and control logic is added in stages from the
simple to the hard.

**[决定] The first scope is Sensory + Behavior.** Stats Control is deferred wholesale
(§3.2.1). The designer's chosen sequence for the two that ship is
**Behavior Control first**, driven by the equipment ladder (Appendix D.4) — it is where
the quest line lands and its seams are the cheapest in Appendix A.

**[决定] Variables that belong to the training model are excluded from the controller.**
Appendix A already flagged them; the designer confirms the exclusion list:

| Excluded | Why |
| --- | --- |
| `calcGagRed`, `calcCorsetSPRed` | `KDTraining` values — they model *tolerance built by practice* (§2.2's `KDGagReductionMult` / `KDCorsetSPReductionMult`), which §4 decided is a separate record from the Host's file |
| `calcEscapePenalty` | ditto — escape difficulty is training's business |
| `calcBindCrit` | the designer's reading: training-related, and the crit path is not a control surface |
| `calcDisplayDamage` | meaningless — UI only, never affects gameplay |

> **[决定] 3.2.1 — And Stats Control is deferred as a whole until the resource system
> exists.** The multipliers and rates are resource arithmetic, and §8 plans a large
> expansion of the game's resource model. Designing Stats Control before that would design
> it twice. **[提议]** the subsystem is *named* and *scoped* now, and built after §8.

**[决定] Family 5 is a layer, not a subsystem.** Restraint definitions are read-only, so
the mod cannot move `immobile` / `freeze` / `blindfold` / `hobble` / `blockfeet` /
`bindhands` / `gag` / `deaf` at runtime. **Therefore Boids ships them at 0 or at a very
loose baseline, and the actual binding strength is applied dynamically by the subsystems
above** — which is exactly what the equipment-evolution design (Appendix D.4) asks for
anyway: the item is not born strict, it *becomes* strict.

**[决定] The designer's split of Family 1 is adopted.** The sense values and the
multipliers look alike in Appendix A because both are `calc*` handlers whose output is
the return. **[既有] They are not alike in what a handler can do with them:** the sense
values are the ones a projector can own outright, while the multipliers feed resource
arithmetic.

> **[既有] And that difference explains the layering rule the designer raised:** the
> projected parts are *displays and earphones* — physical items that sit **at a specific
> depth** in the restraint stack. Whether the projector can dictate the sense value at all
> depends on whether it is innermost; if something is worn over it, the outer item must
> still get its say, or the result contradicts what the player can see on their own
> character. **Appendix A.8 is the mechanism for that:** the sense value is a multi-seam
> dimension, and the projector's bid is one bid among the ones already there.

### 3.3 The persisted shape, and the write validators

The shape is in §3.1.1. Three things about it are decisions rather than implementation
detail:

**[决定] Storage is uniform; semantics are in the registry.** `target`, `equipment` and
`config` are keyed maps over `DimensionId`, and *no* per-dimension type enters the save.
The expressive part — which facets a dimension has — is code-side. This is what makes a
new dimension a code change with an empty-save default.

**[决定] `target > equipment` is allowed, and the router takes the stricter value.**
The Host's working order is *read capability, then set intent*, but the designer allows
setting an intent the equipment cannot reach: **future narrative may make that
reasonable**, and equipment upgrades are gradual (§D.4), so a player may legitimately
want an intent on record before the gear that can honour it exists. Rejecting it would
make "think it through before you equip" mandatory.

**[决定] The validators reject at write time rather than failing silently at run time.**
They fall out of the facets, which is the main reason to have facets at all:

| Facet | Validator |
| --- | --- |
| **Gate** | `OverrideAllowed` requires the equipment's `Granted` / `Capability` to cover the dimension — **the write is refused otherwise** (§3.1.2) |
| **Gate** | `Free` may not carry a non-zero `target` |
| **Whitelist** | every granted key must be a member of the closed `CapabilityKey` union |

> **[提议] `Rate`'s `target > ceiling` is deliberately *not* a validator** — it is legal
> by decision, and the router clamps at read time.

### 3.4 What must change, and the requirements on a dimension

**[决定] `ItemArchetype` / `ItemRegistry` are replaced by the keyed store.** Today both
are closed over three GUIDs, and `ItemRegistry` names each slot literally
(`Internal/State.ts:129-158`) — `Blinder` carries a `Visor` record and the other two a
bare `SensoryLimiter`, a distinction that exists only because a visor was first.

**[既有] The requirements a dimension descriptor must record**, accumulated across
Appendices A, C and D:

| # | Requirement | Source |
| --- | --- | --- |
| 1 | which **group** owns it — Constraint / Substitution / Buff, and which subsystem | §3.1 |
| 2 | which **facets** it composes — `Rate`, `Gate`, `Whitelist` — and the extra `config` fields that go with them | §3.1.1 |
| 3 | its **direction**: grant, deny, or both | §A.1, A.7 |
| 4 | **every seam** it can use, with a **precedence** relative to the game's own writes | §A.8 |
| 5 | whether it has a **buff side** — and a deny-only seam may not claim one | §C.3, A.7 |
| 6 | whether it is **excluded as training-owned** | §3.2 |
| 7 | its `DimensionId` is **derived from the version master**, not random | §2.10, B.5 |

**[既有] The state-shape consequences, named exactly.** These are the files that change:

| File | Change | Gate |
| --- | --- | --- |
| `Coordinator/Internal/State.ts` | `ItemRegistry` becomes keyed; `Visor`/`Gag` stop being distinct record types | `coordinator-state.property.test.ts` |
| `Coordinator/Constant.ts` | `ItemArchetype` stops being the only source of dimension IDs | — |
| `Coordinator/Public/Event.ts` | unchanged — it already stamps an archetype onto an event | — |
| `Coordinator/SensoryControl.ts` | `ThrowIfNotIsSensoryController` becomes descriptor lookup | — |
| `MachinePrime/index.ts` (public surface) | unchanged, if the namespace shape holds | `public-api.test.ts` |

> **[既有] The existing `SensoryControl` is the prototype of one subsystem, and the
> designer's verdict is that it is *very primitive* and may be rewritten rather than
> extended.** That is consistent with what Appendix A found: it validates an archetype
> against a three-member `const enum` and always advances game time
> (`SensoryControl.ts:20-29`, `:106`). **[提议]** keep `GetState` / `SetStateIn` (they are
> property-tested and correct) and replace the limiter layer on top of them.

### 3.5 The routing layer, and its one job

**[提议]** The rule the design conversation asked for is *one-to-many*: many items may
speak to the same dimension, and they must not fight. Three things the router owns:

1. **Which items are providers.** An item declares its dimensions on apply — the same
   stamped-event pattern `RegisterItemOnApply` (`Public/Event.ts:42`) already uses, so
   this is a widening of an existing mechanism, not a new one.
2. **Which provider wins.** The design intent is a resolution rule, not a merge. The
   base game's own `getArmsBound` shows the shape it prefers: handlers bid with a
   **power**, and the highest bid wins unless someone has already forced the result
   (`KinkyDungeonEvents.ts:266-280`). **[提议]** adopt that — which also answers §3.1's
   layering question, because the projector is simply one bidder.
3. **How the loser expresses itself.** The router decides that a losing or partial
   provider still changes the model, the appearance, or the pose. The
   `SensoryLimiterStrengthUpdate` event (`SensoryControl.ts:54-61`) is the existing
   channel for exactly this, and `MakeMorphableVisor` (`Item/Visor/Common.ts:204`) is the
   existing consumer.

**[决定] And a fourth job, named in Appendix D: the projection layer.** The current
socketed-sub-item mechanism is an **unfinished prototype** — it projects on `postApply`
with one hard-coded sub-item, where the design wants projection gated on servitude
progress and applied **retroactively** to an item already worn (D.2). That is the same
abstraction #45 wants, so it belongs in the router rather than beside it.

**[决定] The escape valve is that facets are code-side, with one deliberate exception.**
Per-dimension configuration that is *not* a number — which group and subsystem, which
facets, seams, direction, precedence — belongs in a **code-side descriptor registry**,
keyed by `DimensionId`, so a new dimension is a code change with an empty-save default.
**The exception is `config` (§3.1.1), which *is* persisted** on the designer's call —
semantic extra fields, likely to be wanted, and cheap while the migration chain exists.
The save still carries no per-dimension *type*.

**[决定] Do this now, not later.** This is the one structural change in the brief that
is expensive to postpone: after release, widening the persisted shape is a save
migration. **[提议]** the window to change it cheaply is *before anyone else has a
save*. **[既有] The migration chain (§2.10, A3) lowers this cost but does not remove it** —
a migration is written once per breaking version and must be maintained forever.

**[既有] The first real customer is already queued.** Issue #40 ("nothing selects a visor
to equip") and #45 ("extendable socketed item selection") are both the routing layer
under different names. `RequireSubItemEvent` (`MachinePrime/Item/Gag.ts:152-194`) is the
working one-case version of it: an item names a socket and a sub-item, with one
hard-coded sub-item and no selection.

**[提议] Build it so it can be driven from the console.** `Coordinator.GetState` and
`SetStateIn` already exist and are property-tested, so a router can be exercised before
any UI exists — which is how the sensory limiters were built, and it worked.

### 3.6 The one exception in Family 5: arousal

**[决定] `blocks arousal` should be dynamically adjustable**, because the designer's
interest is specifically there and a dynamic switch is what makes narrative and gameplay
possible: a transformed item's shield opens, the Host temporarily grants the doll control
of its own toys, and so on. This is the **only** Family 5 field that must move at runtime.

**[既有] The investigation result: there are two separate mechanisms, and the useful one
is not the one named `chastity`.**

| Mechanism | Site | Dynamic? |
| --- | --- | --- |
| `restraint.chastity` / `.chastitybra` as **flags** | read inline by `KinkyDungeonIsChaste` (`player/KinkyDungeonStats.ts:2538-2542`) and `KinkyDungeonChastityMult` (`:2544-2551`) | **no** — no event seam, same class of problem as `immobile` (§A.9) |
| **`ChastityLower` / `ChastityUpper` player tags** | set from those flags during `KinkyDungeonUpdateRestraints` (`restraint/KinkyDungeonRestraints.ts:4229-4232`, also `:4343`, `:4481`); read by `KDGetPotentialBlockingRestraints` (`KDRestraintUtility.ts:19`, `:27`) and `KinkyDungeonIsArmsBoundFast`-adjacent checks (`KinkyDungeonRestraints.ts:1587-1588`) | **yes** |

**[既有] Why the tag route works, precisely.** `KinkyDungeonUpdateRestraints` builds the
tag map, **sets the `Chastity*` tags from restraint flags**, and *then* dispatches
`updatePlayerTags` (`:4304`) — which Boids already hooks with its own `AddTags` event
(`CommonEvent/Inventory.ts:36-57`). So a Boids handler runs **after** the game has set the
tag and can set it too. And the tag is consumed by pure `PlayerTags.get(...)` lookups with
**no event seam to block**, which is exactly why it is the movable one.

> **[既有] Two limitations, stated rather than glossed.**
>
> 1. **It is an add, not a withdrawal.** `AddTags` writes tags in; nothing in Boids
>    currently *removes* one the game has already set. So "the Host denies access" is
>    achievable in one line, while "the Host grants access the item would otherwise
>    deny" needs the tag to be cleared — which means either writing into `data.tags`
>    (the handler receives the map, so this is possible) or accepting that the base-game
>    flags win. **The two directions cost differently, and the deny direction is the
>    cheap one.**
> 2. **`KinkyDungeonIsChaste` and `KinkyDungeonChastityMult` are not movable at all.**
>    They read the restraint flags directly, so any mechanic that routes through *them*
>    — rather than through the blocking tags — stays bound to the item definition. That
>    is an upstream ask if a design needs it, of the same shape as §A.9's `calcGag` ask.
>
> **[提议] Consequence for the design:** the dynamic arousal gate should be expressed as
> **"the Host may deny access"** rather than "the Host may grant it", because that is the
> direction the existing seam supports. A temporary *reward* is then built out of the
> toys the Host controls rather than out of lifting the block — which is very close to the
> designer's own example, and cheaper.

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

> **[提议] For the aggregate, §8.1 names a concrete candidate:** a `Compliance` stat
> presented as an **inverted WP bar, drawn right-to-left**, which provides resistance and
> shrinks the WP ceiling as it rises. That is deferred with the rest of §8, but it is a
> usable answer to *this* question without it.

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

> **[决定] "Gone" means *unusable*, not *destroyed* — and the distinction is what makes §6.0
> possible.** The mechanism below is **denial at the action chokepoint**, so the game refuses
> the action rather than deleting anything from the character: **the baseline is never
> modified.** The native ability is still on the character sheet and still costs nothing; it
> is simply not permitted, and the mediated version is the only route back to acting.
>
> **[决定] Therefore the loss is reversible by re-doing the ritual, and this is the mod's
> governing invariant rather than a convenience** (`spec` §11, invariant 12): **baseline
> values live in the Coordinator, never on an item**, so removing an item **releases** an
> override instead of having to restore a value that the removal destroyed. Were the baseline
> stored on the equipment, the same feature would need a restore path — and a restore path
> that can silently fail is exactly what a player-visible "permanent" decision must not
> depend on.

**[既有/待验证] Cost differs sharply by ability kind**, and this is the important
engineering split:
| Ability kind | Implementation | Verdict |
| --- | --- | --- |
| **Spells** | swap the entry in the flat `KinkyDungeonSpells` list, or gate it through `calcComp` / a component whose `check` inspects worn restraints | **cheap** — but **[既有]** every hotbar stores *indices* into `KinkyDungeonSpells` (`base/KinkyDungeon.ts:7233`, `KinkyDungeonSpellChoices: number[]`), so **splicing the array invalidates every stored index.** Mutate the spell object; do not remove it. |
| **Spell components** | a handler on `calcComp` / `beforeCalcComp` that clears or adds `data.failed` | **cheap**, and idiomatic — base-game `Psychokinesis` does exactly this (§2.4) |
| **Weapon use while bound** | a `getWeapon` handler setting `data.flags.HandsFree`, gated on the equipment | **cheap — and already implemented upstream.** See Appendix C.1: `FloatingWeapon` is a working reference, and **three** handlers already widen weapon access this way. |
| **Attacks, movement, and other base capabilities** | **injection**: the game must deny the native ability while un-equipped | **deny is uniform, grant is per-ability** — see the policy below |

**[提议] The mechanism, stated as a policy rather than left open.** Appendix A makes the
choice mechanical instead of aesthetic:

> **The native ability is denied at the action chokepoint (§2.5 / A.5). The mediated
> version is granted at the seam the ability actually has (A.2 / A.4).**

Both halves then follow from the inventory rather than from taste:

- **Denying** is uniform and cheap: wrap `KDInputTypes`, which is a plain mutable record,
  and refuse the commands that constitute the ability. Attack, cast, speak, move — one
  mechanism, 86 named commands to choose from, and the game's own `KDAutoStruggle`
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

**[提议] And the ladder is where §D.4 and this section become one system.** The designer's
evolution chain — *craft a lock → craft reinforcing parts → make it permanent* — is the
same chain as "permanently give up a native ability for points", viewed from the item's
side instead of the character's. **[决定]** they should be designed as one quest line, not
two that happen to interlock.

**[提议] Build the resource first, spend the ritual second.** A new currency that the
mediated abilities consume is the piece that makes "traded away, bought back" legible
to the player. It is also the piece that makes the Host's privileges (§4) concrete.
**[goal post]** the specific currency is not chosen — but **§8.1 is where it will come
from**, and its conversion mechanics are what will make the currency feel earned rather
than granted.

**[提议] Do not build the content before the framework.** The designer's stated
preference is a framework into which privileges and narrative fragments are poured
later. Baleenie agrees, with one caveat: a framework with **no** content cannot be
validated. So the iteration should ship the framework plus **one** complete ritual →
capability → privilege chain, end to end, as the proof it works.

---

## 6. Graduation — `Being Filed`

**[决定] The mechanic's name is `Filed`** — an information-technology borrowing, in the
sense of *archived*, *committed to the record*. The doll is not destroyed and not
promoted; it is **filed**. The name should be used consistently in text keys, and it fits
the versioning scheme of §2.10 better than a ceremonial word would.

**[决定] `Being Filed` is a *family* of final quests, not one scripted sequence.** The
content varies — capture a boss for the Hive, walk a prescribed route across several
floors, and so on — because a single fixed chain would make every filing identical and
cost the moment its ceremony.

**[决定] What is fixed is the entry condition and the sequence, up to the fork.** Everything
between them is free; §6.0 supplies the fork and the two commits beyond it.

### 6.0 Reversibility, and the two exit routes

> **Placed here, numbered `6.0`, because it is the inverse of §6: §6.1–§6.2 describe one
> route through this room, and this section describes the other one plus the reversibility
> that precedes both.** The alternatives were renumbering §7–§11, or folding the exit into
> §5's ladder; the first churns every cross-reference in the brief, and the second buries
> the single most load-bearing rule under a section about equipment. Renumbering is still
> available later if this ever stops being a subsection of the graduation chapter.

**[决定] The governing principle, in the designer's words: *before either point of commit
executes, everything is reversible.***

That is not a courtesy extended to the player. It is what makes the room's choice a choice
rather than a trap, and it is the mechanical form of the mod's whole subject — **voluntary
descent is only voluntary while leaving is still possible.**

#### The two curse kinds

**[决定] There are two curse kinds, and they are *not* the two instances §6.2 already
distinguished.** The earlier pair (equipment permanence vs. the furniture's seal) were both
*permanent*. This pair is a division of **labour**:

| | **Kind 1 — the equipment's "permanent" curse** | **Kind 2 — the commit curse** |
| --- | --- | --- |
| **where it exists** | on the character's equipment, for the whole progression | **only inside the final room's commit** |
| **what it means** | *"the equipment's lock tier is finished"* | *"the character is filed"* |
| **when it lifts** | **liftable, but only in the final room** — the room is the key | **never** — no `condition`, no lift |
| **the player's experience** | the struggle that opens the final act | the moment of no return |
| **also locks** | the item it is on | the item **and the `furniture`'s own restraint** |

**[既有] The `condition` mechanism carries the first kind exactly as designed.** §D.3.2
verified that `KDGetEscapeChance` (`KinkyDungeonRestraints.ts:2250-2252`) sets
`escapeChance = -100` whenever `KDGetCurse(restraint)` is truthy, **on its second line,
before the lock is even consulted** — so a curse is a hard gate across every struggle type,
and the `condition` on `KDCursedDef` (`base/KDTypeDefs.ts:3929-3970`) is the only way out.

> **[决定] The first kind's `condition` is *never satisfiable*, until the final act — and
> then the room itself is the key.** This is the "permanent" that §6.9 asserts, expressed in
> the mechanism the game actually has: the curse's condition cannot be met anywhere in the
> world, so the curse is not liftable anywhere in the world. Inside the room, the condition
> becomes true, the curse becomes liftable, and the player works through them one at a time.

**[决定] The first kind is lifted with a button, and the struggle is somewhere else.** This
separation is the designer's, and it is deliberate:

> **Lifting the curse is ceremony — no test, no cost, no roll. Removing the equipment is the
> struggle — the hardest passage in the mod.**

Why the two must not be merged: *"lift the curse, then fit a decorative lock"* has to be a
**pure ritual action** with nothing in its way. **A curse that had to be broken would put a
fight in front of a ceremony** — and worse, it would make the ceremony's re-enactment a second
trial, so the player would be fighting the ritual instead of performing it.

**[既有] But in the base game a curse-lift also *takes the item off*, so kind 1 must override
that — and the override is one return value.** The chain is
`KDSendInput("curseUnlock")` (`base/KinkyDungeonInput.ts:155-157`) → `KinkyDungeonCurseUnlock`
(`item/KDCurse.ts:1049`), which sets `keep = true` (`:1051`), clears `restraint.curse` and the
variant's curse (`:1064-1067`), calls `KDCurses[Curse].remove(...)` (`:1071`) and then — if the
result is **not** `false` — calls `KinkyDungeonRemoveRestraintSpecific(restraint, keep, …)`
(`:1087`). With `keep = true` that strips the restraint and turns it into a loose inventory
item (`restraint/KinkyDungeonRestraints.ts:6065-6099`).

> **Left alone, lifting the curse would remove the equipment — and the struggle would have
> nothing to do.** So **[决定] kind 1's `remove` hook returns `false`**: the curse is cleared
> and the equipment **stays worn.** That is the whole override, and the designer confirms it
> is cheap. **[既有]** `KDCursedDef.remove` is
> `(item, host, specialMethod, index?) => boolean | void`, documented as *"Can return a
> boolean. True means the item is removed, if unlocked"* (`base/KDTypeDefs.ts:3965-3966`).
>
> **[决定] The state after the lift is the point of the whole mechanic:** worn, uncursed, and
> still on the body. The item is now removable **only by the game's ordinary struggle path** —
> which is the peak. And it *is* removable, because invariant 13 forbids a refusal.

**[既有] Curse and lock are mutually exclusive in the base game, so the ritual is two actions,
not one.** The designer's correction, verified in three places:

| Evidence | Where |
| --- | --- |
| `KDLockableRestraints` **excludes locked items** | `restraint/KinkyDungeonRestraints.ts:1264-1267` — `if ((!item.lock \|\| …) && !KDGetCurse(item) && …)` |
| applying a curse and applying a lock are **disjoint branches**, each requiring the other to be absent | `:5016-5018`, `:5192-5194` |

So **a decorative lock cannot be fitted to a locked or cursed item** — the order is
*lift → lock*, per item, and route 2's condition can only be assembled that way.

> **[既有] And a curse is a single value per item, not a set.** `KDGetCurse` returns
> `item?.curse || KDRestraint(item)?.curse` (`:768-770`). Two kinds are therefore
> **alternatives at one slot**, never simultaneous on the same item — which is exactly what
> §6.9's two kinds are.

**[决定] And the difficulty is supplied by the Controller, not by the curse.** While any
controlled item is worn, **the Controller sets that item's dimension to its maximum
suppression and prohibition.** Nothing else resists the removal:

| When | The Controller's value | Effect |
| --- | --- | --- |
| any controlled item is worn | **the highest value that still leaves removal possible** | the game's own escape and struggle calculations run at their worst case, so taking the gear **off** is real work — while putting it **on** is always permitted, which is what makes the fallback below work |
| **the last controlled item covering a controller facet leaves the body** | that facet drops to its **`Free` value** — `Rate.target = 0`, `Gate.Intent = Free` | **the facet is freed**, so items may be taken on and off at will |

> **[决定] There is no "body region" in the mechanism, and that is deliberate.** The
> designer's clarification: the rule is *"when the last restraint covering a controller facet
> leaves the body, dial that facet to its Free value"* — **per dimension, not per body part.**
> "Removing an arm restraint frees the arm" is a **consequence**, not a rule: those dimensions
> simply have no provider left, because the group's capability is computed from what is worn
> (§6.5, §6.12). **No anatomical grouping, and no per-region bookkeeping.**

> **[决定] "Maximum" means *hard*, not *closed*.** §6.0's opening principle forbids a refusal
> outside the two commits, so the ceiling is the highest suppression that still leaves the
> escape route legible. **A ceiling that zeroed the escape chance would be a wall, not a
> peak** — and the wall would be a bug, not a difficulty setting.

> **[决定] The Free state is the mechanism, not a mercy.** Because it is per facet, the act
> stays legible: **the thing you took off is the thing that comes back.** And it is what makes
> the struggle and the free phase the same system rather than two — *the Host giving a doll
> control back* is a state change, not a scripted beat.

> **[决定] There is no invented curve to design.** The base game's own escape, struggle and
> destruction calculations supply the difficulty; the Controller's ceiling is the only dial.
> **The work is calibration, not construction** — the peak must be hard enough to be the
> mod's hardest moment and still winnable.

> **[既有] And the failure of that struggle is a fork, not a dead end.** Route 2 asks only for
> **decorative locks on every worn item**, and because the lift is frictionless and **leaves
> the item worn** (below), a player who cannot break free can still turn the state they are
> already in into route 2's condition — **lift, fit, repeat** — then walk to the `furniture`
> and commit. This is why the peak can be tuned hard without violating §6.0's opening
> principle: **losing the fight resolves into the ending rather than into a stall.**

**[决定] The second kind is not a struggle and has no individual removal step.** It is
applied to **every** worn item *and* the `furniture` in **one atomic replacement** at the
point of commit (§6.2). There is no intermediate state in which some items are sealed and
others are not — a partial seal would not be permanent, and would be a hole rather than a
design.

**[既有] And the `furniture` is a restraint, which is what gives kind 2 something to attach
to.** The designer's correction, verified: the base game's **`furniture` is a map doodle** —
`KDFurnitureDef` (`restraint/KinkyDungeonFurniture.ts:4-16`) carries `restraintTag`,
`restraintSetTags`, `lockType`, a `sprite` and a `tickFunction`, and **has no `curse`
field.** *Binding* furniture is implemented as **a wearable restraint** in the
**`ItemDevices`** group, resolved by tag and applied like any other restraint.

> **[决定] So the chain is `furniture` (map definition) → restraint (applied, worn) → curse
> (kind 2)** — and **the curse goes on the restraint**, not on the tile. **[既有]** The
> verified route: a tile names a restraint by `restraintTag`
> (`KinkyDungeonFurniture.ts:22, 92, 230, …`), the tag is resolved by
> `KinkyDungeonGetRestraint({tags: [furn.restraintTag]}, …)`
> (`prison/KinkyDungeonJail.ts:2740-2748`), the result lands in **`ItemDevices`**
> (`restraint/KinkyDungeonRestraintsList.ts`, 42 entries), and the furniture's optional
> `lockType` is passed straight through as the lock (`map/KinkyDungeonSetpiece.ts:935`).
>
> **[决定] And because that restraint is an ordinary worn item, kind 2 needs no special
> case for it.** It is one more item in the set the atomic replacement covers. The
> `ItemDevices` group's own semantics are what make being in it a commitment; the curse is
> what makes it permanent; **and any "she cannot be extracted" constraint is the room's
> business, not a second mechanism.**

#### No mechanism does this to the player

> **[决定] The most important property of the final act: from the leash to the seal, nothing
> acts on the character that is not her own equipment.**
>
> The equipment is hers. The decorative locks are hers. **She is the one who applies them.**
> The author supplies the room and the `furniture`; **the only way to stay is to do it by
> hand.** There is no captor to blame and no machine to fight — which is precisely what
> "voluntary descent" has to mean if it is to mean anything at all.

This is why the two kinds must not be swapped or merged. Kind 1 is a **seal the player
applied herself** in §D.4's ladder, and its terror is that **nothing in the world can open it
again** — the only key is a room she cannot walk to. Kind 2 is a **decision**, and nobody but
the player can press it. **Both are hers**, and that is the whole point.

#### The sequence

**[决定] The leash, then the lift, then the struggle, then the free phase, then the fork.**
In order:

| # | Step | Reversible? |
| --- | --- | --- |
| 1 | **Enter by the leash.** The entry is a leash staging, and **the room has no entrance on the world map** — the character cannot walk back to it. | — |
| 2 | **The character reaches the marked position, the leash ends, control returns to the player.** | — |
| 3 | **The character lifts the kind-1 curse, one item at a time.** A button; no test, no cost, no roll — and it **takes nothing off** (below). | yes |
| 4 | **The struggle:** with the curses gone, the equipment itself must be removed, against the Controller's ceiling. **This is the peak.** | yes |
| 5 | **The free phase — the Free state is in force.** Anything may be done in any order: equipment on or off, decorative locks added or removed. **Both routes remain open through all of it.** | yes |
| 6 | **The fork.** Interacting with the door, or with the `furniture`, is the only thing that is not reversible. | **no** |

> **[决定] The free phase is genuinely free, and that is what §6.0's opening principle
> buys.** During step 5 the player may open the box, take equipment back out, and put it on
> again. *"I have changed my mind"* is inside the permitted set, right up to the instant of
> interaction. **The only thing that is irreversible is interacting.**

#### Route 1 — leave

**[决定] Entry condition:** no **controlled** equipment on the body **and** none carried.
Gear the controller does not register — base-game items, anything not part of Boids —
**does not count**, in either direction.

**[决定] Point of commit:** interacting with the **door**.

**[决定] Consequences:** the progression is cleared and **every controlled item is
destroyed.** Nothing of the equipment survives — so the second kind is never left behind on
anything, and there is no route out of the room that carries a permanent curse into the
world.

**[既有] The reset is what makes the destruction literal.** §6.0's room does not persist:
even if the room object survives technically, it resets on exit, so the discarded equipment
does not survive either. **[决定] Semantically "cleared" means: the Host deletes the
character's dossier.** Per §2.6 and §8.2 the Coordinator's state is **not stored on the
equipment** — it is one file the Host keeps *about* the character. Clearing the progression
is therefore **deleting that file**, not unwinding a set of fields. **The character leaves
with her body and her knowledge; what she loses is that the Host ever acknowledged her — not
a capacity.** And **the §5 surrender needs no record to survive this, because it never was
one**: *"permanently gives up a native ability"* means **the equipment is sealed by a kind-1
curse, and while it is sealed the ability is denied at the chokepoint** — **the seal *is* the
surrender** (`spec` §8.1). The curse goes with the equipment, the equipment is destroyed, and
the ability was never deleted in the first place. **So the ritual is simply something the
player may perform again**, which is why the repeat-entry criterion treats it as a key rather
than a purchase.

> **[既有] The base game's manual save does not reopen this.** Saves are automatic on exit;
> manual saving exists but is not legitimate play. **[决定] A save taken mid-ritual is not a
> way to fork the ending.** This is the designer's reading and it is the one that ships: the
> character's state is *fixed*, not *paused* — the player stops observing her, and however
> long passes before the next observation, she is in the same condition.

#### Route 2 — descend

**[决定] Entry condition: identical to `Being Filed`'s unlock conditions (§6.1), with one
substitution** — the requirement *"every controlled item is permanently locked with a
kind-1 curse"* is replaced by ***"every controlled item carries a decorative lock."***

> **[决定] A decorative lock is a lock in appearance and nothing in substance.** It shows a
> lock icon, it can be applied and removed freely, and **it is not kind 1 and not kind 2.**
> Its only role is to make *"one at a time"* an experience the player performs — attaching
> them one by one, and later watching them all become real at once.

**[既有] And it costs no new item, because the base game already has a self-lock feature to
intercept.** The designer's route: the game's own self-lock is the player-cast **`Lockdown`**
spell (`magic/KinkyDungeonMagicCode.ts:651-681`), which collects `KDLockableRestraints()`
(`restraint/KinkyDungeonRestraints.ts:1258-1273`) and calls `KinkyDungeonLock(item, "Purple")`
on each. Three verified facts make it the right seam, and the third is why interception is
**required** rather than merely convenient:

| Fact | Where | Why it matters |
| --- | --- | --- |
| the handler table is a **plain mutable record** | `magic/KinkyDungeonMagicCode.ts:19` — `let KinkyDungeonSpellSpecials: Record<string, KDSpellSpecialCode>` | the handler may be **wrapped or replaced outright**, so Boids' own logic runs while the room is active |
| the **lock type is a parameter**, not baked into the restraint | `restraint/KinkyDungeonRestraints.ts:709-717` — `KinkyDungeonLock` sets `item.lock = lock`, and `KDLocks[lock].doLock` is **optional** | a Boids-registered `"Decorative"` entry in `KDLocks` is a complete lock with **no restraint behaviour** |
| the base handler **refuses when every item is cursed** | `:1264-1267` — `KDLockableRestraints` skips any item where `KDGetCurse(item)` is truthy | in this room **every** controlled item carries a kind-1 curse at entry, so the base implementation finds nothing and returns `"Fail"` |

> **[决定] So the interaction is the same element, re-labelled:** inside the room, on a
> controlled item, **the icon and the text are the decorative lock's**, and the trigger
> applies a decorative lock instead. Outside the room it behaves as it always did. **No new
> UI, no new item, and no inventory of locks** — which also disposes of the question of where
> the locks come from.
>
> **[既有] Two mechanical conditions**, both read from base-game code rather than chosen:
>
> 1. **The restraint must be *lockable*** — `KinkyDungeonIsLockable`
>    (`restraint/KinkyDungeonRestraints.ts:697-700`) requires the template to declare
>    `escapeChance.Pick` or `escapeChance.Unlock`. **A controlled item declaring neither
>    cannot receive a decorative lock at all**, so every piece in the set must be able to.
> 2. **It must not defeat removal** — the decorative lock exists to be applied and lifted
>    freely, and if it gated escape, route 1 would be unreachable for a bookkeeping reason.

**[决定] Point of commit:** interacting with the `furniture`. In **one atomic replacement**,
**every decorative lock on every worn item, and the `furniture`'s own restraint, become
kind-2 curses.** The whole worn set is sealed at once, and the character is filed.

| | Route 1 — leave | Route 2 — descend |
| --- | --- | --- |
| **what the player does** | takes everything off, puts it in the box | puts everything back on and locks it |
| **the shape of it** | **subtraction** | **addition** |
| **the last act** | interacting with the door | interacting with the `furniture` |
| **outcome** | the dossier is deleted; the items are destroyed | archived; the character is effectively dead (§6.2) |

> **[决定] Both routes require the lift and the struggle, and this is the section's sharpest
> consequence.** The kind-1 curse keeps the equipment *on* until it is lifted, and the door
> will not open while anything controlled is worn — **so there is no way out of the room that
> does not pass through being overmastered and breaking free.** Leaving is not an escape hatch
> from the performance. **It is the performance, followed to the end, and then declined.**

#### The room, and the box

**[既有] The entry is a leash staging, and the room is not on the world map.** The character
is escorted in; leaving teleports her back to the world map — **at the stairs, the entry
point** — rather than back the way she came. There is no route to walk back, and no route to
walk out except the two commits.

**[决定] Even if the room persists technically, it resets on exit.** Named as a fallback so
that the design's intent does not depend on whether the implementation actually destroys
anything: *not returnable* is the promise, and the reset is what keeps a persistent room
from contradicting it.

> **[既有] The box is `[提议]`, and it exists to give the discard a destination** — the route-1
> condition names "carried" explicitly, so the equipment has to *go* somewhere. **[既有] The
> check itself is written against the body and the registry, not against containers** —
> *"no controlled equipment worn or carried"* is evaluated from the controller's
> authoritative set, so it does not enumerate containers and cannot be defeated by stashing
> gear somewhere the check forgot to look.

**[既有] The player may open the box and take equipment back out.** Confirmed by the
designer: everything before the commits is reversible, so the box is a container, not a
one-way disposal.

#### Replaying

**[既有] Leaving resets the equipment as well as the progression.** The items are real game
objects and the room resets, so **the discard destroys them.** The consequence, which the
designer names as a *benefit* rather than a cost:

> **[决定] A second attempt starts from nothing — a different combination of equipment is
> available, and the player is genuinely starting over.**

**[决定] Repetition is reduced by making some quests skippable on re-entry.** The designer's
examples — upgrade materials must be gathered again, but blueprints need not be found twice;
the Host resets the doll's progression but does not delete the doll's key, so key-acquisition
quests need not be redone. **[提议] One criterion covers all of them:**

> **A quest may be skipped on a later entry when what it produces is *knowledge* or a *key*
> — something the Host remembers. A quest that produces a *physical* thing must be redone.**

**[决定] And the design already has somewhere to keep that memory: the Coordinator's state has
two parts, and route 1 clears only one.** This is the piece that makes the criterion
implementable rather than aspirational:

| Part | Holds | Route 1 |
| --- | --- | --- |
| **the dossier** | the equipment configuration — what the Host demands of her on this attempt | **cleared** |
| **quest metadata** | what the **allocator** reads: knowledge and keys — blueprints, obtained keys, completion records | **kept** |

**So the skip criterion is not a special case bolted onto the allocator.** The allocator
already has the memory that says *"this one has been done"*, and the equipment side is what
gets wiped. **A second attempt is faster because the Host never forgot** — and the three
records stay distinct: the **dossier** is the Host's relation to *this attempt*, **quest
metadata** is *what the Host knows*, and the base game's **Training** is *what her body has
learned*.

This is a rule rather than a list, so it can be applied to quests that do not exist yet
(§6.4's framework). It also falls out of §6.0's own structure: the Host deleting the doll's
*dossier* is not the Host forgetting its own *keys* — the two live in different layers, which
is §8.2's decoupling doing useful work a second time.

> **[待定] One thing this section does not settle: how hard the peak should be.** The
> *mechanism* is decided — the base game's own struggle system, driven by the Controller's
> maximum — so there is no formula to design and no curve to invent. What is open is
> **calibration**, and it is done against the finished room rather than in the abstract. The
> safety valve above is what makes it safe to tune hard: **a player who loses the struggle can
> still commit.**

### 6.1 Entry conditions — all must hold

> **[决定] Read with §6.0, which states the constraint these conditions live under:**
> progression may make leaving **harder**, never impossible, and the entry conditions are a
> gate on *entering the final act*, not a gate on leaving it.

**[决定] The quest unlocks only when all of these are true.**

1. **Capability coverage.** For the gate/capability class, the *required* set must be a
   **subset** of what the character's worn equipment group offers:

   ```
   RequiredCapabilities ⊆ WornEquipmentCapabilities
   ```

   The equipment must **cover** the requirement — not merely intersect it. *(Spelled out
   because the original note mixed prose and set notation, and the difference between
   covering and intersecting is the whole condition.)*

2. **Suppression thresholds.** For each suppression-class capability, the character's
   equipment group value must be **at least** the prescribed threshold:

   ```
   ∀ d ∈ SuppressionDimensions:  EquipmentValue(d) ≥ RequiredThreshold(d)
   ```

3. **The equipment is finished.** Every controlled item the character wears has been
   upgraded to its strongest form **and locked with a kind-1 curse** (§D.4's final stage,
   §6.0).

> **[决定] And the two upgrade axes are bound differently**, which is a design note added
> while writing this down:
>
> | Axis | Bound to |
> | --- | --- |
> | **restraint strength** (suppression) | **bound** to the **ability/substitution** upgrade — they advance together |
> | **the lock** | **not bound** — lock tier advances on its own track |
>
> **[决定] Because capability can be decoupled from the restraints that carry it, these
> conditions are evaluated at the controller layer, not by inspecting items.** That is what
> makes condition 3 meaningful: it asks the controller what it believes about the character,
> not what a specific item's fields happen to say.
>
> **[决定] Condition 3 is what §6.0's route 2 relaxes.** The final act is the same chain over
> again — the whole set worn, and every piece locked — except that the locks are **decorative**
> and the seal is applied by the commit. **This is the point at which progression stops being
> a difficulty increase and becomes the choice**, and it is why the entry conditions are
> written as a controller-level test rather than an item inspection.

### 6.2 The ending — fixed

**[决定] The ending is one sequence up to a fork, and the fork has two ends.** The first
half is shared by the whole family; the second half is chosen in the room (§6.0):

1. A **staging performance modelled on the base game's own `leash to prison`** — the
   character is escorted rather than simply teleported, so the moment is *witnessed*.
2. Transport to a **small map shaped like a warehouse**.
3. Ritual beats on that map — **§6.0's shared passage**: the character **lifts** the
   equipment's kind-1 curses one at a time, then **fights free of the equipment itself**
   against the Controller's maximum, then reaches the **free phase**.
4. **The fork.** Leaving the room is a commit (§6.0, route 1); so is what follows.
5. **Route 2 only, and its terminus:** the character is **sealed into a `furniture`** — a
   restraint in the `ItemDevices` group, applied by the furniture tile — and **that
   restraint is locked by a kind-2 curse** (§D.3 — a curse, not a lock, because a lock can be
   destroyed and a curse cannot).

> **[决定] The two curse *kinds* of §6.0 are what the game's registry must carry**, and they
> are separate registry entries. **[既有] The mechanism supports this directly:** a curse is
> an entry in the `KDCurses` registry with its own `condition`, `events`, `customIcon_*`,
> `altIcon`, `unlockText`, `powerMult` and `powerBoost` (`base/KDTypeDefs.ts:3929-3970`), so
> two kinds are two entries with no shared state. **A shared `condition` is the one thing to
> avoid by accident** — if both end up `() => false`, the game cannot tell them apart and the
> flavour text has nowhere to attach.
>
> | Curse kind | `condition` | Where it can be lifted |
> | --- | --- | --- |
> | **kind 1** — equipment permanence (§D.4's final stage) | unsatisfiable everywhere **except** the final room | **only in the final room** (§6.0) |
> | **kind 2** — the commit (§6.0's both-ends seal) | none | **never** |

**[决定] At the end of route 2, the file is complete, and the character is effectively
dead.** Barring future content expansion — a "the doll is selected and taken out of storage"
mechanic — the character has **no effective action left**: waiting and futile struggling
only. The player's only move is to save and start a new character.

> **[决定] "Dead" is a fixed state, not a stopped game — and this is deliberate.** The
> designer's reading, and it is the one that ships: **the character's time does not stop and
> does not rewind — the player merely stops observing her.** Loading her later returns the
> same character in the same condition, because *her state has been made constant: however
> long passes before the next observation, she is unchanged.* **[既有] That is also true
> mechanically** — the game saves on exit, manual saving is not legitimate play, and a save
> taken in the filed state loads back into the same permanent cage. There is no fork to
> exploit and nothing to rewind. **The "dead save" is the artistic expression of being
> archived and put away**, and it is why §6.0 can assert an irreversible ending without
> having to delete anything.

> **[决定] Because "no effective action" is not the same as "no possible action", two
> global sync hooks are added.** A player can still press things that do nothing useful but
> do move state — spending skill points is the named example. So:
>
> | Hook | Fires | Does |
> | --- | --- | --- |
> | **save** | once per save | if the character is in the `filed` state, run a **character export** |
> | **load** | once per load | ditto |
>
> The export is what makes the archive trustworthy: it is taken at a moment when the
> character's state is unambiguous, rather than reconstructed later from a save that may
> have had further no-op writes applied.

**[决定] The artifact persists in `localStorage`** — a cross-save archive a new character
can read. Rationale: §2.6, that is exactly the layer the base game uses for
cross-character unlocks, and it is invisible to `KDResetData`.

**[既有] The base game has no graduation, ascension, retirement or permadeath mechanic.**
Searched for all of those names; the nearest things are `KinkyDungeonNewGamePlus` (§2.6)
and the Collection / "Summit" persistent-NPC roster.

**[既有] And Collection / Summit are *not* a graduation mechanic.** Confirmed by the
designer: they belong to the game's **dom playstyle**. Collection is where captured NPCs
are kept; Summit is a fairly primitive home-base system. There is no graduation-shaped
thing to reuse, only implementation *patterns* to borrow:

| Borrow | For |
| --- | --- |
| the Collection loop: capture requires beating a strong NPC, and the capture is permanent | **a repeatable quest**: "collect NPCs for the Host" — self-refreshing content with an existing mechanical idiom, giving the faction a reason to keep playing after the main line |
| the Summit pattern: a player-owned space with rooms and contents | **a faction-specific home base** — the room and workshop the Host assigns to the character |

The second matters more than it looks: §5 wants a framework content is poured into later,
and a physical space is the cheapest place to put content that does not need a quest to
gate it.

### 6.3 The Host, and its appellations

**[决定] The Host's design, in the designer's words:** a **distributed super-consciousness
that runs above the consciousness of all machinery and all dolls.** It has no centre in
the fiction.

**[决定] And the defining property is a network boundary.**

| Observer | Can perceive the Host? | How |
| --- | --- | --- |
| **inside the network** — dolls, machinery | **yes** | the designer's term is **"spiritual sensing" (圣灵感应)** |
| **outside the network** — everyone else | **no, never directly** | only by **observing the behaviour of network members** and inferring that something is running them |

> **[决定] This is not a deity, and the distinction is load-bearing.** The Host is not a
> god in the artistic sense; the "spiritual sensing" is simply **what the perception of a
> distributed structure feels like from inside it**. Writing it as a god would be a
> different design — it would place the Host *above* the network rather than *in* it, and
> would make it directly addressable, which is exactly what the boundary forbids.

**[既有] That boundary roughly lines up with something the brief already found:**
`Hypno_Doll` and the hypnosis buffs are player-facing states that a doll-coded actor
reacts to (`§2.8`), and the `updatePlayerTags` seam is a per-character channel. So
"inside the network" already has a mechanical shadow — it is not a purely narrative idea
that needs new machinery.

**[决定] In presentation the Host has no speech at all.** The model is *Battlefleet Gothic:
Armada II*'s treatment of the Great Devourer: characterised **entirely through how third
parties react to it**. What a character perceives of it directly is **non-verbal UI
feedback only** — a reinforcement cue, not a message. Everything else arrives **retold by
a third party**: a quest briefing comes from *another doll* NPC conveying "the Host's
intent", never from the Host to the character.

**[既有] That leans on machinery the brief already found.** §2.8's hypnosis suggestion
buttons are non-verbal, click-to-accept UI; the `updatePlayerTags` and `draw` seams are
always-on reinforcement channels. Nothing new is needed for the direct-perception layer —
**only discipline about not writing dialogue for it.**

**[决定] Minimise direct appellations, and prefer passive and third-party constructions.**
**The fewer direct references to the Host a text contains, the more distance it has.** So
several of the slots below should be **designed out** rather than named: a quest briefing
says *"you have been assigned"*, not *"⟨X⟩ assigns you"*; a `filed` doll is *"filed"*, and
the agent is implied. **[提议]** treat each slot as guilty until proven useful — a slot
that can be avoided by a passive construction should be.

**[决定] Inside the network, the Host is not referred to — it is spoken *as*.** Because
the Host is the collective super-consciousness, **no otherness exists** between it and a
doll: a doll is not *pointing at* the Host, a doll **is part of** the Host. So the honest
grammatical form inside the network is the **first-person plural — "we"** — and naming it
would be a category error, not merely a stylistic choice.

> **[决定] This removes four of the six slots that survived the passive-voice rule**, and it
> removes them for a better reason than brevity: *the dolls, a doll addressing an outsider,
> the `Being Filed` ceremony, and the HUD* are **all inside-network contexts**. They
> therefore take "we", and there is no constant to author.
>
> *(Count the drafts carefully: the original list had **eight**; the passive-voice rule cut
> it to **six**; this decision cuts it to **two**. An earlier draft of this section said
> "four of the eight", which conflated the two cuts.)*
>
> | Context | Was | Now |
> | --- | --- | --- |
> | the dolls, to each other | `HostName_Doll` | **"we"** — no constant |
> | a doll addressing an outsider | `HostName_DollToOutsider` | **"we"** — no constant |
> | the `Being Filed` ceremony | `HostName_Ritual` | **"we"** — no constant |
> | HUD / status text | `HostName_UI` | **"we"** — no constant |

**[决定] What survives is exactly the outside view**, and it is the only place a name can
honestly live — because an outsider **cannot** perceive the Host, only infer it from the
behaviour of network members:

| # | Constant key | Who is speaking | Why a name is unavoidable |
| --- | --- | --- | --- |
| 1 | `HostName_FactionHostile` | hostile factions | they are **outside**, so they must name the thing they have inferred — and they will name it badly, because they cannot see it |
| 2 | `HostName_FactionTechnical` | factions that study or trade with it | same inference, analytic register |

**[决定] Two constants, not eight — and the second is optional.** If the technical register
reads as a duplicate of the hostile one in practice, it collapses to a single constant and
the design is no poorer. **[提议]** start with one and split only if the writing demands it.

> **[提议] And the spread now carries *more* weight, not less.** With the inside using
> "we", **every name in the game belongs to an outsider looking in** — so the vocabulary's
> whole job is to sound like something coined by people who cannot see what they are
> naming. That is a sharper brief than "an intimate term and a hostile term", and it makes
> the register question easier: the words should be **descriptive and slightly wrong**,
> rather than devotional.

> **[既有] One localisation caveat worth recording now.** "We" as a self-reference for a
> collective is **not the same word in every language** — the inclusive/exclusive first
> person plural distinction exists in some, and the game ships translation files
> (`kd-structured/KinkyDungeon/.github/CONTRIBUTING.md`). If the Host's voice is "we", that
> choice has to survive translation, which means the strings should make the collective
> reading explicit rather than relying on English's ambiguity.

### 6.4 The equipment-upgrade quest framework

**[决定] Build a free, extensible framework before writing quests.** The shape:

1. **Upgrades are classified by function**, and each class gets **several mini quests**,
   recorded as a **table**.
2. **A quest coordinator assigns from that table by matching the equipment's tags** — and
   it is deliberately *randomised* within the eligible set, so the same upgrade does not
   produce the same errand twice.
3. **[决定] The quest coordinator is built *with* the controller/coordinator, not beside
   it.** They read the same state (which dimension, which stage) and a second registry
   would duplicate that knowledge.

> **[提议] Why the table-and-tags shape is the right one here.** §D.4 warns that the ladder
> must not become tedious, and a table of interchangeable errands per upgrade class is what
> makes that a *content* problem rather than a *design* problem: tedium is fought by
> authoring more variety into one row, not by restructuring the ladder. It also means the
> framework can ship with two quests per class and grow without touching code.

**[goal post] The recording half.** "Record the player's operating habits and freeze them
into a behaviour tree or a small neural net, so a template doll can be pasted at the level
of *behaviour*" is recorded here and **explicitly not in this iteration.**

**[提议] And a cheaper version should be considered before it.** The fantasy that matters —
a new character inherits a template, is progressively rebuilt toward it, and that
constitutes an additional progression axis — does not require learning anything. A
hand-authored template plus the §5 ritual chain delivers most of it. The learning version
is a research project wearing a game feature's clothes, and it should be judged on its own
merits later.

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
- **Cleaning up the morphing routes.** **[既有]** §D.2 measures three routes and finds two
  of them hacky: route 1 mints a **random variant name** on every morph (undoing §2.10's
  scheme) and its fallback branch briefly **unbinds the player**; route 2 can only reach
  rendering. **[决定]** the designer is explicitly open to replacing or optimising these,
  so this is a standing invitation rather than a decision. The target is one projection
  layer (§D.4), and the variants it mints should be **derived ids**, not random ones.
- **Custom locks and curses.** **[既有]** Boids has registered **none** (issue **#27**),
  while `KDLocks` / `KDCurses` are a fully injectable, save-persistent, narratively loaded
  gate (§D.3.3) — per-method removal rules, a key, a break chance, entity unlock paths for
  the Host, spawn weights, and a bespoke `specialActions` modal. **[提议]** on the evidence
  this is the largest unexploited surface in the brief.
- **`Stats Control`, the whole subsystem.** **[决定]** Scoped in §3.1, **deferred until the
  resource system exists** (§8), because the multipliers and rates it owns *are* resource
  arithmetic and designing them before §8 would design them twice. The dimensions are
  declared in the data model now (§3.2) and left unused.
- **The base-game patches, as a separate optional mod.** **[决定]** Base-game changes are
  permitted but must ship as **standalone patches that Boids consumes as *optional*
  plugins** — never as a dependency (Q8, §9.3). Three asks are on the list: a
  `calcGag`-style event so speech becomes grantable (A.9, issue #44), a weapon-side `lock`
  (C.2), and dynamic chastity beyond the `Chastity*` blocking tags (§3.6). **[决定] Each
  must also have a working non-patched path**, so Boids degrades rather than breaks when the
  patch is absent.

**[goal post] Other factions:**

- **The charm / hypnosis / marionette faction.** **[既有]** the original author has
  already built part of this — `DollShoppe`, `DollStorage`, `Dollmaker` content,
  the `Doll` start perk, `DollMirrorCurse`, the `Hypno_Doll` stat. It shares §2.8's
  machinery with MachinePrime.

**[goal post] Loose ideas** mentioned but not recorded in detail: **not lost, just not
written down yet.**

---

## 8. Goal post: resource-system expansion, and the pleasure split

> **[goal post]** This section is recorded by explicit instruction and **deliberately not
> researched**. It is the same order of magnitude as the control system — a large project
> in its own right — and it must not compete with `MachinePrime` for attention.
>
> It is written down now because two of its ideas touch live sections (§4's presentation
> question, and §5's currency), and because the reasoning behind it is worth preserving
> before it is re-derived.

**[决定] The framing: any consumable number that converts into an action is a resource.**
Under that definition the game has far more resources than the four with visible bars, and
the design note's own reading of the existing ones is worth keeping verbatim:

| Existing | Design reading |
| --- | --- |
| **SP** (stamina) | a fast, free, automatically produced resource; a **buffer**, in the sense a souls-like's stamina is |
| **WP** (will) | **not** a conventional health pool — it is a **resistance indicator** |
| **DP** (distraction) | analogous to a shooter's **weapon overheat** |

**[既有] And the hidden ones the note lists** are consistent with what §2 read:
`ArcaneEnergy` (the Mage's relatively hidden arcane points, `KinkyDungeonMagicList.ts:4344`),
skill points, materials and gold, potions and equipment, and captured NPCs via Collection
(`§6`).

> **[提议] The first task of this project, when it starts, is therefore an inventory, not
> a design:** systematically enumerate what the game already treats as a resource. Note
> that **Appendix A is the wrong tool for that job** — A enumerates *constrainable* values
> (things the Host can hold), which is a different set from *consumable* values (things
> the player spends). The overlap is real but neither contains the other.

### 8.1 The direction

**[goal post] Conversion between pools.** The note's examples are concrete and both are
mechanically plausible on the Appendix A seams:

- "convert stamina into something else *while running*" as a **combination effect** of
  boots, a vibrator, and similar restraints;
- a **mana-tap device** that extracts MP into a mod-specific token.

**[goal post] Substitute stats that change the player's resource-management logic.** Two
named:

- **`Compliance`** — a numeric display of the §4 "control degree". Its designed effects:
  provides resistance **equal to or greater than** WP's, and **shrinks the WP ceiling as
  it rises**. Presented in-game as an **inverted WP bar, drawn right-to-left**.
- **"Extraction" designs** that turn extracted mana or stamina into **ammunition** in the
  inventory — the note names `ancient crystals` as the shape. Under this, a §5 mediated
  ability would be **ammunition-driven instead of stat-driven**.

> **[既有] One live cross-reference, because it is not entirely deferred.** §4 asks how
> each dimension's "control degree" is presented, and `Compliance` is a concrete answer to
> that question for the aggregate. **[提议]** if §4 settles on an explicit display, an
> inverted WP bar is the cheapest candidate and it does not need the rest of this section.

### 8.2 The pleasure split

**[决定] The base game's pleasure model is one number, and the designer is not satisfied
with it.** Orgasm control and pleasure control are a specific kink, and representing them
as a single DP is, in the note's words, a simplification the base game settled for.

**[提议] Split the pleasure system from DP into several modelled dimensions** — the note
names four axes: **hunger** (饥渴程度), **stimulus intensity** (刺激强度), **arousal
intensity** (唤起强度), and **suppression intensity** (抑制强度).

**[既有] What the base game already has in this area**, recorded so the split is designed
against the real thing rather than against "a single DP":

| Piece | Site |
| --- | --- |
| `KinkyDungeonStatDistraction` + `KinkyDungeonStatDistractionMax` + a *lower* bound (`KinkyDungeonStatDistractionLower`, `…LowerCap`) | `player/KinkyDungeonStats.ts:2078-2079` |
| `calcOrgThresh` event, consulted by `KinkyDungeonCanTryOrgasm` | `:2270-2278` |
| `KDGetOrgasmCost`, and `OrgasmStamina` / `OrgasmStage` as separate state | `:2281`, `:2259` |
| `calcInvolOrgasmChance`, `calcEdgeDrain`, `orgasm` / `tryOrgasm` / `deny` / `edge` triggers | `:1720`, `:1910`; `effect/KinkyDungeonEvents.ts` |
| `orgasmMode`-gated entry points (`KinkyDungeonCanPlayWithSelf`) | `:2265` |

> **[既有] So the base game is not quite "a single number"** — there is a threshold event,
> a separate orgasm meter, and denial/edge triggers already. **[提议]** that is good news
> for the split: it means the four axes have existing state to attach to rather than
> needing the pleasure system rebuilt from nothing.

### 8.3 Why this is worth recording at all

**[决定] Class differentiation depends on it.** A roguelike's classes are distinguished
to a large degree by their **resource management and their loop**, not by their numbers.
So **variant classes and new classes are downstream of this section**, and any class
design done before it will be provisional.

**[提议] And the kink/gameplay balance lives here too.** §4's submission economy needs a
currency; §8.1's conversion mechanics are exactly the machinery that turns "I gave
something up" into "and here is what it became". The two sections want to be designed
together when this project starts — but not before `MachinePrime`.

---

## 9. Open questions

> **This is the full inventory, ordered by what each one blocks** rather than by topic.
> Resolved items are kept, struck through, so that a later reader can see they were asked
> and answered rather than never asked.

### 9.1 Blocks engineering work — decide before writing code

| # | Question | Why it blocks | Status |
| --- | --- | --- | --- |
| **Q1** | ~~The identifier scheme's shape.~~ | — | **[决定] Resolved (§2.10):** `uuidv5(namespacedName, MOD_ROOT_UUID)`, no separate version field, **store the path and recompute the id at load**, plus a version-numbered **migration chain** (§2.10.1). The one open piece is **where the version table lives** — see Q3. |
| **Q2** | ~~The dimension list.~~ | — | **[决定] Resolved (§3):** three groups (Constraint / Substitution / Buff), dimensions **composing facets** (`Rate` / `Gate` / `Whitelist`) so overlapping semantics are expressible; uniform storage; `config` persisted; first scope is **Sensory + Behavior**, Behavior first. |
| **Q3** | **Where does the version table live?** (§2.10 — code-side, `localStorage`, or code + root-in-save.) And **what does the update mechanism do when the master changes?** | Load-time id recomputation depends on resolving the saved root, so this is what makes the whole scheme work or not. | **[提议]** code-side table **plus** the root recorded in the save, and never bump the master except deliberately — the migration chain carries the rest. |

### 9.2 Blocks design — decide before designing around it

| # | Question | Why it blocks | Baleenie's read |
| --- | --- | --- | --- |
| **Q4** | ~~Which subsystem first?~~ | — | **[决定] Resolved (§3.2, §6.4):** **Behavior Control first**, driven by the equipment-upgrade quest framework, with **Sensory** second. Stats Control deferred until §8. |
| **Q5** | ~~The Host's identity.~~ | — | **[决定] Resolved (§6.3):** a **distributed super-consciousness above all machinery and dolls**, perceptible **only from inside the network** (the designer's "spiritual sensing") and inferrable from outside only through network members' behaviour. **Not a deity** — that distinction is load-bearing. No speech; characterised entirely through third parties; direct perception is non-verbal UI only. **[决定] Inside the network it is spoken *as*, not referred to — the first-person plural "we", so no constant.** **Two appellation constants survive** (down from eight), both belonging to parties **outside** the network: `HostName_FactionHostile`, and optionally `HostName_FactionTechnical`. |
| **Q6** | ~~What exactly is `Filed`?~~ | — | **[决定] Resolved (§6, §6.0):** a **family** of final quests with a **fixed entry condition and a fixed sequence that forks into two commits** — **route 1** leaves (the dossier is deleted, the items are destroyed) and **route 2** seals the character into a curse-locked `furniture`, after which the character is effectively dead. **Everything before either commit is reversible.** Two global sync hooks export on save and load. |
| **Q7** | ~~The quest line's concrete shape.~~ | — | **[决定] Resolved (§6.4):** upgrades classified by function, a **table** of mini quests per class, and a **quest coordinator** that assigns by matching equipment tags, randomised within the eligible set. Built *with* the controller, not beside it. |

### 9.3 Strategy — worth a decision, not urgent

| # | Question | Why it matters | Status |
| --- | --- | --- | --- |
| **Q8** | ~~Is Boids willing to patch the base game?~~ | — | **[决定] Resolved: yes, but only as a separate patching mod, and Boids must never depend on it.** Base-game changes ship as **standalone patches that Boids treats as *optional* plugins** — so Boids runs without them, and degrades rather than breaks when they are absent. This supersedes the earlier "work around everything" leaning: the asks (a `calcGag`-style event, a weapon-side `lock`, richer dynamic chastity) are now **legitimate to pursue**, but each must have a working non-patched path as well. |
| **Q9** | ~~Mod-update vs save compatibility.~~ | — | **[决定] Resolved:** the version table lives **in code**, and the save records **only `root_uuid`** as its version information (§2.10.1). Combined with the migration chain, that closes the question. |
| **Q10** | **The projection layer's seam** (§D.5, §3.5) — how are projection stages expressed, and can a stage be authored without a new layer group? | **[既有]** new sorting groups are a **load-time** decision (`LAYERS_BASE` is patched once at load, `Boids/index.ts:17-22`), and nested projections may need them. | **[决定] Much reduced.** The designer confirms the current `LAYERS_BASE` edit is **a personal preference, not load-bearing** — it ought to have been commented out. So the *existing* patch is a leftover to remove, and the real open question is only whether **future** projection stages need new groups. |

### 9.4 Recorded, deliberately not now

| # | Item | Where |
| --- | --- | --- |
| **Q11** | **The currency** for mediated abilities. | §5, §8.1 |
| **Q12** | **The resource inventory** — a systematic enumeration of *consumable* values, distinct from Appendix A's *constrainable* set. | §8 |
| **Q13** | **A weapon-side `lock`.** | §7, C.2 |
| **Q14** | **The calibration of the final act's peak** — how hard the struggle of §6.0 step 4 should be. The *mechanism* is decided: the base game's own struggle system at the Controller's ceiling, so there is no formula to author. What is open is the tuning, done against the finished room. **Blocks the room's difficulty, not its structure.** | §6.0, §D.3.1 |

### 9.5 Resolved, kept for the record

| ~~#~~ | ~~Question~~ | How it was settled |
| --- | --- | --- |
| ~~R1~~ | ~~The complete inventory of constrainable values.~~ | Appendix A. Every seam family enumerated, every `data` shape read, both former unknowns closed (`calcSpellRange` grantable, `afterNoise` not). |
| ~~R2~~ | ~~How "permanent native ability loss" is enforced.~~ | §5 as a policy: deny at the action chokepoint, grant at whatever seam the ability has. Three abilities confirmed ungrantable (A.9). |
| ~~R3~~ | ~~The variant-key / dimension-ID freeze point.~~ | Appendix B: no variant-key fields, `ItemRegistry` becomes a keyed `ControlState`, `DimensionId → number` is the only persisted form; order in B.5. |
| ~~R4~~ | ~~Whether Collection / Summit is a graduation mechanic.~~ | §6, resolved in the negative — dom-playstyle systems. Two *patterns* borrowed instead. |
| ~~R5~~ | ~~Whether the weapon case needs a core-logic override or a separate mod.~~ | Appendix C.1, resolved in the negative. `FloatingWeapon` is a working reference and four handlers already widen weapon access. |
| ~~R6~~ | ~~Whether weapons can be variants.~~ | Appendix C.2, resolved in the affirmative (registry, per-instance record, `data`, `events`, save-persisted). Only the *lock* is missing. |
| ~~R7~~ | ~~Whether "blocks arousal" can be dynamic.~~ | §3.6, resolved in the affirmative through the `ChastityLower` / `ChastityUpper` player tags — with the **deny** direction cheap and the **grant** direction not. |
| ~~R8~~ | ~~How Family 5 is handled when restraint definitions are read-only.~~ | §3.1: it is not a subsystem but a layer. Ship loose baselines; apply strength dynamically. |
| ~~R9~~ | ~~Whether the controller needs a buff half.~~ | §5, C.3: yes, with a cost gradient — numeric buffs free, unit marking has a template, shared vision is real rendering work. |
| ~~R10~~ | ~~Whether the Family 1 split (sense values vs multipliers) is real.~~ | §3.1, A.1: yes, and it is why one subsystem cannot own both. |

---

## 10. Issue triage, as it relates to this brief

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

## 11. What this brief does not do

- It does not specify the controller's final state shape. §3 proposes a direction and
  states the precondition for freezing it.
- It does not pick a currency, a Host name, or any sub-faction's fiction.
- It does not estimate schedule. The scope is "1–3, done properly", and round 1's
  finding is that this is larger than it first looked.
- **It does not design the resource-system expansion or the pleasure split.** §8 records
  them as a goal post, on instruction, without research. They are their own project.

---

# Appendix A — The constrainable-value inventory

> This answers open question §9, item 1 — the inventory the designer named as the
> precondition for freezing the controller's shape. It is a **working inventory**,
> produced by reading the base-game implementation. It is dense on purpose: it is a
> reference, not prose.
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

> **[决定] How the families map onto the controller — see §3.1.** The designer's review
> of this appendix settled the architecture, and it is *not* one subsystem per family:
>
> - **Family 1 splits.** Its *sense* values go to **Sensory Control**; its *multipliers*
>   are absorbed into Family 2.
> - **Family 2 becomes Stats Control**, and is **deferred until the resource system
>   exists** (§8), because these values are resource arithmetic.
> - **Families 3 and 4 combine into Behavior Control**, alongside the voluntary-servitude
>   quest line.
> - **Family 5 is not a subsystem at all** — restraint definitions are read-only, so the
>   mod ships those fields at a loose baseline and the subsystems above apply the
>   binding strength dynamically. **The single exception is `blocks arousal`, whose
>   dynamic route is §3.6.**
>
> **Five Appendix-A rows are excluded from the model entirely** as training-owned or
> meaningless: `calcGagRed`, `calcCorsetSPRed`, `calcEscapePenalty`, `calcBindCrit`, and
> `calcDisplayDamage`. §3.2 has the reasoning.

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
| bind crit | `calcBindCrit` | `:405` | same shape, `basecrit: Damage?.bindcrit` | `(basecrit+critboost)*critmult` (`:407`); **[决定] excluded** — training-related, §3.2 |
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
| gag penalty mult | `calcGagRed` | `KDTraining.ts:370` | `mult *= exponent ** (level + buff)` (`:373`) | **[决定] excluded** — a `KDTraining` value, §3.2 |
| corset SP mult | `calcCorsetSPRed` | `:341` | `mult *= exponent ** (level + buff)` (`:344`) | **[决定] excluded** — ditto |

**[既有]** Four more joined this family once their shapes were read. Each is *influence*,
not replacement, and each has a **knockout field** — one value whose neutral
(multiplier-identity or additive-neutral) setting removes the whole term:

| Value | Trigger | Site | Shape | Knockout field |
| --- | --- | --- | --- | --- |
| evasion / hit chance | `calcEvasion` | `fight/KinkyDungeonFight.ts:490` | `{enemy, isSpell, isMagic, flags:{KDEvasionHands, KDEvasionSight, KDEvasionDeaf, KDEvasionSlow}, cost, forceWeapon, hitmult, stamPenType}` | `hitmult = 1`; or clear the relevant `flags.*` |
| weapon damage / accuracy | `calcDamage`, `calcDamage2` | `:291`, `:294` (same object) | `{flags:{KDDamageHands, KDDamageArms}, accuracyMult, damageMult, weapon, HandsFree, canUse, forceUse, handBondage, armBondage, legBondage, brawler}` | `accuracyMult = 1`, `damageMult = 1`; `canUse = true` bypasses the unwieldy branch (`:296`) |
| escape penalty | `calcEscapePenalty` | `restraint/KinkyDungeonRestraints.ts:2418` | `data` carries `escapePenalty`, `struggleType`, `struggleGroup`, `restraint`, `handsBound`, `handBondage`, `query`, … | `escapePenalty` is read after the event (`:2408` onward); **[决定] excluded** — `KDTraining`-owned, §3.2 |
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

**[既有]** `KDSendInput` → `KDInputTypes`, **86 commands** (measured, `base/KinkyDungeonInput.ts:10`).
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
| **GUID registry** | every handler `type`, in-game *and* across every other mod | `AddEventHandler` throws on a duplicate at load (`src/KDExtension/Event.ts:19-21`) |

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

**[既有] Avoiding a key change is still cheaper now than later**, because `Colorize` and
`Level` are *already* in the `GlassVisor` key. Adding a field now would be a save
migration; adding a field **after** the dimension work would have been a save migration
*plus* a rename of every visor.

> **[决定] But the vocabulary softened, and it should: the variant key is "expensive to
> move", not "immovable".** §2.10's migration chain exists precisely to carry a rename
> across versions, so a key change is now **a migration to write**, not a save to
> abandon. The rule above still stands on its own merits — a dimension is not an identity —
> but a reader should not conclude the key is permanently frozen, because concluding that
> leads to designs more conservative than the tooling requires.

## B.4 The coordinator-state decision

**[既有] Today the state is `ActivePC.Items` keyed by the three `ItemArchetype` GUIDs,
each slot a `SensoryLimiter`-shaped record** (`Internal/State.ts:129-158`). Adding a
dimension means editing `ItemRegistry`, which is a state-shape change.

**[决定] Replace it with the shape from §3.1.1, in one step, before release.** Concretely:

```ts
// Before                          // After
type ItemRegistry = {               type ControlState = {
    [Blinder]:  Visor                    target:    { [D: DimensionId]: number }
    [Deafener]: SensoryLimiter           equipment: { [D: DimensionId]: number }
    [Gag]:      Gag                      config:    { [D: DimensionId]: Config }
}                                   }
```

**[既有] The migration cost of doing it now is zero saves.** No released build has a
coordinator save in the wild; the "captures no value generated during this run" case in
`test/registration-manifest.test.ts` already asserts the coordinator's save key is **absent**
from the registration record, precisely so the shape is not accidentally frozen.

**[决定] Migrate nothing, and say so explicitly.** This is a deliberate exception to
§2.10's migration chain, and the exception is *only* about the old shape's age: a `fromJS`
that recognises a format nobody has ever written is not worth writing. If a save cannot be
understood, the coordinator falls back to defaults and says so in the log — the existing
`SetState`-drops-equals-no-op behaviour (`StateStorage.ts:53-59`) already gives the right
precedent for "a write that changes nothing is not a write". **From the first release
onward, every shape change goes through the chain instead.**

## B.5 The freeze checklist

The concrete list, in the order that keeps each step cheap:

1. **[既有] Fix #48 first.** Write and read the same global (`KDGameData`). Until this is
   settled, "what does the coordinator persist" has no verified answer, and freezing a
   shape that does not round-trip is worse than not freezing it.
2. **[决定] Settle the version table's home** (§2.10) — the one open piece of the
   identifier scheme. The construction (`uuidv5(namespacedName, MOD_ROOT_UUID)`, store the
   path, recompute the id) is decided; where the root → release mapping lives is not, and
   the load-time recomputation depends on it.
3. **[决定] Stand up the migration chain** (§2.10.1) — the version key in the save, the
   load-path gate, and the refusal path. This is what makes steps 5–7 survivable rather
   than permanent.
4. **[提议] Add the GUID-uniqueness test** (§B.2) — before minting the dimension GUIDs.
5. **[提议] Mint the dimension GUIDs** *derived from the master*, and register the
   existing slots as the first entries of the same registry.
6. **[提议] Replace `ItemRegistry` with `ControlState`** in one change, regenerate the
   surface summary (`npm run test:update-manifest`), and review the diff.
7. **[提议] Add no variant-key fields** (§B.3), and write the rule — *a dimension is not an
   identity* — into the README's invariants list so the next person does not have to
   rediscover it.
8. **[既有] Keep the save to numbers and semantics.** `target` and `equipment` are numbers;
   `config` holds semantic extra fields and no live gameplay state. That is what keeps the
   shape stable, with the migration chain as the backstop rather than the everyday tool.

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

**[既有] The `getWeapon` event already has three handlers that widen weapon access** —
`HandsFree` (`:6928`), `UnconventionalWarfare` (`:6933`), `GuerillaFighting` (`:6939`). They
all do the same thing: set `data.flags.HandsFree = true`.
`KinkyDungeonCanUseWeapon` (`player/KinkyDungeonStats.ts:1584`)
then reads `flags.HandsFree` **first**, before it consults the real bound state —
which is exactly the "grant" direction that §A.4 said was missing from
`treatAsHandsBound`.

> **[既有] And the `treatAsHandsBound` sibling is *live*, in a different map.** It is not a
> commented-out fourth handler: `TreatAsBound` sits in the **other** `getWeapon` map at
> `KinkyDungeonEvents.ts:342`, and it sets `data.flags.treatAsHandsBound = true` — the
> **deny** direction that §A.4 already classifies as deny-only. Three handlers widen access;
> a fourth is not one of them.

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

---

# Appendix D — The restraint model, morphing, and lock versus curse

> Raised by the designer after Appendix C. This is the **foundational** constraint the
> whole mod is built around, and it reframes Appendix A: most of Boids' existing
> engineering is a workaround for it, and the workarounds deserve to be evaluated as
> workarounds rather than as designs.

## D.1 The constraint everything is built around

**[决定] Ada built restraints as a single model, and nearly stateless.** The designer's
own words: the restraint is one model per name, with almost no per-instance state, and
**this is buried so deep in the game that it cannot be changed.** Many of Boids' designs
are therefore workarounds for it, not designs in their own right.

**[既有] The evidence is everywhere in Appendix A:** `KDRestraintVariant` is
`{prefix?, suffix?, curse?, lock?, events, template, noKeep?, power?}` with **all physical
properties delegated to the template** — the variant is a name plus a small delta, not a
different object. `KDRestraint(item)` resolves `variants[item.inventoryVariant].template`
and returns the shared template (`restraint/KinkyDungeonRestraints.ts:272-274`). Per-item
state lives only in `item.data` (`base/KDTypeDefs.ts:75`) and in progress counters
(`pickProgress`, `struggleProgress`, `cutProgress`, `tightness`).

> **[提议] Naming consequence.** Since the base game cannot be talked out of this, Boids
> should stop treating each route as an ad-hoc fix and define **one explicit layer** for
> "a restraint that changes over time" (§D.4). Three routes exist; two are hacks; the
> layer is whatever survives.

## D.2 The three morphing routes, measured

**[既有] Route 1 — `KDMorphToInventoryVariant`** (`item/KinkyDungeonInventory.ts:3500`).
It has **two branches**, and the split matters:

| Branch | Condition | What it does |
| --- | --- | --- |
| **in-place** | `forceMorph`, or the wearer has no dynamic link, or the item is loose | keeps the same `item` object, keeps `item.lock` (`:3551` is the *other* branch), rewrites `item.name`, `item.events`, `item.inventoryVariant` |
| **remove-and-re-add** | otherwise | reads `item.lock` into a local (`:3551`), removes the restraint (`:3553`), re-adds — i.e. **the wearer is momentarily unbound** |

Both branches register a fresh variant under `newname = prefix + template + GetItemID() + curse`
(`:3505`, `:3540`) — **a random id**, which is precisely the problem §2.10 describes.

> **[既有] So route 1's real cost is not the morph itself:** it is that a morph **mints a
> new variant name**, which means morphing many times grows `KinkyDungeonRestraintVariants`
> and every one of those names is a save artifact. And the fallback branch unbinds the
> player mid-morph, which is a visible glitch if the morph is a narrative beat.

**[既有] Route 2 — an injected, dynamically computed layer filter.** `Dollmaker.ts`'s
`CalcVisorFilter` (`MachinePrime/Item/Visor/Dollmaker.ts:52-74`) writes
`data['Filters'][Layer.GlassLayerName]` on the `apply` trigger. It changes **how the item
looks** without changing what it is: no new variant name, no unbinding, no save artifact.
Its limit is that it can only reach rendering (alpha, brightness, saturation) — it cannot
change the sprite, the restraint's properties, or its behaviour.

**[既有] Route 3 — auto-equip through the socketed-sub-item mechanism.**
`RequireSubItemEvent` + `RequireMuffler` (`MachinePrime/Item/Gag.ts:152-194`) link a
sub-item under a host on `postApply`, which is how the hard-light visor and the projected
mask socket currently work. **The designer names this as emulating "a restraint that
projects non-physical parts" by copying how the base game hangs a chain off a cuff** — the
`Link`/`UnLink`/`dynamicLink` family from §A.4's note.

> **[决定] And it is an unfinished prototype.** The projection is **not supposed to happen
> on equip.** Per the design, projecting extra intangible restraining parts is one of the
> **feedback forms of the voluntary-servitude progress**: once the player has progressed
> far enough, the equipment begins to project additional, non-interactive parts, as a
> strong visual and mechanical signal of how far they have gone.
>
> **[提议] So the fix is a layer, not a patch.** Right now projection is a `postApply`
> side effect with one hard-coded sub-item. It should become a **projection stage**: a
> restraint declares what it projects and at which servitude stage, and the projector reads
> the §3/§4 state and projects accordingly — including **retroactively**, for an item that
> was already worn when the stage was reached. That is a real abstraction, and it is the
> same one #45 wants.

## D.3 Lock versus curse — the actual mechanics

**[决定] The designer's distinction:** a **lock** can be removed by force; a **curse**
cannot. The research refines this, and the refinement is more useful than the slogan.

### D.3.1 What a lock actually gates

**[既有] A lock's flags gate *which escape method exists*, not how hard it is.**
`pickable: false` / `unlockable: false` mean the method is absent. Verified on the three
Cyber locks, which is what Boids already uses:

| Lock | `pickable` | `unlockable` | `breakChance` | `lockmult` | `specialActions` |
| --- | --- | --- | --- | --- | --- |
| `Cyber` (`KDLocks.ts:366`) | false (`:351`) | false (`:371`) | `false` (`:368`) | 2.9 (`:349`) | yes → `KDCyberActions` (`:332`) |
| `Cyber2` (`:468`) | false | false | `false` (`:470`) | 3.15 | yes |
| `Cyber3` (`:567`) | false (`:572`) | false | `false` (`:569`) | 3.5 | yes |

> **[既有] Note the `breakChance` column: all three are `false`.** That is consistent with —
> and is why — the correction below matters. A `yes` here would mean the pick survives, not
> that the lock breaks; reading the column as "the lock can be broken" is the exact
> misreading the next paragraph warns about.

**[既有] A correction that matters: `breakChance` is about the *pick breaking*, not the
lock.** `KinkyDungeonUnlockAttempt`'s branch at `KinkyDungeonRestraints.ts:2036` reads
`KDLocks[lock].breakChance({})` and the comment on it says *"Blue locks cannot be picked
or cut!"* — the outcome is `KDAddConsumable("Pick", -1)`, i.e. a pick is destroyed. Reading
it as "the lock breaks" is the natural mistake; it is the opposite.

**[既有] The actual force-removal path is restraint destruction, and it bypasses the lock
entirely.** `KDSuccessRemove` (`:6447-6499`) computes `data.destroyChance`:

```
data.destroyChance = (StruggleType == "Cut" || restraint.cutProgress) ? 1.0 : 0;
if (restraint.struggleProgress && restraint.struggleProgress > 0) {
    progress += restraint.struggleProgress;          // ← the line that makes the ratio mean anything
    data.destroyChance = restraint.cutProgress / progress;
}
if (KDRestraint(restraint)?.struggleBreak && StruggleType == "Struggle") data.destroyChance = 1.0;
…
if (KDRandom() < data.destroyChance) { … destroy = true; }
```

> **[既有] The middle block is quoted in full deliberately.** Without
> `progress += restraint.struggleProgress`, `cutProgress / progress` divides by a value that
> was seeded earlier and never advanced — so a paraphrase that drops that line reads as
> plausible code that computes the wrong number. The surrounding lines are exact:
> `:6449`, `:6454`, `:6490`.

So a restraint marked `struggleBreak: true` (`base/KDTypeDefs.ts:228`) is **destroyed, not
unlocked** — the lock never consults its own rules. **[既有] And the destruction can be
refused at the last moment by `KDAlwaysKeep` (`:6491`).**

> **[既有] So the designer's distinction holds, with the mechanism named:** a lock governs
> *the lock route* (pick / key / hack / shrine), while the restraint underneath can still
> be destroyed if the restraint itself permits it. `shrineImmune` (`:885`) and
> `noShrine` (`:445`, and per-curse at `:3933`) separately block the shrine route.

### D.3.2 What a curse actually is

**[既有] A curse is a hard gate across every struggle type, plus a condition for lifting
it.** `KDGetEscapeChance` (`:2250-2252`) does, on its **second line**:

```
if (KDGetCurse(restraint)) escapeChance = -100;
```

before the lock is even consulted. And `KDCursedDef` (`base/KDTypeDefs.ts:3929-3970`)
carries `condition` and `condition2` — *"required to remove it"* — plus `noShrine`,
`noShop`, `noPurify`, `powerMult` (*"similar to a lock's lockmult"*), `lock` (*"treated as
a type of lock, for display purposes"*), `activatecurse` (*"keeps events with the curse
property from vanishing"*), and its own `events`.

**[既有] And a curse has no pick/cut/unlock path at all.** `KDStruggleGroups.ts` routes a
cursed item to `struggleCurse` / `curseUnlock` instead of `struggle` / `pick` / `unlock`,
and every ordinary escape entry is gated on `!KDGetCurse(item)`.

> **So the real difference is: a lock is a *lock*, and a curse is a *condition*.**
>
> | | Lock | Curse |
> | --- | --- | --- |
> | what it is | an object with rules about its own removal | a condition the wearer must satisfy |
> | pick / key / hack | possible unless the lock forbids that method | **all barred** |
> | force destruction | the restraint may still allow it | **barred** |
> | in-game display | `Locks/<icon>` | `Curse` / `customIcon_hud` |
> | scaling a restraint's power | `lockmult` | `powerMult` / `powerBoost` |
>
> **[既有] `lockmult` does not gate escape.** It is read by `KinkyDungeonGetLockMult`
> (`:3635-3638`), which `KinkyDungeonRestraintPower` (`:4546`) then uses — so it is what
> makes a restraint *feel* stricter, not what makes it escapable or not.
> **[提议]** that makes `lockmult` a usable *strictness dial* independent of the removal
> rules, which is exactly what a progression ladder wants.

### D.3.3 Lock interaction is narratively rich — and the hooks are enumerable

**[决定] The designer's point, and it is well supported.** Every lock is a bundle of
injectable functions, so "interacting with the lock" is a designed surface rather than a
dead end:

| Hook | `KDLockType` | What a mod can make it mean |
| --- | --- | --- |
| `canPick` / `doPick` / `failPick` / `pick_speed` / `pick_diff` | `:3698` region | who may attempt it, how fast, and what failure costs |
| `canUnlock` / `doUnlock` / `failUnlock` / `unlock_diff` / `key` | — | which item opens it |
| `removeKeys` / `entityRemoveKeys` / `consume_key` | — | whether the key is spent, and by whom |
| `breakChance` | `:3698` | whether the **pick** survives |
| `shrineImmune` / `loot_locked` / `loot_special` | — | which removal route is closed |
| `canNPCPass` / `entityCanUnlock` / `entityDoUnlock` | — | **who else can open it** — the Host's access |
| `commandable` / `commandlesser|greater|supreme` | — | the command-word subsystem |
| `levelStart` / `filter` / `weight` / `sfx` / `penalty` | — | spawn behaviour and the cost of failure |
| `specialActions` | `:3672` | a bespoke modal, e.g. the Cyber locks' swipe / scan / hack |

> **[既有] And Boids has registered nothing here.** Appendix C's note stands: there are no
> custom locks or curses in `src/` (issue **#27**). **[提议]** this is the single largest
> unexploited surface the brief has found — a lock is the natural place to put a
> progression gate, because the game already asks "may I remove this, and how" through a
> fully injectable interface.

## D.4 The evolution ladder

**[决定] The progression is a mini-quest chain and a core source of gameplay, not
decoration.** Equipment is acquired **low-restraint and unlocked**, and ends
**high-restraint and permanently sealed.** The named stages:

1. **craft a lock for the item, and put it on**
2. **craft reinforcing parts for the item, and upgrade them**
3. **make the lock permanent**

Each step is a quest line requiring resources, travel to a specific place, and so on. The
design goal is that **the player hands their own character over, by hand, with ceremony** —
and the designer names the trap explicitly: *do not let the quest line become tedious.*

**[提议] And the ladder generalises to a fourth and fifth stage**, since a restraint can
carry several locks' worth of meaning over its life: a **degradation or crisis stage**
(something fails and must be re-sealed, at a cost), and an **integration stage** where the
item stops being equipment and becomes part of the character — which is where §5's
ability-substitution and §6's `Filed` naturally attach.

**[既有] Two mechanics make the ladder cheap to express, and the brief had not named them:**

- **[既有] `lockmult` is the strictness dial** (§D.3.2) — so the visual and mechanical "how
  bound am I" can be one number, independent of the removal rules.
- **[既有] Curse removal conditions are per-item functions with their own icon and text.**
  A curse's `condition` (`:3959`) is a predicate the game evaluates, and `customIcon_*` /
  `altIcon` / `unlockText` are already there. So the final stage can be a **curse whose
  `condition` is a quest objective**, and the UI will present it as a cursed lock with the
  Host's own iconography — no new UI.

> **[决定] And the permanence should be a `curse`, not an unbreakable lock.** §D.3 says
> force destruction bypasses locks but not curses. So "permanent" means **curse with a
> condition**, which is also the only form that can be *lifted* later if a story needs it.

**[既有] The `lock` slot is free, and Boids has not used it.** If the ladder changes the
lock at each stage, the item's visible lock icon and its `lockmult` change with it — which
is a strong, cheap feedback channel that costs no art.

## D.5 The projection ideas, and more

**[既有] Currently implemented:** only the visor projection, and it is explicitly a crude
first version.

**[决定] Designed but not implemented:** an **energy tether between limb restraints**; a
**restraint prosthesis morphing to release a hovering mechanical fist** (noted as touching
the weapon interaction, and the designer's own instinct is to defer it — Appendix C.2
agrees, since weapon locks are the one genuine gap); and **a chastity device generating
toys**.

**[提议] Boids' options beyond those.** Offered as suggestions, not decisions:

1. **Make the projection *retroactive*.** The strongest version of the mechanic is not a
   thing that appears — it is a thing the player **notices has always been there**. An
   item worn for many turns begins to project, with text that refuses to frame it as new.
2. **Let the projection be deniable.** Pair each stage with a line of text where the Host
   says it was always part of the item, and the player's own equipment contradicts the
   explanation. Cheap to write, and it is the "voluntary" fantasy doing the work.
3. **Project a projection.** Stage two projects *from* a stage-one projection — a socket
   on a socket — so the silhouette grows faster than the art does. The existing socket
   mechanism supports nesting, and it makes one art pass cover several stages.
4. **Make a projection the *only* way to satisfy a curse's condition.** §D.4 says the
   permanence is a curse with a `condition`; if that condition requires an item the Host
   issues, then the ritual and the equipment become the same system rather than two.
5. **Give the wearer a mirror.** A "view yourself" action, gated on progress, that renders
   the accumulated projections. It is the cheapest possible feedback for an abstract stage
   counter, and the mod already has the layer machinery (`SwapLayerPose`, `HUD/Glass`, and
   the 32 unused HUD models in `Futuristic/HUD`).

> **[提议] One caution, learned from §A.9.** Every projection idea above is a *visual*
> grant, and the base game renders layers through `LAYERS_BASE` — a table Boids already
> patches once at load (`Boids/index.ts:17-22`). Adding layer groups later is possible but
> the table is not a per-item thing. So **a projection that needs a new sorting group is a
> load-time decision**, not a runtime one, and the stage plan should be settled before the
> art exists.
>
> **[决定] The patch that is there now is a leftover, not a requirement.** The designer
> confirms it was **a personal preference and contributes nothing functional** — it should
> have been commented out and was forgotten. So it is a candidate for removal, and it is
> evidence for §7's policy rather than an exception to it: the mod should not be quietly
> carrying a base-game edit whose purpose nobody remembers.

## D.6 What this appendix changes

- **Appendix A gets its frame.** The seams are the seams; D.1 is why there are not more
  of them.
- **§3 gains a fourth requirement's worth of work:** the projection layer is a
  state-driven projector, not a `postApply` side effect, and it belongs with the routing
  layer rather than beside it.
- **§5's ladder and D.4 are the same ladder.** "Permanently give up a native ability"
  (the ritual) and "make the lock permanent" (the equipment) are one quest chain, and
  should be designed as one.
- **A convergence worth naming:** §6's `Filed`, §5's ritual, and D.4's permanent stage are
  three names for the same narrative moment — *the point at which the character stops
  being able to go back*. They should share a single set of triggers.
- **[提议] And the highest-value unexploited surface is `KDLocks` / `KDCurses`** (§D.3.3):
  a fully injectable, narratively loaded, save-persistent gate that Boids has not touched
  at all (issue #27).

---

# Appendix E — Frozen record

> **This appendix is the only part of this document that grows.** The brief was frozen on
> **2026-10-16**; from that date the reasoning above stands as it was reasoned, and every
> subsequent design change is recorded here as a row and implemented from `docs/spec.md`.
>
> A row says **what changed and where it landed**, not why — the why belongs to the issue
> and, once decided, to the spec. **Nothing is deleted from the body.** If a decision is
> reversed, the body keeps the original and the row records the reversal, so a later reader
> can see that the question was asked and answered twice.

| Date | Issue | What changed | Landed in |
| --- | --- | --- | --- |
| 2026-10-17 | *—* (designer's instruction, in session) | **The layout, and the text surface.** `src/Boids/` was the machine faction's root rather than the mod's, so the tree is now `src/FactionMachine/` beside `src/Common/`, with the dependency arrow `Utilities < KDInterface < KDExtension < Common < FactionMachine` gated by a test; the published surface is demoted to `Boids.FactionMachine.*` beside `Boids.CommonUI`, so a second faction is a sibling rather than a fourth top-level name. Text became one adapter in `src/KDExtension/Text/`: the engine's group for what the engine resolves and the mod's own group for what the mod resolves, composed keys beside dotted paths, a JSON tree cascade with a local layer and a declared engine source beneath it, per-family text authored once with variants overriding what differs, and the `Desc`/`Desc2` slot correction that gave every item a function line. | `spec` §4.6; `dev-plan` Phase 0.5; `README.md` |
| 2026-10-17 | *—* (designer's instruction, in session) | **The refactor-era gates retired.** Phase 0 and 0.5 built a 437 KB manifest baseline to prove that a rearrangement changed nothing; with no behaviour-preserving rearrangements left, that gate had become a 16,000-line regeneration in front of every content commit, so the tracked artifact is now a 345-line summary of per-section counts and per-entry digests, and the full record is written on demand. The generated text reference's byte comparison moved to the delivery gate, three assertions coupled to shipped English became properties over the registry, and three subsumed tests were deleted. Regeneration switches became argv flags, because the documented `UPDATE_*=1 npm test` was a bash-ism. **The checks that force a regeneration now report as skipped in the workday gate rather than as passes.** | `spec` §4.5, §11 inv. 22; `dev-plan` Phase 0.6; `README.md` |

**How to add a row:** open or cite the issue, then append one line. If the change is
**breaking for saves**, it also needs a slot in the spec's version table and a step in the
migration chain (`spec` §4.3–4.4) — a brief row is a record, not a migration.
