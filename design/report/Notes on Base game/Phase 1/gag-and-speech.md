# Gag and speech

> Research notes, not corpus — see [`AGENTS.md`](AGENTS.md). Every site below was read while the
> sentence citing it was written; every count was re-derived, and the commands are at the end.

## The aggregate

`KinkyDungeonGagTotal(AllowFlags?, gagMult = 1, noMults?)` — `player/KinkyDungeonStats.ts:2209-2231`:

```js
if (!noMults && KinkyDungeonStatsChoice.get("SmoothTalker")) gagMult = 0.85;
let total = 0, allow = false, prevent = false;
let globalGagReduction = KDGagReductionMult(KDPlayer());
if (!noMults) gagMult *= globalGagReduction;
for (let rest of KinkyDungeonAllRestraintDynamic()) {
    let inv = rest.item;
    if (KDRestraint(inv).gag) total += gagMult * KDRestraint(inv).gag;
    if (KDRestraint(inv).allowPotions) allow = true;
}
if (!noMults) {
    if (globalGagReduction < 1) total = Math.max(0, total - KDGlobalMaxGagReduction * (1 - globalGagReduction));
}
if (AllowFlags) { if (prevent) return 1.00; else if (allow) return 0.0; }
return total;
```

Five inputs, and they compose in this order: the item sum → `SmoothTalker` (`×0.85`) →
`KDGagReductionMult` (a training-derived multiplier, `player/KDTraining.ts:360`) → a **saturating flat
reduction** of up to `KDGlobalMaxGagReduction = 0.5` (`:8`) → an `allowPotions` override that returns
`0.0` outright.

Three properties worth carrying:

- **It is a plain sum over the dynamic list**, so a linked sub-item counts and nothing clamps it. Every
  consumer that wants `0..1` clamps it itself.
- **The reduction is subtractive and global**, not per item: `total - 0.5 · (1 - mult)`. So a trained
  wearer with one weak gag can reach exactly zero while a heavily gagged one is barely moved.
- **`allowPotions` is a flag, not a value** — one item anywhere in the worn set zeroes the whole result
  *only when `AllowFlags` is true*, which only the drinking paths pass.

### Two parts of it are dead

| Dead thing | Evidence |
| --- | --- |
| the `prevent` branch | `prevent` is initialised `false` (`:2213`) and **never assigned**. The word `blockPotions` appears **twice in the entire game source, both inside docblocks** — `:2206` and `:2234`. So `if (prevent) return 1.00;` at `:2227` cannot execute. |
| the `gagMult` parameter | every call site passes a default or `1`: the callers are `()`, `(false)`, `(true)` and `(false, 1, true)`. So the multiplier the signature offers is inert, and `SmoothTalker` is applied unconditionally. |

Both are in the register at [`docs/guide/known-issues.md`](../../../../docs/guide/known-issues.md).

## The four predicates that answer "can she talk"

| Predicate | Site | Reads | Answers |
| --- | --- | --- | --- |
| `KinkyDungeonCanTalk(Loose?)` | `player/KinkyDungeonStats.ts:2241-2246` | **the raw per-item `gag`, over `KinkyDungeonAllRestraint()`** | `false` if *any* top-level item has a truthy `gag`; with `Loose`, `KinkyDungeonGagTotal() >= 0.99` instead |
| `KinkyDungeonGagTotal() >= 0.99` | written at each call site | the sum | a threshold on the sum |
| `KDIsGaggedFast()` | `:2238` | the `Gagged` **tag** | a boolean |
| `KinkyDungeonPotionCollar()` | `item/KinkyDungeonConsumables.ts:472-484` | `return KinkyDungeonCanTalk(!strict)` | a **speech** predicate with a potion's name |

> **[read] `KinkyDungeonCanTalk` cannot see a linked item, and this is not a subtle difference.**
> `KinkyDungeonAllRestraint()` (`item/KinkyDungeonInventory.ts:753-755`) returns the inventory's
> **top-level** values; `KinkyDungeonAllRestraintDynamic()` (`:771-785`) flattens the `dynamicLink`
> chains. `GagTotal` iterates the second and `CanTalk` the first, so **a gag linked under a face cover is
> visible to the sum and invisible to the predicate**. The base game's own muffler-and-socket pattern
> (`item/KinkyDungeonRestraintsList.ts` items with `Link`/`LinkableBy`) is exactly the arrangement that
> triggers it.

