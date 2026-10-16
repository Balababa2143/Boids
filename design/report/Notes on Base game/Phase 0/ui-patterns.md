# UI patterns

> The game's own UI is a canvas with a name-keyed cache of closures behind it: a button registers a
> callback when it is *drawn* and the callback runs only if something invokes the cache entry later.
> This note records that mechanism, the one idiom built on it, and the single surface that leaves it
> behind.

Sites are relative to `kd-structured/KinkyDungeon/Game/src/`; the shorthand is in the
[phase notes](AGENTS.md).

---

## A drawn button is a registration, not an action

**[read]** `DrawButtonKDEx` (`base/KinkyDungeon.ts:3833`) packages its arguments into a record and
stores it in a module-global cache — `base/KinkyDungeon.ts:3878`:

```ts
	KDButtonsCache[name] = params
```

The record is typed at `base/KinkyDungeon.ts:3638`:

```ts
interface KDButtonParamData {
	Left: number,
	name: string,
	Top: number,
	Width: number,
	Height: number,
	enabled: boolean,
	func?: (bdata: KDButtonPressData) => boolean,
	priority: number,
	scrollfunc?: (amount: number) => void,
	hotkeyPress?: string,
	contextMenu?: string,
	nonplayable?: boolean,
	hoverData?: any,
	onHover?: (button: KDButtonParamData) => void,
  Hover?: InventoryHoverObject
}
```

**[read] The `func` is not called while drawing.** The only callback the draw itself fires is the
hover hook — `base/KinkyDungeon.ts:3879`, `if (hover && options?.onHover) options.onHover(params);`.
Everything else is stored and left for later.

**[read]** The cache's key is the caller-supplied `name` and the value holds the **live closure**,
so any code sharing this module scope can invoke a button's action by name. The game does exactly
that in three places; see *the cache is an API* below.

---

## The two paths that invoke it, and they pass different arguments

**[read] Mouse.** `KDProcessButtons` (`base/KinkyDungeon.ts:4509`) filters the cache to entries that
are `enabled`, have a `func`, and are under the cursor; sorts by `priority`; and calls **only the
winner**:

```ts
		buttons = buttons.sort((a, b) => {return (b.priority || 0) - (a.priority || 0);});
		return buttons[0].func({
			source: "mouse",
			button: buttons[0],
		});
```

**[read] Hotkey, or anything that wants to press a named button.** `KDClickButton`
(`base/KinkyDungeon.ts:4553`) — no geometry test at all:

```ts
function KDClickButton(name: string, source: string = "hotkey", key: string = ""): boolean {
	let button = KDButtonsCache[name] || KDLastButtonsCache[name];
	if (button && button.enabled) {
		if (button.hotkeyPress == KinkyDungeonKeySkip[0]) {
			KinkyDungeonGameKey.keyPressed[9] = false;
		}
		return button.func({
			source: source
		});
	}
	return false;
}
```

> **[inferred] The two call sites disagree about what the callback receives, and the difference is
> not documented anywhere except these two bodies.** Mouse supplies `{ source, button }`; the direct
> path supplies **only `{ source }`**. A handler that reads `bdata.button` works when a player clicks
> and throws when something presses it by name. Anything written to be invoked programmatically has
> to tolerate the narrower shape.

**[inferred] `KDClickButton` is what makes a deferred load possible at all.** Pressing a named
button re-enters that button's own closure — including whatever the *caller* does after the load
call returns, because the caller's code is inside the closure. That is why re-invoking the button is
a different thing from calling the function it wraps, and why the in-tree precedent matters more
than the convenience does.

---

## The cache lives for part of a frame, and the comments about it mislead

**[read]** `KDButtonsCache` is a module-level `let` (`base/KinkyDungeon.ts:3657`), rotated inside
`KinkyDungeonRun` — emptied at the top, snapshotted mid-frame, and the snapshot dropped at the end:

| Site | Line |
| --- | --- |
| `KDLastButtonsCache = KDButtonsCache; KDButtonsCache = {}; KDHoldButtonsCache = {};` | `base/KinkyDungeon.ts:1720-1722` |
| `KDLastButtonsCache = {}; KDLastHoldButtonsCache = {};` | `base/KinkyDungeon.ts:3422-3423` |

