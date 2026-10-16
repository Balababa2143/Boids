# The save system

> What a Kinky Dungeon save is made of, which of the two `KDGameData` objects a save actually
> carries, the exact order the load path runs in, and the one write it performs before it can know
> whether the save is any good.

Every site is relative to `kd-structured/KinkyDungeon/Game/src/`; the shorthand is stated in the
[phase notes](AGENTS.md). Line numbers were read, not remembered, and the enclosing function is
named for every claim.

---

## The trap that cost a phase: there are two `KDGameData` objects

| Object | Declared | What it is |
| --- | --- | --- |
| the interface `KDGameDataBase` | `base/KinkyDungeon.ts:347` | the *shape*, ~540 lines of fields |
| `KDGameDataBase` | `base/KinkyDungeon.ts:595` | the **template literal** — the defaults a new game starts from |
| `KDGameData` | `base/KinkyDungeon.ts:893` | the **live state** — what the game mutates, and what a save carries |

**[read]** `base/KinkyDungeon.ts:893` is a *shallow* copy of the template:
`let KDGameData: KDGameDataBase = Object.assign({}, KDGameDataBase);` — so the two are separable
objects from the first frame, and their nested values start out shared by reference.

**The rule, stated flatly: a save carries `KDGameData`, never `KDGameDataBase`.**

**[read]** `base/KinkyDungeon.ts:7292`, in `KinkyDungeonGenerateSaveData`: `save.KDGameData = KDGameData;`
— assigned **by reference**, not copied, and it is the only assignment to that field. Contrast
`save.spells` and `save.inventory` a few lines above, which are freshly built.

**[read]** `KDGameDataBase` is never assigned to a save field anywhere. It is only ever
`JSON.stringify`-ed in order to build a *clone*:
`base/KinkyDungeon.ts:7434` (in `KinkyDungeonLoadGame`), `base/KinkyDungeon.ts:6096` (in
`KinkyDungeonLoadPreview`), and `base/game/KinkyDungeonGame.ts:474` (in `KDResetData`, called from
`KinkyDungeonInitialize` at `base/game/KinkyDungeonGame.ts:521`).

> **[inferred] Why this is the expensive kind of mistake.** A mod that writes its state onto
> `KDGameDataBase` looks correct at every step: the property is set, the object is readable, the
> shape is right. Nothing fails until a save is taken, because the writer and the reader are
> different objects and only one of them is serialised. It is invisible to a unit test that round
> trips through the same object, which is why the check that catches it has to go through the
> game's own two functions rather than through `toJS`/`fromJS`.

> **[inferred] The template's *contents* can still reach a save, indirectly.** At
> `base/KinkyDungeon.ts:7434-7436` a load with no `saveData.KDGameData` leaves `KDGameData` as the
> clone of the template, and the next save writes that. So "defaults leaked into a save" is a real
> outcome — but it is never `KDGameDataBase` itself, and never under that name.

---

## The blob, and what is in it

**[read]** `KinkyDungeonGenerateSaveData` (`base/KinkyDungeon.ts:7219`) builds the blob by
**explicit field assignment** over roughly a hundred lines (7221–7317) and returns it at 7319. The
fields a reader cares about here:

| Field | Site | Note |
| --- | --- | --- |
| `save.KDGameData` | `:7292` | by reference; **this is where a mod's own state rides** |
| `save.KDMapData` | `:7294` | also by reference |
| `save.inventory` | `:7291` | a rebuilt array of shallow item copies — see below |
| `save.inventoryVariants` | `:7251` | the variant table, by reference |

**[read]** `KinkyDungeonSaveGame` (`base/KinkyDungeon.ts:7325`) deep-copies the whole thing in one
line — `base/KinkyDungeon.ts:7327`, under the comment `// Make a deep copy`:

```ts
let save = JSON.parse(JSON.stringify(KinkyDungeonGenerateSaveData()));
```

**[inferred] There is no key whitelist, and the whitelist people imagine is the generator's own
field list.** Nothing filters the blob here. What is *absent* from a save is absent because
`KinkyDungeonGenerateSaveData` never assigned it — which is exactly why a mod-added key on
`KDGameData` survives a save, and why `save.KDGameData = KDGameData` being by reference matters:
the `JSON` round trip at 7327 is what snapshots the live object, and it takes whatever the mod put
there along with it.

**[read] What is stored of an item.** `base/KinkyDungeon.ts:7279-7291` builds the inventory by
shallow-copying every entry, and the source of that enumeration is
`KinkyDungeonFullInventory()`:

```ts
for (let inv of KinkyDungeonFullInventory()) {
	let item = Object.assign({}, inv);
	newInv.push(item);
}
```

