# Phase 1 second acceptance — the re-delivery, clause by clause

**Reviewed:** 2026-10-20, `dev` at `4f22378`, working tree clean.
**Scope:** whether the phase’s exit condition is true **as written** after the 2026-10-20 re-delivery,
what each of the first review’s corrections (K1–K12) now stands on, and how far the tests written for
them actually reach.
**Status:** the exit condition holds as written. Four findings are recorded outside it, of which two
block the acceptance of later slices rather than this phase’s. Accepting the phase is the plan’s to
record; this report states what was found.

> **The route behind the re-delivery.** [The first review](phase-1-control-model.md) and
> [the divergence audit](canonical-model-divergences.md) are the finding;
> [the mid-review draft](phase-1-mid-review-draft.md) is the correction list K1–K11; #79–#84 are the
> issues they were tracked as. This report is the second pass over the same exit condition, not a new
> review of the phase.

## What was checked, and how

| Checked | How |
| --- | --- |
| the workday gate | `npm run verify` → exit 0: typecheck clean, **233 tests over 48 suites, 231 pass, 0 fail, 2 skipped by `AuditSkipReason`** [counted] |
| the delivery gate | `npm run verify:full` → exit 0: **233 pass, 0 skipped** — both audit comparisons ran — and `Deploy/Boids.zip` built at 1 372 540 B [counted] |
| the corpus edits | `design/spec.md` §6.1, §6.5, §6.6, §6.7, §12; `design/dev-plan.md` Phase 1 and 3.1; `design/design-brief.md` Appendix E [read] |
| the code the corrections touch | `KDExtension/Control/{Router,Grant,Validator,Capability}.ts`, `Coordinator/{Provider,Membership,Public/Control,Public/Selection,Internal/State,SensoryControl}.ts`, `Debug.ts` [read] |
| the tests that are supposed to catch a regression | every named suite, then each mechanism deleted in turn and the suite re-run — §*The mutation matrix* [counted] |
| the tracker | `gh issue list --state all` → #79–#84 present and **closed** [counted] |
| the generated reference | `npm run docs:api`, then `git diff` → an **empty content diff** [counted] |

Not checked: **no in-game play session** — every runtime claim below is about the code and the harness;
**no measurement on a non-Windows checkout**, so the line-ending remark in F4 is from this one; **the issue
bodies** — only their titles and states were read.

## The exit condition, clause by clause

| Clause | Verdict | Evidence |
| --- | --- | --- |
| dimensions can be **declared** | holds | one catalogue and one name table, 23 dimensions; `control-descriptor.test.ts` walks both directions, so a name without a descriptor and a descriptor without a name both fail [read] |
| dimensions can be **registered**, with validation | holds | `ValidateDescriptor` covers every field §6.2 names, refuses at registration, throws on a duplicate id [read] |
| dimensions can be **written, with validation** | holds | the (shape)/rate/posture/gate/config rules are unchanged, and the grant is now **read from the worn set** on the dimension’s own channel (`Public/Control.ts:126-128`) instead of taken from the caller [read] + M3 |
| dimensions can be **resolved by the router** | holds | `Applied` is the demand clamped to capability (`Router.ts:358`, `ResolveNumeric`), a permit cannot add a pose outside the ceiling (`:408-417`, `ResolvePosture`), and a whitelist reports the union of the bids’ `Granted` (`:317-320`) [read] + M1, M2 |
| all of it is **drivable from the console** | holds | `SetIntent`, `SetConfig`, `Resolve(dimension, bids?)`, `FindProviders`, `SelectProvider`/`WhichQualify`, and the `Debug` console drivers, under `Boids.FactionMachine.MachinePrime`; the posture restore is drivable end to end (`control-facade.test.ts:103-114`) [read] |
| the **property suite** extended | holds | `control-router.test.ts:219-246` (the clamp over every `Rate` dimension), `control-pose.test.ts:204-217` (a permitted pose is inside the capability or is the sentinel), `control-baseline`, `coordinator-state`, `save-round-trip` [read] |

Two statements the phase’s plan makes remain true and are **not** reopened: **no dimension is bound to a
game seam** (`dev-plan.md:268-272`), and `Projected` reaches no engine value yet. *Resolved* still means
resolved, not applied.

## The corrections, clause by clause

