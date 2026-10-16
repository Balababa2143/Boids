# Boids — Development Plan

**Status:** **FROZEN — 2026-10-16.** The ordered work programme. It sequences the work
`design/spec.md` defines; it does not restate the spec.

**How this document changes now.** It is a **schedule**, so it is expected to move — but it
moves by **tracking**, not by rewriting the plan:

- **Work is tracked as GitHub issues** (`github.com/Balababa2143/Boids`). A step's status
  lives there, not here.
- **If the design changes** (`spec`'s header says how), the affected steps are re-read and
  this plan is updated **only where the change makes a step wrong** — a new step, a changed
  ordering constraint, or a phase that no longer has its exit condition.
- **Phase 8 is expected to be re-entered.** Calibration is iterative by nature; it is one
  step because it is one activity, not because it is run once.

**Companion documents:** `design/spec.md` (normative — terms used here are defined in its
glossary), `design/design-brief.md` (the reasoning and the base-game citations),
`AGENTS.md` (repository conventions, commands, build and invariants) and `docs/guide/`
(the explanations behind them).

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

**The GitHub milestone that carries this plan is `v0.5.0: Machine Prime (mvp)`**, and it holds
**Phases 1–5 plus Phase 8** — the delivery of the frozen design. Phase 6 is an open-ended backlog
with no exit condition and Phase 7 is optional by construction, so neither is in the milestone; a
phase being absent from it is not a statement about its priority.

> **[既有] The gates that govern every change here.** Most of the suite is behaviour and
> invariants. `test/registration-manifest.test.ts` additionally compares what the mod registers
> against a committed **summary** — per-section counts and per-entry digests — so a dropped model,
> a renamed restraint, or a payload that moved under an existing name fails, naming the entry.
>
> **[决定] Phase 0.6 split the checks that force a regeneration out of the workday gate.** They run
> under `--audit`, which `npm run verify:full` passes, and are reported as *skipped* otherwise, so a
> run that did not compare a generated artifact cannot read as one that did. The full 437 KB record
> is no longer tracked: it was the equivalence proof for a rearrangement, and there are no
> behaviour-preserving rearrangements left to gate.
>
> ```sh
> npm run verify                   # the workday gate: typecheck + suite
> npm run test:update-manifest     # registration summary, when the surface is meant to move
> npm run test:update-api          # published namespace
> npm run test:update-text         # text reference, before a release
> npm run docs:api                 # the TypeScript reference for the published surface
> npm run verify:full              # typecheck + suite with audits + full mod build
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
| 0.3 | **Stand up the identifier scheme** (`spec` §4.1–4.3): the mod root UUID, the namespaced-name construction, the in-code version table, `root_uuid` in the save, and recomputation at load. | #50 |
| 0.4 | **Add the GUID-uniqueness test** (`spec` §11, invariant 2). Collect every GUID literal under `src/` and fail on any duplicate. | #51 |
| 0.5 | **Stand up the migration chain** (`spec` §4.4): one numbered slot per release, the load-path gate, and a clean refusal path that reports and returns rather than throwing. | #52 |
| 0.6 | **Remove the leftover layer-table edit.** A personal preference with no functional contribution, meant to be commented out. Removing it takes an unexplained base-game edit out of the mod. | #53 |

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
| 0.5.1 | **Reorganize, and demote the surface.** `src/Boids/{Futuristic,MachinePrime,DebugStart}` → `src/FactionMachine/`; `src/Boids/{CommonUI,CommonEvent}` → `src/Common/`; the mod's barrel retired into `src/Api.ts` and `src/mod.ts`; the layer-table block moved into the entry's body; the published surface demoted to `Boids.FactionMachine.*` beside `Boids.CommonUI`. `webpack/verify.ts` now requires the *namespace* export, so a build that flattened the surface fails rather than handing consumers a different `Boids`. New `test/layering.test.ts`. | *(delivered)* |
| 0.5.2 | **The text adapter.** `src/KDExtension/Text/`: `Tree` (the merge and the specific-to-general walk), `Data` (the scopes, the ranks, the language), `Sink` (both groups, the registry, the pin, the deferred engine pass), `Slot` (every key the engine composes), `Spec` (the authoring shape and the precedence list). | *(delivered)* |
| 0.5.3 | **The slot correction.** `FlavorText` stopped going to a `Flavor` suffix nothing in the engine reads, and `FunctionText` stopped going to `Desc`, the line the engine draws as flavour — so no item had a function line at all. Every slot is now registered, blank where nothing supplies it. | *(delivered)* |
| 0.5.4 | **Register what was only displayed**: the start perk's name and description, the two start category labels, and the four morph messages the visor and gag handlers send. | *(delivered)* |
| 0.5.5 | **A family authors its text once**, and a variant declares only what differs. | *(delivered)* |
| 0.5.6 | **Declare the four engine sources** the derived items used to read at module evaluation, which raced the engine's own text load. | *(delivered)* |
| 0.5.7 | **The first text trees**, at their closest common root, and the ordering rule they corrected. | *(delivered)* |
| 0.5.8 | **Gates**: `test/text-registry.test.ts` (the shape of the whole surface) and `test/text-tree.test.ts` (a shipped path resolves), plus the base-game text the harness needed to exercise a declared source at all. | *(delivered)* |
| 0.5.9 | **Docs**: `spec` §4.6, this phase, the brief's record, and `docs/guide/text.md`. | *(delivered)* |

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

## Phase 0.6 — Retire the refactor-era gates

**Status: delivered 2026-10-17.** `npm run verify:full` is green.

**Goal:** stop taxing ordinary content work with artifacts that only a rearrangement needed, without
losing the ability to detect an unintended change.

**Exit condition:** the workday gate passes after a content change with no artifact regeneration; the
delivery gate still fails on a stale generated artifact; and the tracked baseline is small enough
that a one-item change is a diff someone actually reads.

| # | Step | Issue |
| --- | --- | --- |
| 0.6.1 | **The registration record becomes a summary.** `registration-summary.json` — 345 lines, 20.7 KB — holds per-section counts and per-entry digests. The 437 KB record it replaces leaves tracking and is written on demand by `npm run test:audit`, which also holds the surface to it byte for byte when a copy has been kept. | *(delivered)* |
| 0.6.2 | **The text reference leaves the workday gate.** Presence and slot coverage stay on every run; the byte comparison moves to the delivery gate, because a translator deliverable should not force a 40 KB regeneration on every reworded string. | *(delivered)* |
| 0.6.3 | **Content-coupled assertions become properties.** `text-tree` asserts that every slot the registry reports as tree-sourced still resolves there, instead of naming five shipped strings; `mitten-layers` asserts that a band swaps **iff** it is a common band or a forearm band, instead of a hand-maintained count table. | *(delivered)* |
| 0.6.4 | **Three subsumed tests removed**: `variant-map`'s `infrastructure surface` block, whose length check restated the module under test, and `save-prompts`' registration check, which `text-registry` already performs over the whole surface. | *(delivered)* |
| 0.6.5 | **Regeneration is platform-neutral.** The `UPDATE_*=1` environment spells were a bash-ism; they are argv flags read by `test/harness/flags.ts`, with an npm script for each. | *(delivered)* |

**Deliberately kept**, having looked at each: the enumerated GUID list — one line per new hand-written
identifier, and the only thing that makes one deliberate — the `SharedGuidExceptions` allowlist whose
own failure message points at it, and `release`'s "no refusal in any shipped slot yet", which is a
deliberate-decision tripwire that retires at the first breaking release.

---

## Phase 1 — The control model

**Status: delivered 2026-10-17, reopened for the correction recorded as steps 1.9–1.14, and
delivered again 2026-10-17.** The first delivery is green and is described below. The correction is
not an extension of it: it **retracts** one of the decisions that delivery shipped — `Form` — and
with it the belief that the body has dimensions of its own. It was tracked here rather than as a new
phase because it is the same control model being finished, and because every phase after this one
reads the model it leaves behind. **The correction is now in the code**: steps 1.9–1.14 are
implemented, the registry holds twenty-three dimensions, `npm run verify:full` is green at 220 tests
over 44 suites, and the deviations from the steps as written are recorded at the end of this phase,
including the one the implementation turned up and did **not** settle.

**Goal:** replace the three-slot limiter prototype with the general control model, and give
it a router.

**Exit condition:** dimensions can be declared, registered, written with validation, and
resolved by the router — all drivable from the console, with the property suite extended to
cover the new shape.

**Met.** The first delivery declared eighteen dimensions by one catalogue and one descriptor
registry — **1.9 makes it twenty-three** — with the descriptor's every §6.2 field present and
validated at registration *and* over the whole registry by a test; the dossier is two sparse keyed
maps with the §6.6 rules enforced at write time — including the **(shape)** rule, which refuses a parameter the dimension's facets do not
take; the router resolves one dimension by power bid, clamps to 0..1, reports its losers, and is
exercised both as a case and as a property. The console reaches all of it through
`Boids.FactionMachine.MachinePrime.Coordinator`.

**The exit condition that is only partly met, stated rather than glossed.** The router is drivable
from the console and nothing else: **no dimension is bound to a game seam by this phase.** That is
the deviation below — it is the ordering the plan already carried (3.1 is where the sensory limiter
layer is rewritten on top of the store), but it means "resolved by the router" currently means
"resolved", not "applied".

| # | Step | Issue |
| --- | --- | --- |
| 1.1 | **The archetype store generalised.** The closed three-member `ItemArchetype` enum and its hard-coded registry are a keyed map over dimension ids, seeded from the catalogue. | #19 |
| 1.2 | **The descriptor registry** (`spec` §6.2): group, subsystem, facets, direction, seams with precedence, buff side, derived id. A dimension is added by adding one record and one name; the registry, the router and the store are total over it. | #19 |
| 1.3 | **The persisted shape.** `{ intent, config }` as sparse keyed maps, with §6.6's write validators enforced before the write. | #19 |
| 1.4 | **The router** (`spec` §6.7): provider declaration on apply, bidding by power, loser reporting, and a selection helper for choosing which provider to wear. | #45 |
| 1.5 | **The first real selection.** The visor and gag families declare themselves providers; `DebugStart.AddDroneSet` presents its two glass families as candidates and equips the one the Host's demand can be honoured on, with the hard-coded choice gone. | #40 |
| 1.6 | **The remaining hand-written families converted** — `Cuff` (eight restraints and eight models) and `Aroused` (chastity and toys) — to the variant infrastructure. No family registers restraints as repeated literals any more. | #42, #43, #30 |
| 1.7 | **The morphing debt recorded** — `KDMorphToInventoryVariant` stays in use until Phase 4's projection layer replaces it, and no fourth route was added. | #34 |
| 1.8 | **The restraint contract** (`spec` §6.12): the `shrine` tag as the membership test, and no equipment recorded in the dossier — so adding or removing a worn item changes the resolved capability with nothing to invalidate, and the per-facet **Free state** falls out. | #70 |
| 1.9 | **The decomposition recorded, and the body-part dimensions refused.** Twenty-three dimensions, four facets. `Defense`, `Interaction`, `PoseArms`, `PoseLegs` and `Noise` are declared because each was a real mechanism hiding inside another dimension's property, or a real consumer with no dimension at all; `Attack`, `Casting` and `Movement` gain a `Rate` because the base game applies a continuous penalty to all three. **There is no `Arms` dimension and no `Hands` dimension** — an arm restraint is a set of bids on the capabilities its effects actually reach. | #19 |
| 1.10 | **`Form` retracted.** The facet was the previous delivery's answer to *size and force are separate axes*, and it was the wrong answer: appearance is a property of the item (§6.12 clause 4), not a Host demand. `Form`, its intent parameter, the provider's `Size` and the router's size fields all go; an item declares its own appearance beside its own bid, and the muffler reads its own declaration. **The Host loses the cosmetic lever**, which is the point rather than a loss. | #19, #45 |
| 1.11 | **`Posture`, `PoseKey` and the pose route, declared.** A body configuration is a set, so it is the one facet whose value is a set and whose `Free` is not "nothing"; the route runs **directly from the controller to the game's pose system** and never through a restraint, with eight normative rules (`spec` §6.13). The module ships **declared and unbound**, exactly as every seam does. | #19, #45 |
| 1.12 | **The seam record gains a kind, and every `Rate` dimension gains an engine value map.** The base game has four algebras rather than one — an addition (`calcDeaf`), an absolute value (`calcBlind`), a multiplier (`calcHearing`) and a **replacement** with no event at all (the pose availability functions) — while `Rate` is uniformly 0..1 in the model and no base-game quantity is on that scale. | #45 |
| 1.13 | **A bid declares how it stacks.** `Max` and `Sum`, because the base game's aggregates disagree with one another: `gag` sums, a blind level counts *and* takes a maximum, a deaf level is a weighted maximum plus a weighted sum. **A third mode for counting was drafted and then removed** — see the deviation below — because a count aggregates the number of items rather than what they say, and nothing this mod builds is a fixed-value restraint. `Posture` is the exception that proves the field is per-facet — it has no numeric aggregate at all, and combines by **intersection** so that the worn set can always draw the pose it permits. | #45 |
| 1.14 | **The two rules the model was missing.** **Dimensions do not contract for interaction** — a seam may read anything, but nothing may rely on it and no test may assert it, so the base game's real couplings are recorded as *unspecified* rather than modelled. And **there are two grant channels**: `OverrideAllowed` is checked against the channel the dimension actually has, so invariant 6 holds for a posture dimension without there being a `CapabilityKey`. | #19, #45 |

**Deviations from the steps as written, recorded:**

- **1.3 — `equipment` is not persisted at all, and `spec` §6.5 has since been revised to say so.** §6.5's
  prose said the equipment's capability is *computed at execution time* and that the group is never
  recorded (§6.12 clause 4), while its shape block carried an `equipment` key. The two could not both
  hold. What ships is **`{ intent, config }`**: there is no Host-owned ceiling, so there is nothing for a
  target to exceed, and §6.5's *"`target > equipment` is legal"* and §6.6's matching row described a
  conflict that no longer exists. **The spec revision this note asked for was made by the owner**: the
  `equipment` key is gone and §6.5 states that there must not be one.
- **1.3 — an intent is a *record*, and the first delivery had it as an enum.** This is a **corrected
  implementation error**, recorded because it was the kind that reads as working code: `intent` was
  typed `IMMap<DimensionId, GateIntent>`, so the Host's demand for a rate dimension could only be `Free`
  or forbidden — *"squeeze sight to 0.4"* had no representation at all, and the continuous half of the
  control model was simply absent. §6.5's own correction says what it should have been: a demand is a
  **composition of the parameters its facets take** (`{ Target }`, `{ Intent }`, or both), which
  `FacetIntentParameters` now derives from the descriptor so the write rule cannot drift from the
  catalogue. Three consequences: the router takes **the stronger of the Host's demand and the equipment's
  capability** rather than deriving a severity from the equipment alone; §6.6's **(shape)** rule became
  meaningful and is implemented (a parameter the dimension does not take is refused, not stored and
  ignored); and the debug driver's `SetBlindStrength`/`SetGagStrength` take a value again, which is what
  makes the continuous behaviour playable before Phase 3.1 replaces the driver.
  **§6.6's *"`Free` may not carry a non-zero derived `Target`"* stays a property rather than a write
  validator**, and this is now a reason rather than an excuse: the gate and the rate are different facets
  of one demand, and the resolved severity is the stronger of the demand and what is worn, so no single
  write can establish what a gate resolves to. The property asserts it over every resolution.
- **1.3 — `Form` was added, and a provider declares size apart from force.** A demand carries *how big the
  thing imposing it looks* as well as *how hard it squeezes*, because the base game's `gag` property is one
  number that drives the mechanics **and** selects the model — so a larger ball there is necessarily a
  stricter one, and *a small ball on a strict mechanism* was not expressible. `Form` contributes `Size` and
  `Rate` contributes `Target`; a provider declares `Size` beside `Power` through its own declaration, and a
  provider that omits it offers its power as its size, which is the base game's convention for the families
  that want it. **`Speech` therefore composes `Rate` + `Form` + `Gate`** rather than being a pure
  permission: the rate is how strictly the mouth is filled, the form is how large the model is, and the
  gate is whether speech is denied or re-granted — the three are orthogonal, so a wearer can talk through a
  prosthesis with her mouth still visibly full. The muffler's display size reads the resolved `Size` rather
  than the resolved severity, which is the decoupling this step exists for.
- **1.8 — the base game's gag sum is *not* bound to `Speech` in this phase.** The inventory of
  `KinkyDungeonGagTotal` (`KinkyDungeonStats.ts:2209`) and its 34 direct consumers shows the property is
  three quantities in one: the sum every mechanic reads, a per-item enemy silence, and a boolean tag — with
  thresholded readers at `0.01`, `0.05`, `0.25`, `0.9` and `0.99` that a continuous rate crosses. Binding
  that onto the dimension means writing the restraint's own `gag` from the resolved value, which is the
  limiter layer and therefore **Phase 3.1**. This phase ships the shape and the display decoupling; until
  3.1 the muffler's *mechanical* effect is still the base game's own `gag` on its template.
- **1.2 — every seam is declared and none is bound.** `Seam` carries `Verified`, which says whether
  its trigger was read out of the engine or is still a hope, and the test suite fails if the whole
  catalogue ever claims verified. `Sight`, `Hearing`, `SpellRange` and `Arousal` are verified
  (their triggers were read); `Behavior`'s remaining dimensions and all of `Stats` are not. The
  consequence is the honest one: the property suite covers the model, and no dimension affects play
  yet.
- **1.2 — `CapabilityKey` ships empty.** §3.2 rules speech, `immobile` movement and noise
  ungrantable, and every remaining grant-capable dimension's seam is Phase 2's, so the closed union
  is empty with a **compile-time emptiness proof** in `KDExtension/Control/Capability.ts` that fails
  the moment a key is added without its dimension. This already refuses `OverrideAllowed`
  everywhere, which is the one write rule Phase 1 can reach.
- **1.6 — the converted families' names changed and are not migrated.** Their restraints and models
  were hand-written GUIDs, so the conversion had to mint derived names. Nothing is migrated because
  **0.5.0 has not shipped**: there is no save in the world that resolves the old names, and the
  unversioned-save gate refuses anything older than this release anyway. From the first release
  onward this is a migration, which is why the new bases are named in `KDExtension/Release.ts`
  beside the rule.
- **1.4 — a selection helper, not only resolution.** §6.7's router answers for one dimension;
  choosing *which item to wear* is a question about a set of dimensions at once. `SelectProvider`
  is that predicate, kept thin and separate rather than folded into the router, and it is what 1.5
  consumes.
- **Not this phase's, and unfixed:** the migration chain's slot for `0.4.0` was missing at HEAD
  while the release table carried the row, so `npm run test` failed on a clean checkout at
  `test/release.test.ts`. Restored with the chain empty-body rule the file already states. The
  brief's Appendix E row is the record.
- **Two gates were added beyond the plan.** The control model is a **published** namespace, and
  `public-api.test.ts` pinned only to `MachinePrime`'s children, so the widening was invisible:
  `test/public-api-surface.test.ts` now pins one level deeper. And the harness gained a
  `KinkyDungeonAllRestraintDynamic` stub beside a variant-aware `KDRestraint`, because the contract
  reads the body rather than the inventory and the two are not the same question.

- **1.10 — `Form` is retracted, and the spec says so where it used to say otherwise.** The
  previous delivery added a fifth facet on the argument that the base game's `gag` conflates size
  with force, so *a small ball on a strict mechanism* was inexpressible. **The argument was right
  and the answer was wrong**: making appearance a **Host demand** contradicts §6.12 clause 4, which
  says capability is read from what is worn and never demanded, and it left an item that has a look
  but no behavioural effect with nowhere to declare that look. `spec` §6.1 now carries the
  retraction *in place*, because a reader who reaches that section must not find the old reasoning
  standing. The expressibility survives and moves: one item variant declaring a small appearance
  and a high bid, and its sibling declaring the opposite.
- **1.9 — the decomposition refused two dimensions rather than adding them.** `Arms` and `Hands`
  are not declared and will not be. Tracing `bindarms` / `bindhands` / `restricthands`
  (`base/KDTypeDefs.ts:487-492`) found **two bundled properties and no axes**: between them they
  pay for melee, blocking, weapon use, two spell components, escaping, locks, doors, picking things
  up and the body's own configuration. The same reading was applied to the gag (four demands, not
  one), to the blinder and the deafener (whose aggregates are a count-and-maximum and a weighted
  maximum-plus-sum) and to the lower body (four unconnected tracks: a slow level, a heel level, a
  balance pool, and a set of state tags).
- **1.12 — "projection" was already taken, so the new map is called something else.** §6.7's
  *projection layer*, §6.8, §8.2 and invariant 8 use the word for **equipment** growing extra
  parts. The map from a resolved 0..1 to the engine's own units is therefore the dimension's
  **engine value**, and the glossary states the distinction in both directions. The body-state
  predicates the base game insists on are a third thing again: a compatibility shim, named
  `BodyStateName`, and **not** a dimension.
- **1.14 — invariant 6 was honoured rather than narrowed.** The step as first drafted would have
  limited the `OverrideAllowed` check to `Whitelist` dimensions, which would have left a posture
  dimension unable to take `OverrideAllowed` while `CapabilityKey` is empty — and would have broken
  an invariant to do it. The check is instead **channel-aware**: the validator is handed the
  promise **on the channel the dimension actually has**.
- **Deliberately not fixed, and recorded instead.** Reading four subsystems turned up eleven
  base-game defects: `KinkyDungeonIsArmsBoundFast` returning `undefined` on every path, a
  `blockPotions` branch no code can reach, `forbidPose` with no consumer, `BoundFeet` written to
  one tag map and read from another, a `Hobble` tag with three writers and no reader, a
  `ForceHogtie` tag with no writer, a restraint `freeze` field with no writer, and four more.
  **They are inherited, not repaired** — the register is `docs/guide/known-issues.md` — and the
  ones that would collide with our own route are avoided by not using those fields and tags at all
  (`spec` §6.13 rule 6).
- **[待定→决定] 1.13 — §6.7 contradicted itself about `Count`, and the implementation followed the
  table row rather than the paragraph.** The **table row** says the engine value map "turns `Applied`
  into the number a seam receives", and `Applied` is a rate — so it is in 0..1. The **paragraph below
  it** said *"the aggregate is clamped to 0..1 like any other rate, and the dimension's engine value
  map is what puts it back on the engine's own scale — which is where a count of three items becomes
  the integer 3 rather than three eighths."* Both cannot hold: if the aggregate is clamped to 0..1 then
  a count of three is 1 before the map ever sees it, and no map recovers the 3. **What shipped was the
  table row**: the aggregate is clamped, `Ceiling` saturates, and `Projected` is `Applied` through the
  map — which is the reading that keeps *a rate is uniform in the model* true and keeps one clamp rule
  for every rate. **Resolved the same day, by removing the mode rather than by choosing a reading:**
  see the next deviation and the brief's Appendix E row. The finding is kept rather than deleted
  because it is *why* the mode was looked at again.
- **1.13 — `Count` is removed, and the reason is what this mod's equipment is.** The owner's ruling:
  *this mod does not design fixed-value restraints*, and a count is exactly that semantics — it
  aggregates the **number** of contributing items rather than what any of them says, so it only means
  anything if a piece's contribution is a fixed step, *one item, one rung*. A piece here declares a
  **power**, and two pieces of a kind are stronger than one because their powers add rather than
  because there are two of them. **Nothing is lost**: a count is a sum in which every contributor bids
  the same step, so a family that wants that behaviour writes the step it wants under `Sum`. The
  retraction also **dissolves the contradiction above** rather than settling it — with no count mode
  there is no quantity that has to survive the 0..1 clamp, and a `Sum` of powers is exactly the
  quantity the clamp and the engine value map were already stated over. `spec` §6.7's table now carries
  two modes with the blindness of the third recorded beside it, and `3.8` no longer carries the blind
  level's count half through a stacking mode.

**Ordering constraints:** 1.1 and 1.2 precede 1.3; 1.3 precedes 1.4; 1.5 needs 1.4. **For the
correction: 1.9 precedes 1.10–1.14** (the catalogue cannot lose `Form` before the facets say what
replaces it), and **1.10 precedes 1.11** (the appearance declaration is what frees `Posture` from
carrying a size).

> **The debug tick driver is not retired here.** It is currently the *only* input to the
> sensory limiters, and it advances game time from inside tick dispatch. Its replacement is
> the router **plus** the Phase 3 sensory work, so retiring it is **3.1**. That keeps this
> phase's exit condition honest.

**Ordering constraint, as delivered:** the driver was **rewritten** rather than retired — it now
records an intent and announces what the router resolved, which is what makes the wearer's visor or
gag re-model itself without any UI. It is still the only writer of a dimension, and 3.1 is still
where it goes.

---

## Phase 2 — Behavior Control

**Goal:** the first shipped subsystem, because the fantasy is hollow without it and its
seams are the cheapest available.

**Exit condition:** a character's action boundary can be set, denied, and re-granted through
equipment, with arousal dynamically controllable — and the base game's own restraint
baseline intact when the Host is set to Free.

| # | Step | Issue |
| --- | --- | --- |
| 2.1 | **Bind the gate to the base game's own bound-checks.** Drive `getArmsBound` / `getHandsBound` through their `forceResult` seam, **including `forceResult = false`** — the direction no base-game caller uses, which is what makes a bound character able to act. Both are **body-state predicates** now (`spec` §6.7): the answer is the union of the refusals among the dimensions that feed them, which is also what makes this the step where `Movement`, `Attack`, `Casting`, `Defense` and `Interaction` acquire their rates. | #54 |
| 2.2 | **Bind the action chokepoint.** Wrap the input registry so actions can be vetoed, and look up the relevant dimensions. **`Interaction` is the step's real customer**: doors, picking things up, eating and drinking, tethers and shrines are all inline reads with no `calc*` event of their own (`spec` §6.3), so the chokepoint is the only tool they have. | #55 |
| 2.3 | **Implement the arousal gate** (`spec` §6.11) through the movable player tags, expressing it as "the Host may deny". | #56 |
| 2.4 | **Implement the substitution whitelist** and the write rule that `OverrideAllowed` requires equipment capability (`spec` §6.4, §6.6). | #57 |
| 2.5 | **Wire the non-verbal reinforcement channel** (`spec` §9.1): direct perception of the Host is UI feedback, never text. | #57 |
| 2.6 | **Decouple restraint strength from the item.** Ship the declarative fields at a loose baseline and have the controller apply the real strength, so an item is not born strict. **Done when** invariant 12 holds: the character's baseline lives in the Coordinator, no baseline value is stored on an item, and removing every item returns the character to the never-equipped state field for field (`spec` §11). | #71 |
| 2.7 | **Posture.** Build the route `spec` §6.13 declares: wrap the two availability functions, override when there is a demand, **subtract then add**, never come out empty, and keep every pose-driver word out of the mod's `shrine` lists — one word there moves the lower body's numbers outside the controller. **Done when** a console session can deny and restore a body configuration, with the base game's own cascade untouched whenever the gate is `Free`. | — *(unopened)* |
| 2.8 | **Invalidate the wearer-adaptation perks.** `SmoothTalker`, `Incantation`, `SomaticPlus`/`SomaticMinus`/`Butterfingers`, and the `ClassicHeels`/`Flexible`/`PoorForm`/`HeelWalker`/`PoorBalance` family: a mod-controlled dimension is not rescaled by the wearer's adaptation, because the equipment compensates for it (`design/codex.md`). **Done when** the same demand resolves to the same severity with and without each perk. | — *(unopened)* |

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
| 3.1 | **Rewrite the sensory limiter layer** on top of the Phase 1 store, and **retire the debug tick driver**. Keep the existing state accessors — they are correct and property-tested — and replace the limiter layer above them. The tick driver goes because this is the step that finally gives the limiters a real writer. | #58 |
| 3.2 | **Handle seam precedence explicitly.** Some perception values are written by an early seam and overwritten by a later one; the descriptor must name every seam and its order, and a partial implementation must be a **loud** failure rather than a silent one. | #58 |
| 3.3 | **Wire the deafener.** The slot's schema, guard and round-trip all exist and no item has ever emitted it; today the headphone sets a static `deaf: 2` instead. **[待定]** The source discussion recorded this as *not decided*; wiring it is the obvious first customer for the keyed store, so it is scheduled here as the cheap test of whether the store earns its keep. **`Hearing` is `Direction.Both` now** (`spec` §6.1): `calcHearing` has a live granting handler (`effect/KinkyDungeonEvents.ts:7263-7267`) that the base game already uses through two spells, so this step wires **both** directions rather than only the denial. | #59 |
| 3.4 | **Wire spell range** — **done when** a dimension can change the range the game reports for a spell, with no other consumer involved. | #59 |
| 3.5 | **Add the numeric buffs.** Numeric buffs reuse the same `calc*` seams read in the other direction. | #60 |
| 3.6 | **Add map-unit marking.** The base game has an in-repo template for this: a calculation seam decides *what* to mark, a flag marks it, and a minimap handler renders it. | #60 |
| 3.7 | **Add shared vision** — seeing what an allied doll sees. This is **real rendering work** and should be scheduled as its own milestone, not as part of 3.5 or 3.6. | #61 |
| 3.8 | **Trace light and dark.** `Sight`'s producing seam composes **four** inputs — the restraint aggregate, `KinkyDungeonBlindLevelBase`, a `Blindness` buff, and `KinkyDungeonStatBlind` forcing a floor of 6 — and the aggregate is **a count and a maximum at once** (`player/KinkyDungeonStats.ts:2063-2075, :1827-1831`). **The count half is not a stacking mode** — there is no `Count` (§6.7) — so it is a `Sum` in which every contributor bids the same step, and the whole of the aggregate travels through the engine value map, which is where the integer ladder capped at 7 lives. | — *(unopened)* |

**Ordering constraints:** 3.1 needs 1.4 and must precede 3.2–3.8; 3.5–3.8 are independent
of each other, and 3.7 is the only one expected to be large. **2.7 and 2.8 have no issue number
yet** — the plan's own rule applies: *a step with no number is a step nobody is tracking, so open
it before starting it.*

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
| 4.1 | **Build the projection layer** (`spec` §6.7): projection gated on progress, applied **retroactively** to already-worn items. | #62 |
| 4.2 | ***(deferred)* Make morphing mint derived ids.** Today it mints a random variant name on every morph, which grows the variant registry and defeats the versioning scheme. | *(deferred, no issue)* |
| 4.3 | ***(deferred)* Fix the unbinding glitch.** One morphing branch removes and re-adds the restraint, so the wearer is briefly unbound. | *(deferred, no issue)* |
| 4.4 | **Implement the evolution ladder** (`spec` §8.2): craft a lock, upgrade parts, make it permanent, with the two upgrade axes bound as specified. **Needs 4.6** — the permanence stages need a real curse. | #63 |
| 4.5 | **Build the quest framework** (`spec` §8.3): functional classes, a table of mini quests per class, and a quest coordinator built alongside the controller. | #64 |
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
| 5.1 | **Implement the entry conditions** (`spec` §8.4): capability coverage as **subset**, suppression thresholds as **at least**, and the equipment-is-finished check evaluated at the controller layer. **Done when** each of the three can be tested independently and a failing condition names which one failed. | #65 |
| 5.2 | **Implement the room and its sequence** (`spec` §6.10): the leash entry with **no world-map entrance**, control returning to the player, the **frictionless kind-1 lift** (a button — no test, no cost, no roll), and the **free phase**. | #66 |
| 5.3 | **Implement route 1 — leave.** Set the entry condition (no **controlled** equipment worn or carried, evaluated from the controller's authoritative set) and commit on interacting with the **door**: **clear the dossier, destroy the controlled items, then teleport to the world map at the stairs — in that order** (invariant 15). **Done when** the character returns with her native abilities usable and the §8.1 ritual cost still reopenable — i.e. what was cleared was the dossier, not the baseline (`spec` §11, invariant 12). | #72 |
| 5.4 | **Implement route 2 — descend.** Set the entry condition (`spec` §8.4's, with the lock requirement relaxed to **decorative locks**) and commit on interacting with the **`furniture`**: **one atomic replacement** of every decorative lock and **the `furniture`'s own restraint** into **kind-2 curses**, then the seal. **[既有]** The furniture is a map doodle that applies a restraint in the **`ItemDevices`** group (`spec` §6.9), so the curse goes on **that restraint** — no new curse carrier is needed, and no special case. | #73 |
| 5.5 | **Register the two curse kinds** (`spec` §6.9) as separate registry entries with **distinct `condition`s**: **kind 1** unsatisfiable everywhere except the room, **kind 2** with none. **Kind 1 must also supply a `remove` hook that returns `false`** (`base/KDTypeDefs.ts:3965-3966`), so lifting the curse **clears it and leaves the equipment worn** instead of stripping it (`item/KDCurse.ts:1051, 1071, 1087`). **Done when** the post-lift state is *worn, uncursed* — which is the state step 5.2's struggle needs, and which no base-game path produces. | #27 |
| 5.6 | **Inject the Controller ceiling that makes the struggle real** (`spec` §6.10, step 4): while any controlled item is worn, drive the dimensions it covers to **the highest suppression that still leaves removal possible** — *hard, not closed*, because a refusal outside the two commits is a bug (invariant 13). When the **last controlled item covering a facet leaves the body**, that facet drops to its **`Free` value** (`Rate.target = 0`, `Gate.Intent = Free`). **Done when** the peak is produced entirely by these injected values, with **no bespoke struggle formula**, and the Free state is what lets the free phase change equipment at will. | #74 |
| 5.7 | **Implement the decorative lock by intercepting the self-lock feature** (`spec` §6.10): wrap or replace `KinkyDungeonSpellSpecials["Lockdown"]` (`KinkyDungeonMagicCode.ts:19, 651-681`) so that in-room it applies a Boids-registered `"Decorative"` entry in `KDLocks` instead of `"Purple"` — **required, not cosmetic**, because `KDLockableRestraints` skips every cursed item (`KinkyDungeonRestraints.ts:1264-1267`) and every controlled item is cursed at entry. Re-label the element's icon and text in-room. **Done when** every controlled piece satisfies `KinkyDungeonIsLockable` (`:697-700`), so no piece is un-lockable and route 2 is reachable for the whole set; and the lock is applied **after** the lift, since curse and lock are mutually exclusive (`:5016-5018`). | #75 |
| 5.8 | **Implement the two sync hooks** (`spec` §8.4) and the character export to `localStorage` (`spec` §8.5). | #67 |
| 5.9 | **Make the filed state robust.** **Done when** a filed character can be saved, loaded, and acted-upon with a no-op action, and the archive is byte-identical before and after. | #67 |
| 5.10 | **Implement the repeat-entry skip criterion** (`spec` §8.3): a quest is skippable when it yields **knowledge or a key**, and must be redone when it yields a **physical** thing. **Depends on the two-part Coordinator state** (`spec` §5, §7.1): route 1 clears the **dossier** and must **keep quest metadata**, so the allocator can tell what has already been done. | #76 |

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
| 6.6 | **New sub-factions** — **[goal post]**, deferred with `spec` §10: the mechanism layer ships first. Three are on record as the eventual targets. | #68 |

---

## Phase 7 — Optional base-game patch mod

**Goal:** capture the value of upstream changes without making Boids depend on them.

**Exit condition:** a separate mod exists that patches the game, Boids runs identically
without it, and every patched path has a working unpatched counterpart.

| # | Step | Issue |
| --- | --- | --- |
| 7.1 | **Scaffold the patch mod** as a separate repository/package, load-ordered ahead of Boids. | #69 |
| 7.2 | **Patch a gag calculation event** so speech becomes grantable instead of hard-coded. | #44 |
| 7.3 | **Patch richer dynamic chastity**, beyond what the movable tags reach. | #69 |
| 7.4 | **Patch a weapon-side lock**, if the design still wants one. | #69 |
| 7.5 | **Document the optionality.** Each patched path names its unpatched fallback. | #69 |

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
| 8.1 | **Calibrate the final act's peak** (`spec` §6.10, §12). Tune the Controller's ceiling (5.6) until the struggle is the hardest passage in the mod **and still winnable**, and verify the fallback end to end: **a player who cannot break free can still lift, fit decorative locks, and commit via route 2.** **Done when** invariant 13 is demonstrated in play, not asserted — no ceiling value leaves removal impossible. | #77 |

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
| The registration summary is the surface's change detector | regenerate only when the surface is *meant* to change, and review the diff — the full record is written on demand (`npm run test:audit`), not committed |
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

Two columns, because a phase's work is partly tracked as GitHub issues and partly as work this
plan created. **Reconciled 2026-10-17:** the second column now names the issue each step opened,
so the step tables above and this map carry the same numbers.

| Phase | Existing issues | Opened at the freeze |
| --- | --- | --- |
| 0 — Foundation **(delivered)** | #48 (0.1), #47 (0.2), #50 (0.3), #51 (0.4), #52 (0.5), #53 (0.6) — **all closed** | — |
| 1 — Control model | #19, #45, #40, #42, #43, #30, #34 | #70 (1.8, the restraint contract). **1.9–1.14 ride on #19 and #45** — the control model and its router — because they *correct* that delivery rather than extend it |
| 2 — Behavior Control | #54 (2.1) | #55 (2.2), #56 (2.3), #57 (2.4–2.5), #71 (2.6) — **2.7 and 2.8 are unopened on purpose**, and each needs a number before it starts |
| 3 — Sensory Control | — | #58 (3.1–3.2), #59 (3.3–3.4), #60 (3.5–3.6), #61 (3.7) — **3.8 is unopened on purpose**, same rule |
| 4 — Equipment evolution | #27 (4.6), #33 and #41 (4.7), #32 (4.8), #37 (4.9) | #62 (4.1), #63 (4.4), #64 (4.5) — 4.2 and 4.3 stay unopened, deferred with the consolidation |
| 5 — `Being Filed` | #27 (5.5, narrow form) | #65 (5.1), #66 (5.2), #72 (5.3), #73 (5.4), #74 (5.6), #75 (5.7), #67 (5.8–5.9), #76 (5.10) |
| 6 — Content and breadth *(ongoing)* | #26, #3, #29, #9, #21, #25, #28, #20 | #68 (new sub-factions) |
| 7 — Optional patch mod | #44 (7.2) | #69 (7.1, 7.3–7.5) |
| 8 — Calibration, by playtest | — | #77 (the peak's calibration) |

> **[既有] Reconciled 2026-10-17.** Every `new` this plan carried now has a number. The *exit* work
> (the room, both commits, the two curse kinds, the decorative lock, the Controller ceiling, the
> repeat-entry criterion, the calibration) was opened as #70–#77, and Phase 0's delivered work was
> opened as #50–#53 and closed with a comment naming the step that holds it. Five steps stay
> **unopened on purpose** — 4.2 and 4.3 are deferred with the morphing consolidation, and 2.7, 2.8
> and 3.8 were added later by Phase 1's correction, after the reconciliation; an issue
> would be a promise this plan does not make. **A step with no number is a step nobody is tracking:
> open it before starting it.**

> **Reassigned from the design brief's triage.** #20 (the quest line) was called *content*
> there and is content here too — it is the first thing Phase 6's quest framework gets
> filled with, not framework work. #27 (custom locks and curses) was called "not on the
> critical path" there, and is required here in a **narrow form only**: the two curse
> *kinds* (`spec` §6.9) — **kind 1** for the equipment, in Phase 4, and **kind 2** for the
> commit, in Phase 5. The broader lock-and-curse content stays in Phase 6.

> **[待定] Raised 2026-10-17, by the correction's own implementation, and deliberately unnumbered.**
> §6.7 carried two `[决定]` sentences about a `Count` stacking mode that could not both hold: the
> table row had the **engine value** map convert `Applied` — a rate, and therefore in 0..1 — while
> the paragraph below it said the aggregate is *clamped to 0..1 like any other rate* **and** that
> the map is where *a count of three items becomes the integer 3*. If the aggregate is clamped, the
> count is 1 before the map sees it. **Resolved the same day, and not by choosing between them**:
> the owner ruled the mode out altogether, because this mod does not design fixed-value restraints
> and a count is that semantics. The mode is gone from `spec` §6.7, the contradiction it created is
> gone with it, and a count is expressible as a `Sum` in which every contributor bids the same step.
> The finding is kept here because it is *why* the mode was looked at again, and because a
> `[待定]` that is answered by removal rather than by a decision between two readings is worth being
> able to tell apart from one that was simply dropped. **The plan's 1.13 and the brief's Appendix E
> row carry the same ruling.**
