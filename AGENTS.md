# AGENTS.md

How to change this repository. It is written for an agent picking the work up cold, and it is
equally the checklist for a person. The docblocks in `src/` state the contract each symbol keeps.

## Language Usage | 语种选择

1. Always use English for source code documentation and inline comments.
   - If the programming language/dev tool supports documentation localization, always produce a Chinese localization file.
2. For all other files, including but not limited to design documents and agent prompts:
   1. A working document uses English and Chinese as working languages, where:
       - Always use Chinese in conceptual content, such as architectural design, data flows, and relationships.
       - Always use English in rules, guidelines, and logical content.
   2. You are encouraged to use both language in a single document.
3. Regardless of file type, always use the same language the user uses while taking notes.

## Commands

| Command | Does |
| --- | --- |
| `npm install` | install; **does not** build the `kd-structured` submodule |
| `npm run "Webpack Bundle: Debug"` | bundle → Bundle/main.bundle.js + Deploy/Boids.zip |
| `npm run "Webpack Watch: Debug"` | the same, watching |
| `npm run "Webpack Bundle: Production"` | the same, production |
| `npm run typecheck` | `tsc` over `src/`, `test/` and `webpack/` |
| `npm run test` | bundle the suite with the project's own webpack + ts-loader, run it with `node` |
| `npm run verify` | `typecheck` + `test` — **the workday gate** |
| `npm run verify:full` | both with `--audit`, then a full mod build — **the delivery gate** |
| `npm run docs:api` | regenerate `docs/api/typescript` (TypeDoc over `src/Api.ts`) |

`kd-structured` must be built before a full build: `npm install` alone does not produce its
archive, and the build names it when the archive is missing.

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
not compare an artifact cannot be mistaken for one that did.

## The map

| Path | What it is |
| --- | --- |
| `src/` | the mod: `Api.ts` (the published surface), `mod.ts` (the bundle entry), `FactionMachine/`, `Common/`, `KDExtension/`, `KDInterface/`, `Utilities/` |
| `test/` | the suite, run from the repository root |
| `webpack/` | build tooling: paths, ts-loader, staging, the post-build checks |
| `Script/` | build-adjacent scripts run by `node` |
| `Asset/` | shipped assets, including `Asset/mod.json` |
| `PackageAsset/` | the staged types package's template |
| `kd-structured/` | the submodule both the build and the typings depend on |
| `docs/api/` | **generated** — never edit by hand |
| build output | `Bundle/`, `Deploy/`, `Declaration/`, `Generated/`, `.fake/` — all gitignored |

## Conventions, and the gate that holds each

- **Barrels.** A folder others import from has an `index.ts` re-exporting every module in it; code
  outside imports the barrel, code inside imports siblings. A deep import is a bug in the barrel.
- **Layering.** `Utilities < KDInterface < KDExtension < Common < FactionMachine`; dependencies
  point one way and `test/layering.test.ts` fails if one points back.
- **Text.** Every string is registered in one place, and *who resolves the key* decides where it
  lives — `src/KDExtension/Text/`, with the shapes in `Slot.ts`. `test/text-registry.test.ts` fails
  if a key matches neither kind or a registered value is a placeholder.
- **Documentation lives beside the code.** A source file's docblocks state the contract — what a
  symbol is for, what it takes and returns, and the one constraint that makes a plausible edit
  wrong. No status marker appears in code.
- **Generated files are never hand-edited**, and neither is a lockfile or `kd-structured/`.

## Invariants to respect

Each of these bites in a way that is not obvious from reading one file.

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
- **`SensoryControl.AnnounceRate` advances game time by one**, so it must never be called from
  inside a tick handler: that re-enters the game's dispatch.
- **Never mint a random id where a derived one is possible** — it is unversionable forever.
- **A restraint or control value derives from the Coordinator's single baseline.** Never store a
  baseline value on an item, or removing the item loses it and rollback becomes a restore instead
  of a release.
