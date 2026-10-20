# Canonical model divergences — the control system the owner states, against the corpus and the tree

**Reviewed:** 2026-10-20, `dev` at `44d8840`, plus this session's uncommitted report files.
**Subject:** the owner gave the canonical control model directly in session (2026-10-20). This report
sets that statement against `design/spec.md` and `design/design-brief.md`, and against the tree.
**Standing:** every fix below needs the corpus's own route — issue, decision, spec, plan, brief
Appendix E. This report decides nothing, and the corpus is unchanged by it.

## The canonical model, as stated

No corpus document states it whole, so it is recorded here as the yardstick this report measures
against — not as a decision.

**Three states.**

1. **Capability** — computed from the controlled restraint set: what the hive/coordinator *can* do
   to the doll. Two halves, and they are **not mutually exclusive**: **suppression** (take away a
   behaviour or a perception) and **grant** (give an ability the current status forbids — a
   prosthetic letting a bound doll use a weapon).
2. **Intent** — what the hive/coordinator *wants* to do.
3. **Status** — a quick reference resolved from the current game state: what the PC is doing this
   turn that the hive cares about (pose, violations, and the numbers it watches). **Its field
   list is deferred**: the owner is discussing a design question that this gap raised.

**Four signal paths.**

| # | Path | What it carries |
| --- | --- | --- |
| 1 | restraint set → coordinator | the capability it can physically exercise |
| 2 | game state → coordinator | the observed numbers, i.e. Status |
| 3 | coordinator → restraint instance | the instance derives **its own cosmetics** from the Intent |
| 4 | coordinator → dynamic-effect injector | the injector derives the game-state modification from **Intent and Capability**, and applies it at the injection point |

**One rule of grace:** the hive sends Intent inside Capability's feasible space; an Intent beyond it
is **not an error** but is executed as the **closest actionable to the Intent**.

**And one rule outside the control system:** a restraint **may** use the vanilla declaration for a
**very loose** baseline effect. The real effect belongs to the injector.

> **Confirmed while writing this report (owner, 2026-10-20).** The grace rule means a **clamp** —
> `Applied = min(Intent, Capability)` — with the recorded intent left untouched, so a demand can
> still wait for gear that reaches it. That settles D1's direction; it does not by itself put
> anything into the corpus.

## State and signal map

| Canonical | Corpus | Tree | Verdict |
| --- | --- | --- | --- |
| Capability · suppression | `Rate.Ceiling` (`design/spec.md:455`), aggregated from bids | `ProviderBid.Power` → `DimensionResolution.Ceiling` | present |
| Capability · grant | `Whitelist.Granted` (`design/spec.md:458`, `:581`), `Posture.Allowed` | `Posture.Allowed` only; there is **no `Granted`** in the bid or in the resolution, and `CapabilityKey = never` | **missing** |
| Intent | `design/spec.md` §6.5 `{ Target, Allowed, Intent }` | `dossier.intent` | present |
| Status | nothing | nothing | **missing** |
| Path 1 | §6.12 clause 4: capability computed at execution time from what is worn | `FindProviders()` pulled per resolution | mechanism differs (pull, not push); semantics keep |
| Path 2 | nothing | nothing | **missing** |
| Path 3 | §6.1: appearance is the **item's** declaration; the Host has no cosmetic lever | visor derives its template from the resolved strength; muffler renders a static declaration | **split, and the corpus sides with the half the canonical model rejects** |
| Path 4 | §6.4 names an "injection layer"; §6.12 clause 5: the item does not call the controller | no injector module; injection lives in item handlers, and they **do** call the controller | **missing, and clause 5 is violated** |

A note so this is not over-accused: the per-dimension `Direction` (deny / grant / both) is **not** a
divergence. "The halves are not mutually exclusive" is a statement about one equipment set's
capability, and one dimension composing both is exactly how the corpus represents it.

## Findings

### D1 — capability is treated as a floor and intent is unclamped [read]

