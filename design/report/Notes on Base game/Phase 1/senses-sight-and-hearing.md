# The senses: sight and hearing

> Research notes, not corpus — see [`AGENTS.md`](AGENTS.md). Every site below was read while the
> sentence citing it was written; every count was re-derived, and the commands are at the end.

The two sensory aggregates have **different algebras and different scales**, and they share one training
track. That combination is why they are one file.

## Sight

### The field and the aggregate

`blindfold?: number` — `base/KDTypeDefs.ts:506`, documented as *"Higher value = higher vision loss"*.
It is an **integer** in practice, not a fraction.

`KinkyDungeonGetBlindLevel()` — `player/KinkyDungeonStats.ts:2063-2075`:

```js
let blindness = 0;
for (let inv2 of KinkyDungeonAllRestraintDynamic()) {
    let inv = inv2.item;
    if (KDRestraint(inv).blindfold) blindness = Math.max(Math.min(8, blindness + 1), KDRestraint(inv).blindfold);
}
let data = { player: KinkyDungeonPlayerEntity, blindness: blindness ? blindness * 1.5 : 0 };
KinkyDungeonSendEvent("calcBlind", data);
return data.blindness;
```

> **[read] This is a count and a maximum at once, and it is the only aggregate in the game that is.**
> Each blindfold adds **1** — so three weak blindfolds reach level 3 — while the same line also raises a
> **floor** to that item's own value. A single `blindfold: 6` gives 6; a `blindfold: 4` under a
> `blindfold: 1` gives 5. Then the whole thing is scaled by `× 1.5`.

### The composition, which is four inputs deep

`player/KinkyDungeonStats.ts:1827-1831`:

```js
let blind = Math.max(KinkyDungeonBlindLevelBase, KinkyDungeonGetBlindLevel());
if (KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "Blindness")) blind = Math.max(0, blind + KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "Blindness"));
KinkyDungeonBlindLevel = Math.min(KDBlindnessCap, blind);
if (KinkyDungeonStatBlind > 0) KinkyDungeonBlindLevel = Math.max(KinkyDungeonBlindLevel, 6);
```

| Input | Where it comes from | Note |
| --- | --- | --- |
| `KinkyDungeonBlindLevelBase` | `:219`, raised by buffs (`effect/KinkyDungeonBuffs.ts:464-466` sets it to `max(base, 1)` or `2`) | a `max`, not an addition, so it is a **floor** |
| the restraint aggregate | above | `0..12` before the cap |
| the `Blindness` buff | `KinkyDungeonGetBuffedStat` | the only **additive** term |
| `KDBlindnessCap` | `:1602` initialised `0`, set to **`7`** at `:1697` | a hard ceiling |
| `KinkyDungeonStatBlind` | `:221`, *"Used for temporary blindness"* | **not an equipment value at all** — over a dozen `playerEffect`s write it (`magic/KinkyDungeonPlayerEffects.ts`), as do the stun paths in `effect/KinkyDungeonEvents.ts`, and `prison/KinkyDungeonJail.ts:1238-1239` writes `6` directly. Any value `> 0` forces the level to **at least 6**. |

So the level a consumer sees is the maximum of a buff floor, a scaled count-and-maximum, and a temporary
effect — clamped to `0..7`.

The scale is stated once in the source, at `:220`: *"Blind level 1: -33% vision, blind level 2: -67%
vision, Blind level 3: Vision radius = 1"*. **It is an integer ladder, not a rate.**

### What reads it

| Reader | Site | Uses |
| --- | --- | --- |
| melee miss chance | `fight/KinkyDungeonFight.ts:517` | `min(3, BlindLevel) * KinkyDungeonMissChancePerBlind` |
| evasion and blocking | `:566, :576, :580, :593` | `+0.5`, `0.1 * level`, `+0.5`, `+0.33` |
| enemy vision distance | `enemy/KinkyDungeonEnemies.ts:1878-1879` | `MaxVisionDist - level * data.blindMult`, floored at `1.5` (or `0.5` under `TotalBlackout`) |
| rendering | `base/KinkyDungeonVision.ts:640` (greyscale at `>= 2`), `base/game/KinkyDungeonDraw.ts:556` (a trap draws as floor), `:1322`, `:5205` | — |
| **item interaction** | `item/KinkyDungeonItem.ts:326` | `if (KDDroppedItemProperties[item.name]?.tinyness <= KinkyDungeonBlindLevel) return false;` — small items become unseeable, and the threshold is on the integer ladder |
| the score | `player/KinkyDungeonStats.ts:1672` | `KDBoundPowerLevel += 0.1 * min(1, BlindLevel / 3)` |
| classification | `restraint/KinkyDungeonRestraints.ts:782` | `KDIsBinding` uses `blindfold > 1` |
| enemy status | `:431-433` | `status.blind = ceil(powerMult * blindfold * 1.7)` |
| enchant weights | `item/KDEnchant.ts:214, :501, :532, :598` | flat weights per family, plus `:835` |
| HUD, titles | `base/game/KinkyDungeonHUD.ts:2929`, `player/KDPlayerTitles.ts:847` | a boolean-ish display |