**[read] The declaration comment promises more than the code delivers**
(`base/KinkyDungeon.ts:3656`):

> `/** For most things use LastButtonsCache as buttons might not have been rendered yet this frame. Will lag a frame behind but eh. */`

The snapshot exists only *within* the drawing portion of a frame — it is created at 1720 and cleared
at 3422 — so it is not available to code running at other points. And **[read]**
`KDLastHoldButtonsCache` (`base/KinkyDungeon.ts:3664`) is never assigned anywhere in `Game/src`: it
is declared and read (`:4569`) and written by nothing, so a lookup that falls through to it always
gets `undefined`.

**[read] The game states the deferral plainly, in its own words**, twice
(`base/KinkyDungeon.ts:4550-4552` and `:4565-4567`):

> *"Buttons are clickable one frame later, please factor this in to UI design (especially when
> enforcing validation)"*

> **[inferred] That sentence is the whole reason a dialog cannot be a game-drawn panel here.** "One
> frame later" is fine for a click; it is fatal for anything that has to answer a question
> *synchronously* — a function that must return a boolean now cannot wait a frame for the player to
> decide, and the canvas keeps drawing while any overlay is up anyway. The only surface that can
> appear, return control immediately, and settle the decision later is DOM outside this system, which
> is why the crash modal below is the pattern worth copying rather than the button cache.

---

## The cache is an API, and the game proves it

**[read]** Three in-tree callers bypass hit-testing and act on cache entries directly:

| Caller | Site | What it does |
| --- | --- | --- |
| `KDClickButton` | `base/KinkyDungeon.ts:4553` | indexes by name and calls `func({ source })` |
| `KDCheckCustomKeypress` | `base/game/KinkyDungeonGame.ts:2261` | walks the cache for an entry whose `hotkeyPress` matches, then calls `KDClickButton` |
| `MouseInKD` | `base/KinkyDungeon.ts:4578` | reads a named entry's geometry and `enabled` to answer "is the cursor in it" |

Because it is a plain mutable object, any code in this scope can also **overwrite** a named entry.
That is not a hazard the game guards against; it is the mechanism.

---

## The click-twice confirmation

**[read]** Destructive actions are confirmed by a two-click flag rather than a dialog. The clearest
instance is the delete-save button in `KDDrawLoadMenu`
(`base/KinkyDungeon.ts:5163-5174`):

```ts
				DrawButtonKDEx("KDDeleteSlotButton" + i, (_b) => {
					if (!KDConfirmDeleteSave || KDDeleteSaveIndex != num) {
						KDConfirmDeleteSave = true;
                	if (KDSoundEnabled()) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/ClickError.ogg");
						KDDeleteSaveIndex = num;
					} else {
						KDConfirmDeleteSave = false; KinkyDungeonReplaceColorConfirm = -999;
						KinkyDungeonDBDelete(num);
						loadedsaveslots[num - 1] = null;
					}
					return true;
				}, true,
```

**[read] The guard is a compound condition, and the second half is the interesting one.** It is not
`if (!KDConfirmDeleteSave)` but `if (!KDConfirmDeleteSave || KDDeleteSaveIndex != num)` — so clicking
a *different* slot's button re-arms for that slot instead of deleting on a stale confirmation. The
flag alone would let one button inherit another's armed state.

**[read] The armed state is visible and it expires.** The button jitters by a pixel and shows `"!"`
(`:5175-5189`), and the flag is disarmed from a dozen unrelated places — for instance
`base/game/KinkyDungeonHUD.ts:2080`, where leaving the hot region clears it.

**[read]** The same idiom appears at `base/KinkyDungeon.ts:2882-2909` (an overwrite-save
confirmation, whose label switches to `KDConfirmREALLY` and whose colour turns red) and at
`base/game/KinkyDungeonHUD.ts:2042-2057`. The flags are module-level: `KDConfirmDeleteSave` at
`base/game/KinkyDungeonHUD.ts:256`, `KDDeleteSaveIndex` at `base/KinkyDungeon.ts:5028`,
`KDShopBuyConfirm` at `base/game/KinkyDungeonGame.ts:2250`.

