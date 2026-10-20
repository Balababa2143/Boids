# Phase 1 mid-review — acceptance report (draft)

> **Superseded, 2026-10-20.** [The second acceptance](phase-1-second-acceptance.md) is the record of
> what was delivered; this draft is kept as the correction list it became (K1–K11, tracked by #79–#84).

> **Working draft, 2026-10-20.** It exists so the next session can pick the work up without
> re-deriving it: what is delivered, what is not, the correction list, and the decisions the owner has
> already taken. It is written to be read, not signed — a decision recorded here is only real once it
> reaches the corpus through its own route (issue, spec, plan, brief Appendix E).
>
> **Start at §3** for the work, §6 for the decisions taken, and §7 for the issues this asks to file.

**Reviewed at:** `9f39210`, working tree clean. **Gate re-run for this draft:** `npm run verify` —
typecheck clean, **222 tests over 44 suites, 220 pass, 0 fail, 2 skipped by `AuditSkipReason`**,
exit 0.

**Documents this draft stands on:** [spec.md](../spec.md), [dev-plan.md](../dev-plan.md),
[design-brief.md](../design-brief.md), [the phase review](phase-1-control-model.md),
[the divergence audit](canonical-model-divergences.md), and the owner's canonical statement as
audited there; [willing-surrender.md](<../Experience design/willing-surrender.md>) for the
interaction layer's state requirements.

## 1. Verdict

**Not accepted as delivered.** Phase 1's exit condition is true for the declarative half of the
control model and false for its resolving half: the router, the write path's grant channel, and the
cosmetics rule encode a reading of capability that the owner has since stated is wrong. That is a
bounded defect, not a failed phase — the descriptor registry, the validators' shape rules, the
persisted shape and the suite skeleton all stand and are not reopened.

**Decided (owner, 2026-10-20): re-deliver.** Phase 1 is written again against the corrected model,
with the correction list in §3 executed in order. A conditional close was considered and rejected:
the items that fail are the ones Phase 2 builds directly on.

## 2. What was checked, clause by clause

| Exit-condition clause | Status | Evidence |
| --- | --- | --- |
| dimensions can be **declared** | met | one catalogue and one name table, 23 dimensions; `control-descriptor.test.ts` walks both directions |
| dimensions can be **registered**, with validation | met | `ValidateDescriptor` covers every field; registration throws on a duplicate id |
| dimensions can be **written, with validation** | **not met** | the validator is complete, but `OverrideAllowed` is refused by every real entry point because no caller supplies the equipment's grant (K3, K4) |
| dimensions can be **resolved by the router** | **not met** | the algebra is `max(demand, capability)` where the model says intent is clamped to capability (K1, K5) |
| all of it is **drivable from the console** | **partly** | `SetIntent`/`Resolve`/`Selection` exist; the posture restore path cannot be driven (K3, K4) and the provider enumeration is unpublished (K9) |
| the **property suite** extended | **partly** | the suites exist, and three of them assert the algebra this draft rejects (K5); the path tests are missing (K10) |

What stands and is not reopened: the 23-dimension declaration and registration, the descriptor rules
and their whole-registry test, the write validators' shape/rate/posture/gate rules, the `{intent,
config}` persisted shape and its round-trip, the text and registration gates, and the layering gate.

## 3. Corrections required before Phase 1 is delivered

Ordered by execution: nothing in the code column starts before the corpus column's matching item is
decided, because a rewritten algebra that the spec does not state is a second private model.

| # | Correction | Kind | Site | Blocks | Done when |
| --- | --- | --- | --- | --- | --- |
| **K1** | Restate `Rate`'s resolution as the **clamp**: `Applied = Intent` bounded by the equipment's capability, with the recorded intent left untouched so a demand can wait for gear (D1) | corpus | [spec.md](../spec.md) §6.7's `Rate` row and the "stronger" sentence; the brief's own contradiction (602 vs 618-619) is the record, not an edit | K5 | the spec states the clamp and states the "waiting" property over the **intent**, not over `Applied` |
| **K2** | Restate cosmetics as **a function of the Intent, parameterised by the item** (D6) | corpus | §6.1's "Appearance is the equipment's declaration" block (in place) | S4 | the spec says an instance derives its look from the intent, and per-item variation is the mapping's parameter |
| **K3** | Give capability's **grant half** a field in the bid and in the resolution, and say where it lives (D3) | corpus + code | §6.1's `Whitelist`, §6.5's persisted shape, §6.7's resolution; `ProviderDeclaration`, `DimensionResolution` | K4, S5 | a bid can declare a grant, a resolution reports it, and the validator's `grants` argument has a producer |
| **K4** | The facade **supplies the grant from the worn set** on the dimension's own channel (F1) | code | `Public/Control.ts:111-123` and one new test through the facade | 2.7's acceptance, S5 | `SetIntent({dimension, intent:{Intent: OverrideAllowed}})` succeeds exactly when the worn set promises, and is refused when it does not |
| **K5** | **Clamp both facets** in the router and rewrite the three tests that assert the stronger-of rule (D1, D7's posture half) | code + test | `Router.ts:329` and `ResolvePosture`'s allow branch; `control-router.test.ts:112-153`, `:319-346` | — | an over-capability intent resolves to capability; a demand under a permit gate cannot add a pose the ceiling excludes; the "wait" case still resolves to the demand when capability rises |
| **K6** | Delete §12's stale row that still lists the router's three rules as proposed (F6) | corpus | [spec.md](../spec.md) §12, last table | — | §6.7 and §12 tell one story |
| **K7** | Rewrite plan 3.1's text, which still says "keep the existing state accessors" — Phase 1 deleted them (F7) | plan | [dev-plan.md](../dev-plan.md) Phase 3, step 3.1 | 3.1's scope | 3.1 names the limiters and the driver that actually exist |
| **K8** | Gate the random `tick` driver out of a playable build (F2) | code | `MachinePrime/Debug.ts:192-205` | 2.2's observability, any playtest | a release build registers no tick handler, or the handler is inert without an explicit flag |
| **K9** | Publish the provider enumeration, or a batch resolve, and say which is the intended call (F5) | code | `Coordinator/Membership.ts:78`, `Public/index.ts` | 2.1/2.2 | a console caller can enumerate once and resolve several dimensions against one set of bids |
| **K10** | Write the test each of K4, K5, K8, K9 needs, each **failing when its mechanism is deleted** (F8's subset) | test | the named suites, plus `run-all.ts` | — | the suite catches the regression; a "green with the mechanism removed" test is rejected in review |
| **K11** | File the decision(s) and record them as brief Appendix E row(s) once decided | process | GitHub issues; [design-brief.md](../design-brief.md) Appendix E | the corpus edits | each accepted item above names its issue, and the brief's record accretes without its reasoning being rewritten |
| **K12** | Give `Entry` its two **shell fields** — `Quests` (the metadata route 1 preserves) and `Rules` (the Hive's rules, §7.5) — as empty interfaces with a tolerant reader (Q4/A4) | code | `Coordinator/Internal/State.ts:50-163`; `coordinator-state.property.test.ts` | the first release | **done 2026-10-20** — both shells round-trip to one shared value, and the suite carries the case that would fail on a naive `{}` |

K1–K3 and K6 are the **corpus** half; K4, K5, K8–K10 are the **re-delivery**; K7 is the plan's own
text; K11 is the route that makes any of it legitimate.

## 4. Deferred to the slice that owns it

| # | Correction | Owner slice | Why not now |
| --- | --- | --- | --- |
| **S1** | Every controlled family ships the **loose vanilla baseline**, with a gate over the templates (D2) | 2.6 | it changes item behaviour and needs a per-family before/after; it is the step 2.6 already schedules |
| **S2** | Remove the pose-driver words from the controlled templates and make the rule-6 gate **walk the templates** (D7) | the gate now; the words with 2.7 | the words are a live second route, so the gate can land immediately; removing them belongs to the posture slice |
| **S3** | Build the **injector layer**: one component resolves (Intent, Capability) and applies it; items stop calling the controller (D4) | 2.1, with 3.1 | it is the first phase that binds a seam, so it is the first that needs the component |
| **S4** | The **muffler's cosmetics** move from its static declaration to the resolved intent | with S3 (D6's code half) | an item-side change that follows the injector's shape |
| **S5** | The body-state answer becomes **three-valued** (F4) | 2.1 | it is the contract of the first `forceResult` seam, so it cannot be written before that seam is bound |
| **S6** | The **Status** state and its path 2 | after the observed-surface design | the owner deferred the field list with a named dependency (D5) |
| **S7** | **Fill** the coordinator entry's two shells — the quest metadata and the rules (F9, §7.5) | 5.10, and the rule channel's design | the **homes** are in place as of K12 (2026-10-20); only the contents wait, and filling one is an addition rather than a migration |

## 5. Notes, not corrections

- The driver's docblock says *roughly 45%*; the comparisons give 40%. A prose number that disagrees
  with the line below it costs trust in the rest of the docblock.
- `Coordinator/SensoryControl.ts:12` names `Resolve(dimension).Target`; a resolution has `Demand`,
  `Applied`, `Ceiling` and `Projected`.
- The plan records *220 tests over 44 suites*; the tree runs **222**.
- Commit `44d8840` (*label swap*) rewrote the marker vocabulary across the corpus with no Appendix E
  row. If a pure label swap is outside the protocol there is nothing to do; if not, it wants one row.

## 6. Decisions taken

| # | Question | Answer |
| --- | --- | --- |
| **A1** | Do K1 and K2 change the corpus as worded? | **yes** — §6.7's algebra becomes the clamp; §6.1's appearance becomes the intent's function |
| **A2** | Does K3's `Granted` field land now, or with 2.4? | **now** — the field in this re-delivery; the first capability keys still arrive with 2.4 |
| **A3** | Re-deliver, or close conditionally? | **re-deliver** — the phase is written again against the corrected model |
| **A4** | Add the coordinator's missing state fields now? | **yes** — `Quests` and `Rules` land in `Entry` now, typed as **empty interfaces** (K12, done); filling them belongs to their own slices |
| **A5** | How are the corpus edits tracked? | **one issue** carrying the five as a checklist; **one issue each** for the code items (§7) |

Two clarifications that cost a round of questions, kept because the next session will meet the
same words: **"state shape"** meant the field layout of the coordinator's saved record (not the
semantics of what goes in the fields), and **"the corpus"** meant the four documents under
[`design/`](../README.md) — the corpus half of the list is the five edits that touch one of them.

## 7. Issue drafts (A5's shape)

**Corpus — one issue.**

*Title:* `Design: the control model's algebra, cosmetics and grant channel`