**[read]** that accessor (`item/KinkyDungeonInventory.ts:563`) walks every container of
`KinkyDungeonInventory` (declared `Map<string, Map<string, item>>` at `player/KinkyDungeonStats.ts:241`)
and returns the **live `item` instances**, not copies. It **includes worn restraints**, because it
does not skip the `"restraint"` container — which is precisely what its two siblings do
(`KinkyDungeonFullLooseInventory` `:572`, `KinkyDungeonFullLooseInventoryKeepOutfit` `:583`, each
with `if (ent[0] == Restraint) continue;`).

> **[inferred] So an item's per-instance `data` is in the save, and this is the reason it is worth
> knowing.** `Object.assign({}, inv)` is a shallow own-property copy, so each saved entry carries
> the same `data` object until stringification; the restore puts the *saved item object itself*
> back (`base/KinkyDungeon.ts:7550`), so `data` survives the round trip. A design that wants to
> remember something about a worn item has a place to put it — but see the note in the
> [identifiers note](identifiers.md) about which object a name lookup actually returns.

---

## The load path, in order

**[read]** `KinkyDungeonLoadGame` is declared at `base/KinkyDungeon.ts:7366` with the signature

```ts
function KinkyDungeonLoadGame(String: string = "", kdloadconsent = false) {
```

and its body runs to 7730. The sequence that matters:

| # | What | Site |
| --- | --- | --- |
| 1 | writes `KDLastSaveSlot` to `localStorage` — **unconditionally** | `:7367` |
| 2 | dispatches `beforeLoadGame` | `:7368` |
| 3 | **decompresses** the save string | `:7369-7371` |
| 4 | `JSON.parse`s it | `:7373` |
| 5 | validates a handful of fields, else falls out to `false` | `:7374-7382` |
| 6 | resets `KDGameData` to a deep clone of the template | `:7434` |
| 7 | replaces `KDGameData` with a **shallow** copy of the save's | `:7436` |
| 8 | restores variants, consent, toggles, map, entities, perks, stats | `:7449`–`:7723` |
| 9 | `KinkyDungeonAdvanceTime(0, true, true)` | `:7724` |
| 10 | dispatches `afterLoadGame` | `:7725` |
| 11 | `return true;` | `:7726` |

**[read] The ordering trap, and it is the one a version gate has to design around:
`beforeLoadGame` fires *before* decompression.** Step 2 precedes step 3 by one line, and dispatch
is synchronous (`KinkyDungeonSendEvent`, `effect/KinkyDungeonEvents.ts:65`, calls the handler maps
directly; the generic handler is `effect/KinkyDungeonEvents.ts:13878`). A handler on
`beforeLoadGame` therefore sees the compressed string in storage and **cannot** see the parsed
save. Neither can it see a decompressed value, because nothing has decompressed one yet.

**[read] `afterLoadGame` is the last statement of the successful branch**, dispatched after the
stat recalculation and after `KDFixNeeds()`, `KDUpdateBuffsOnLoad()` and `KDSortCollection()`
(`:7721-7723`). By then `KDGameData` has been the save's contents for roughly 290 lines.

**[read] The reset at `:7434` and the replacement at `:7436` are different kinds of copy**, and the
distinction is easy to state backwards:

```ts
KDGameData = JSON.parse(JSON.stringify(KDGameDataBase));            // deep clone of the template
if (!KDGameData.HeelPowerEffective) KDGameData.HeelPowerEffective = 0;
if (saveData.KDGameData != undefined) KDGameData = Object.assign({}, saveData.KDGameData);  // shallow
```

The saved values are adopted shallowly, so their nested objects are shared with the parsed save.

**[read] Exactly two `return`s, and no early exit.** `:7726` returns `true`; `:7729` returns
`false`. The `false` is reached from three different situations — an empty/falsy save string, the
field-validation guard failing, or the block falling through — and **the caller cannot tell them
apart**. That is a fact worth knowing before designing anything that wants to distinguish "no save"
from "an unreadable save".

**[read] `DecompressB64` is synchronous** (`base/KinkyDungeon.ts:7935-7938`):

```ts
function DecompressB64(str: string): string {
	if (!str || !str.trim) return str;
	return LZString.decompressFromBase64("".concat(...str.trim().split('\n')));
}
```

It calls the global `LZString` (pieroxy lz-string 1.4.4, `Scripts/lib/LZString.js:9`, loaded by
`index.html:17`) — no import, no promise, no worker. It also strips newlines before decoding, and
its `!str.trim` guard tests for the *presence of the method*, not for an empty value.

---

## The load path already writes, and before it knows anything

**[read]** There are exactly three `localStorage.setItem` calls inside `KinkyDungeonLoadGame`, and
the first one is the interesting one:

| Site | Call | Guard |
| --- | --- | --- |
| `:7367` | `localStorage.setItem('KDLastSaveSlot', "" + KDSaveSlot)` | **none** — first statement of the function |
| `:7687` | `localStorage.setItem('KinkyDungeonSave', String)` | inside `if (String)` and a `try` (`:7685-7686`) |
| `:7690` | `localStorage.setItem('KinkyDungeonSave', "")` | the `catch` of that block (`:7688`) |