---

## The one surface outside the button system

**[read]** `KinkyDungeonShowCrashReportModal` (`base/KinkyDungeonErrors.ts:168-281`) is real DOM
layered over the canvas, and it never touches `KDButtonsCache`:

- an **idempotence guard** by `document.querySelector` (`:171`), which is what makes showing the same
  modal twice a no-op rather than a stack;
- a **fixed, full-viewport backdrop** — `document.createElement("div")` with
  `Object.assign(backdrop.style, { position: "fixed", inset: 0, backgroundColor: "#000000a0", … })`
  (`:175-184`);
- a **centred panel** on top of it, absolutely positioned and pulled back by
  `transform: "translate(-50%, -50%)"` (`:186-204`);
- children built with `createElement` (`h1`, `hr`, `p`, `pre`, `button`), all styled by
  `Object.assign(element.style, {…})` rather than a stylesheet;
- buttons from `KinkyDungeonErrorModalButton` (`:302`), wired with native
  **`addEventListener("click", …)`** (`:265`, `:275`);
- dismissal by `backdrop.remove()` (`:276`) and mounting by `document.body.appendChild(backdrop)`
  (`:280`).

**[read] The button `func` convention is the same object with different contents**, and that is why
the modal is reusable as a pattern: `KDProcessButtons` and `addEventListener` both call a callable
with a single argument, so a handler written for the button cache can be attached to a DOM button
with a signature change and nothing else.

---

## Two screen globals

**[read]** They are separate, and confusing them is a real hazard:

| Global | Declared | Means |
| --- | --- | --- |
| `KinkyDungeonState` | `base/KinkyDungeon.ts:135`, initial `"Logo"` | the **app state machine**: `"Menu"`, `"LoadSlots"`, `"Game"`, `"GenMap"`, … |
| `KinkyDungeonDrawState` | `base/game/KinkyDungeonHUD.ts:65`, initial `"Game"` | the **in-game screen**, switched by `KDGoToScreen` (`base/KinkyDungeon.ts:8871`) |

**[read]** A menu button switches the first by assignment; `base/KinkyDungeon.ts:1985-1987` sends the
menu to the slot list, and `:2911-2914` returns from a submenu to `"Menu"`. There is no navigation
stack: the current screen is one string, and going "back" is assigning the previous value.

> **[inferred] Which is why "return to the menu" is cheap and honest.** It is one assignment to a
> global, the same thing the game's own back buttons do — no teardown, no stack unwinding, no
> resource to release. Anything that wanted a richer exit would be inventing a mechanism the game
> does not have.

---

## How to re-derive this

Read-only.

- **Store, not call** — read `base/KinkyDungeon.ts:3854-3881` and look for an invocation of `func` in
  the draw path. There is none.
- **The rotation** —
  `Select-String -Path kd-structured/KinkyDungeon/Game/src/base/KinkyDungeon.ts -Pattern 'KDLastButtonsCache|KDButtonsCache = '`
  Expect 1720, 3422 and the declaration at 3657.
- **That `KDLastHoldButtonsCache` has no writer** — search the whole tree for the name and compare
  the assignment sites against the reads.
- **The two call shapes** — read `KDProcessButtons` (`:4509-4528`) and `KDClickButton`
  (`:4553-4564`) side by side; the differing `func` argument is in those two bodies only.
- **The modal** — read `base/KinkyDungeonErrors.ts:168-281` in full. It is less than 120 lines and
  the whole pattern is there.
- **The click-twice guard** — read `base/KinkyDungeon.ts:5163-5174`; the compound condition is the
  part worth quoting to anybody reimplementing it.

## What this note does not cover

- **The game's drawing and layer system** (sprites, `PIXI`, layer ordering). A separate mechanism
  with its own report, if one is ever needed.
- **Dialogue and the hypnosis suggestion UI.** Both are other ways the game puts a choice in front
  of the player; neither was needed for the work this note came out of.
- **Text and localisation.** Registered keys and resolution are a mod-facing concern with its own
  guide; all this note relies on is that `TextGet(key)` resolves a registered string.