- **Canonical:** intent is clamped to capability; the intent itself is kept.
- **Corpus:** `design/design-brief.md:602` — "`target > equipment` is allowed, and the router takes
  the **stricter** value"; and `:618-619` of the same brief — "`target > ceiling` is deliberately
  *not* a validator … **the router clamps at read time**". The two sentences cannot both hold.
  `design/spec.md:799` then adopted the first: "**`Applied` is the stronger of the Host's demand
  and that capability**".
- **Tree:** `src/KDExtension/Control/Router.ts:329` — `Applied = Math.max(demand, capability)` — and
  `test/control-router.test.ts:112-153`, which pins three things: with nothing demanded the gear
  still imposes its capability (`:123`), the stronger side wins in both directions (`:130-141`), and
  a demand beyond any worn gear is applied as sent (`:143-153`).
- **Consequence:** over-capability intent is applied as sent, so the field named `Ceiling` is not a
  ceiling; the "closest actionable" fallback does not exist; and the visor's own docblock
  (`src/FactionMachine/MachinePrime/Item/Visor/Common.ts:96-99`) describes the opposite of what the
  code does.
- **Fix:** restate §6.7's `Rate` rule as a clamp (and the `Posture` rule with it — D7 is its other
  half), change `ResolveNumeric`, and rewrite the three tests to assert the clamp while keeping the
  "a demand waits for gear" property.
- **Issue title:** *Router: capability bounds intent — replace the stronger-of rule with the clamp.*

### D2 — the vanilla baseline is not loose [read]

- **Canonical:** the vanilla declaration is optional and **very loose**; the injector supplies the
  real effect.
- **Corpus:** `design/spec.md:428` ("restraint fields at 0 or a very loose baseline"); `:579`
  ("the restraint template's defaults are always the floor").
