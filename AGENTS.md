# AGENTS.md

How to change this repository. It is written for an agent picking the work up cold, and it is
equally the checklist for a person. [`docs/guide/`](docs/guide/) is the explanation behind each
rule; [`design/`](design/) is the design they serve.

**The design is frozen (2026-10-16).** A design change is not an edit to these files. It is an
**issue** first; when it is decided it lands in `design/spec.md`, is scheduled in
`design/dev-plan.md`, and is recorded as a dated row in `design/design-brief.md`'s Appendix E.
`design/README.md` states the protocol and `design/spec.md`'s header is its normative form.
**Never rewrite the brief's reasoning to record a change; the reasoning stays as it was reasoned.**

**This is a gradual rewrite of the codebase, one part at a time.** `design/README.md`'s *What this
development pass is* is the framing every task inherits: the spec is the target and the old code is
evidence, a phase is finished only when its exit condition is true as written, and a finding outside
the current slice is recorded rather than fixed in passing.

## Commands

| Command | Does |
| --- | --- |
| `npm install` | install; **does not** build the `kd-structured` submodule |
| `npm run "Webpack Bundle: Debug"` | bundle → `Bundle/main.bundle.js` + `Deploy/Boids.zip` |
| `npm run "Webpack Watch: Debug"` | the same, watching |
| `npm run "Webpack Bundle: Production"` | the same, production |
| `npm run typecheck` | `tsc` over `src/`, `test/` and `webpack/` |
| `npm run test` | bundle the suite with the project's own webpack + ts-loader, run it with `node` |
| `npm run verify` | `typecheck` + `test` — **the workday gate** |
| `npm run verify:full` | both with `--audit`, then a full mod build — **the delivery gate** |
| `npm run docs:api` | regenerate `docs/api/typescript` (TypeDoc over `src/Api.ts`) |

`kd-structured` must be built before a full build: `npm install` alone does not produce
`kd-structured/Deploy/kd-structured.zip`, and the build names it when the archive is missing.

## Playtesting — the game, not the suite

The suite installs recording stubs and cannot load the mod
([`docs/guide/testing.md`](docs/guide/testing.md)); registration in the real engine, text
resolution, model lookup, the console surface and the save path can only be observed **in the
game**. The recipe below is the one the first session used; its result and its traps are recorded
in
[`design/report/Play sessions/first-contact-plan.md`](design/report/Play%20sessions/first-contact-plan.md).
A session is **non-visual**: no screenshots, no image analysis, no judging a canvas.

**1. Build the game.** The checkout is `kd-structured/KinkyDungeon` (a nested submodule).
`out/main.js` and `TextureAtlas/` are gitignored build output and do not exist after `npm install`:

```sh
cd kd-structured/KinkyDungeon
npm run build   # tsc && python tools/pack.py — needs Python and the bundled wtxpck.exe
```

The build is complete when `out/main.js` exists and `TextureAtlas/` holds `displacement_*`,
`game_*`, `models_*` and `models_mobile_*` webp+json pairs, written in that pack order.

**2. Make the two zips current.** `Deploy/Boids.zip` comes from `npm run "Webpack Bundle: Debug"`;
`Deploy/kd-structured.zip` is built by the submodule. Both are installed together — Boids loads at
priority 10, `kd-structured` at 20, and the second supplies the import map the first awaits.

**3. Serve without a process you cannot keep.** A shell-launched `http-server` is reaped with the
command that started it, and background jobs are unavailable in this harness. Serve from the
Playwright session instead, with a route that answers from disk. The origin is arbitrary but must
**stay constant**, because the mod store is IndexedDB keyed by it:

```js
const ORIGIN = 'http://kdgame.local/'
const ROOT = '<repository root>/'
await page.route(ORIGIN + '**', async route => {
  const rel = decodeURIComponent(new URL(route.request().url()).pathname).replace(/^\/+/, '')
  try { await route.fulfill({ path: ROOT + (rel || 'kd-structured/KinkyDungeon/index.html') }) }
  catch { await route.fulfill({ status: 404, contentType: 'text/plain', body: 'missing: ' + rel }) }
})
await page.goto(ORIGIN + 'kd-structured/KinkyDungeon/index.html')
```