| # | Done when | State | Site |
| --- | --- | --- | --- |
| **K1** | the spec states the clamp, and the waiting property over the **intent** | done | `spec.md:810` (`min(demand, capability)`, the demand left untouched, the *waits* sentence), `:820-821` (*a resolution never rewrites the recorded intent*) [read] |
| **K2** | appearance is the intent’s function, parameterised by the item | done | `spec.md:486-500`; the code half is still declared for 2.1/3.1 and the guide says so (`docs/guide/control-model.md:30-38`) — that is S4, not K2 [read] |
| **K3** | a bid can declare a grant, a resolution reports it, the validator has a producer | done | `Provider.ts:64-71` and the per-axis reader `:120-128`; resolution `Router.ts:317-320`; producer `Control.ts:126-128`; the channel split is `Grant.ts` (`GrantKeys` `:49-65`, `ResolveGrant` `:82-99`) [read] |
| **K4** | `SetIntent({Intent: OverrideAllowed})` succeeds exactly when the worn set promises | done | accept, refuse-with-nothing-worn and *says nothing is not the ladder* at `control-facade.test.ts:54,72,85`; M3 [counted] |
| **K5** | an over-capability intent resolves to capability, a permit cannot add outside it, the wait still resolves | done | `Router.ts:358` and `:408-417`; the three old assertion sets rewritten at `control-router.test.ts:130,142,356`; M1, M2 [counted] |
| **K6** | §6.7 and §12 tell one story | done | `spec.md:1677-1698` no longer lists the router’s three rules as proposed [read] |
| **K7** | 3.1 names the limiters and the driver that exist | done | `dev-plan.md:492` names `Resolve`/`SetIntent`, the deleted accessors, and the console entry points as the only writer until 3.1 [read] |
| **K8** | a release build registers no tick handler, or it is inert | done | `Debug.ts` carries no `AddEventHandler` at all and its header says why (`:16-19`); the retired GUID is pinned by `debug-driver.test.ts:49-55` and the behavioural half at `:57-75`; M4 [counted] |
| **K9** | a console caller enumerates once and resolves several dimensions | done | `Control.ts:179-188`, re-exported by `Public/index.ts:29`; `control-facade.test.ts:130-151`; M5 [counted] |
| **K10** | each test fails when its mechanism is deleted | met, with one exception | §*The mutation matrix* below; the exception is F1’s branch, which no test misses [counted] |
| **K11** | each accepted item names its issue; Appendix E accretes | done | #79–#84 closed [counted]; the dated row is `design-brief.md:2706`, and it states what the re-delivery superseded without rewriting the earlier rows [read] |
| **K12** | the two shells round-trip to one shared value | done | `Internal/State.ts:82,92` (the empty interfaces), `:69` (`ReadShell`), `:144-145` (the load reader), and the case in `coordinator-state.property.test.ts` [read] |

## The mutation matrix

Each row is a real edit to the working tree, one at a time, reverted with `git checkout -- <path>` before
the next; the tree was confirmed clean between rows and returned to `4f22378` at the end. The point is
K10’s rule: **a test that stays green with its mechanism deleted is not evidence.**

| # | Deleted mechanism | Result | The assertion that fired |
| --- | --- | --- | --- |
| **M1** | `Router.ts:358` — `Math.min` → `Math.max` | **9 fail** (`control-router` 112, 130, 142, 207, 219, 273, 426; `restraint-contract` twice) | *the capability bounds the demand*; *did not clamp its demand to its capability*; *the demand is clamped to the bid* |
| **M2** | `Router.ts:413` — dropped `&& ceiling.has(pose)` | **2 fail** (`control-router:356`; `control-pose:168`) | *a demand is clamped to the capability*; *permitted 'Wristtie' outside its capability, and it is not the sentinel* |
| **M3** | `Public/Control.ts:127` — the facade stops reading the worn set | **2 fail** (`control-facade:54,103`) | the write’s own refusal value, Rule `not-grantable` and the reason *has no equipment that can offer a substitute for it on its own grant channel* |
| **M4** | the retired `tick` handler restored verbatim | **4 fail** (`debug-driver:49,57`; `guid-uniqueness`; `registration-manifest`) | *the random tick driver is registered again*; *a tick changed the dossier* |
| **M5** | `FindProviders` removed from the published surface | **typecheck fails** — `test/control-facade.test.ts:141: error TS2339: Property FindProviders does not exist` | — (compile-time, which is the honest form: the name is part of the surface the gate typechecks) |
| **M6** | `Router.ts:408-417` — the **whole posture permit branch** deleted | **0 fail — 233 tests, 231 pass** | none — this is F1 |