And one more coarse copy: the `Gagged` tag is set on truthiness at three sites in
`restraint/KinkyDungeonRestraints.ts` (`:4239-4240`, `:4351-4352`, `:4487-4488`).

## What the sum actually drives

Grouped by mechanism, with the site. This is the census that showed the property is **four demands in
one number** rather than one.

| Mechanism | Sites | How it reads `gag` |
| --- | --- | --- |
| **speech** | `base/game/KinkyDungeonGame.ts:4867` (`!CanTalk()`), `restraint/KinkyDungeonRestraints.ts:3017, :5322, :5425` (mumble chance) | `CanTalk` |
| **the `Verbal` spell component** | `magic/KinkyDungeonMagic.ts:64, :73` (the `Incantation` fold), `:74` (`SmoothTalker` zeroes below `0.5`), `:81` (`noMults` for training), `magic/KinkyDungeonMagicCode.ts:556` (`>= 0.25`), `item/KinkyDungeonInventory.ts:4260-4262` and `base/game/KinkyDungeonHUD.ts:779-781` (display) | the sum, and thresholds at `0.25`, `0.5`, `0.99`, `1` |
| **drinking and eating** | `item/KinkyDungeonConsumables.ts:570` (`needMouth`), `:576` (`gagMax`), `:754` (potency), `:578, :605, :808` (`PotionCollar`); `item/KDPotions.ts:50, :59` | see the four gates below |
| **noise** | `base/KinkyDungeonInput.ts:421-423` (the shout), `player/KinkyDungeonStats.ts:2318` (the moan) | the sum, squared for the shout |
| **a derived score** | `player/KinkyDungeonStats.ts:1677` | `KDBoundPowerLevel += 0.2 · total` |
| **enemy silence seconds** | `restraint/KinkyDungeonRestraints.ts:428-430`, applied at `item/KDInventoryActions.ts:1359-1360` and `enemy/KinkyDungeonEnemies.ts:4427-4428` | `ceil(powerMult · gag · 1.3)`, **enemy-only** |
| **classification** | `restraint/KinkyDungeonRestraints.ts:783` (`KDIsBinding`), `:7688` (`KDGetRestriction`) | `gag > 0.25` for binding, `+1` restriction |
| **enchant and item-power weights** | `item/KDEnchant.ts:502, :533, :566, :757, :813` (a flat weight per family) and `:834` (`gag * 3`) | the field, not the sum |
| **dialogue and AI gates** | `dialogue/KinkyDungeonDialogue.ts:560, :2809`; `enemy/KinkyDungeonEnemies.ts:5394, :5428, :5431`; `item/KinkyDungeonItem.ts:274`; `item/KinkyDungeonLoot.ts:123`; `map/KinkyDungeonObject.ts:496` | mostly `CanTalk` |
| **display** | `base/game/KinkyDungeonHUD.ts:2919-2928` | the sum as a **percentage** — the only place a blinding uses a continuous readout |

The shout and moan formulas, since they are the noise half of the story:

```js
// base/KinkyDungeonInput.ts:422, inside the "noise" action
KinkyDungeonMakeNoise(Math.ceil(10 - 8 * Math.min(1, gagTotal * gagTotal)), x, y, false, true);

// player/KinkyDungeonStats.ts:2318, inside the play-with-self event payload
alertRadius: 4.5 - 4 * Math.min(1, KinkyDungeonGagTotal()),
```

So a full gag takes a shout from radius `10` to `2` and a moan from `4.5` to `0.5`. **Neither reaches
zero**, so a gagged character is never silent — merely quiet. Note also that the shout passes
`AllowFlags = true` (`:421`) while the moan does not, so `allowPotions` silences one and not the other.

## The four consumption gates

This is the most tangled corner of the subsystem, and it is worth reading in order.

```js
// item/KinkyDungeonConsumables.ts:570 — whether the mouth is needed at all
let needMouth = item.item && KDConsumable(item.item) &&
    ((KDConsumable(item.item).potion && !KDConsumable(item.item).gagFloor) || KDConsumable(item.item).needMouth);

// :575-577
if (needMouth && ((!potion && ((gagMax && KinkyDungeonGagTotal() > gagMax)
                              || (!gagMax && !KinkyDungeonCanTalk(true))))
                  || (potion && !KinkyDungeonCanDrink()))) { … refuse, unless PotionCollar … }
```