`browser_run_code_unsafe` has no `require`, no `process` and no dynamic `import` — the snippet gets
`page` and browser APIs only.

**4. Install the mods the way the game does, minus the picker.** Online mode keeps mods in
IndexedDB; `Mods/` is only for the desktop build's `window.kdAPI`. The file picker's calls can be
made directly:

```js
const get = async p => new File([await (await fetch(p)).blob()], p.split('/').pop())
await batchSaveMods([await get('/Deploy/kd-structured.zip'), await get('/Deploy/Boids.zip')])
```

`KDToggles.AutoLoadMods` is **false** by default, so after every reload call the mods screen's own
entry point — `KDGetModsLoad(true)` — and wait for `globalThis.Boids` before touching anything.

**5. Start a run, and mind the three traps.**

- Use **`KinkyDungeonStartNewGame()`** with no argument. `KinkyDungeonStartNewGame(true)` is not the
  menu's path and throws `Cannot read properties of undefined (reading 'HiddenRooms')`.
- A save can only come out of a run: `KinkyDungeonGenerateSaveData()` at the menu throws in
  `KinkyDungeonFilterInventory`.
- Equip only once the game has drawn a frame or two. Equipping a gag before the wearer's model
  exists throws `StartMods is not iterable` from `GetModelLoc`.

**6. Read the failures correctly.** The engine's compatibility fields are **display only**
(`Scripts/KDMods.ts:159-178`; `KDExecuteMods` has no compatibility branch), so a yellow *outdated*
label is not a load failure. Two 404s are expected noise in this checkout: `Logo.png` at the game
root and `Models/CyberMitts/Free.png`. The checkout's dev head may be newer than the mods' declared
`gamepatch_max` — that is a record note, **not** an edit to `mod.json` in passing.

**7. Record the session** under
[`design/report/Play sessions/`](design/report/Play%20sessions/AGENTS.md), following that folder's
conventions. If a real click is unavoidable, the draw functions are global —
`DrawButtonKDEx` and its siblings can be wrapped to log the rectangles they lay out — but a session
that can be answered through `page.evaluate` should be.

## Regeneration — deliberate, reviewed, committed with its cause

A few tracked artifacts are **generated**. They are compared against a committed copy, and the
comparisons that cost a slow regeneration run only under `--audit` (`npm run verify:full`):

| Artifact | Regenerate with |
| --- | --- |
| `test/__manifest__/registration-summary.json` | `npm run test:update-manifest` |
| `test/__manifest__/public-api.json` | `npm run test:update-api` |
| `docs/api/text-reference.md` | `npm run test:update-text` |
| `docs/api/typescript/**` | `npm run docs:api` |

**Regenerate only when the surface is meant to change, read the diff, and commit it beside the
change that moved it.** A demoted check reports as *skipped*, never as a pass, so a run that did
not compare an artifact cannot be mistaken for one that did. The full registration record is
written on demand by `npm run test:audit`; it is not tracked.

## The map

| Path | What it is |
| --- | --- |
| `src/` | the mod: `Api.ts` (the published surface), `mod.ts` (the bundle entry), `FactionMachine/`, `Common/`, `KDExtension/`, `KDInterface/`, `Utilities/` |
| `test/` | the suite, run from the repository root |
| `webpack/` | build tooling: paths, ts-loader, staging, the post-build checks |
| `Script/` | build-adjacent scripts run by `node` (currently the API-reference generator) |
| `Asset/` | shipped assets, including `Asset/mod.json` |
| `PackageAsset/` | the staged types package's template |
| `kd-structured/` | the submodule both the build and the typings depend on |
| `design/` | the frozen design corpus — see [`design/README.md`](design/README.md) |
| `design/report/` | **development reports** from earlier work, grouped by subject — `Notes on Base game/` holds the engine facts behind the corpus's citations, each with a site and a reproducer. **Not corpus**: nothing there decides anything, and where a report disagrees with `design/spec.md` the spec wins |
| `docs/guide/` | the hand-written documentation |
| `docs/api/` | **generated** — never edit by hand |
| `Bundle/`, `Deploy/`, `Declaration/`, `Generated/`, `.fake/` | build output, all gitignored |

