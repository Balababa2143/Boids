# Phase 0.5 research notes — the text layer underneath

> **This folder is not corpus.** It decides nothing, it is not frozen, and nothing here may be cited
> as authority. Where these notes and `design/spec.md` disagree, the spec wins — always, and without
> appeal. What the folder is for is the other half of the work: the engine facts a phase had to trace
> to finish, written down once so nobody has to trace them twice.

Phase 0.5 was the **layout and the text surface**: one adapter through which every string the mod can
show is registered, with the engine's own group for what the engine resolves and the mod's own group
for what the mod resolves. Almost all of that work sat on one mechanism of the base game that is
documented nowhere and is, in places, two mechanisms wearing one name: how a string is looked up, and
how a translation reaches it.

The sibling phase folders hold the notes of the phases either side of this one. **This folder is
written to stand alone** and names none of them, so a later reorganisation of the folder above cannot
break a link inside it. The three conventions that matter are restated here rather than
cross-referenced.

---

## The markers

`design/README.md` defines the corpus's markers — `[既有]`, `[决定]`, `[提议]`, `[待定]`,
`[goal post]`, `[待验证]` — and those are claims about **design status**. Reusing them in a research
note would imply a standing it does not have, so this folder uses its own three, and nothing here is
ever `[决定]`:

| Marker | Means |
| --- | --- |
| **[read]** | the source line was read, and the claim is what it says |
| **[counted]** | produced by a command given in that file's *How to re-derive this* |
| **[inferred]** | reasoned from what was read, but not confirmed by a line of the engine |

A finding here can **motivate** a decision. The decision lives in `design/spec.md`, and this folder is
not where you find out what the mod does.

---

## How paths are written

The base game lives in a submodule and has **three** roots. This folder follows the shorthand the
sibling phases use, plus the third root, and states it because it is written down nowhere else:

| Written as | Means |
| --- | --- |
| `item/KinkyDungeonInventory.ts:1297` | `kd-structured/KinkyDungeon/Game/src/item/KinkyDungeonInventory.ts:1297` |
| `base/KDModUtils.ts:487` | `kd-structured/KinkyDungeon/Game/src/base/KDModUtils.ts:487` |
| `Scripts/Text.ts:384` | `kd-structured/KinkyDungeon/Scripts/Text.ts:384` |
| `Data/Models.ts:102` | `kd-structured/KinkyDungeon/Data/Models.ts:102` |
| `Screens/MiniGame/KinkyDungeon/Text_KinkyDungeon.csv` | `kd-structured/KinkyDungeon/Screens/MiniGame/KinkyDungeon/Text_KinkyDungeon.csv` |
| `src/…`, `test/…`, `design/…`, `docs/…` | repository paths, as usual |

So **a path with no leading repository folder is under the submodule's `Game/src/`**, and `Scripts/`,
`Data/` and `Screens/` name themselves.

> **[inferred] This shorthand is why a wrong site can survive a long time.** A bare
> `item/X.ts:1234` is not a repository path, so no gate in this repository can resolve it — the
> path-checking gate only polices backticked tokens that begin with `design/` or `docs/`. **Every site
> in this folder was re-read while the sentence citing it was written**, which is the only defence
> available for a claim about somebody else's source tree.

A citation gives a line **plus the enclosing function's name** wherever one exists, so a shift of a
line or two does not invalidate it.

---

## The index

| File | What it answers |
| --- | --- |
| [`text-and-localization.md`](text-and-localization.md) | how `TextProvider` looks a string up, why only the `default` group is ever read, the key shapes the engine composes at each call site, which of the two slots is flavour, and the two translation routes that reach the same flat map |

---

## What this folder is not

- **Not a decision record.** `design/design-brief.md` is where reasoning about choices lives; this
  folder only says what the engine does.
- **Not a substitute for the guide.** `docs/guide/` is hand-written documentation for people working
  *on this mod*; the mod's own text conventions live there and are **not** restated here, because a
  second copy of a live design is a copy that drifts.
- **Not a defect register.** Defects the engine ships are tracked in `docs/guide/known-issues.md`. This
  folder notes only the ones its own claims need.
- **Not exhaustive.** One mechanism, because one was needed. The engine's own text content, the screens
  that draw it, the word-wrap rules and the font metrics behind them are largely untraced.
