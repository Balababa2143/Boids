# Notes on Base game

> **These notes are not corpus.** They decide nothing, they are not frozen, and nothing here may be
> cited as authority. Where a note and [`design/spec.md`](../../spec.md) disagree, the spec wins —
> always. What a report is, and what belongs in one, is stated once in [`../AGENTS.md`](../AGENTS.md).

Everything under this folder is about Kinky Dungeon's own code: what a mechanism actually does, what it
is written and read as, and which of several answers to the same question is the live one. Each note
names the site it was read from and, at the end, the command that reproduces its numbers.

| Folder | Phase | What it traces |
| --- | --- | --- |
| [`Phase 0/`](<Phase 0/AGENTS.md>) | Foundation | the save round-trip, the event bus, the UI button cache, and how a name is minted on each side of the boundary |
| [`Phase 0.5/`](<Phase 0.5/AGENTS.md>) | the text surface | the engine's text lookup, the one group it reads, the key shapes it composes at each call site, and the two translation routes that reach the same flat map |
| [`Phase 1/`](<Phase 1/AGENTS.md>) | the control model | the interpolation seams, binding, gag and speech, the two senses, the lower body, and the pose system |

These folders keep the phase names they were written under. Each carries its own conventions in an
`AGENTS.md` beside its notes — its markers, its path shorthand and its index — so read that file before
the notes it indexes. The spelling of each folder name is load-bearing: every link here and inside the
notes names it exactly.

The game is in continuous development. Information recorded in this folder may become obsolete.
