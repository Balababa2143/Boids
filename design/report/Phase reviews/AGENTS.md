# Phase reviews

Reviews of a delivered phase: what the plan asked of it, what the tree actually does, and what the
next phase is going to stand on. A review is not a sign-off — it is a statement of what was **found**,
carrying the site or the command that produced it so a later reader can check the claim instead of
trusting it.

> **Nothing here is corpus.** A review decides nothing, is never frozen, and may not be cited as
> authority. Where a review and [`design/spec.md`](../spec.md) disagree, the spec wins — always, and
> without appeal. A finding here can motivate a decision; the decision lives in the spec, is scheduled
> in [`design/dev-plan.md`](../dev-plan.md), and is recorded in the brief's Appendix E.

## What belongs here

- **One review per delivered phase**: its exit condition clause by clause, the findings that make a
  clause untrue, and what each finding blocks downstream.
- **Findings that are not issues yet.** This repository tracks step status as GitHub issues, so a
  review is where a problem lives between being noticed and being filed. Each finding therefore ends
  with the issue title it would be opened under.
- **The coverage boundary** of a phase: which claims are tested, which are tested only against a
  stub, and which are merely read.
- **A working draft**, when a review's findings need to survive to the next session as one list: it
  carries the verdict, the corrections and the decisions taken so far in one place, it is written to
  be read rather than signed, and it is still not a decision.

It does **not** belong here: a decision, a design argument, a change request against the spec, or a
step rearranged in the plan. Those go through the corpus's own route — issue, decision, spec, plan,
Appendix E — and a review is not that route.

## Markers

The same three the parent tree uses, and no others:

| Marker | Means |
| --- | --- |
| **[read]** | the source line was read, and the claim is what it says |
| **[counted]** | produced by the command given in that report's *How to re-derive this* |
| **[inferred]** | reasoned from what was read, but not confirmed by a line of the engine |

The corpus's markers are claims about **design status**; borrowing them here would lend a review a
standing it does not have.

## How paths are written

A site is the repository path plus a line, with the enclosing function's name where one exists. The
base game's shorthand — a bare `restraint/KinkyDungeonRestraints.ts:1652` meaning
`kd-structured/KinkyDungeon/Game/src/restraint/KinkyDungeonRestraints.ts:1652` — is the one stated in
[`Notes on Base game`](<../Notes on Base game/AGENTS.md>), and reviews here use it the same way.

## The index

| Report | Phase | What it answers |
| --- | --- | --- |
| [`phase-1-control-model.md`](phase-1-control-model.md) | 1 — the control model | whether the phase's exit condition holds as written, and what Phases 2 and 3 are standing on |
| [`canonical-model-divergences.md`](canonical-model-divergences.md) | 1 — the control model | where the corpus and the tree diverge from the owner's canonical statement of the control system, and what each divergence blocks |
| [`phase-1-mid-review-draft.md`](phase-1-mid-review-draft.md) | 1 — the control model | a **working draft for the next session**: the verdict, the correction list (K1–K11), what is deferred to which slice, and the decisions the owner has taken |

## What this folder is not

- **Not a gate.** The gate is `npm run verify`; a review records what the gate cannot see.
- **Not a bug list for the base game.** Inherited defects have one register, in the guide, and a
  review only names the ones a finding below stands on.
- **Not a promise.** A finding is a problem as of the date on the report. Line numbers move.