- **Tree:** the floor is not loose in five families. `src/FactionMachine/Futuristic/Link/Arm.ts:77,
  :98, :120` set `bindarms: true`; `src/FactionMachine/Futuristic/Limb/Mitten/Item.ts:174` sets
  `bindhands: 1.4`; `src/FactionMachine/Futuristic/GlassVisor/Item.ts:146` sets
  `blindfold: CalcBlind(variant)` (1.0 to 2.8 before the game's x1.5);
  `src/FactionMachine/Futuristic/Headphone.ts:108` sets `deaf: 2`;
  `src/FactionMachine/Futuristic/Gag/Common.ts:335` sets `gag: GetGagStrength(variant)`.
  Only the cuff family is loose (`src/FactionMachine/Futuristic/Cuff/Item.ts:178` — `bindarms: false`).
- **Consequence:** with the Host silent, the gear is already restricting; the controller cannot
  relax below the vanilla floor, so the clamp has nothing to clamp down to; and `Free` cannot mean
  "inject nothing" while the template says otherwise.
- **Fix:** extend the dev-plan's 2.6 to every controlled family, and add a gate that walks the
  controlled templates and asserts the loose baseline per field, rather than trusting a hand check.
- **Issue title:** *Restraints: every controlled family ships the loose baseline, and a gate proves it.*

### D3 — capability's grant half exists nowhere in the runtime path [read]

- **Canonical:** capability = suppression **and** grant, both computed from the equipment.
- **Corpus:** `design/spec.md:458` (`Whitelist { Granted }`), `:581` and `:586` (the grant rule),
  `design/design-brief.md:614` (`OverrideAllowed` requires the equipment's `Granted`).
- **Tree:** `src/FactionMachine/MachinePrime/Coordinator/Provider.ts:36-65` — the bid carries
  `Power`, `Stack`, `Allowed` and nothing else; `src/KDExtension/Control/Router.ts:121` —
  `DimensionResolution` has no `Granted`; `src/KDExtension/Control/Capability.ts:35` —
  `CapabilityKey = never`; no item declares a granted key; and `SetIntent`'s `grants` argument has
  no supplier at all (the phase-1 review's F1).
- **Consequence:** the canonical model's own example — a prosthetic that lets a bound doll use a
  weapon — cannot be expressed end to end: no bid, no resolution, no key, no supplier.
- **Fix:** add `Granted` to the bid and the resolution, open the first capability keys at 2.4, and
  have the facade read the promise from the worn set (F1).
- **Issue title:** *Capability: carry the grant half from the bid to the seam.*

### D4 — there is no injection layer, and items call the controller [read]

- **Canonical:** one component takes (Intent, Capability) and applies the resulting modification
  at the injection point.
- **Corpus:** `design/spec.md:579-581` names an "injection layer"; `:1256-1260` (clause 5) says
  "**the item does not call the controller** … the controller is a subscriber, never a callee".
- **Tree:** injection is distributed into item handlers. The visor resolves and writes the seam
  itself — `src/FactionMachine/MachinePrime/Item/Visor/Common.ts:112`, `:320`, and
  `Item/Visor/Dollmaker.ts:63` — while the muffler listens to the rate event and only re-renders
  (`Item/Gag.ts:147-178`). No module owns the decision.
- **Consequence:** no single place can enforce the clamp (D1) or consult capability, so each
  family invents its own conversion (the phase-1 review's F3 is one symptom); and the item-side
  call is the clause-5 violation the spec forbids.
- **Fix:** build the injector as one subscriber per seam family, resolving once and applying once;
  items keep cosmetics only (path 3).
- **Issue title:** *Injection: one injector that resolves (Intent, Capability) — items stop calling the controller.*

### D5 — Status is absent, and nothing observes the game back to the coordinator [read]

- **Canonical:** state 3, and path 2 that carries it.
- **Corpus:** nothing. `design/spec.md` has no Status state, no violation concept, and its nearest
  relatives are the `BodyState` predicate shim and the deferred `Compliance` **stat** (§7.3). The
  term "Status" appears in the corpus only as a document-status heading.
- **Tree:** the coordinator learns only the worn set (pulled) and its own dossier; nothing about
  what the PC did this turn reaches it.
- **Consequence:** nothing in the model can react to behaviour — violations, attempts, a pose she
  actually took — and §8.4's entry conditions and 2.3's arousal work will each have to invent a
  private answer.
- **Fix:** a design addition (where the state lives, who resolves it, when) plus a module. **The
  field list is deliberately open** — the owner is discussing the design question this raised.
- **Issue title:** *Status: the coordinator needs an observed state, and path 2 to carry it.*

> **Later note, 2026-10-20 (design conversation).** A second and *separate* gap was found while the
> Status field list was being discussed, and it is not Status: the model has no **rule that does not
> strip capability** — a standing prohibition the PC can still break. It is not a divergence from the
> corpus either (the corpus never promised it). The requirement is recorded in
> [willing-surrender.md](<../Experience design/willing-surrender.md>) §7.5.

### D6 — cosmetics come from the item, not from the intent [read]

- **Canonical:** path 3 — the instance derives its cosmetics from the Intent.
- **Corpus:** `design/spec.md:485-495`, in place: appearance is "the equipment's declaration — not a
  facet, and not a demand", "the item declares its own appearance beside its own bid", "the Host
  has **no cosmetic lever at all**". This is the shape the `Form` retraction left behind.
- **Tree:** split. The visor does derive its model from the resolved strength
  (`Item/Visor/Common.ts:294-306`, `GetTemplateForStrength(partialVariant, NewStrength)`); the
  muffler renders a static declaration — `Item/Gag.ts:105-108` reads `AppearanceKey` off the item
  and `:147-178` re-renders that value when the rate moves, whatever the rate says.
- **Consequence:** two rules coexist for one mechanism, and the corpus's rule is the one that makes
  the canonical model's signal path 3 impossible.
- **Fix:** correct §6.1 to *cosmetics are a function of the intent, parameterised by the item* —
  which keeps "a small ball on a strict mechanism" expressible — and make the muffler render from
  the notified/resolved strength.
- **Issue title:** *Cosmetics: an instance derives its look from the Intent; §6.1's item-declared appearance is the wrong rule.*

### D7 — the posture system is still driven by vanilla words, and its gate is vacuous [read]

- **Canonical:** the body configuration follows from the Intent through the route; vanilla words
  must not drive it.
- **Corpus:** `design/spec.md:1298-1308` — rule 5 (no pose fields on a mod restraint) and rule 6
  (no pose-driver word in a controlled restraint's `shrine`).
- **Tree:** `src/FactionMachine/Futuristic/Link/Arm.ts:76-77` carries `shrine: ['Yokes']` on a
  template that also sets `bindarms: true`; `src/FactionMachine/Futuristic/Link/Leg.ts:57` and
  `:104` add the `FeetLinked` player tag. The test named for rule 6
  (`test/control-pose.test.ts:156-164`) only checks that `PoseDrivingShrineWords` **contains** six
  words; it never walks a shipped template, so the violation is green.
- **Consequence:** today's poses come from the game's tag cascade, not the controller — and once
  2.7 binds the route, those words remain a second, invisible route into the same system.
- **Fix:** remove the words and tags from the controlled templates, and rewrite the gate to walk
  every controlled template's `shrine`, `addPose`, `addPoseIfTopLevel`, `removePose` and `forbidPose`.
- **Issue title:** *Pose: a gate over the shipped templates, and the words that still drive them.*
  This is the posture half of D1, and the phase-1 review's F11 is the same finding seen from the
  router side.

## Why it was misread

Three artefacts, all still in the tree, explain the drift rather than an accident:

1. **The brief contradicts itself** — `:602` (take the stricter value) against `:618-619` (clamp at
   read time). The spec adopted the first and wrote it as a decision (`:799`).
2. **The suite pinned the wrong reading** — `control-router.test.ts:112-153` asserts the max as a
   property, so the clamp cannot arrive without a deliberate test change. That is good news: the
   gate will make the correction visible.
3. **The `Form` retraction moved a mechanism** — 1.10 removed the Host's size demand, and with it
   the sentence that cosmetics follow the intent; §6.1 now says the item declares its look. One
   retraction, two ideas, only one of them wrong.

## Fix order

| Order | What | Why here |
| --- | --- | --- |
| 1 | A single design issue covering D1, D6, D3's field and D5's existence | They are one vocabulary; code must not move before the target is written |
| 2 | D2 (loose baselines + gate) | Mechanical, many files, gate-able; shares a pass with 2.6 |
| 3 | D7 (pose words + gate) | Mechanical, and it removes a live second route |
| 4 | D4 (the injector) | Architectural; belongs to the Behavior slice, and absorbs the phase-1 review's F3 |
| 5 | D3 (grant half) | With 2.4, after the correction |
| 6 | D5 (Status) | After the owner settles what it holds |

## Open, and deliberately not decided here

- **Status's field list.** The owner deferred it, and the question it raised is a design question
  in its own right.
- **What "very loose" means numerically** — a per-field table, or zero everywhere with the injector
  supplying the whole effect.
- **Whether the injector is one module or one per seam family.** The canonical model says "one
  component"; the seam kinds differ enough that its internal shape is a real choice.
- **The five families' immediate values** — D2 changes behaviour on its own, so it is a deliberate
  step with a before/after, not a cleanup.

## How to re-derive this

```sh
sed -n '595,620p' design/design-brief.md          # D1: the two contradicting sentences
sed -n '795,802p' design/spec.md                  # D1: the adopted reading
sed -n '320,332p' src/KDExtension/Control/Router.ts   # D1: the algebra
grep -rn 'bindarms\|bindhands\|deaf:\|gag:\|blindfold:' src/FactionMachine   # D2: the baselines
grep -rn 'Granted' src/KDExtension/Control src/FactionMachine/MachinePrime/Coordinator   # D3
grep -rn 'Coordinator.Resolve' src/FactionMachine   # D4: items calling the controller
grep -rn 'shrine.*Yokes\|FeetLinked' src/FactionMachine   # D7: the live pose words
```

Sites are as of `44d8840`; the vendored game's line numbers are as of the submodule it pins.