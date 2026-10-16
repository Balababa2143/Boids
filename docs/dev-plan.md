# Boids — Development Plan

**Status:** **FROZEN — 2026-10-16.** The ordered work programme. It sequences the work
`docs/spec.md` defines; it does not restate the spec.

**How this document changes now.** It is a **schedule**, so it is expected to move — but it
moves by **tracking**, not by rewriting the plan:

- **Work is tracked as GitHub issues** (`github.com/Balababa2143/Boids`). A step's status
  lives there, not here.
- **If the design changes** (`spec`'s header says how), the affected steps are re-read and
  this plan is updated **only where the change makes a step wrong** — a new step, a changed
  ordering constraint, or a phase that no longer has its exit condition.
- **Phase 8 is expected to be re-entered.** Calibration is iterative by nature; it is one
  step because it is one activity, not because it is run once.

**Companion documents:** `docs/spec.md` (normative — terms used here are defined in its
glossary), `docs/design-brief.md` (the reasoning and the base-game citations),
`README.md` (repository conventions, build and invariants).

**Markers used here**, identical to the spec's:

- **[既有]** — verified against the base game or this repository.
- **[决定]** — a decision, not open for silent revision.
- **[提议]** — proposed, not decided. **A step may implement one; that does not promote it.**
- **[待定]** — deliberately open; the step that depends on it says so.
- **[待验证]** — known to be unknown; nothing may be built on it yet.
- **[goal post]** — recorded, deliberately out of scope for this programme.

**How to read this:** each phase is a milestone with an exit condition. Within a phase,
steps are ordered by dependency, not by importance. Issue numbers refer to
`github.com/Balababa2143/Boids`.

> **[既有] The gate that governs every change here.** `test/registration-manifest.test.ts`
> compares everything the mod registers against a committed baseline. **Refactoring meant to
> preserve behaviour must leave the manifest byte-identical; a change may alter it only with
> a reviewed diff.** So after a refactor, `git status` should not show the manifest. When a
> change is *meant* to alter the surface:
>
> ```sh
> UPDATE_REGISTRATION_MANIFEST=1 npm test     # registration surface
> UPDATE_PUBLIC_API=1 npm test                # published namespace
> npm run verify:full                          # typecheck + suite + full mod build
> ```

---

## Phase 0 — Foundation

**Status: delivered 2026-10-16.** Every step below is implemented and `npm run verify:full`
is green; the three deviations from the steps as written are recorded after the table, and
where the design changed, `spec` §4.4 carries the decision.

**Goal:** make the substrate honest. Nothing later is safe on a save path that does not
round-trip, or on identifiers that cannot be versioned.

**Exit condition:** coordinator state provably survives save → load in-game; the identifier
scheme, the version table and the migration chain all exist and are tested; the GUID
uniqueness test is green; and a save from a deliberately broken version is refused without
hanging the game.

**Met, with one item still needing a play session.** Everything the exit condition asks for
is implemented and covered by the suite; the "in-game" half of "provably survives save →
load in-game" is asserted through the game's own two seams in
`test/save-round-trip.property.test.ts` rather than in a running browser, which is the
strongest claim the repository's test harness can make. A single manual save → reload is
still worth doing before it is called observed.

| # | Step | Issue |
| --- | --- | --- |
| 0.1 | **Fix the coordinator's save round-trip.** It writes one global and reads another, so the round-trip has never closed. | #48 |
| 0.2 | **Close the stale UMD issue.** Already fixed in code — the build fails if a UMD wrapper returns. | #47 |
| 0.3 | **Stand up the identifier scheme** (`spec` §4.1–4.3): the mod root UUID, the namespaced-name construction, the in-code version table, `root_uuid` in the save, and recomputation at load. | new |
| 0.4 | **Add the GUID-uniqueness test** (`spec` §11, invariant 2). Collect every GUID literal under `src/` and fail on any duplicate. | new |
| 0.5 | **Stand up the migration chain** (`spec` §4.4): one numbered slot per release, the load-path gate, and a clean refusal path that reports and returns rather than throwing. | new |
| 0.6 | **Remove the leftover layer-table edit.** A personal preference with no functional contribution, meant to be commented out. Removing it takes an unexplained base-game edit out of the mod. | new |

**Delivered 2026-10-16, with three deviations from the steps as written.** They are recorded
here because the plan moves by tracking, and each is a real change to what was scheduled:

- **0.3 — the release identity is `package.json`'s semver string** (`0.5.0`), not a separate
  numbering. It is already the authority the build stamps `modbuild` from, and the two are
  now checked against each other by the build and by the suite. The **root UUID's job is
  therefore narrower than §4.1 implies**: it is not minted per release but per
  *save-breaking* release, so the version table maps each minted root to the releases that
  used it, and a release that does not intend to break saves keeps its root and adds no row.
  Without that reading the scheme contradicts itself — a root bump renames every generated
  name, so minting one per release would break saves every release.
- **0.3 — `root_uuid` is a sibling key on `KDGameData`**, not a field inside the
  coordinator's state tree. It is metadata about the *file*, while the state is the dossier
  about the character; keeping them apart is what will let route 1 (5.3) clear the dossier
  without touching the record of what produced the save.
- **0.5 — the gate confirms rather than refusing the unversioned case.** It was scheduled as
  "a clean refusal path", and that is still what it does for a save whose version is *known
  and refused* and for an unknown root. A save with **no** recorded version is a different
  finding, and it now loads on a warned confirmation: the character survives, and the
  coordinator starts from an empty dossier. The constraint behind the shape is
  **[既有]** — `KinkyDungeonLoadGame` returns a synchronous boolean and carries the caller's
  map-generation work inline, so the confirmation refuses the first attempt and re-enters the
  game's own load button rather than repeating the call. Recorded in `spec` §4.4.

**Added after the three deviations, on review and at the designer's instruction.** 0.5 grew a
second refusal shape once the chain existed to carry it:

- **A migration slot's refusal is a value with a `reason` and a `ReturnToMenu` flag.** Every
  refusal is shown, with the slot's own words; `ReturnToMenu` offers the game's own main menu,
  and is true only where staying cannot help. **Neither answer writes anything** — the gate
  refuses before the game adopts the save, so the character on disk is untouched and a release
  that understands it can still read it. `spec` §4.4 carries the decision.
- **The dialog was generalised and published** as `Boids.CommonUI.Prompt`, with the save
  wording moved to `SavePrompts`. The published surface therefore went from three namespaces to
  four, and `test/__manifest__/public-api.json` was regenerated for it — the one widening this
  phase makes, and it is for other mods' compatibility warnings rather than for content.

**Ordering constraints:**

- 0.3 and 0.4 **must precede** every later step that mints an identifier. 0.4 is in the exit
  condition because a GUID minted before the test exists is a GUID nobody is checking.
- 0.1 **must precede** 0.5: freezing a persistence shape that does not round-trip is worse
  than leaving it unfrozen.

---

## Phase 0.5 — Layout and the text surface

**Status: delivered 2026-10-17.** `npm run verify:full` is green; the deviations from the steps as
written are recorded at the end of this phase.

**Goal:** make the tree say what each folder is, and give every string the mod can put in front of a
player one declared home, one key rule, and one place it is written.

**Exit condition:** `src/Boids/` no longer exists and the arrow
`Utilities < KDInterface < KDExtension < Common < FactionMachine` is gated; every registered key is
either composed by the engine or a dotted path; the engine's group and the mod's own are separated,
with the engine half pinned against the engine's by-source translation map; a string a family shares
is authored once; the data lives in trees at their closest common root; and the registration
manifest is **byte-identical** across the reorganization while `public-api.json` moves by exactly
the demotion.

**Met.** The neutrality claim is proved rather than asserted: the manifest's blob is unchanged
across 0.5.1 and again across each step that only moved text between layers (0.5.5, 0.5.6, 0.5.7),
and the surface diff is the demotion and nothing else. The two steps that were *meant* to change the
manifest — the slot correction and the registrations that had no key at all — are reviewed diffs of
exactly those sections.

| # | Step | Issue |
| --- | --- | --- |
| 0.5.1 | **Reorganize, and demote the surface.** `src/Boids/{Futuristic,MachinePrime,DebugStart}` → `src/FactionMachine/`; `src/Boids/{CommonUI,CommonEvent}` → `src/Common/`; the mod's barrel retired into `src/Api.ts` and `src/mod.ts`; the layer-table block moved into the entry's body; the published surface demoted to `Boids.FactionMachine.*` beside `Boids.CommonUI`. `webpack/verify.ts` now requires the *namespace* export, so a build that flattened the surface fails rather than handing consumers a different `Boids`. New `test/layering.test.ts`. | new |
| 0.5.2 | **The text adapter.** `src/KDExtension/Text/`: `Tree` (the merge and the specific-to-general walk), `Data` (the scopes, the ranks, the language), `Sink` (both groups, the registry, the pin, the deferred engine pass), `Slot` (every key the engine composes), `Spec` (the authoring shape and the precedence list). | new |
| 0.5.3 | **The slot correction.** `FlavorText` stopped going to a `Flavor` suffix nothing in the engine reads, and `FunctionText` stopped going to `Desc`, the line the engine draws as flavour — so no item had a function line at all. Every slot is now registered, blank where nothing supplies it. | new |
| 0.5.4 | **Register what was only displayed**: the start perk's name and description, the two start category labels, and the four morph messages the visor and gag handlers send. | new |
| 0.5.5 | **A family authors its text once**, and a variant declares only what differs. | new |
| 0.5.6 | **Declare the four engine sources** the derived items used to read at module evaluation, which raced the engine's own text load. | new |
| 0.5.7 | **The first text trees**, at their closest common root, and the ordering rule they corrected. | new |
| 0.5.8 | **Gates**: `test/text-registry.test.ts` (the shape of the whole surface) and `test/text-tree.test.ts` (a shipped path resolves), plus the base-game text the harness needed to exercise a declared source at all. | new |
| 0.5.9 | **Docs**: `spec` §4.6, this phase, the brief's record, and the README's Text section. | new |

**Deviations from the steps as written, recorded:**

- **The newline ban was dropped.** The step that introduced it justified it by the flat `key,value`
  translation format, and the design replaced that format with bundled JSON trees — where a break is
  representable — while the visor family's four-line function block *relies* on the engine splitting
  on `\n` (`KinkyDungeonInventory.ts:1297-1302`). The convention survives where it was ever load
  bearing: a dialog's paragraphs are separate entries in `PromptSpec.Body`, because a browser
  collapses a break and the engine does not.
- **The quote-bracketing check was dropped** with the CSV reader whose behaviour justified it.
- **A tree is imported by the module that reads it**, not by the entry. The first attempt gathered
  the data at `src/mod.ts` ahead of the surface and **failed**: the suite reaches `src/Api` through
  one test file statically while the entry loads dynamically through another, the static path wins,
  and every registration resolved with no trees at all — item names came out empty and nothing threw.
- **No `Data/` folder exists for the wider scopes yet.** By the placement rule a scope's folder
  appears when it has text to share, and the faction-wide and common scopes hold prose that Phase 6
  authors. Creating them empty now would be a directory that says nothing.
- **Addressability is partial, and the reference says so.** A string is overridable by a translator
  once it has a path. The link and visor families have one, as does every string on the mod's own
  side; the hand-written item families do not, so their lines are listed in the generated reference
  as not yet addressable. Giving each family its paths is an authoring task, and it is the first
  thing Phase 6 should do.

**Ordering constraint:**

- **Phase 1 waits for this phase.** Every later phase adds text, and a step that adds a string
  before the surface exists is a string that has to be found and moved afterwards — which is the
  cost this phase exists to avoid.

---

## Phase 1 — The control model

**Goal:** replace the three-slot limiter prototype with the general control model, and give
it a router.

**Exit condition:** dimensions can be declared, registered, written with validation, and
resolved by the router — all drivable from the console, with the property suite extended to
cover the new shape.

| # | Step | Issue |
| --- | --- | --- |
| 1.1 | **Generalise the archetype store.** The closed three-member enum and its hard-coded registry become a keyed map over dimension IDs, seeded from a descriptor registry. | #19 |
| 1.2 | **Implement the descriptor registry** (`spec` §6.2): group, subsystem, facets, direction, seams with precedence, buff side, derived id. **Done when** every field of that table is present and a dimension can be added by adding one record. | #19 |
| 1.3 | **Implement the persisted shape** (`spec` §6.5): `target` / `equipment` / `config`, with the write validators of §6.6. | #19 |
| 1.4 | **Implement the router** (`spec` §6.7): provider declaration on apply, priority bidding, loser expression. | #45 |
| 1.5 | **Wire the first real selection.** Nothing currently chooses which visor to equip; **done when** the router picks one from a partial variant request, and the hard-coded choice is gone. | #40 |
| 1.6 | **Convert the remaining hand-written families** to the variant infrastructure. **Done when** no family registers restraints as repeated literals over a spread base; today `Cuff` and `Aroused` are the remaining two. | #42, #43, #30 |
| 1.7 | **Record the morphing debt** — `KDMorphToInventoryVariant` stays in use until Phase 4's projection layer replaces it. This is a tracking step, not a change. | #34 |
| 1.8 | **Implement the restraint contract** (`spec` §6.12): the `shrine` tag as the membership test, and the rule that **no equipment is recorded in the dossier and the group's capability is computed at execution time**. **Done when** adding or removing a worn item changes the resolved capability with no cached value to invalidate, and the per-facet **Free state** falls out of it (§6.10) rather than being tracked. **Partly implemented already** — `Coordinator/Public/Event.ts` and `Coordinator/Internal/State.ts` hold the registration half. | new |

**Ordering constraints:** 1.1 and 1.2 precede 1.3; 1.3 precedes 1.4; 1.5 needs 1.4.

> **The debug tick driver is not retired here.** It is currently the *only* input to the
> sensory limiters, and it advances game time from inside tick dispatch. Its replacement is
> the router **plus** the Phase 3 sensory work, so retiring it is **3.1**. That keeps this
> phase's exit condition honest.

---

## Phase 2 — Behavior Control

**Goal:** the first shipped subsystem, because the fantasy is hollow without it and its
seams are the cheapest available.

**Exit condition:** a character's action boundary can be set, denied, and re-granted through
equipment, with arousal dynamically controllable — and the base game's own restraint
baseline intact when the Host is set to Free.

| # | Step | Issue |
| --- | --- | --- |
| 2.1 | **Bind the gate to the base game's own bound-checks.** Drive `getArmsBound` / `getHandsBound` through their `forceResult` seam, **including `forceResult = false`** — the direction no base-game caller uses, which is what makes a bound character able to act. | #19 |
| 2.2 | **Bind the action chokepoint.** Wrap the input registry so actions can be vetoed, and look up the relevant dimensions. | new |
| 2.3 | **Implement the arousal gate** (`spec` §6.11) through the movable player tags, expressing it as "the Host may deny". | new |
| 2.4 | **Implement the substitution whitelist** and the write rule that `OverrideAllowed` requires equipment capability (`spec` §6.4, §6.6). | new |
| 2.5 | **Wire the non-verbal reinforcement channel** (`spec` §9.1): direct perception of the Host is UI feedback, never text. | new |
| 2.6 | **Decouple restraint strength from the item.** Ship the declarative fields at a loose baseline and have the controller apply the real strength, so an item is not born strict. **Done when** invariant 12 holds: the character's baseline lives in the Coordinator, no baseline value is stored on an item, and removing every item returns the character to the never-equipped state field for field (`spec` §11). | new |

**Ordering constraints:** 2.1 and 2.2 are independent of each other and both need Phase 1;
2.4 needs 2.1's gate values to exist; 2.6 needs 1.3.

> **[决定] Invariant 12 is established here and honoured everywhere after.** Removing equipment
> must **release** an override, never **restore** a value that the removal destroyed — so the
> baseline may not live on an item. This is cheap to honour at 2.6 and expensive to retrofit
> later, and it is what makes the final act's reversibility free rather than a restore path
> (§6.10).

---

## Phase 3 — Sensory Control

**Goal:** the second subsystem, and the one whose prototype already exists.

**Exit condition:** sight, hearing and range are constrainable per dimension through the
router, with the known seam precedence handled explicitly.

| # | Step | Issue |
| --- | --- | --- |
| 3.1 | **Rewrite the sensory limiter layer** on top of the Phase 1 store, and **retire the debug tick driver**. Keep the existing state accessors — they are correct and property-tested — and replace the limiter layer above them. The tick driver goes because this is the step that finally gives the limiters a real writer. | #19 |
| 3.2 | **Handle seam precedence explicitly.** Some perception values are written by an early seam and overwritten by a later one; the descriptor must name every seam and its order, and a partial implementation must be a **loud** failure rather than a silent one. | new |
| 3.3 | **Wire the deafener.** The slot's schema, guard and round-trip all exist and no item has ever emitted it; today the headphone sets a static `deaf: 2` instead. **[待定]** The source discussion recorded this as *not decided*; wiring it is the obvious first customer for the keyed store, so it is scheduled here as the cheap test of whether the store earns its keep. | new |
| 3.4 | **Wire spell range** — **done when** a dimension can change the range the game reports for a spell, with no other consumer involved. | new |
| 3.5 | **Add the numeric buffs.** Numeric buffs reuse the same `calc*` seams read in the other direction. | new |
| 3.6 | **Add map-unit marking.** The base game has an in-repo template for this: a calculation seam decides *what* to mark, a flag marks it, and a minimap handler renders it. | new |
| 3.7 | **Add shared vision** — seeing what an allied doll sees. This is **real rendering work** and should be scheduled as its own milestone, not as part of 3.5 or 3.6. | new |

**Ordering constraints:** 3.1 needs 1.4 and must precede 3.2–3.7; 3.5–3.7 are independent
of each other, and 3.7 is the only one expected to be large.

---

## Phase 4 — Equipment evolution

**Goal:** the progression that makes the player hand their character over by hand.

**Exit condition:** equipment upgrades from loose-and-unlocked to sealed-and-permanent
through a table-driven quest chain, and projections appear as servitude progresses.

> **[goal post] The morphing cleanup is *not* in this phase's exit condition.** Consolidating
> the three legacy routes into one projection layer is a **standing invitation** (`spec`
> §6.8), not a dependency. Steps 4.2 and 4.3 below are recorded because they are real
> defects, and they are **deferred with the consolidation** — the one hard rule is that new
> code may not add a fourth route (`spec` §11, invariant 8).

| # | Step | Issue |
| --- | --- | --- |
| 4.1 | **Build the projection layer** (`spec` §6.7): projection gated on progress, applied **retroactively** to already-worn items. | new |
| 4.2 | ***(deferred)* Make morphing mint derived ids.** Today it mints a random variant name on every morph, which grows the variant registry and defeats the versioning scheme. | new |
| 4.3 | ***(deferred)* Fix the unbinding glitch.** One morphing branch removes and re-adds the restraint, so the wearer is briefly unbound. | new |
| 4.4 | **Implement the evolution ladder** (`spec` §8.2): craft a lock, upgrade parts, make it permanent, with the two upgrade axes bound as specified. **Needs 4.6** — the permanence stages need a real curse. | new |
| 4.5 | **Build the quest framework** (`spec` §8.3): functional classes, a table of mini quests per class, and a quest coordinator built alongside the controller. | new |
| 4.6 | **Register the minimal curse the ladder needs — kind 1 only** (`spec` §6.9). Its `condition` is unsatisfiable everywhere **except the final room**, which is what makes it a real seal in the world and a liftable one where the choice is made (§6.10). **Kind 2 belongs to Phase 5** (5.5). The `KDCurses` registry is fully injectable and Boids has never touched it. | #27 |
| 4.7 | **Implement auto-equip / dependent-item linking** as a projection-layer consumer rather than a separate mechanism. | #33, #41 |
| 4.8 | **Implement self-locking over time** as an evolution stage rather than a timer. | #32 |
| 4.9 | **Make links morphable** through the projection layer. | #37 |

**Ordering constraints:** 4.1 precedes 4.7 and 4.9, which are consumers of it. 4.2 and 4.3
need 4.1 to exist before they can be fixed through it. 4.4 needs 4.6 and 4.5.

> **[待定] 4.4 and 4.8 depend on design that is not yet settled.** The ladder's concrete
> stages are specified (`spec` §8.2) but not authored, and "self-locking **as an evolution
> stage rather than a timer**" is an inference from the ladder's shape rather than a
> decision — issue #32 says only "item self locking after several turns". Confirm before
> building it.
>
> **[决定] 4.4's third stage is a *kind-1 curse* and nothing else** (`spec` §6.9, §8.2): its
> `condition` is unsatisfiable anywhere in the world except the final room. **Do not
> implement it as an unliftable lock** — a lock can be destroyed (§D.3), so it does not seal,
> and it has no `condition` for the room to satisfy later. **The ladder's "permanent" and the
> final act's obstacle are the same mechanism**, which is why 4.4 must not invent its own.

---

## Phase 5 — `Being Filed`

**Goal:** the ending.

**Exit condition:** a filing quest can be accepted when its conditions hold, played to the
fixed ending — **either route** — with the struggle produced by the Controller's injected
ceiling rather than a bespoke formula; the character is exported to the archive on route 2,
or cleared and returned to the world map on route 1; **a player who loses the struggle can
still commit**; and the filed state survives save and load.

| # | Step | Issue |
| --- | --- | --- |
| 5.1 | **Implement the entry conditions** (`spec` §8.4): capability coverage as **subset**, suppression thresholds as **at least**, and the equipment-is-finished check evaluated at the controller layer. **Done when** each of the three can be tested independently and a failing condition names which one failed. | new |
| 5.2 | **Implement the room and its sequence** (`spec` §6.10): the leash entry with **no world-map entrance**, control returning to the player, the **frictionless kind-1 lift** (a button — no test, no cost, no roll), and the **free phase**. | new |
| 5.3 | **Implement route 1 — leave.** Set the entry condition (no **controlled** equipment worn or carried, evaluated from the controller's authoritative set) and commit on interacting with the **door**: **clear the dossier, destroy the controlled items, then teleport to the world map at the stairs — in that order** (invariant 15). **Done when** the character returns with her native abilities usable and the §8.1 ritual cost still reopenable — i.e. what was cleared was the dossier, not the baseline (`spec` §11, invariant 12). | new |
| 5.4 | **Implement route 2 — descend.** Set the entry condition (`spec` §8.4's, with the lock requirement relaxed to **decorative locks**) and commit on interacting with the **`furniture`**: **one atomic replacement** of every decorative lock and **the `furniture`'s own restraint** into **kind-2 curses**, then the seal. **[既有]** The furniture is a map doodle that applies a restraint in the **`ItemDevices`** group (`spec` §6.9), so the curse goes on **that restraint** — no new curse carrier is needed, and no special case. | new |
| 5.5 | **Register the two curse kinds** (`spec` §6.9) as separate registry entries with **distinct `condition`s**: **kind 1** unsatisfiable everywhere except the room, **kind 2** with none. **Kind 1 must also supply a `remove` hook that returns `false`** (`base/KDTypeDefs.ts:3965-3966`), so lifting the curse **clears it and leaves the equipment worn** instead of stripping it (`item/KDCurse.ts:1051, 1071, 1087`). **Done when** the post-lift state is *worn, uncursed* — which is the state step 5.2's struggle needs, and which no base-game path produces. | #27 |
| 5.6 | **Inject the Controller ceiling that makes the struggle real** (`spec` §6.10, step 4): while any controlled item is worn, drive the dimensions it covers to **the highest suppression that still leaves removal possible** — *hard, not closed*, because a refusal outside the two commits is a bug (invariant 13). When the **last controlled item covering a facet leaves the body**, that facet drops to its **`Free` value** (`Rate.target = 0`, `Gate.Intent = Free`). **Done when** the peak is produced entirely by these injected values, with **no bespoke struggle formula**, and the Free state is what lets the free phase change equipment at will. | new |
| 5.7 | **Implement the decorative lock by intercepting the self-lock feature** (`spec` §6.10): wrap or replace `KinkyDungeonSpellSpecials["Lockdown"]` (`KinkyDungeonMagicCode.ts:19, 651-681`) so that in-room it applies a Boids-registered `"Decorative"` entry in `KDLocks` instead of `"Purple"` — **required, not cosmetic**, because `KDLockableRestraints` skips every cursed item (`KinkyDungeonRestraints.ts:1264-1267`) and every controlled item is cursed at entry. Re-label the element's icon and text in-room. **Done when** every controlled piece satisfies `KinkyDungeonIsLockable` (`:697-700`), so no piece is un-lockable and route 2 is reachable for the whole set; and the lock is applied **after** the lift, since curse and lock are mutually exclusive (`:5016-5018`). | new |
| 5.8 | **Implement the two sync hooks** (`spec` §8.4) and the character export to `localStorage` (`spec` §8.5). | new |
| 5.9 | **Make the filed state robust.** **Done when** a filed character can be saved, loaded, and acted-upon with a no-op action, and the archive is byte-identical before and after. | new |
| 5.10 | **Implement the repeat-entry skip criterion** (`spec` §8.3): a quest is skippable when it yields **knowledge or a key**, and must be redone when it yields a **physical** thing. **Depends on the two-part Coordinator state** (`spec` §5, §7.1): route 1 clears the **dossier** and must **keep quest metadata**, so the allocator can tell what has already been done. | new |

**Ordering constraints:** 5.1 needs Phase 4 complete (condition 3 asks whether the equipment
is finished); 5.2 needs 5.5; 5.3 and 5.4 both need 5.2 and 5.5, and 5.4 additionally needs
5.7; 5.6 needs 5.2; 5.8 and 5.9 need 5.4; 5.10 needs 5.3 to exist, since it exists only
because route 1 destroys everything.

> **[决定] There is no escape formula to design.** The peak comes from the Controller's
> injected ceiling (5.6) running the base game's own struggle calculations — so 5.6 is
> implementation. **Do not author a bespoke struggle curve.**
>
> **[决定] And the peak's calibration is not a Phase 5 step.** It needs playtesting, so it is
> **the last step of the programme — 8.1** — and it is the only thing standing between the
> finished mod and a release.

---

## Phase 6 — Content and breadth *(ongoing)*

**Goal:** fill the framework, and expand horizontally.

**This phase has no exit condition.** It is the standing backlog: content is added as it is
authored, and it never "completes". Nothing here blocks any earlier phase.

| # | Step | Issue |
| --- | --- | --- |
| 6.1 | **Additional `Futuristic` equipment assets** — the remaining gaps in the outfit layer. | #26, #3 |
| 6.2 | **Additional link assets and the connection ports.** **[既有]** Two sprites already ship with **no code referencing them**: `Models/Boids/Futuristic/Cuff/WaistCuffPort/PortBase.png` and `PortGlow.png` (both in `BoidsAsset0.json`). They are the drawn half of the wrist-to-waist link. | #29, #9 |
| 6.3 | **Gloves** — a hand item family for the futuristic set. | #21 |
| 6.4 | **A body-coating collar.** | #25 |
| 6.5 | **Headphone assets for the remaining ear shapes.** | #28 |
| 6.6 | **New sub-factions** — **[goal post]**, deferred with `spec` §10: the mechanism layer ships first. Three are on record as the eventual targets. | new |

---

## Phase 7 — Optional base-game patch mod

**Goal:** capture the value of upstream changes without making Boids depend on them.

**Exit condition:** a separate mod exists that patches the game, Boids runs identically
without it, and every patched path has a working unpatched counterpart.

| # | Step | Issue |
| --- | --- | --- |
| 7.1 | **Scaffold the patch mod** as a separate repository/package, load-ordered ahead of Boids. | new |
| 7.2 | **Patch a gag calculation event** so speech becomes grantable instead of hard-coded. | #44 |
| 7.3 | **Patch richer dynamic chastity**, beyond what the movable tags reach. | new |
| 7.4 | **Patch a weapon-side lock**, if the design still wants one. | new |
| 7.5 | **Document the optionality.** Each patched path names its unpatched fallback. | new |

**Policy:** this phase is **never** a blocker for Phases 0–6, and Phase 8 does not need it.
If the patch never ships, the mod is smaller and everything still works.

---

## Phase 8 — Calibration, by playtest

**Goal:** set the numbers that only play can set. **This phase exists because one value in the
programme is deliberately left open, and it cannot be decided on paper.**

**Exit condition:** the final act's peak has been played enough times to be trusted — it is
the mod's hardest moment, it is winnable, and **losing it leads somewhere rather than
nowhere.** The owner has signed off on the numbers.

| # | Step | Issue |
| --- | --- | --- |
| 8.1 | **Calibrate the final act's peak** (`spec` §6.10, §12). Tune the Controller's ceiling (5.6) until the struggle is the hardest passage in the mod **and still winnable**, and verify the fallback end to end: **a player who cannot break free can still lift, fit decorative locks, and commit via route 2.** **Done when** invariant 13 is demonstrated in play, not asserted — no ceiling value leaves removal impossible. | new |

**Ordering constraints:** 8.1 needs **everything** — the room (5.2), the ceiling (5.6), the
decorative lock (5.7) and both commits (5.3, 5.4) — because there is nothing to calibrate
until they exist. **It is the last step of the programme and the only one gated on feel.**

> **[决定] Why this is not a Phase 5 step.** It was one, and it was moved here on the
> designer's instruction: **calibration requires playtesting**, and playtesting requires the
> room to exist. A tuning step that sits inside the phase that builds the thing it tunes gets
> either skipped or guessed.

> **[既有] What is *not* open here.** The mechanism is fully specified — the base game's own
> struggle system, driven by the Controller's ceiling, with **no bespoke curve to author**
> (`spec` §6.10). Only the ceiling's value is undecided. **Do not treat this phase as licence
> to redesign the struggle.**

---

## Cross-cutting rules

| Rule | Consequence |
| --- | --- |
| Refactors preserve the registration manifest | regenerate only when the surface is *meant* to change, and review the diff |
| A new test file must be added to `test/run-all.ts` | the self-check fails otherwise |
| Moving a variant-key field requires a migration | the key is a persisted format; it is expensive to move, not immovable |
| A new handler GUID must be globally unique | a duplicate **registration** throws at load, not at test time |
| Never mint a random id where a derived one is possible | it is unversionable forever |
| Restraint and control state derives from one baseline held by the Coordinator | never store a baseline value on an item, or removing the item loses it — and rollback becomes a restore instead of a release |
| Advancement makes leaving harder, never impossible | only the final act's two commits are irreversible; every other step needs a defined non-refusing route back |
| A kind-2 commit is one atomic replacement | no reachable state leaves some worn items sealed and others unsealed |
| Clear the dossier before the exit teleport | otherwise a save can be taken mid-transition |
| A layer sorting group is a load-time decision | settle the silhouette plan before the art exists |
| Boids degrades, never breaks, without the patch mod | Phase 7 is optional by construction |

## Issue map

Two columns, because a phase's work is partly tracked as GitHub issues and partly as work
this plan creates. **The `New work` column names the issues that must be opened.**

| Phase | Existing issues | New work |
| --- | --- | --- |
| 0 — Foundation **(delivered)** | #48 **(closed by 0.1)**, #47 | identifier scheme + version table, GUID uniqueness test, migration chain, remove the leftover layer edit — **all delivered; the GitHub issues for the `new` work still have to be opened and closed** |
| 1 — Control model | #19, #45, #40, #42, #43, #30, #34 | — |
| 2 — Behavior Control | #19 | action chokepoint, arousal gate, substitution whitelist, reinforcement channel |
| 3 — Sensory Control | #19 | seam precedence, deafener wiring, spell range, numeric buffs, map marking, shared vision |
| 4 — Equipment evolution | #27, #33, #41, #32, #37 | projection layer (the morphing consolidation and its two fixes are **deferred**) |
| 5 — `Being Filed` | #27 | the room and its sequence, both commits, the two curse kinds, the decorative-lock interception, **the Controller ceiling**, sync hooks, filed-state robustness, the repeat-entry skip criterion |
| 6 — Content and breadth *(ongoing)* | #26, #3, #29, #9, #21, #25, #28, #20 | new sub-factions |
| 7 — Optional patch mod | #44 | patch-mod scaffold, richer dynamic chastity, weapon-side lock |
| 8 — Calibration, by playtest | — | the peak's calibration |

> **[既有] Every `new` in this table is an issue that does not exist yet, and the numbers a
> reconciliation opens are the only ones this plan can cite.** The *exit* work (the room, its
> two commits, the two curse kinds, the decorative lock, the Controller ceiling, the
> repeat-entry criterion, the calibration) postdates the identifier-and-control reconciliation
> and has **no issue numbers**; opening them is a freeze-time chore, not a design gap.

> **Reassigned from the design brief's triage.** #20 (the quest line) was called *content*
> there and is content here too — it is the first thing Phase 6's quest framework gets
> filled with, not framework work. #27 (custom locks and curses) was called "not on the
> critical path" there, and is required here in a **narrow form only**: the two curse
> *kinds* (`spec` §6.9) — **kind 1** for the equipment, in Phase 4, and **kind 2** for the
> commit, in Phase 5. The broader lock-and-curse content stays in Phase 6.
