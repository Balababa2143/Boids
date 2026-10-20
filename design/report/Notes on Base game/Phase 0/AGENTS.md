# Phase 0 research notes — the engine underneath

> **This folder is not corpus.** It decides nothing, it is not frozen, and nothing here may be cited
> as authority. Where these notes and `design/spec.md` disagree, the spec wins — always, and without
> appeal. What the folder is for is the other half of the work: the engine facts a phase had to trace
> to finish, written down once so nobody has to trace them twice.

Phase 0 was **Foundation**: the save round-trip, an identifier scheme, a version table and a
migration chain, and the GUID-uniqueness gate. Almost all of that work sat on four mechanisms of the
base game that are documented nowhere — how a save is assembled and read back, how an event reaches
a handler, how a player clicks a button, and what a "name" is on each side of the boundary. Those
four are what this folder records.

Sibling: [`Phase 1's notes`](<../Phase 1  - Base Game Research Notes/AGENTS.md>) hold the later phase's
notes and the folder's shared conventions. This phase's notes are written to stand alone, so the three
conventions that matter are restated here rather than cross-referenced.

---

## The markers

`design/README.md` defines the corpus's markers — `[Existing]`, `[Decided]`, `[Proposed]`, `[TBD]`,
`[Goal Post]`, `[To Be Verified]` — and those are claims about **design status**. Reusing them in a research
note would imply a standing it does not have, so this folder uses its own three, and nothing here is
ever `[Decided]`:

| Marker | Means |
| --- | --- |
| **[read]** | the source line was read, and the claim is what it says |
| **[counted]** | produced by a command given in that file's *How to re-derive this* |
| **[inferred]** | reasoned from what was read, but not confirmed by a line of the engine |

A finding here can **motivate** a decision. The decision lives in `design/spec.md`, and this folder
is not where you find out what the mod does.

---

## How paths are written

The base game lives in a submodule, and its sites need a shorthand or every citation becomes a
paragraph. This folder follows the same one the sibling phase uses, and states it because it is not
written down anywhere else:

| Written as | Means |
| --- | --- |
| `base/KinkyDungeon.ts:7292` | `kd-structured/KinkyDungeon/Game/src/base/KinkyDungeon.ts:7292` |
| `Data/Poses.ts` | `kd-structured/KinkyDungeon/Data/Poses.ts` |
| `Scripts/lib/LZString.js` | `kd-structured/KinkyDungeon/Scripts/lib/LZString.js` |
| `node_modules/uuid/dist-node/v5.js` | the repository's own installed dependency |
| `src/…`, `test/…`, `design/…`, `docs/…` | repository paths, as usual |

So **a path with no leading repository folder is under the submodule's `Game/src/`**, and the two
exceptions that live outside it — `Data/` and `Scripts/` — name themselves.

> **[inferred] This shorthand is why a wrong site can survive a long time.** A bare
> `restraint/X.ts:1234` is not a repository path, so no gate in this repository can resolve it —
> the path-checking gate only polices backticked tokens that begin with `design/` or `docs/`. **Every
> site in this phase's notes was re-read while the sentence citing it was written**, which is the only
> defence available for a claim about somebody else's source tree.

Citations give a line **plus the enclosing function's name** wherever one exists, so a shift of a
line or two does not invalidate them.

---

## The index

| File | What it answers |
| --- | --- |
| [`save-system.md`](save-system.md) | what a save is made of, the two `KDGameData` objects, the load lifecycle in order, and the one write the load path makes before it can know whether the save is good |
| [`event-bus.md`](event-bus.md) | one send, thirteen maps, four handler signatures, the mod-writable registry, and the two arrival points on the load path |
| [`ui-patterns.md`](ui-patterns.md) | why a drawn button does not act, the two ways the cache is invoked, the click-twice confirmation, and the one surface outside the button system |
| [`identifiers.md`](identifiers.md) | how a name is minted on each side of the boundary, and why a definition and a worn instance are not interchangeable |
| [`repo-traps.md`](repo-traps.md) | the **host repository's** traps: what a registration costs, which gate holds each rule, and the three ways the test harness can report a pass over code it never reached |

---

## What this folder is not

- **Not a decision record.** `design/design-brief.md` is where reasoning about choices lives; this
  folder only says what the engine does.
- **Not a substitute for the guide.** `docs/guide/` is hand-written documentation for people working
  *on this mod*. In particular the mod's own versioning scheme, its gate and its prompts are
  [`docs/guide/saves.md`](../../../../docs/guide/saves.md) and are **not** restated here — a second copy
  of a live design is a copy that drifts.
- **Not a defect register.** Defects the engine ships are tracked in
  [`docs/guide/known-issues.md`](../../../../docs/guide/known-issues.md), with the base-game ones in
  their own table at the end. This folder notes only the defects its own claims need.
- **Not exhaustive.** Four mechanisms, because four were needed. Dungeons, AI, combat, magic,
  inventory and the drawing system are largely untraced.

> **[read] One dead reference, recorded and then repaired.** The defect table in the guide said the
> mechanism behind each entry was traced in `design/report/`'s root index, and the link it used named
> a file that does not exist — the index lives inside a phase folder, not above one. The
> path-checking gate could never see the problem, because it polices **backticked** tokens and that
> reference was a markdown link target. **The reorganisation of `design/report/` into
> [`Notes on Base game/`](../AGENTS.md) is the change that owned the fix**, so the guide now points
> at the base-game index where it actually is.