| Gate | Where it is declared | What it does |
| --- | --- | --- |
| `needMouth` | per consumable (`base/KDTypeDefs.ts:128-130`) | if false, **the mouth is bypassed entirely** — a potion with a `gagFloor` needs no mouth |
| `gagMax` | per consumable, **4 sites** in `item/KinkyDungeonConsumablesList.ts` (all `0.59`, all foods) | an absolute ceiling on the sum, checked **before** `CanTalk` |
| `gagFloor` | per consumable, **6 sites** (all `0.5`, all potions) | a floor on the *potency* multiplier: `gagFloor + (1 - gagFloor) · (1 - clamp01(total))` at `:754`, so a `0.5`-floor potion always works at half strength |
| `KinkyDungeonCanDrink()` | `item/KDPotions.ts:50` and `:59` | a separate predicate, so a third answer to the same question |
| `PotionCollar()` | `item/KinkyDungeonConsumables.ts:472-484` | `CanTalk(!strict)` — **the escape hatch**: being able to talk loosely lets potions through regardless of the gag |

> **[read] So "can she drink this" is answered by four different mechanisms and one per-item threshold,
> and `gagFloor`/`gagMax` are content fields competing with the global sum.** A `gagFloor: 0.5` potion
> skips the mouth check entirely and then has its *effect* scaled by the same sum. Both numbers are the
> author's, not the engine's, and neither is documented in the restraint type.

## The whole-axis multipliers

These are applied at the aggregate or by a consumer, never per item:

| Multiplier | Site | Effect |
| --- | --- | --- |
| `SmoothTalker` | `player/KinkyDungeonStats.ts:2210` (`× 0.85`) **and** `magic/KinkyDungeonMagic.ts:74` (zeroes the miscast below `0.5`) | one perk, two different behaviours |
| `Incantation` | `magic/KinkyDungeonMagic.ts:64, :73` | **if the sum is nonzero, treat it as `1.0`** — the perk *maximises* the penalty |
| `KDGagReductionMult` | `player/KDTraining.ts:360`, applied at `:2214-2224` | training, with a flat floor of `0.5` |
| `noMults` | the third argument | bypasses both `SmoothTalker` and training; used only by the training tick and the `Verbal` component's `cast` |

> **[inferred] These are wearer-adaptation effects, and they are why "the same restraint is stricter on
> an untrained character" is a real behaviour rather than a rounding error.** They sit at the aggregate,
> so they rescale everything downstream at once.

## The derived score

`KDBoundPowerLevel` — `player/KinkyDungeonStats.ts:1671-1682` — is the closest thing the game has to an
overall "how bound is she" number, and the gag is `0.2` of it:

```js
KDBoundPowerLevel = 0;
KDBoundPowerLevel += 0.1 * Math.max(0, Math.min(1, KinkyDungeonBlindLevel / 3));
if (KinkyDungeonIsArmsBound(false, false))            KDBoundPowerLevel += 0.2;
if (KinkyDungeonIsHandsBound(false, false, 0.65))     KDBoundPowerLevel += 0.075;
if (KinkyDungeonIsHandsBound(false, false, 0.99))     KDBoundPowerLevel += 0.075;
KDBoundPowerLevel += 0.1 * KinkyDungeonChastityMult();
KDBoundPowerLevel += 0.2 * KinkyDungeonGagTotal();
if (KDIsOnKnees(KDPlayer())) { if (SlowLevel > 2) += 0.15 } else += 0.15 * clamp(SlowLevel / 2);
KDBoundPowerLevel += 0.1 * Math.max(0, Math.min(1, KDGameData.HeelPowerEffective / 4));
if (KDBoundPowerLevel > 1) KDBoundPowerLevel = 1;
```

**It is consumed as a gameplay input, not merely displayed**, which is easy to miss:

| Reader | Threshold |
| --- | --- |
| `map/KinkyDungeonFurniture.ts` (six sites, `:33-495`) | `>= 0.35` → power 2, `>= 0.1` → power 1 |
| `enemy/KinkyDungeonEnemies.ts:5501, :5602` | `>= AIData.targetRestraintLevel` — whether an enemy will leash or bind her |
| `enemy/KinkyDungeonEnemyEventList.ts` (seven sites) | `< 0.5` gates an attack decision |
| `player/KinkyDungeonPerks.ts:151` | `KDDamageAmpPerks += KDBoundPowerLevel * KDBoundPowerMult` — **being bound raises her damage** |
| `player/KinkyDungeonPerks.ts:252`, `dialogue/KinkyDungeonDialogueList.ts:4668` (`> 0.4`), `map/KinkyDungeonObject.ts:452` | display and gating |