### The `calcBlind` seam is an absolute value

`effect/KinkyDungeonEvents.ts:1005-1011` is the only handler:

```js
"DollmakerMask": (_e, _item, data) => {
    if (!KinkyDungeonFlags.get("DollmakerGrace")) {
        data.blindness = Math.max(data.blindness, 5);
        …
    }
},
```

It **replaces** `data.blindness`, which arrived as `aggregate × 1.5`. So a handler on this seam must
*write a level*, not add to one — the distinction catalogued in
[`seam-taxonomy.md`](seam-taxonomy.md). The handler is attached by two restraint records
(`restraint/KinkyDungeonRestraintsList.ts:2960, :2990`).

## Hearing

### The field and the aggregate

`deaf?: number` — `base/KDTypeDefs.ts:466`. `KDDeafLevel()` — `player/KinkyDungeonStats.ts:413-435`:

```js
let data = {
    deaflevel: 0,
    deafMaxWeight: 0.75,
    deafTotalWeight: 0.25,
    maxDeaf: 0, totalDeaf: 0,
    restraints: KinkyDungeonAllRestraintDynamic().filter((inv) => KDRestraint(inv.item)?.deaf)
};
for (let inv of data.restraints) {
    let deaf = KDRestraint(inv.item).deaf;
    data.maxDeaf = Math.max(deaf, data.maxDeaf);
    data.totalDeaf += deaf;
}
KinkyDungeonSendEvent("calcDeaf", data);
data.deaflevel = data.deafMaxWeight * data.maxDeaf + data.deafTotalWeight * data.totalDeaf;
return data.deaflevel;
```

**A weighted maximum plus a weighted sum** — and the weights are **in the payload**, so the final
combination is itself mutable by a handler. No other aggregate in the game does that.

> **[read] `calcDeaf` has no handler anywhere.** The name appears exactly once in the whole game source,
> at this dispatch. So the loop runs, the payload is built, the event fires into an empty table, and the
> result is thrown away as far as any extension is concerned. A mod adding a `calcDeaf` handler is the
> first consumer — which also means there is no base-game precedent for what such a handler should do
> beyond the payload's own initialisers.

### The radius, and the two branches

`KinkyDungeonGetHearingRadius(entity?)` — `:440-469`:

```js
// player
return { radius: Math.round((data.base * 5 / (5 + data.deaflevel)) * data.hearingMult), mult: data.hearingMult };
// enemy — a DIFFERENT formula, and deaflevel is hardcoded
deaflevel: 0,//KinkyDungeonDeaf ? 4 : 0,
return { radius: Math.round((data.base - data.deaflevel) * data.hearingMult), mult: data.hearingMult };
```

Three things:

- **The player's radius is a hyperbola**: `base = 8`, so `level 0 → 8`, `level 3.75 → ≈ 4.6`, and it
  **never reaches zero**. There is no deaf state in this game, only a quieter one.
- **The enemy branch uses subtraction instead**, and its `deaflevel` is a literal `0` with the real
  expression commented out — so **a player's deafness cannot reach an enemy's hearing at all**. That is
  the register entry in [`docs/guide/known-issues.md`](../../../../docs/guide/known-issues.md).
- `hearingMult` is initialised from `KDSensesTrainingBoost(entity)`, so the training multiplier is inside
  the radius, not applied after it.

Four call sites, all enemy-side: `enemy/KinkyDungeonEnemies.ts:9802, :9855, :9869, :9904`. Enemies have
their own path too — `KDEntitySenses` (`:393-411`) with a `calcEntityHearing` event and a plain
`(base - deaflevel) * hearingMult`.

### The `calcHearing` seam is a multiplier, and it has two handler tables

| Table | Handler | Driven by |
| --- | --- | --- |
| `effect/KinkyDungeonEvents.ts:7263-7267` | `"Multiply": data.hearingMult *= e.mult` | **spell effects** — `magic/KinkyDungeonMagicList.ts:520` passes `1.15`, `:1847` passes `3.0` |
| `effect/KinkyDungeonEvents.ts:13750-13756` | `"KeenHearing"` reads `KinkyDungeonStatsChoice.get("KeenHearing")` and does `data.hearingMult *= 2`, **ignoring its event argument entirely** | a **perk** |

So the same coefficient carries a per-effect grant and a character-level one, and `calcHearing` is
already used to *grant* hearing rather than only to deny it.

## The two senses share one training track

`KDTickSensesTraining` — `base/game/KinkyDungeonGame.ts:3847-3869`:

```js
let trainingLevel = KinkyDungeonBlindLevel + KDDeafLevel();
…
if (!canSee && canHear) {
    KDGameData.SeenEntities[enemy.id] = true;
    KDTickTraining("Senses", true, false, KDSensesTrainingMult * 2, 4 + trainingLevel * .4);
} else if (canSee) {
    KDGameData.SeenEntities[enemy.id] = true;
    KDTickTraining("Senses", KinkyDungeonBlindLevel > 0, KinkyDungeonBlindLevel == 0, KDSensesTrainingMult, 1 + KinkyDungeonBlindLevel * .1);
}
```

