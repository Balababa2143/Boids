# Phase 1 review — the control model, and what Phases 2–3 stand on

**Reviewed:** 2026-10-20, `dev` at `44d8840`, working tree clean.
**Scope:** whether the phase's exit condition holds **as written**, and whether anything the tree now
does or fails to do is a blocker for the phases after it.
**Status:** the workday gate is green; the exit condition is not yet true as written. Findings F1–F5 are
code defects, F6–F7 are documents that disagree with the code, F8 is the coverage boundary, F9–F10 are
shape and process constraints on later phases, and F11 is a rule the code has no input to exercise.

> **Later note, 2026-10-20.** The owner gave the canonical statement of the control model in session.
> [canonical-model-divergences.md](canonical-model-divergences.md) sets it against this delivery: it
> re-reads F1 (the grant channel), F3 (the two Sight conversions) and F11 (the posture order rule), and
> it establishes that part of what follows is the **corpus** disagreeing with the owner rather than the
> code disagreeing with the corpus.

## What was checked, and what was not

| Checked | How |
| --- | --- |
| the workday gate | `npm run verify` → exit 0: typecheck clean, **221 tests over 44 suites, 219 pass, 2 skipped** [counted] |
| the control model's modules | read end to end: `KDExtension/Control/*`, `Coordinator/*`, both published barrels [read] |
| what the shipped item families actually declare | read `MachinePrime/Item/Gag.ts`, `MachinePrime/Item/Visor/Common.ts`, and every family's `shrine` list [read] |
| each engine seam the next two phases name | read in the vendored game: binding predicates, input funnel, blindness, deafness, hearing, pose availability, and the wrapper bundle that proves which names are globals [read] |
| the suite's coverage of the model | a separate reading pass over `test/`: names, bodies, and every assertion that could pass with the thing it names removed [read] |

Not checked: **no in-game play session** — every runtime claim below is about the code and the harness,
not about a running game; **the GitHub issue state** — step status lives in issues and cannot be read from
the tree; **performance** — no measurement, so the hot-path remark in F5 is an inference.

## The exit condition, clause by clause

| Clause | Verdict | Evidence |
| --- | --- | --- |
| dimensions can be **declared** | holds | one catalogue (`Coordinator/Catalog/Dimensions.ts`) and one name table (`Catalog/Name.ts`), 23 dimensions (3 Sensory, 7 Stats, 13 Behavior) [counted]; `control-descriptor.test.ts` walks both directions, so a name without a descriptor and a descriptor without a name both fail |
| dimensions can be **registered**, with validation | holds | `ValidateDescriptor` covers every field the spec requires, refuses at registration, throws on a duplicate id |
| dimensions can be **written, with validation** | **holds only in the deny direction** — see F1 | `(shape)`, rate, posture, gate and config rules are implemented and tested; `OverrideAllowed` is refused by every real entry point because nothing supplies the equipment's grant |
| dimensions can be **resolved by the router** | holds | per-facet algebra, winner by power, loser reporting, gate engagement, the posture intersect/subtract/add rule and the never-empty sentinel are implemented and property-tested |
| all of it is **drivable from the console** | partly | `SetIntent`, `SetConfig`, `Resolve`, `Selection` and the `Debug` drivers are published under `Boids.FactionMachine.MachinePrime`; the posture restore path cannot be driven (F1), and the provider enumeration is not published (F5) |
| the **property suite** extended | holds | `control-router`, `control-pose`, `control-baseline`, `coordinator-state`, `restraint-contract`, `save-round-trip` |

## Findings

### F1 — `OverrideAllowed` cannot be written from the published surface [read]

- **Sites:** `src/FactionMachine/MachinePrime/Coordinator/Public/Control.ts:111` (the `grants`
  parameter), `:123` (`grants ?? new Set()`), `src/KDExtension/Control/Validator.ts`
  (`not-grantable` when the set is empty), `src/FactionMachine/MachinePrime/Debug.ts:150`
  (`DrivePosture` calls `SetIntent` with no `grants`).
- **Finding:** the `grants` argument has **no caller anywhere in `src/`** [counted by grep]. So every
  `SetIntent({ …, Intent: OverrideAllowed })` returns `not-grantable` — for the two posture
  dimensions whose grant channel is a set of poses, and for `WeaponUse` whose channel is capability
  keys. The facade's own docblock says the grant is "read from what is worn rather than stored", but the
  facade does not read the body; it forwards what the caller supplied, and the default is empty.
- **Consequence:** the rule that `OverrideAllowed` requires equipment capability currently tests the
  caller's honesty, not the worn set. `SetPostureArms(poses, OverrideAllowed)` — documented as
  "restore the named poses" — is refused. The one test that covers the grant channel
  (`test/control-pose.test.ts`, *the two grant channels are told apart*) calls the validator with a
  hand-built non-empty set, so it proves the validator and misses the facade.