M6 is the one row that does not behave, and it is why F1 below is a finding rather than a note: the
permit half of the posture algebra can be removed without the suite noticing, while the negative half
(M2) is guarded.

## The coverage boundary

| What | Reach |
| --- | --- |
| the algebra, the write rules, the facade’s grant path, the enumeration, the retired handler | tested through the real functions and the real published barrel [counted] |
| the worn-set walk | tested against `test/harness/equipment`’s recorder, whose `KDRestraint` mirrors `restraint/KinkyDungeonRestraints.ts:272-275`’s variant resolution — a stub that is read-matching rather than engine-executing [read] |
| the **whitelist accept path** | **untestable in this phase and untested**: `CapabilityKey` is `never` (`Capability.ts:36`), so `GrantKeys` can never yield a key and only the empty answer is exercised (`control-facade.test.ts:116-126`). K4’s positive half is proved on the posture channel only [read] |
| every seam, the engine value maps beyond `Sight`, the posture route | declared and **merely read** — no dimension is bound [read] |

## Findings

### F1 — the posture permit branch restores nothing, and no test misses it [read] [counted]

- **Sites:** `src/KDExtension/Control/Router.ts:401` (`let allowed = new Set(ceiling)`), `:408-417` (the
  `OverrideAllowed` branch), `design/spec.md:811` (*where the gate allows, the demand may only restore a
  pose the capability already contains*).
- **Finding:** the permitted set **starts** at the ceiling, so a pose the branch admits is already present
  and the branch’s only observable effect is to refuse one outside the ceiling. `OverrideAllowed` plus
  `Allowed` is therefore behaviourally identical to `Free` on a posture dimension. Deleting the branch
  entirely leaves the suite green (M6: 233 tests, 231 pass, 0 fail), while deleting its guard fails two
  (M2) — the branch is guarded against over-permitting and has no work to do.
- **Consequence:** §6.7’s *restore* and its *allow wins* ordering are unobservable under the clamp the
  corpus adopted at K1. Either the decision means something narrower — the demand restoring against the
  *game’s own* baseline rather than against the ceiling — or the add-half should be removed and §6.7’s
  posture row restated. Writing 2.7 against the current sentence would build a mechanism whose only
  reachable behaviour is the one it already has.
- **Blocks:** 2.7’s acceptance (the posture route, and S2 with it). Not this phase: the exit condition
  says *resolved*, and the resolution is what the corpus states.
- **Issue title:** *Router: §6.7’s posture permit restores nothing under the clamp.*

### F2 — engagement is reported without the grant it promises [read]

- **Sites:** `src/KDExtension/Control/Router.ts:311-313` (`resolution.Engaged` is computed from
  `CanDeny`/`CanGrant(descriptor.Direction)` alone), `Coordinator/Public/Selection.ts:77-82`
  (`WhichQualify` reads `Engaged` and nothing else), `design/spec.md:812` (*a gate the seams cannot honour
  does not engage*).
- **Finding:** the promise is checked at write time (`Public/Control.ts:126-128`) and **never again**. A
  demand written while the gear promised stays `OverrideAllowed` with `Engaged: true` and an empty
  `Granted`/`PostureCeiling` once that gear is removed or a save carrying it is loaded.
- **Consequence:** nothing injects today, because no seam is bound. The first consumer — 2.1’s injector —
  reads `Engaged` to decide whether to act, and `Selection` already does; both would act on a promise with
  nothing behind it. The corpus does not say which reading it wants: a rate demand *waits* for gear, so a
  grant demand surviving its gear is consistent — but then the injector must read the channel and not the
  flag, and §6.7 should say so.
- **Blocks:** 2.1’s contract (with S3 and S5).
- **Issue title:** *Router: engagement is reported without the grant it promises.*

### F3 — three module headers still describe the deleted prototype [read]

- **Sites:** `src/FactionMachine/MachinePrime/index.ts:2-6` (*the sensory limiters that decide how blind a
  blinder … the events items register through to become part of the set*),
  `src/FactionMachine/MachinePrime/Item/index.ts:2-3` (*register themselves with the coordinator*), and
  `Coordinator/SensoryControl.ts:12`, whose migration table maps `GetLimiterStrength(type)` to
  `Public.Control.Resolve(dimension).Target` — a field a resolution does not have
  (`Demand`/`Applied`/`Ceiling`/`Projected`, `Router.ts:132-212`).