- **The two levels are added** to form one `trainingLevel`, so the `Senses` record does not distinguish
  them. A blindfold and an earplug train the same stat.
- The *difficulty* of the tick scales with the sum (`4 + level * 0.4`), while the second branch scales
  only with the blind level.
- `KDSensesTrainingMult = 0.5` (`effect/KinkyDungeonEvents.ts:18`).
- The boost is then read back by **both** senses: `KDSensesTrainingBoost` (`player/KDTraining.ts:389-405`)
  fires `calcGagRed` (a training seam with no base-game listener) and returns a `mult` that becomes
  `hearingMult` for hearing (`:448`) and divides the vision multiplier for sight (`:372`).

```js
function KDSensesTrainingBoost(player, buffs = true) {
    let data = { level: Training?.Senses?.training_stage || 0, buff: KDEntityBuffedStat(player, "SensesTraining"),
                 buffmult: 1, mult: 1, boost: 0.05, priority: 0 };
    KinkyDungeonSendEvent("calcGagRed", data);
    if (data.boost) data.mult += data.boost * ((data.level + data.buff) * data.buffmult);
    return data.mult;
}
```

> **[read] So "the senses" is one training record, one multiplier, and two parallel consumers — and the
> sight side divides by it while the hearing side multiplies by it.** A change that touches either
> without the other will read as a bug in the untended one.

## Two dead globals in this subsystem

| Global | Evidence | Still read at |
| --- | --- | --- |
| `KinkyDungeonDeaf` | declared `false` (`player/KinkyDungeonStats.ts:224`) and **assigned `false` on every stats update** (`:1833`, where the real implementation is commented out as `//KinkyDungeonPlayer.IsDeaf()`) | `:364` (`noperipheral`), `base/KinkyDungeonVision.ts:585`, `base/game/KinkyDungeonDraw.ts:5183` |
| `KDBlindnessCap`'s two setters | initialised `0` (`:1602`), set to `7` once (`:1697`); the two sites that would narrow it are **commented out** (`effect/KinkyDungeonEvents.ts:6717, :6744`) | the `Math.min` at `:1829` |

## The content grid

Scanned with `-CaseSensitive`, over `restraint/KinkyDungeonRestraintsList.ts`:

| Field | Sites | Distribution |
| --- | --- | --- |
| `blindfold` | **26** | `1 ×3, 2 ×2, 3 ×8, 4 ×6, 5 ×3, 6 ×4` — six integer values |
| `deaf` | **3** | `4 ×2, 5 ×1` — two integer values |

> **[read] The asymmetry is the finding.** Sight is a first-class mechanic with 26 items on a six-step
> ladder and dozens of consumers; hearing is three items, two values, one aggregate nobody handles, and
> four consumers that are all enemy-side. Any design that treats "the two sensory slots" as parallel is
> reading the type definitions rather than the content.

## How to re-derive this

```powershell
$g = 'kd-structured/KinkyDungeon/Game/src'

# The two aggregates, whole.
Select-String -Path "$g/player/KinkyDungeonStats.ts" -Pattern 'function KinkyDungeonGetBlindLevel' -CaseSensitive -Context 0,12
Select-String -Path "$g/player/KinkyDungeonStats.ts" -Pattern 'function KDDeafLevel' -CaseSensitive -Context 0,22
Select-String -Path "$g/player/KinkyDungeonStats.ts" -Pattern 'function KinkyDungeonGetHearingRadius' -CaseSensitive -Context 0,29

# The composition into the level.
Select-String -Path "$g/player/KinkyDungeonStats.ts" -Pattern 'KinkyDungeonBlindLevel = ' -CaseSensitive -Context 4,2

# That calcDeaf has no handler: the name appears once in the tree.
Get-ChildItem -Recurse -Filter *.ts "$g" | Select-String -Pattern 'calcDeaf' -CaseSensitive

# The shared training track, and the boost both senses read.
Select-String -Path "$g/base/game/KinkyDungeonGame.ts" -Pattern 'function KDTickSensesTraining' -CaseSensitive -Context 0,22
Select-String -Path "$g/player/KDTraining.ts" -Pattern 'function KDSensesTrainingBoost' -CaseSensitive -Context 0,16

# The grids.
$f = "$g/restraint/KinkyDungeonRestraintsList.ts"
foreach ($p in 'blindfold','deaf') {
  Select-String -Path $f -Pattern ("^\s*{0}:\s*([0-9.]+)" -f $p) -CaseSensitive -AllMatches |
    ForEach-Object { $_.Matches } | ForEach-Object { $_.Groups[1].Value } |
    Group-Object | Sort-Object { [double]$_.Name } | Format-Table Name,Count
}

# The dead globals.
Select-String -Path "$g/player/KinkyDungeonStats.ts" -Pattern 'KinkyDungeonDeaf|KDBlindnessCap' -CaseSensitive
```