- **What would fix it:** let the facade compute the grant on the dimension's own channel from the worn
  set — poses for a posture dimension, keys for a whitelist one — and add one case that goes through
  `SetIntent`, not the validator.
- **Blocks:** 2.7's acceptance (*deny and restore a body configuration*), and the meaning of the
  invariant the validator enforces.
- **Issue title:** *Control: the write facade never supplies the equipment's grant, so `OverrideAllowed` is refused everywhere.*

### F2 — the debug tick driver is shipped, and it re-enters game time [read]

- **Sites:** `src/FactionMachine/MachinePrime/Debug.ts:192-205` (the handler is registered at module
  evaluation), `src/mod.ts:1` (the entry imports `./Api`, which evaluates the whole registration tree,
  so this is true of every session), `Coordinator/SensoryControl.ts` (`AnnounceRate` ends in
  `KinkyDungeonAdvanceTime(1)`), and `base/game/KinkyDungeonGame.ts:3576`
  (`KinkyDungeonAdvanceTime` dispatches `tick`, which is the handler's own trigger).
- **Finding:** every tick, with probability `0.25 + 0.75 × 0.2 = 0.40`, the driver writes a random demand
  into `Speech` or `Sight` and advances game time by one [inferred from the two comparisons]. Time is
  therefore advanced from inside the dispatch of a time-advancing function.
- **Consequence:** a build anyone plays has random blindness/gag demands and a dilated clock, and the
  re-entry is a recursion path. Phase 2.2 is where the speech gate is bound, and it would be observed
  through a dimension a random writer rewrites every few ticks; the phase's exit condition (*an action
  boundary can be set, denied and re-granted*) cannot be judged while that is true.
- **What would fix it:** gate the handler behind an environment flag (or retire it) before Phase 2, and
  change step 3.1's text to say so.
- **Issue title:** *Debug: gate the random tick driver out of a playable build.*

### F3 — Sight has two engine values, and the declared one is unused [read]