- **Finding:** Phase 1 deleted the limiters, the registered-item set and the `target`; the headers and one
  table row still describe them. The third was already a note in the first review’s §5 and is unchanged.
- **Consequence:** a docblock is the first thing a reader trusts, and these read as working code. The
  `Target` row is the one that misleads: it names the demand and the field is the wrong one.
- **Blocks:** nothing in this phase.
- **Issue title:** *Docs: the module headers still describe the limiter prototype.*

### F4 — the TypeScript reference is generated and never compared [read] [counted]

- **Sites:** `AGENTS.md:37-45` (*A few tracked artifacts are generated. They are compared against a
  committed copy*), `package.json:17` (`docs:api`), `typedoc.json:6` (the output root),
  `docs/api/typescript/**`.
- **Finding:** of the four artifacts in that table, **only two are compared**: the registration record and
  the text reference, both under `--audit` (`test/registration-manifest.test.ts:211`,
  `test/text-reference.test.ts:128`). Nothing compares `docs/api/typescript/**`; the only gate that reads
  it is `docs-paths.test.ts`, for path existence. Running `npm run docs:api` here produced an **empty
  content diff** — the committed copy is current — and left **233 files** showing as modified by line
  endings alone, because TypeDoc writes LF and this checkout is CRLF. The documented recipe (*regenerate,
  read the diff, commit it beside the change*) therefore leaves a working tree that looks dirty and is
  not.
- **Consequence:** the artifact the published surface is documented from rests on having been run, not on
  a check. And a regeneration on Windows invites a commit of 233 line-ending changes.
- **Blocks:** the delivery gate’s own claim, not Phase 1.
- **Issue title:** *Docs: the TypeScript API reference is generated but never compared.*

### Notes, not findings

- The first review asked whether `44d8840` (*label swap*, 450 lines of `spec.md`) needs an Appendix E row.
  It still has none; the 2026-10-20 row covers #79–#84 and does not mention it.
- `SetBlindStrength()` and `SetGagStrength()` still draw `Math.random()` when called with no argument
  (`Debug.ts:191,201`). With the tick driver gone this requires a deliberate call, so it is a console
  convenience rather than a writer nobody asked for.
- `test/control-pose.test.ts:208-211` derives the sentinel’s expectation from the same ceiling and demand
  the router read. It is the only shape available (the sentinel is the router’s own fallback), but it means
  the property cannot distinguish *the router subtracted everything* from *the provider delivered nothing*.

## What stands, and is not reopened

The 23-dimension declaration and registration, the descriptor’s shape rules and their whole-registry test,
the write validators’ shape/rate/posture/gate rules, the `{intent, config}` persisted shape and its
round-trip, the `Granted` reader’s per-axis degradation (`Provider.ts:120-128`,
`restraint-contract.test.ts:215-238`), the text and registration gates, and the layering gate. The
re-delivery moved none of them, and the suite’s counts moved only by the cases it added.

## How to re-derive this

```sh
npm run verify          # 233 tests / 48 suites / 231 pass / 2 skipped (the audit comparisons)
npm run verify:full     # 233 pass / 0 skipped, plus the mod bundle
gh issue list --state all --limit 12

# K5: the clamp, and the permit guard
sed -n '353,360p;401,429p' src/KDExtension/Control/Router.ts
# K4: the grant read, and the view from the facade
sed -n '120,145p' src/FactionMachine/MachinePrime/Coordinator/Public/Control.ts
sed -n '53,152p' test/control-facade.test.ts
# K10: reproduce one row of the matrix, then put it back
#   M1  Router.ts:358  Math.min -> Math.max              -> npm run test   (9 fail)
#   M2  Router.ts:413  drop the ceiling guard            -> npm run test   (2 fail)
#   M6  Router.ts:408-417  delete the permit branch      -> npm run test   (0 fail: F1)
git checkout -- src/KDExtension/Control/Router.ts

# F4: the reference is current in content, and dirty in line endings
npm run docs:api && git diff --stat && git status --porcelain | Measure-Object -Line
git checkout -- docs/api/typescript
```

Line numbers are as of `4f22378`; a finding is a problem as of the date on the report.
