# Where the base game's code is

> Research notes, not corpus — see [`AGENTS.md`](AGENTS.md). Every site below was read while the
> sentence citing it was written.

## Two roots, and a submodule

Kinky Dungeon is vendored as a git submodule at `kd-structured/`, and the actual source lives **inside
it** under two roots:

```
kd-structured/KinkyDungeon/
├── Game/src/     the game — 157 .ts across 13 folders
├── Data/         89 .ts — models, poses, dress lists, filters
├── Scripts/      the engine the game is built on: Character, Inventory, Text, Drawing, Patch
└── tsconfig.json listed `files`, one `outFile`, and `strictNullChecks: false`
```

`Game/src` is where every mechanism in this folder lives. `Data` holds the presentation tables, and the
one it holds that matters to a control model is [`Data/Poses.ts`](#the-files-that-matter) — the pose
system's constants and its two availability functions. `Scripts` is the Bondage-College-derived engine
underneath, and reading it is only necessary when a `Character` or `Inventory` method's semantics
matter.

> **[read] `strictNullChecks` is `false`** in that `tsconfig.json`, and it is why a function declared
> `: boolean` can fall off its own end and return `undefined` without a compile error. The register in
> [`docs/guide/known-issues.md`](../../../../docs/guide/known-issues.md) has an instance. **Do not treat a
> type annotation in this codebase as a guarantee.**

## What each folder owns

| Folder | Files | Owns |
| --- | --- | --- |
| `base/` | 23 | the game loop, input dispatch, HUD, drawing, vision, and `KDTypeDefs.ts` — **the restraint type** |
| `base/game/` | — | `KinkyDungeonGame.ts` (the main loop and the save path), `KinkyDungeonHUD.ts`, `KinkyDungeonDraw.ts` |
| `map/` | 27 | generation, tiles, objects, shrines, traps, stairs |
| `enemy/` | 18 | AI, personalities, spawns, the enemy list, enemy event handlers |
| `collection/` | 16 | the non-combat places: wardrobe, recycler, warden, facilities, NPC restraint |
| `restraint/` | 16 | **the restraint registry, variants, tags, struggles, locks, tethers** |
| `item/` | 15 | inventory, items, consumables, potions, loot, enchantment, inventory actions |
| `player/` | 14 | **the stat globals and every aggregate built on them**, training, dress/poses, perks |
| `prison/` | 7 | jail, prison types, parole |
| `dialogue/` | 6 | dialogue trees, triggers, lore |
| `magic/` | 5 | spell definitions, spell components, spell effect code |
| `faction/` | 5 | factions, reputation, quests |
| `effect/` | 3 | **one file — `KinkyDungeonEvents.ts`, 14,278 lines — holding nearly every event handler** |
| `fight/` | 2 | combat resolution and the weapon list |

## The files that matter

Read in this order when a subsystem is unfamiliar. The line count is there so a reader knows what they
are walking into.

| Lines | File | Why it matters |
| --- | --- | --- |
| 18,479 | `restraint/KinkyDungeonRestraintsList.ts` | every restraint the game ships: the fields, the tags, the models. **This is the content grid** — it is where a field's true intent is legible |
| 14,278 | `effect/KinkyDungeonEvents.ts` | the handler table. Every `calc*` seam, every `forceResult` guard, every item event |
| 12,048 | `enemy/KinkyDungeonEnemies.ts` | AI decisions, and the enemy-side readers of player state |
| 8,292 | `restraint/KinkyDungeonRestraints.ts` | the aggregates and predicates: bound checks, bondage totals, struggle, locks, tags |
| 4,951 | `base/game/KinkyDungeonGame.ts` | the loop, the save, and the action handlers |
| 4,540 | `base/KDTypeDefs.ts` | **the restraint type itself**, plus the entity and event payload types |
| 4,517 | `item/KinkyDungeonInventory.ts` | `KinkyDungeonAllRestraint` and its `…Dynamic` sibling — read both |
| 4,339 | `base/game/KinkyDungeonHUD.ts` | what the player is shown, which is often the only place a mechanic is explained |
| 4,129 | `fight/KinkyDungeonFight.ts` | melee, blocking, the damage pipeline |
| 3,245 | `magic/KinkyDungeonMagic.ts` | **the spell components** — `Verbal`, `Arms`, `Legs` — and their partial-miscast maths |
| 2,774 | `player/KinkyDungeonStats.ts` | **every aggregate in this folder** except the pose ones. The densest file here |
| 2,600 | `magic/KinkyDungeonMagicCode.ts` | per-spell effect code |
| 1,779 | `base/KinkyDungeonInput.ts` | the action chokepoint: the named actions, and what each does |
| 1,445 | `player/KinkyDungeonDress.ts` | where the pose record is assembled from the availability answer |
| 1,117 | `base/KinkyDungeonVision.ts` | the lightmap, and the blind level's rendering |
| 916 | `item/KinkyDungeonConsumables.ts` | eating, drinking, and the gag gates on both |
| 783 | `Data/Poses.ts` | the pose constants, the two availability functions, and the fallback sentinel |
| 643 | `restraint/KDRestraintUtility.ts` | tag validation per item and per restraint |
| 405 | `player/KDTraining.ts` | the training record, and `KDSensesTrainingBoost` |

Those nineteen are 91,280 lines together. The other ~140 files are mostly content and presentation.

## How it is bundled, and why that matters here

The game is compiled with a single `outFile`, so **every top-level `function` is a property of the same
global object** once built. Two consequences:

1. A mod can **read** any of these by name at run time — which is how a mod's own code resolves
   `KinkyDungeonGagTotal()` without importing anything.
2. A mod can **replace** one, and this is the only way into a mechanism that has no event. The pose
   availability functions are the case in point: they are pure functions with no `calc*` event, so
   wrapping the global is the entire seam. This repository already wraps two game globals at module
   evaluation, and [`docs/guide/invariants.md`](../../../../docs/guide/invariants.md) records the ordering
   hazard that comes with it.

There is no module system to reach through — no `import` from the game side, no types package for the
runtime — so **a citation to the game is a citation to a global**, and the name is the interface.

## Three patterns that recur everywhere

Recognising one of these three is usually the whole of understanding an unfamiliar subsystem.

### One question, many predicates

The engine almost never has a single answer to *"is she X"*. It has several, they are computed
differently, and they disagree. Examples, all confirmed:

| Question | Answers | Where |
| --- | --- | --- |
| can she talk? | `KinkyDungeonCanTalk` (per-item, **top-level list only**), `KinkyDungeonGagTotal() >= 0.99` (the sum), `KDIsGaggedFast` (the `Gagged` tag), `KinkyDungeonPotionCollar` (a fourth, for potions) | [`gag-and-speech.md`](gag-and-speech.md) |
| are her hands bound? | `KinkyDungeonIsHandsBound(…, threshold)` (a sum over a threshold), `KinkyDungeonIsHandsBoundFast` (the tag), `KDHandBondageTotal` (the raw sum) | [`binding-arm-and-hand.md`](binding-arm-and-hand.md) |
| are her arms bound? | `KinkyDungeonIsArmsBound` (tags), `KinkyDungeonIsArmsBoundC` (the per-item field, for NPCs), `KinkyDungeonIsArmsBoundFast` (**broken**) | [`binding-arm-and-hand.md`](binding-arm-and-hand.md) |
| can she use her feet? | `KinkyDungeonCanUseFeet`, `KinkyDungeonCanUseFeetLoose` (adds "is she on the ground") | [`lower-body.md`](lower-body.md) |

**The practical rule: before trusting any predicate, find out which list it traverses.** The difference
between `KinkyDungeonAllRestraint()` and `KinkyDungeonAllRestraintDynamic()` is the difference between
seeing a linked sub-item and not seeing it at all.

### The write side is a field; the read side is an aggregate or a tag

A restraint carries a scalar field (`gag: 0.5`, `bindhands: 1.0`, `hobble: 1`). Something then either

- **sums / maxes / counts** those fields into a level (`KinkyDungeonGagTotal`, `KDDeafLevel`,
  `KinkyDungeonGetBlindLevel`, `KinkyDungeonCalculateSlowLevel`), or
- **copies truthiness into a tag** (`Gagged`, `BoundArms`, `BoundHands`, `BoundFeet`, `Hobble`,
  `Blindfolded`, `ChastityLower`, …) which the fast predicates then read.

The tag copy happens in `KinkyDungeonUpdateRestraints` and runs at **three** separate sites in
`restraint/KinkyDungeonRestraints.ts` — roughly `:4225-4257`, `:4341-4361` and `:4483-4497`. Any change
that assumes there is one such site will be wrong. **A tag is a second, coarser copy of the field, and
the two drift**: the field is a number, the tag is a boolean, and the predicates that read each disagree
by construction.

### The aggregate owns the algebra, not the field

The same author, writing fields that look identical, produced four different combination rules:

| Aggregate | Rule |
| --- | --- |
| `KinkyDungeonGagTotal` | sum, times a global multiplier, minus a saturating floor |
| `KDHandBondageTotal` | sum, times a perk multiplier |
| `KDDeafLevel` | `0.75 · max + 0.25 · sum`, with the weights **in the mutable payload** |
| `KinkyDungeonGetBlindLevel` | **count and maximum at once**: `max(min(8, n + 1), value)`, then `× 1.5` |
| `KinkyDungeonCalculateSlowLevel` | nine successive operators over one integer |

So **the field's type tells you nothing about how a field combines.** Read the aggregate.
[`seam-taxonomy.md`](seam-taxonomy.md) is the catalogue of what the combination rules turn out to be.

## How to search this codebase

The constraints are not obvious and each one has cost a wrong answer at least once.

```powershell
# The game's own source lives under a submodule: scope every search, or you will read the bundle.
$g = 'kd-structured/KinkyDungeon'

# A property on a restraint, anchored, so a nested object's key cannot match.
Select-String -Path "$g/Game/src/restraint/KinkyDungeonRestraintsList.ts" `
  -Pattern '^\s*gag:\s*([0-9.]+)' -CaseSensitive

# Every call site of an aggregate. Note the shape: Get-ChildItem does the recursion, because
# Select-String -Path does NOT accept -Recurse.
Get-ChildItem -Recurse -Filter *.ts "$g" | Select-String -Pattern 'KinkyDungeonGagTotal\(' -CaseSensitive
```

- **`-CaseSensitive` is not optional.** `gag` is also a model layer filter key written `Gag:` in
  `Filters: { … }` blocks, and PowerShell's default case-insensitive match conflates the property with
  the filter. That single omission inflated an earlier count from 81 to 87.
- **Anchor with `^\s*`** when counting a property. Unguarded patterns match nested objects and
  inline single-line records differently, which is how a count acquires an off-by-five.
- **`Get-ChildItem -Recurse … | Select-String`** is the repo-wide form; the sandbox's constrained
  language mode rejects `[Math]::` and `Add-Type`, so do arithmetic with `Sort-Object { [double]$_.Name }`
  and `Group-Object` rather than helper types.
- **The bundle is not the source.** `kd-structured/KinkyDungeon/out/main.js` and `Declaration/` are
  build output; a search that reaches them returns duplicated hits and stale line numbers.

## How to re-derive this

```powershell
# The folder census and the file sizes.
Get-ChildItem -Directory 'kd-structured/KinkyDungeon/Game/src' |
  ForEach-Object { "{0,-14} {1}" -f $_.Name, (Get-ChildItem -Recurse -Filter *.ts $_.FullName).Count }
@(Get-Content 'kd-structured/KinkyDungeon/Game/src/player/KinkyDungeonStats.ts').Count   # 2774

# The bundling claim: one outFile, and strictNullChecks off.
Select-String 'kd-structured/KinkyDungeon/tsconfig.json' -Pattern 'outFile|strictNullChecks'
```

> **[read] `Measure-Object -Line` is the wrong tool for this**, and it produced a wrong table once: it
> does not count blank lines, so it reported `KinkyDungeonStats.ts` as 2,399 lines against a true 2,774.
> Use `@(Get-Content $f).Count` or the `read` tool's own total.