## Conventions, and the gate that holds each

- **Barrels.** A folder others import from has an `index.ts` re-exporting every module in it; code
  outside imports the barrel, code inside imports siblings. A deep import is a bug in the barrel.
  Two exceptions are deliberate and spelled out where they happen (`src/Api.ts` reaching into
  `src/Common/CommonUI`, and the glass visor barrel exporting `Variant` by name).
- **Layering.** `Utilities < KDInterface < KDExtension < Common < FactionMachine`; dependencies
  point one way and `test/layering.test.ts` fails if one points back.
- **Text.** Every string is registered in one place, and *who resolves the key* decides where it
  lives — `src/KDExtension/Text/`, with the shapes in `Slot.ts`. `test/text-registry.test.ts` fails
  if a key matches neither kind or a registered value is a placeholder. See
  [`docs/guide/text.md`](docs/guide/text.md).
- **A new `*.test.ts` must be listed in `test/run-all.ts`.** `test/self-check.test.ts` fails if it
  is not, so a suite cannot be silently skipped.
- **The suite reads file text through `test/harness/text`.** `test/self-check.test.ts` fails a test
  file that calls `readFile` itself: raw bytes are a comparison that passes only on the machine that
  wrote the file.
- **Generated files are never hand-edited**, and neither is a lockfile or `kd-structured/`.

## Invariants to respect

Each of these bites in a way that is not obvious from reading one file. The reasoning and the
citations are in [`docs/guide/invariants.md`](docs/guide/invariants.md).

- **Registration is a one-shot, throw-on-duplicate side effect** that runs at module evaluation —
  so a registration module reachable under two specifiers crashes the mod at load, and a handler
  `type` GUID must be unique across the game *and every other mod*.
- **Variant field order is the save format.** Model and restraint names are
  `uuidv5(JSON.stringify(variantKey), baseId)`; renaming, adding, removing or reordering a field in
  a variant literal changes every generated name. That is a migration decision, not a cleanup.
- **A `SwapLayerPose` target must be a layer group the game knows** (`LAYERS_BASE`), with the pose
  mask tested as a bitmask with `&`. A group outside the table renders in an undefined order rather
  than failing.
- **The entry module's body runs after everything it imports.** `export * as … from …` is hoisted,
  so `src/mod.ts`'s layer-table block runs after the whole registration tree — moving it into a
  separate module changes when `ModelLayers` is populated.
- **Two game globals are wrapped at module evaluation** (`KinkyDungeonGenerateSaveData`,
  `KinkyDungeonLoadGame`), so a mod that patches either later wraps *around* Boids. Both wrappers
  are defensive, and the load gate throws nowhere: a refusal is a value and a message.
- **`SensoryControl.AnnounceRate` advances game time by one** (`Coordinator/SensoryControl.ts`), so it
  must never be called from inside a tick handler: that re-enters the game's dispatch. The random
  tick driver that did so was retired in the Phase 1 correction; the console drivers are its only
  callers until 3.1.

Two more, because they are the expensive kind of mistake:

- **Never mint a random id where a derived one is possible** — it is unversionable forever.
- **A restraint or control value derives from the Coordinator's single baseline.** Never store a
  baseline value on an item, or removing the item loses it and rollback becomes a restore instead
  of a release.

## Reading order for a new task

1. [`design/spec.md`](design/spec.md) — what the thing is (its glossary is the vocabulary).
2. [`design/dev-plan.md`](design/dev-plan.md) — where the work sits, and its ordering constraints.
3. [`docs/guide/`](docs/guide/) — how the code it touches actually works.
4. [`design/codex.md`](design/codex.md) — only if the task is content.