> **[inferred] Consequence for any mod that wraps this function: "the gate writes nothing" is true
> of the *save*, and not of `localStorage`.** A refusal that returns `false` early still leaves
> `KDLastSaveSlot` written by step 1 above, because the wrapper never reached the code that would
> have skipped it. The character's own save is untouched — `:7687` is past the point a refusal
> returns at — but the statement has to be about the right thing or it is the kind of claim that
> gets "corrected" later by someone who found the other write.

> **[inferred] `:7687` means the load path re-persists the save it was handed.** An explicit save
> string is written straight back to the default slot, unchanged, before the load proceeds. So
> loading a save from a code or a slot *promotes* it to the local slot. Anyone reasoning about
> which save is in storage after a load has to account for that.

---

## Who calls it, and what they do with the answer

**[read]** Three call sites in the game source, and they do not agree with each other:

| Site | Caller | Return value | What follows on success |
| --- | --- | --- | --- |
| `base/KinkyDungeon.ts:5743` | `KDDrawLoadMenu` (`:5041`), in the `KDLoadGame` button callback (`:5725`) | **tested** | clears the consent override, installs `KDGenMapCallback` (`:5748`), sets state `"GenMap"` (`:5759`) |
| `base/KinkyDungeon.ts:6258` | `KinkyDungeonStartNewGame(Load)` (`:6234`) | **discarded** | `KDSendEvent('loadGame')` (`:6259`), then the shared tail creates a map when `!KDMapData.Grid` (`:6275`) |
| `base/KinkyDungeon.ts:6534` | `KinkyDungeonHandleClick` (`:6443`), in the `KinkyDungeonState == "Load"` branch (`:6513`) | **tested** | consent override cleared, `KDSendEvent('loadGame')`, synchronous map creation, state `"Game"` (`:6535-6548`) |

**[read] The two "tested" callers also differ from each other in *how* the map appears.** Caller 1
defers it through a module-level callback slot: `KDGenMapCallback` is assigned at `:5748` and
drained later from the `"GenMap"` draw branch (`:2938`, `RunGenMapCallback` at `:8238`). Caller 3
creates the map inline, synchronously.

> **[inferred] Two consequences, both of which a wrapper has to respect.**
>
> 1. **A wrapper that returns `false` only gets its refusal honoured on two of the three paths.**
>    Caller 2 ignores the boolean entirely and proceeds into the shared map-creation tail, so a
>    refusal there still leaves the player in a game — with whatever `KDGameData` was current.
>    That is not a defect to fix (it is the new-game path), but it is the reason a refusal cannot be
>    the *only* protection.
> 2. **Deferring a load is not possible without also re-entering the caller's own post-load work.**
>    Caller 1's map generation lives in a callback it installs *after* the call returns, and caller
>    3's lives inline after it. A wrapper that answered `false` and then loaded later would have to
>    supply that work itself, because it has already returned past the code that does it.

---

## How to re-derive this

All read-only. There is no build, install or test run in any of these.

- **The two objects and where a save is written** —
  `Select-String -Path kd-structured/KinkyDungeon/Game/src/base/KinkyDungeon.ts -Pattern 'KDGameDataBase|save.KDGameData|KDGameData ='`
  Expect the initialisations at 347, 595, 893, the clone sites at 6096 and 7434, the assignment at
  7292, and the restore at 7436.
- **The lifecycle order** — read `base/KinkyDungeon.ts:7366-7376` for the header, and
  `:7720-7730` for the tail. The order of `beforeLoadGame` against decompression is one line of
  reading and cannot be inferred from the event's name.
- **The write-back** —
  `Select-String -Path kd-structured/KinkyDungeon/Game/src/base/KinkyDungeon.ts -Pattern "localStorage.setItem" | Select-Object -First 20`
  then check which of them fall inside 7366–7730.
- **The callers** —
  `Select-String -Path kd-structured/KinkyDungeon/Game/src/base/KinkyDungeon.ts -Pattern 'KinkyDungeonLoadGame\('`
  Expect 7366 (the declaration), 5743, 6258, 6534.
- **The decode** — read `base/KinkyDungeon.ts:7935-7938`, then confirm the library is a global
  rather than an import: `Select-String -Path kd-structured/KinkyDungeon/index.html -Pattern 'LZString'`.

## What this note does not cover

- **The mod's own use of these seams** — the root key, the gate, the migration chain and the
  prompts. That is [`docs/guide/saves.md`](../../../../docs/guide/saves.md), and it is the normative
  account; this note is only what the engine does underneath it.
- **`KDGameData`'s field list.** It is a 500-line interface and nothing in Phase 0 needed it read
  in full; a note on it belongs to whoever needs one of the fields.
- **`KinkyDungeonLoadPreview`**, beyond the fact that it clones the template into a save-shaped
  object that is never persisted.