- **Sites:** `src/FactionMachine/MachinePrime/Item/Visor/Common.ts:113`
  (`data['blindness'] = Math.max(data['blindness'], Resolve(Sight).Applied * 6)`) and
  `src/FactionMachine/MachinePrime/Coordinator/Catalog/Dimensions.ts:145`
  (`const BlindLadder = value => Math.round(value * 7)`, declared as Sight's engine value map).
- **Finding:** the only dimension whose engine value the catalogue claims to have read is converted
  **twice**, and the map nobody calls is the declared one. The seam's own quantity is the raw field
  (`blindness`), which the game seeds as a blindfold aggregate scaled by 1.5
  (`player/KinkyDungeonStats.ts:2063-2074`) and then reads back as a level capped at 7
  (`:1827-1831`); the visor maps full squeeze to 6, the catalogue maps it to 7.
- **Consequence:** "resolved severity, then the dimension's engine value" is true of the model and false
  of the game. 3.1 cannot bind the store to this seam without choosing, and 3.8 (*trace light and dark*)
  is where the choice belongs.
- **What would fix it:** settle which quantity the seam carries, write it as the dimension's engine value,
  and make the visor read `Projected` instead of applying its own factor.
- **Blocks:** 3.1 and 3.8.
- **Issue title:** *Sight: one engine value — the descriptor's ladder map or the visor's ×6.*

### F4 — the body-state answer is two-valued where 2.1 needs three [read]

- **Sites:** `src/KDExtension/Control/BodyState.ts:94` (`ResolveBodyState` returns
  `true`/`false`) and `base/restraint/KinkyDungeonRestraints.ts:1652` (the seam returns
  `forceResult` whenever it is not `undefined`, skipping the game's own computation).
- **Finding:** the helper answers *is any feeding dimension refusing*. The seam needs three answers:
  refuse (force `true`), granted (force `false`), and **no opinion** (leave `undefined` so the game's
  own binding stands). "Not refused" is not the same as "granted", and the type has no way to say so.
- **Consequence:** a 2.1 built on the current answer and forcing `false` whenever nothing refuses would
  override the game's own restraints with the Host at `Free` — which is precisely the clause Phase 2's
  exit condition adds (*the base game's own restraint baseline intact when the Host is set to Free*).
- **What would fix it:** a return type that distinguishes the three states, computed from the engaged
  dimensions' gates; the handler then writes `forceResult` only when the answer is decisive.
- **Blocks:** 2.1 (the first step of Phase 2).
- **Issue title:** *Body state: a three-valued answer for the `forceResult` seam.*

### F5 — `FindProviders` is advertised but not published [read]

- **Sites:** `src/FactionMachine/MachinePrime/Coordinator/Membership.ts:78` (the enumeration),
  `Coordinator/Public/Control.ts:179-189` (the docblock tells a caller to enumerate once and pass the
  bids to each `Resolve`; the default is `FindProviders()`), and `Coordinator/Public/index.ts`
  (exports `Control` and `Selection` only).
- **Finding:** the caller the docblock describes cannot exist: nothing exports the enumeration, and the
  seam layer that will resolve several dimensions per event is exactly that caller. Each
  `Resolve()` therefore walks the worn set again.
- **Consequence:** a hot path per bound dimension — and no way to answer "what would each candidate do"
  without one walk per dimension. The cost is unmeasured; the API gap is not.
- **What would fix it:** publish the enumeration (or a batch resolve that takes one set of bids), and
  say in the docblock which of the two is the intended call.
- **Blocks:** nothing outright; it makes 2.1/2.2 awkward and 2.7's selection path slower than it needs
  to be.
- **Issue title:** *Surface: publish the provider enumeration, or a batch resolve.*

### F6 — the spec contradicts itself about the router's status [read]

- **Sites:** `design/spec.md:777-779` (*"The three rules for resolving a dimension, promoted … this
  section is their promotion"*) and `:1669` (§12's open-question table still lists *the router's three
  resolution rules* as proposed, with the designer wanting implementation experience before deciding).
- **Finding:** the promotion is the one act Phase 1 could not do in code — the corpus protocol puts it in
  the spec — and the spec now says both things at once.
- **Consequence:** a reader cannot tell whether the router is settled, which is the exact status question
  the markers exist to answer.
- **What would fix it:** one editing pass to remove the stale §12 row, recorded the way corpus edits are
  recorded.
- **Blocks:** nothing technically; it blocks *closing* the phase honestly.
- **Issue title:** *Spec: §12's router row contradicts §6.7's promotion.*

### F7 — the plan's 3.1 names accessors the phase deleted [read]

- **Sites:** the plan's Phase 3, step 3.1 (*"Keep the existing state accessors — they are correct and
  property-tested"*), against `Coordinator/SensoryControl.ts:1-26`, whose table records that
  `GetLimiterStrength`/`SetLimiterStrength` and the stored `target` are gone, replaced by
  `Resolve`/`SetIntent`.
- **Finding:** the step was written against the three-slot prototype's shape. After 1.3 the accessors do
  not exist, so "keep" them is not an instruction anyone can follow; the same table also still names
  `Resolve(dimension).Target`, a field a resolution no longer has.
- **Consequence:** the first step of Phase 3 reads as if half of it were already done, which is how a
  step gets skipped rather than re-read.
- **What would fix it:** re-read 3.1 against the tree and correct its two sentences.
- **Blocks:** 3.1's scope.
- **Issue title:** *Plan: 3.1 still names the limiter accessors Phase 1 deleted.*

### F8 — coverage thins exactly where the exit condition lives [read]

The pure layer is well covered. The gaps are all on the path the exit condition names — *drivable from
the console*, *written with validation*:

- **the facade is tested only on the accept path.** `SetIntent`/`SetConfig` refusals are never asserted
  to leave the store untouched, and the unknown-dimension and empty-name refusals are not exercised;
  `grants` is never passed by any test (see F1).
- **the posture order rule cannot be tested where it is stated:** `test/control-router.test.ts`'s
  *restored* and *contested* cases share their inputs and assert a subset — F11 is why no case can do
  better.
- **a posture dimension's contribution to a body-state predicate is not pinned:** deleting
  `PoseArms.Feeds` leaves the suite green, because other dimensions still feed the same predicate.
- **no shipped item declaration is covered:** no test imports `Item/Gag.ts` or `Item/Visor/Common.ts`;
  the appearance case writes the value it then asserts.
- **the `config` map never crosses a save:** every round-trip sample carries intents only, so the map a
  `Struggle` gate's types will live in is unverified end to end; `ActiveNPC` is never populated either.
- **no test at all** for `Debug.ts`, `Selection.ts`, `SensoryControl.AnnounceRate`, or
  `Internal/Integrity.ts`.
- The two skipped tests are the audit-gated comparisons (the full registration record, the text
  reference); no control-model test is skipped.

- **What would fix it:** one case per bullet, each written to fail when the mechanism it names is deleted.
- **Blocks:** it is the difference between "the router works" and "the phase is delivered".
- **Issue title:** *Tests: close the facade, posture-order, predicate-wiring, item-declaration and config round-trip gaps.*

### F9 — the two-part coordinator state is still one part [read]

- **Site:** `Coordinator/Internal/State.ts:50-76` — an `Entry` is `{ ID, Control }`.
- **Finding:** the design describes the coordinator's state as two parts, the dossier and the quest
  metadata, because route 1 clears the dossier and must keep what has already been done (the repeat-entry
  criterion). The tree has only the dossier.
- **Consequence:** 5.10 has nowhere to read from. Adding the second half before the first release is a
  field; after it, a persisted-format change.
- **What would fix it:** add the quest half (empty is fine) before 0.5.0 ships, or record the decision
  that it arrives with 5.10 as a migration.
- **Blocks:** 5.10, and the shape of the save.
- **Issue title:** *State: split the coordinator entry into dossier and quest metadata before the first release.*

### F10 — three phase-2/3 steps still have no issue number [read]

- **Site:** the plan's issue map, and its own sentence that *a step with no number is a step nobody is
  tracking: open it before starting it*: **2.7, 2.8 and 3.8** are unopened on purpose.
- **Finding:** the plan will not let Phase 2 start on 2.7/2.8 as it stands.
- **What would fix it:** open the three issues (2.7's scope shrinks once F1 and F4 are settled).
- **Blocks:** starting Phase 2 formally.

### F11 — the posture order rule has no input that can violate it [read]

- **Sites:** `src/KDExtension/Control/Router.ts`'s `ResolvePosture`, which takes **one** `gate` value
  per resolution and therefore runs exactly one of its two branches, and the spec's sentence in §6.7 that
  the order is *subtract first, then add* and *a pose named by both a refusal and a grant is allowed,
  because a grant is capability and capability is never overridden downward by a demand*.
- **Finding:** two mechanical facts, each read off the code:
  1. **The two operations cannot co-occur.** A dimension has one gate per resolution, so the router
     either subtracts or adds — never both — and no input makes the order observable. The suite's
     *contested* case is the proof by accident: it passes the same demand and the same bid as *restored*.
  2. **Under `OverrideForbidden` the code does override the equipment's capability downward** — it
     deletes the demanded pose from the intersected ceiling, which is exactly the direction the sentence
     gives as its *reason* that a grant should win. The sentence's stated reason and the deny branch
     disagree; it survives only under one reading of which side "the grant" names.
- **Consequence:** the rule is stated where it cannot be violated and absent where it can be — the route
  that will merge the controller's set with the game's own tag cascade (2.7), which then inherits two
  unreconciled readings of the same sentence.
- **What would fix it:** restate the rule where both operations can meet (the route), or give the router
  a way to represent a removal and an addition for one dimension.
- **Blocks:** 2.7's design, not its feasibility.
- **Issue title:** *Posture: the subtract-then-add rule cannot be violated by the router, so the route must own it.*

## Smaller sightings [read]

- `Debug.ts`'s docblock says the driver fires on *roughly 45%* of ticks; the two comparisons give 40%
  [inferred]. A number in prose that disagrees with the line below it is how a later reader loses trust
  in the rest of the docblock.
- `Coordinator/SensoryControl.ts:12` names `Public.Control.Resolve(dimension).Target`; a resolution has
  `Demand`, `Applied`, `Ceiling` and `Projected`, and no `Target`.
- The plan records *220 tests over 44 suites* for this delivery; the tree runs 221 [counted].
- Commit `44d8840` (*label swap*) normalises the marker vocabulary across the corpus — 703 lines across
  `design/` and eleven source files — with no Appendix E row. If a pure label swap is outside the
  protocol there is nothing to do; if not, it needs one row, because the brief's own texts were rewritten
  by a commit whose subject says "label swap".

## What this report does not decide

- **The Sight scale is a design question**, not a report's (F3). Both candidates are defensible; what is
  not defensible is having two.
- **F1's fix shape** — facade computes the grant — is a proposal. The constraint is the design's: a
  grant is read from what is worn, never demanded.
- **F4's third state** is a modelling decision with a name to choose; the report only establishes that
  two answers are not enough for the seam.
- **Whether Phase 1 should be reopened or closed with a fix list** is the owner's call; the report says
  which clauses are untrue, not what to do about them.

## How to re-derive this

```sh
npm run verify                    # exit 0, 221 tests / 44 suites, 2 skipped by AuditSkipReason
grep -rn "grants" src/            # F1: no caller supplies the grant
grep -rn "trigger: 'tick'" src/   # F2: the driver's registration
grep -rn "Applied \* 6\|Math.round(value \* 7)" src/   # F3: the two conversions
sed -n '777,779p;1665,1672p' design/spec.md             # F6: promotion vs the open-question row
```

Line numbers are as of `44d8840`; the vendored game's are as of the submodule it pins.
