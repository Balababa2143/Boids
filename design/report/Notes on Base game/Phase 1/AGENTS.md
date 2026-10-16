# Base-game research notes

> **This folder is not corpus.** It decides nothing, it is not frozen, and nothing here may be cited
> as authority. Where these notes and [`design/spec.md`](../../../spec.md) disagree, the spec wins — always,
> and without appeal. What this folder is for is the other half of the work: the engine facts the
> design's citations rest on, written down once so nobody has to trace them twice.

## Why these notes exist

Every phase of this mod leans on facts about Kinky Dungeon's own code that are **not in the base game's
documentation and not visible from any single file**. They are aggregate functions with surprising
algebras, predicates that answer one question several disagreeing ways, content grids that reveal what
the original author actually meant, and a pose system with two layers and four attachment points. Each
one cost a tracing session to find.

They are also the kind of fact that decays. A line number moves; a count drifts as content is added; a
defect gets fixed upstream and a workaround silently becomes wrong. So each file here ends with a
**How to re-derive this** section holding the commands that produced its numbers, and every count is
labelled as counted rather than remembered.

## Not corpus, and marked differently on purpose

[`design/README.md`](../../../README.md) defines the corpus's markers — `[既有]`, `[决定]`, `[提议]`,
`[待定]`, `[goal post]`, `[待验证]` — and they are claims about **design status**. Reusing them here
would imply these notes have standing they do not have. This folder therefore uses its own three:

| Marker | Means |
| --- | --- |
| **[read]** | the source line was read, and the claim is what it says |
| **[counted]** | produced by the command given in that file's *How to re-derive this* |
| **[inferred]** | reasoned from what was read, but not confirmed by a line of the engine |

Nothing in this folder is `[决定]`. A finding here can **motivate** a decision; the decision lives in
the spec, and this folder is not where you find out what the mod does.

## How paths in this folder are written

The base game lives in a submodule, in two roots, and its own documentation — and
[`docs/guide/known-issues.md`](../../../../docs/guide/known-issues.md) in this repository — cites it with a
shorthand that **is never stated anywhere**. State it once, here:

| Written as | Means |
| --- | --- |
| `restraint/KinkyDungeonRestraints.ts:1713` | `kd-structured/KinkyDungeon/Game/src/restraint/KinkyDungeonRestraints.ts:1713` |
| `Data/Poses.ts:477` | `kd-structured/KinkyDungeon/Data/Poses.ts:477` |
| `Scripts/Typedef.ts` | `kd-structured/KinkyDungeon/Scripts/Typedef.ts` |

So a path with **no** leading folder is under `Game/src/`, and the two exceptions that live outside it
name themselves (`Data/`, `Scripts/`).

> **[inferred] This unstated convention is why an error survived in the defect register.** Because a
> bare `restraint/X.ts` token is not a repository path that this repo's own gate can resolve,
> [`test/docs-paths.test.ts`](../../../../test/docs-paths.test.ts) cannot check it — that gate only polices
> backticked tokens beginning `design/` or `docs/`. The register had the `BoundFeet` write and read the
> wrong way round, and nothing was ever going to notice. **Every site in this folder was re-read while
> the sentence citing it was written**, which is the only defence there is.

A citation is given as a line **range plus the enclosing function's name** wherever one exists, so that
a shift of a line or two does not invalidate it.

## The method, as a procedure worth repeating

The same six moves found every subsystem in this folder. They are stated because the next unfamiliar
mechanism should not need a new method.

1. **Find the aggregate, not the consumer.** The interesting code is the function that turns what is
   worn into one number — `KinkyDungeonGagTotal`, `KDHandBondageTotal`, `KDDeafLevel`,
   `KinkyDungeonGetBlindLevel`, `KinkyDungeonCalculateSlowLevel`. The consumers only *read* it; the
   aggregate is where the shape is decided.
2. **Read the aggregate's algebra off its body.** Do not trust the event name or the type. One adds to
   accumulators, one replaces a value outright, one multiplies, and one is a count and a maximum at
   once. [`seam-taxonomy.md`](seam-taxonomy.md) is the catalogue.
3. **Count the content distribution.** The shipped restraints are the original author's statement of
   intent, and the histogram is the sentence: 45 of 61 `hobble` values sit at exactly `1`, and 47 of 66
   `bindhands` values sit at exactly `1.0`. A field whose values pile up on one number is a **boolean
   wearing a number's clothes**, and the surrounding range is the real design.
4. **Enumerate every predicate that answers the same question** — then assume they disagree. There are
   four ways to ask *can she talk* and four ways to ask *can she remove this*; two of them traverse
   different lists and one of them is simply broken.
5. **Separate the write side from the read side, and find the mapping between them.** Almost everything
   here is written as a field on a restraint and read as a **tag**, a **flag** or a **level**, through a
   copy step that is easy to miss and has been got wrong at least twice in the base game.
6. **Search case-sensitively.** `gag` is a restraint property *and* the name of a model layer filter
   (`Filters: { Gag: … }`), and a default `Select-String` conflates them — which inflated one count in
   an earlier session from 81 to 87.

## The index

| File | What it answers |
| --- | --- |
| [`base-game-map.md`](base-game-map.md) | where the code is, how it is bundled, which file owns which mechanism, and the three patterns that recur everywhere |
| [`seam-taxonomy.md`](seam-taxonomy.md) | the four algebras an interpolation point can have, and how to tell which one you are looking at |
| [`binding-arm-and-hand.md`](binding-arm-and-hand.md) | `bindarms`, `bindhands`, `restricthands`: two fields, seven capabilities, four disagreeing predicates, and the threshold census |
| [`gag-and-speech.md`](gag-and-speech.md) | `gag`: what the sum drives, the four consumption gates, and the four predicates |
| [`senses-sight-and-hearing.md`](senses-sight-and-hearing.md) | two sensory aggregates with **different** algebras, and the training track they share |
| [`lower-body.md`](lower-body.md) | the four unconnected tracks — a slow level, a heel level, a balance pool and a set of tags |
| [`pose-system.md`](pose-system.md) | the two layers, the four attachment points, the feedback loop, and the empty-set sentinel |
| [`repo-traps.md`](repo-traps.md) | the **host repository's** traps rather than the game's: round-trips, equality, derived names, and the gates a new file must satisfy |

Defects the engine ships are **not** duplicated here. Their register is
[`docs/guide/known-issues.md`](../../../../docs/guide/known-issues.md), and each file below notes the ones
that bear on its subsystem.

## What this folder is not

- **Not a decision record.** [`design/design-brief.md`](../../../design-brief.md) is where reasoning about
  choices lives; this folder only says what the engine does.
- **Not a substitute for the guide.** [`docs/guide/`](../../../../docs/guide/) is hand-written documentation
  for people working *on this mod*; these notes are about the thing the mod sits inside.
- **Not exhaustive.** It covers the subsystems that have been needed so far — binding, speech, the two
  senses, the lower body and the pose system. Dungeons, AI, combat, magic and items are largely
  untraced, and a file for one of them should follow the method above rather than a new one.
