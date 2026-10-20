# The design corpus

The four documents that decide what `Boids` is. They were frozen as a set on **2026-10-16**, and
they are the source of milestone **v0.5.0: Machine Prime (mvp)** — `dev-plan.md` Phases 1–5 plus
Phase 8.

## What this development pass is

> **The owner's statement of the programme, recorded 2026-10-20.** This repository is not a
> greenfield build and not a maintenance branch: it is a **gradual rewrite of the Boids codebase,
> one part at a time**, toward the vision this corpus was written for
> ([design-brief.md](design-brief.md) §1). The documents below are the reference that rewrite is
> written against; the plan's phases are the order it is written in, and each phase **replaces a
> slice of the old mod** rather than decorating it or building beside it.

Three consequences for a session that picks the work up cold:

- **The target is the spec, not the old code.** Where the old implementation and
  [spec.md](spec.md) disagree, the spec wins, and the old code is evidence of what the mod used to
  do rather than precedent for what it should look like. A difference the rewrite intends is
  recorded; an unrecorded one is a defect.
- **A phase is finished when its exit condition is true as written** — not when the code compiles,
  and not when it resembles the design. The exit conditions are a slice's acceptance test, and a
  clause that is only partly true is a phase that is only partly delivered.
- **Work outside the current slice is recorded, not fixed in passing.** A finding belongs to the
  slice that owns it; the [report folder](report/) is where one waits until then.

| Document | What it is | State |
| --- | --- | --- |
| [`design-brief.md`](design-brief.md) | the design discussion: its reasoning, its base-game citations, and the questions it left open | **frozen** — non-normative, and never rewritten |
| [`spec.md`](spec.md) | the normative specification for MachinePrime and the shared infrastructure beneath it | **frozen** — this is what the mod is |
| [`dev-plan.md`](dev-plan.md) | the ordered work programme that implements the spec | **frozen**, and moved by tracking thereafter |
| [`codex.md`](codex.md) | the content and fiction bible: setting, voice, visuals, script beats and terminology | **not** frozen — it is written for the people authoring |

## Where a change goes

The design is closed, so **none of these documents is edited to record an idea.** The route is:

1. an **issue** states the proposed change and its reasoning;
2. the issue is **decided**;
3. the decision lands in `spec.md` — and, if it breaks saves, in its version table and migration
   chain as well;
4. the work is scheduled in `dev-plan.md`;
5. `design-brief.md` gains a dated row in **its Appendix E** naming the issue and the change.
   **The reasoning stays as it was reasoned; only the record accretes.**

**A step that is implemented but not promoted is still a `[Proposed]`.** Building one never settles it —
promotion is an edit to `spec.md`. `spec.md`'s own header is the normative statement of this
protocol; the summary above is only an index.

## Reading the markers

Every claim in the brief, the spec and the plan carries a marker, and the difference matters:
**[Existing]** verified in the base game or this repository, **[Decided]** decided, **[Proposed]** proposed
and not decided, **[TBD]** deliberately open, **[Goal Post]** recorded and deliberately out of
scope, **[To Be Verified]** known to be unknown. The spec's conventions section defines them.
