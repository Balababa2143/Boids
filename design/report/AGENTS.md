# Development reports

Reports written while working on this mod, kept so that the same tracing session, the same measurement
and the same afternoon lost to a trap do not happen twice. A report is a statement of what was **found**,
carrying the site or the command that produced it, so a later reader can check the claim rather than
trust it.

> **Nothing here is corpus.** A report decides nothing, is never frozen, and may not be cited as
> authority. Where a report and [`design/spec.md`](../spec.md) disagree, the spec wins — always, and
> without appeal. The reasoning behind a *decision* lives in [`design/design-brief.md`](../design-brief.md);
> a report is not where you find out what the mod does.

## What is here

| Folder | What it holds |
| --- | --- |
| [`Notes on Base game/`](<Notes on Base game/AGENTS.md>) | research notes on Kinky Dungeon's own code — the engine facts behind the corpus's citations |

Each report folder carries its own `AGENTS.md`, and that file is where its conventions live — the markers
it uses, how its paths are written, and its index — because those differ from one subject to the next.
Read the folder's own file before reading its reports.

## Adding a report

Give the subject a folder, give the folder an `AGENTS.md` that says what belongs in it and how to read
it, and index the reports there. Three habits are worth keeping whatever the subject is, because they are
what makes a report checkable rather than merely readable:

- **Name the site or the command.** A claim with a file and a line, or with a reproducer, can be
  re-derived; a claim without one is only a memory.
- **Say how it was established**, in the folder's own vocabulary rather than in the corpus's.
- **Do not borrow the corpus's markers.** `design/README.md`'s `[既有]`, `[决定]` and the rest are claims
  about **design status**, and reusing them here would lend a report a standing it does not have.
