# Play sessions

Records of **runs in the running game**: what was poked, what the game answered, and what that
means for something the suite cannot reach. A session record is a statement of what was **seen**,
carrying the page, the call and the value, so a later reader can replay it instead of trusting it.

> **Nothing here is corpus.** A session decides nothing, is never frozen, and may not be cited as
> authority. Where a record and [`design/spec.md`](../spec.md) disagree, the spec wins — always, and
> without appeal.

## What belongs here

- **One record per session** (or one plan plus its appended log, when the plan is written first):
  the target commit and build, how the game was served and driven, the checks attempted, and the
  result of each.
- **The evidence**, in the form the check produced it: an evaluated expression and its returned
  value, a console line, an error and its stack.
- **The findings**, with the issue title each would be opened under — same rule as the phase
  reviews, for the same reason: this folder is where a problem lives between being noticed and
  being filed.
- **The limits**: what was not attempted, and what a green result does *not* prove.

It does **not** belong here: a decision, a spec change, a step rearranged in the plan, or a
tester's impression of feel. Feel is Phase 8's subject, and it is decided by the owner, not by a
report.

## Markers

| Marker | Means |
| --- | --- |
| **[seen]** | a value returned by the running page, or a line it printed |
| **[read]** | the source line was read, and the claim is what it says |
| **[counted]** | produced by the command given in that record's *How to re-derive this* |
| **[inferred]** | reasoned from what was seen or read, not confirmed in the running game |

The corpus's markers are claims about **design status**; borrowing them here would lend a session a
standing it does not have.

## Driving the game without looking at it

A session is **non-visual**: no screenshots, no image analysis, no judging a canvas. The game is
driven through its own globals — `page.evaluate` calls against the names the engine publishes —
and through `fetch` of files it serves. A check that can only be answered by looking at the picture
does not belong in this folder.

## How paths are written

A repository site is the path plus a line. The base game's shorthand — a bare
`Scripts/KDMods.ts:350` meaning `kd-structured/KinkyDungeon/Scripts/KDMods.ts:350` — is the one
stated in [`Notes on Base game`](<../Notes on Base game/AGENTS.md>), and sessions here use it the
same way.

## The index

| Record | Target | What it answers |
| --- | --- | --- |
| [`first-contact-plan.md`](first-contact-plan.md) | built `kd-structured/KinkyDungeon` at `60b41e14d` (game 5.5.4), mod `9c77678` | the plan for the first in-browser baseline, its session log, and the owner's disposition; part of Phase 1's re-delivery (rev 2) |