*Body:* the owner's canonical statement and [the divergence audit](canonical-model-divergences.md)
are the finding; this issue is the correction. Checklist:

1. **§6.7** — `Rate` resolves as a **clamp** (`Applied = Intent` bounded by capability), the
   `Posture` rule with it; the "stronger of" sentence goes, and the "a demand waits for gear"
   property is stated over the *recorded intent* instead.
2. **§6.1** — appearance is **a function of the intent, parameterised by the item**; the
   "Host has no cosmetic lever" sentence is corrected for rendering (per-item variation stays,
   as the mapping's parameter).
3. **§6.1 / §6.5 / §6.7** — `Whitelist.Granted` is a **capability** field: a bid can declare it,
   a resolution reports it, and the validator's `grants` has a producer.
4. **§12** — drop the row that still lists the router's three rules as proposed.
5. **dev-plan 3.1** — correct the text that asks for state accessors Phase 1 deleted.

*Done when:* the five edits are in, the plan's step matches the tree, and an Appendix E row names
this issue. **K1, K2, K3's spec part, K6, K7.**

**Code — one issue each.**

| Issue title | Carries |
| --- | --- |
| `Router: capability bounds intent — clamp both facets` | K5 |
| `Control: the facade supplies the equipment's grant` | K4, and K3's code half |
| `Debug: gate the random tick driver out of a playable build` | K8 |
| `Surface: publish the provider enumeration, or a batch resolve` | K9 |
| `Tests: prove the corrected write and resolve paths` | K10 |

Not filed yet: **K12 is done in the tree** (2026-10-20), and the K12 commit is its record; S1–S7
are opened when their slice starts, which is the plan's own rule.

## 8. What this draft does not do

- It does not edit the spec, the plan or the brief, and it does not open the issues it drafts.
- It does not restate the canonical model: that statement and its audit are in
  [canonical-model-divergences.md](canonical-model-divergences.md).
- It does not decide whether the corrections are correct — only that they are what the current
  delivery lacks against the model the owner stated.

## 9. How to re-derive this

```sh
npm run verify                                   # the gate this draft reports
git log --oneline -1                             # 9f39210 at the time of writing
sed -n '112,153p' test/control-router.test.ts    # K5: the three tests that pin the rejected algebra
sed -n '111,123p' src/FactionMachine/MachinePrime/Coordinator/Public/Control.ts  # K4
sed -n '192,205p' src/FactionMachine/MachinePrime/Debug.ts                      # K8
```