## A rate indexing a text variant

Twice, the exact value of the sum picks *which line is printed* rather than whether a threshold is
crossed. Both clamp to a small set of variants:

```js
// base/game/KinkyDungeonGame.ts:4871-4873 — the mumble
const GagEffect = KinkyDungeonGagTotal() * 5;
gagMsg += GagEffect;
gagMsg = Math.max(0, Math.min(7, Math.floor(gagMsg)));

// base/KinkyDungeonInput.ts:423 — the shouted call for help
KinkyDungeonSendTextMessage(10, TextGet("KDShoutHelp" + Math.min(3, Math.floor(gagTotal * 3.3))), "yellow", 1);
```

So the fractional part of the sum is **observable to the player** in eight mumble variants and four
shout variants. A model that quantises `gag` too coarsely changes what she says.

## The content grid

`restraint/KinkyDungeonRestraintsList.ts` — **81 `gag` sites**, over **15 distinct values**:

`0.1 ×1, 0.15 ×1, 0.25 ×1, 0.3 ×10, 0.35 ×8, 0.4 ×6, 0.45 ×3, 0.5 ×18, 0.6 ×4, 0.65 ×7, 0.7 ×4,
0.75 ×9, 0.8 ×1, 0.9 ×2, 1.0 ×6`

Three readings:

- **It is a hand-picked grid on `0.05` steps, not a continuum.** Fifteen values for eighty-one items is
  an author choosing from a palette.
- **`0.5 ×18` is the mode** and `1.0` has only six items, so "fully gagged" is rare — the author treats
  it as an extreme rather than a default.
- **Nothing clamps at `1.0` in the field, but every consumer clamps**, so `1.0` is the effective maximum
  and the sum above `1.0` only matters for the flat reduction and the thresholds.

For comparison within the same subsystem: `blindfold` has 26 sites over six integer values and `deaf` has
three sites over two values. See [`senses-sight-and-hearing.md`](senses-sight-and-hearing.md).

> **[read] `gag` collides with a model-layer key, and this is why every command here is
> case-sensitive.** Restraint records carry `Filters: { Gag: { gamma: …, saturation: … } }` blocks —
> `:3780`, `:11232`, `:11377` — so a case-**insensitive** search for `gag:` finds 87 sites rather than 81,
> and the six extras are colour filters. This is the single most likely way to get a wrong count in this
> subsystem.

## How to re-derive this

```powershell
$g = 'kd-structured/KinkyDungeon/Game/src'

# The aggregate, its two constants, and the training multiplier.
Select-String -Path "$g/player/KinkyDungeonStats.ts" -Pattern 'function KinkyDungeonGagTotal' -CaseSensitive -Context 0,24
Select-String -Path "$g/player/KinkyDungeonStats.ts" -Pattern 'KDGlobalMaxGagReduction' -CaseSensitive
Select-String -Path "$g/player/KDTraining.ts" -Pattern 'function KDGagReductionMult' -CaseSensitive

# The four predicates.
Select-String -Path "$g/player/KinkyDungeonStats.ts" -Pattern 'function KinkyDungeonCanTalk|function KDIsGaggedFast' -CaseSensitive
Select-String -Path "$g/item/KinkyDungeonConsumables.ts" -Pattern 'function KinkyDungeonPotionCollar' -CaseSensitive -Context 0,14

# The census: every reader of the sum. Get-ChildItem recurses; Select-String -Path does not.
Get-ChildItem -Recurse -Filter *.ts "$g" | Select-String -Pattern 'KinkyDungeonGagTotal\(' -CaseSensitive

# The content grid — -CaseSensitive is what excludes the Filters: { Gag: … } keys.
$f = "$g/restraint/KinkyDungeonRestraintsList.ts"
Select-String -Path $f -Pattern '^\s*gag:\s*([0-9.]+)' -CaseSensitive -AllMatches |
  ForEach-Object { $_.Matches } | ForEach-Object { $_.Groups[1].Value } |
  Group-Object | Sort-Object { [double]$_.Name } | Format-Table Name,Count

# The dead branch, proved by the word's whole existence in the tree.
Get-ChildItem -Recurse -Filter *.ts "$g" | Select-String -Pattern 'blockPotions' -CaseSensitive   # docblocks only
Get-ChildItem -Recurse -Filter *.ts "$g" | Select-String -Pattern 'gagMult' -CaseSensitive        # never non-default
```
