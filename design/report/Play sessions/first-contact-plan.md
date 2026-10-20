# First contact — the plan, and the session log

**Target:** `kd-structured/KinkyDungeon` at `60b41e14d` (game **5.5.4**), built 2026-10-20 23:20–23:25;
mod `Deploy/Boids.zip` and `Deploy/kd-structured.zip` at repository `9c77678`.
**Served:** files read from disk and answered through the Playwright session's own request routes;
page `http://kdgame.local/kd-structured/KinkyDungeon/index.html`. *(Deviation: the plan said
`http-server` — see the log's setup note.)*
**Driven:** Playwright (headed), `page.evaluate` only — **no screenshots, no image analysis**.
**Status:** plan written 2026-10-20 before the session; the session ran the same evening. **A–F green**,
with observations O1–O5 recorded below. **This session is part of Phase 1's re-delivery (rev 2)**:
`design/dev-plan.md` Phase 1 carries the result, the owner's disposition (O1 and O4 are non-issues) and
the two open findings F1/F2.

## Why this session, and why it is not a playtest

- **Phase 0 still carries an unobserved clause.** `design/dev-plan.md:76-81` calls the in-game half of
  *"provably survives save → load"* asserted-through-seams rather than observed, and says so.
- **The second acceptance states its own boundary** (`design/report/Phase reviews/phase-1-second-acceptance.md:29`):
  no in-game session; every runtime claim is about the code and the harness.
- **2.1 is about to bind the first seam.** A green load baseline now is a bisection point for every
  later layer; the harness's recording stubs are exactly where a stub and the engine diverge silently.

**Nothing here tests the control model.** No dimension is bound (`dev-plan.md:268-272`), so *resolved*
is still only *resolved*. F1's posture permit and F2's engagement semantics are open, and this
session must not produce evidence about either.

**Not attempted on purpose:** feel, numbers, difficulty (Phase 8's subject); the posture route
(F1 blocks 2.7); the whitelist accept path (unreachable while `CapabilityKey` is `never`).

## Setting the game up

1. Serve the repository root: `http-server <repo> -p 8177 -c-1`. Root-relative fetches in the game
   are all relative (`KinkyDungeonRootDirectory = "Game/"`, `KinkyDungeon.ts:302`), so the document
   may live at a sub-path; this is also what makes `Deploy/*.zip` reachable from the page.
2. Load the page once with no mods; confirm the engine boots (`KDToggles`, `VersionMajor` defined).
3. Install both zips into the game's own store rather than through the file picker — the file picker
   is the online path's only UI route (`Scripts/KDMods.ts:212-236`) and it persists through
   `batchSaveMods` (`Scripts/KDModsUtils.ts:24-41`, IndexedDB `KinkyDungeonModSave`, localStorage
   `KinkyDungeonModList`). Evaluating the same two calls is non-visual and leaves the store in the
   same state the picker would.
4. Reload, so mods load through the game's **own** boot path (`autoLoadMods` → `KDUpdateModInfo` →
   `KDExecuteMods`), not through a call this plan made up.

**[read]** The loader does not enforce compatibility: `gamepatch_max: 3` against a 5.5.4 game colours
the mods list entry yellow (`Scripts/KDMods.ts:159-178`) and `KDExecuteMods` has no compatibility
branch at all (`Scripts/KDMods.ts:350-372`). Both mods declare the same range, so the session runs
with an expected, cosmetic *outdated* label. Widening the range is a release decision, not an edit
made in passing.

## The checks

Each row names what is asked, how it is asked, and what counts as the evidence.

| # | Check | How | Pass means |
| --- | --- | --- | --- |
| **A** | the mod loads in the real engine | after reload: `KDExecuted`, `KDModFileCount`, `KDModLoadOrder` names and priority order, `typeof Boids`, and the console lines `Loading …` | both mods registered, order `kd-structured` then `Boids`, the entry's namespace exists, no uncaught error |
| **B** | the text surface resolves | every registered Boids restraint/model: `TextGet(name)` non-empty and not equal to the key; the four function keys; the start perk's two strings | none empty, none echoing its key |
| **C** | derived names resolve through the engine's variant lookup | for each registered Boids piece, the engine's own variant resolution yields a model and a texture the loader knows | every piece resolves; the muffler's display size follows its variant |
| **D** | the console surface is reachable | `Boids.FactionMachine.MachinePrime.Coordinator`: enumerate dimensions, one `SetIntent` + `Resolve` round-trip with an empty worn set, `FindProviders`, the `Debug` drivers | every name exists and the round-trip returns a resolution in 0..1 |
| **E** | the save → load round-trip, observed | `KinkyDungeonGenerateSaveData`, persist, reload the page, `KinkyDungeonLoadGame`; compare the dossier field for field; `root_uuid` recorded | the dossier returns identically; the record of what produced the save is intact |
| **F** | equipment changes the capability and nothing else | equip a Boids piece through the engine, resolve, remove it, resolve; compare with the never-equipped resolution | removal **releases** to the never-equipped value, field for field (invariant 12) |

**A green A–D** says the mod is loadable and its names resolve — the thing every later phase stands on.
**A green E** is Phase 0's last clause observed for the first time. **F** is the only row that touches
invariant 12 in the real engine; it does not need a seam.

## Failure policy

- **A load-path defect blocks the baseline** and is fixed here, because it is this repository's own
  contract (Phases 0 and 0.5), not a neighbouring slice.
- **Anything else is recorded as a finding**, with the issue title it would be opened under. Findings
  outside the current slice are not fixed in passing (`AGENTS.md`).
- **F1 and F2 are not re-litigated here.** A session cannot settle a spec question.

## How to re-derive this

```sh
# build and serve (already done once)
cd kd-structured/KinkyDungeon && npm run build
node node_modules/http-server/bin/http-server ../.. -p 8177 -c-1
# open http://127.0.0.1:8177/kd-structured/KinkyDungeon/index.html
```

---

## Session log

*Appended as the session ran. Every value below is [seen] unless marked otherwise.*

### Setup, and the one deviation from the plan

- The standalone `http-server` started from the shell **did not survive the command that launched it**
  — the harness reaps the process tree, and the page then got `ERR_CONNECTION_REFUSED`. The game is
  therefore served by **Playwright request routes** instead: every request under
  `http://kdgame.local/` is read from `C:/Users/balab/Source/Repo/Balababa/Boids/` and answered from
  disk. Same bytes, same relative paths, one process fewer. **[seen]**
- Mods are installed the way the game installs them, minus the file picker: both zips are fetched from
  `Deploy/`, wrapped as `File`s, and handed to `batchSaveMods` (`Scripts/KDModsUtils.ts:24-41`). Stored
  names and sizes read back: `kd-structured.zip` 221,202 B, `Boids.zip` 1,372,540 B. **[seen]**
- `KDToggles.AutoLoadMods` is **false**, so every reload needs the mods screen's own call,
  `KDGetModsLoad(true)`. **[seen]**
- The game boots as **5.5.4** (`VersionMajor.Minor.Patch`) and reaches the menu. Base-game 404s seen in
  the console and **not ours**: `Logo.png` at the game root, `Models/CyberMitts/Free.png`. **[seen]**

### A — the mod loads in the real engine

`KDModLoadOrder` = `kd-structured.zip` (priority 20, 4 files) then `Boids.zip` (priority 10, 12 files);
`KDExecuted true`, `KDModFileCount 2`, `KDAllModFiles 16`, `KDModInfo` reads `kd-structured 5.4.78` and
`Boids 0.5.0`; `globalThis.Boids` = `{ CommonUI, FactionMachine }`, `FactionMachine` =
`{ DebugStart, Futuristic, MachinePrime }`, `MachinePrime` = `{ Coordinator, Debug, Item }`. **Green.** **[seen]**

### B — the text surface resolves

126 restraints are the mod's: 125 derived uuidv5 names plus the hand-written uppercase
`F10BAD9F-53F1-439B-9A00-BA5DB504A646`. **[seen]**

| Slot | Keys the engine answers | Note |
| --- | --- | --- |
| name | 125 / 126 | the exception is the uppercase suit |
| flavour | 22 / 126 | blank for the rest |
| function | 99 / 126 | blank for the rest |

Blank is what the registration convention produces, **not a key that is missing**: `TextGet` on a
registered-but-unsupplied slot returns `""`, while a key the provider has never seen returns
`"[NotFound] …"` — checked side by side, so the two are distinguishable in the engine. Whether every
item *should* supply a flavour line is an authoring question (Phase 6's subject), not something this
session measured. **[seen]** **[inferred]** Samples:
`Drone Belt` / `Slim` / *"It's made of exquisite Old Civilization metals …"*; `Drone Arm Link` with a
name and no function line. **[seen]**

### C — derived names and models

`ModelDefs` holds 1,667 models, 135 of them with uuid names — the mod's. Every worn piece resolves
`KDRestraint(item).Model` to a `ModelDefs` entry, derived or base-game, e.g.
`Boids.Asset.Gag.GagMetal_MuzzleGags_None__Metal_CheekDisplay-OTNRivets`. **[seen]**
The three toys (`Lockable Vibe`, both `Drone Plug`s) have **no** `Model`, and neither does the base-game
template they are derived from (`TrapVibeProto` has no `Model` key at all) — inherited, not introduced. **[seen]**
No texture-load error names a Boids asset; the only 404s are the two base-game files above. **[seen]**

### D — the console surface

`Catalog.AllDimensionNames` holds **23** names, `DimensionIdOf(name)` returns a non-empty id for each,
`DimensionName.Sight` → `16164f7a-d3b5-57a9-a1be-d645ecc0ec16`. `Debug` = `{ SetBlindStrength,
SetGagStrength, SetPostureArms, SetPostureLegs }`. `GetDossier()` starts `{intent:{},config:{}}`. **[seen]**

`SetIntent({dimension: <Sight id>, intent: {Target: 0.4}})` → `{kind:'accepted'}`; `Resolve(<Sight id>)` →
`{Winner:null, Losers:[], Config:{}, Demand:0.4, Applied:0, Ceiling:0, Projected:0}` — the demand is
bounded by what is worn, which is nothing. **[seen]**

A **name** in place of an id is refused rather than guessed: `Resolve('Sight')` throws
`Boids control: no dimension is registered under 'Sight'`, and `SetIntent` with a name returns
`{kind:'refused', Rule:'unknown-dimension', Reason:"'Sight' is not a dimension this build registers, …"}`.
(The earlier probe that appeared to return an empty object was this session's own describe helper
treating the thrown message as a resolution; the re-check above is the correct reading.) **[seen]**

### E — save → load, observed for the first time

In a started run: `KinkyDungeonGenerateSaveData()` → 80,582 B of JSON, `version: "5.5.4"`; `KDGameData`
carries two keys the defaults do not — `BoidsRootUUID = 63db7078-2520-56f8-88ce-fcf641af137b` (the
declared root at `src/KDExtension/Release.ts:110`) and `68C84945-3A9A-4024-8CC6-E3CE092E9154` holding the
dossier. Compressed with `LZString.compressToBase64` → 35,848 B, written to `localStorage`. **[seen]**

Reload → `KDGetModsLoad(true)` → `KinkyDungeonLoadGame(<that string>)` → **`true`**; the dossier came back
as `{"intent":{"16164f7a-…":{"Target":0.4}},"config":{}}` — identical to what was written — and
`KDGameData.BoidsRootUUID` is the same root. **Green.** **[seen]**

### F — wear, resolve, remove

Baseline at the start of a run (`Sight` demand 0.4): `Applied 0`, `Ceiling 0`, `Projected 0`, no provider,
no worn item. **[seen]**

`Boids.FactionMachine.DebugStart.AddDroneSet()` → 19 pieces worn (the set plus the base-game pieces it
carries), `FindProviders()` → **1**, and `Resolve(Sight)` → `{Demand:0.4, Applied:0.4, Ceiling:1,
Projected:3, Winner:{Source:'8dcd6701-…'}}` — the demand **clamped to** the capability and put back on the
engine's own scale by the value map, in the real engine. **Green.** **[seen]**

Removal through the engine's own functions → `worn 0`, `providers 0`, `Resolve(Sight)` → `{Demand:0.4,
Applied:0, Ceiling:0, Projected:0, Winner:null}`, `Speech` back to `Applied 0, Gate Free`, and the dossier
unchanged. Removal **releases**; nothing was restored. **Green.** **[seen]**

### Labels used in this record

The prefixes here are not interchangeable, and this note says where each one is from.

| Label | Provenance |
| --- | --- |
| **A–F** | This record's own checks, defined in the table above. They are a plan this session made, not a standing identifier |
| **O1–O5** | Minted in this record. Nothing else in the repository uses `O`, so an `O`-number is a reference to this file and to nothing else |
| **F1–F4** | `design/report/Phase reviews/phase-1-second-acceptance.md`, *Findings*. **Not** this record's `F` check |
| **K1–K12, M1–M6** | The same acceptance's correction list and mutation matrix, and `phase-1-mid-review-draft.md` |
| **§6.x, 2.7, 3.1, #79–#84** | `design/spec.md`, `design/dev-plan.md`, and the GitHub issues the re-delivery was tracked as |

### Observations

- **O1 — the heavy latex suit registers text for no slot.** `AddRestraintWithTextThenGetName` is called
  with no text at all (`src/FactionMachine/Futuristic/Suit/LatexSuit.ts:50`), so its name, flavour and
  function are blank while it is a registered, wearable restraint. It carries no `Categories`, so the
  wardrobe does not reach it today; if anything ever wears it, the item card has no title. Whether this is
  a placeholder for later content or an omission is the owner's call. *[read]* *[seen]*
  **Issue title:** *Text: the heavy latex suit is registered with no name.*
- **O2 — a gag cannot be worn before the wearer has been drawn.** Calling `AddDroneSet()` after loading a
  save directly (state `Logo`/`Intro`) throws `TypeError: StartMods is not iterable` from
  `GetModelLoc` → `GetHardpointLoc` → `KDSendGagParticles`; the same call three seconds after
  `KinkyDungeonStartNewGame()` on a drawn game succeeds. `GetModelLoc` (`Data/Models.ts:2888`) iterates a
  per-container mod list that only exists once the character has been drawn. A tooling constraint, and a
  base-game robustness point rather than this mod's. *[read]* *[seen]*
- **O3 — `KinkyDungeonStartNewGame(true)` is not the menu's path.** With `Load = true` at the menu it
  throws `Cannot read properties of undefined (reading 'HiddenRooms')` in `KinkyDungeonCreateMap`
  (`Game/src/map/KDMapGen.ts`), because the journey slot for the position has not been created; the menu's
  own quick-start calls it with **no** argument (`KinkyDungeon.ts:2637`), and `KinkyDungeonStartNewGame()`
  starts cleanly. Any automation should use the no-argument form. *[read]* *[seen]*
- **O4 — the version metadata is behind the tree.** Both mods declare `gamepatch_max: 3`; the game is
  5.5.4. The loader treats it as a display state only (yellow *outdated*), and `KDExecuteMods` has no
  compatibility branch — so the session ran with an expected, cosmetic label. Widening the range is a
  release decision. *[read]* **[seen]** *(the loading, not the label)*
- **O5 — a save cannot be generated from the menu.** `KinkyDungeonGenerateSaveData()` at `Logo` throws
  `Cannot read properties of undefined (reading 'values')` in `KinkyDungeonFilterInventory`, because
  there is no run to inventory. Recorded so a later session does not read it as a defect. *[seen]*

### Disposition of these observations (owner, 2026-10-20)

The decision lives in `dev-plan.md` Phase 1 — a report decides nothing, and this note is the session's
outcome, not the ruling. Two observations were closed as **non-issues**: **O1**, because the heavy latex
suit is a **placeholder** and content authoring is Phase 6's work; **O4**, because game 5.5.4 is
**unreleased** and this mod has not been tested against it, so the session's target is a dev head rather
than a compatibility claim. No issue is opened for either. O2, O3 and O5 stay as automation and
engine-call notes; none is a defect. The two review findings **F1** and **F2** are recorded in the plan
as open problems blocking 2.7 and 2.1 respectively.

### Not attempted, and not proved

- **Not attempted:** the unversioned/refused save prompt (no known-refused release root was available to
  construct one); the posture route (F1 blocks 2.7); the whitelist accept path (`CapabilityKey` is
  `never`); feel, numbers, difficulty.
- **Not proved:** anything about behaviour in play. No dimension is bound to a seam (`dev-plan.md:268-272`),
  so a green A–F says *the mod is loadable, its names resolve, its state survives the game's own save
  pipeline, and the clamp holds in the engine* — it says nothing about what the player experiences.
  F1 (the posture permit restores nothing) and F2 (engagement outlives its grant) are untouched.

### What this session leaves the next one

A bisection point: at `9c77678` on a 5.5.4 checkout the mod loads, registers 126 restraints and 135
models, resolves its text, accepts a console demand and resolves it against the worn set, and round-trips
its dossier through the game's own save path. Every later phase can now be tested against *that* baseline
instead of against nothing.
