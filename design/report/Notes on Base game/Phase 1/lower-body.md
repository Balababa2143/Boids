# The lower body

> Research notes, not corpus — see [`AGENTS.md`](AGENTS.md). Every site below was read while the
> sentence citing it was written; every count was re-derived, and the commands are at the end.

**There is no "legs" abstraction.** The lower body is four unconnected tracks plus a set of state tags,
and each track answers a different question about the same worn items.

| Track | Carrier | Answers |
| --- | --- | --- |
| the slow level | `KinkyDungeonSlowLevel`, an **integer** | how many move points a step costs |
| the heel level | `HeelPowerEffective` and `HeelPower`, two floats | how badly heels unbalance her |
| the balance pool | `KDBalance` and four multipliers | whether she is knocked over |
| state tags and poses | `BoundFeet`, `Hobble`, `FeetLinked`, `LegBind`, `ForceKneel`, `Hogties` | what she is *in* |

## Track one: the slow level

`let KinkyDungeonSlowLevel = 0; // Adds to the number of move points you need before you move`
(`player/KinkyDungeonStats.ts:217`). Computed by `KinkyDungeonCalculateSlowLevel(delta?)` at
`:2153-2202`, which is the single densest function in this subsystem: **nine successive operators over
one integer**, in a fixed order.

| # | Condition | Operator |
| --- | --- | --- |
| 1 | any **top-level** restraint with `immobile` (`KinkyDungeonAllRestraint()`, not the dynamic list) | `+= 100`, and **everything below is skipped** |
| 2 | each dynamic item with `blockfeet \|\| hobble \|\| (ClassicHeels && heelpower)` | `hobbleAmount = hobble \|\| (ClassicHeels ? round(heelpower + 0.1) : 1) \|\| 1`, then `SlowLevel = min(max(3, hobbleAmount), SlowLevel + hobbleAmount)` |
| 3 | any `blockfeet` | `max(SlowLevel, 2)` |
| 4 | `!KinkyDungeonCanStand() \|\| KDForcedToGround()` | `max(IsArmsBound ? 3 : 2, SlowLevel + 1)`, and `KneelTurns` is set |
| 5 | `KDIsHogtied()` | `max(IsArmsBound ? 4 : 3, SlowLevel + 1)` |
| 6 | any top-level `freeze` | `max(2, SlowLevel)` |
| 7 | no stamina | `max(1, SlowLevel)` |
| 8 | the `PoorForm` perk | `+1`, and again later `max(2, ·)` |
| 9 | buffs `SlowLevel` (`+=`) and `MoveSpeed` (`-=`) | then `max(0, ·)` |
| 10 | `KDGameData.Crouch` | `max(2, SlowLevel)` |

And the consequence that matters most: **`if (KinkyDungeonSlowLevel > 9) KDGameData.MovePoints = Math.min(-1, …)`
(`:2200-2202`) — `> 9` is how the game spells "cannot move".** There is no separate boolean for it.

### Three properties of operator 2 that are easy to get wrong

- **It is a sum with a self-cap.** `min(max(3, amount), SlowLevel + amount)` means the *incoming*
  amount is clamped into `[3, ∞)` and the *total* grows by it — so `hobble: 3` and `hobble: 1` differ
  only while the total is small, and stacking many hobbles is bounded by nothing.
- **`|| 1` is the default**, so an item with `blockfeet: true` and no `hobble` contributes exactly `1`.
- **`ClassicHeels` re-reads `heelpower` as `hobble`** (`Stats.ts:2159-2160`). A perk **changes what a
  field means**, which is a stronger intervention than scaling it: the same item is a different quantity
  depending on a stat choice.

### What reads the slow level

| Reader | Site | Uses |
| --- | --- | --- |
| move point cost | `base/game/KinkyDungeonGame.ts:3057, :3084, :3093, :3162-3168` | `MovePoints += ceil(SlowLevel + 1)`; a move needs more points than the level |
| stamina drain | `:3173` | `moveMult * KinkyDungeonStatStaminaRegenPerSlowLevel * SlowLevel` |
| the five movement messages | `:3156-3160` | *slowed → hopping → inching → crawling → cannot move* at `1, 2, 3, >3, >=10` |
| sprinting | `:3443, :3478` | `KDCanSprint` requires `SlowLevel < 4` |
| evasion and blocking | `fight/KinkyDungeonFight.ts:565` (`.25 * level`), `:589` (`.1 * level`) | |
| melee | `:322-326, :346-348, :518, :3991` | the helpless branch and an accuracy penalty |
| the score | `player/KinkyDungeonStats.ts:1679-1680` | `+0.15`, or `0.15 * clamp(level / 2)` |
| AI | `enemy/KinkyDungeonEnemies.ts:5394, :5428, :5661, :5894, :8879, :9045, :9049, :9053` | what an enemy may do to her |
| the `Legs` spell component | `magic/KinkyDungeonMagic.ts:128, :136-137` | a gate at `> 1` or `> 2` under `HeelWalker`, and a partial miscast of `0.5` or `0.25` |
| tags, struggle, willpower | `restraint/KinkyDungeonRestraints.ts:1727` (`CanUseFeet`), `:2568-2570`, `:3734` | |
| HUD | `base/game/KinkyDungeonHUD.ts:2936-2944` | **five display states** on `>9`, `>3`, `>2`, `==2`, `>0` |

`KinkyDungeonSlowLevel > 9` is also the game's "immobilized" test in
`dialogue/KinkyDungeonDialogueTriggers.ts:252`, and an enemy-side gate at
`enemy/KinkyDungeonEnemyEventList.ts:1748`.

## Track two: the heel level

`KinkyDungeonCalculateHeelLevel(_delta, overrideKneel?)` — `player/KinkyDungeonStats.ts:2122-2137`:

```js
let heelpower = 0;
if (overrideKneel || (!KDForcedToGround() && KinkyDungeonCanStand()))
    for (let inv2 of KinkyDungeonAllRestraintDynamic()) {
        let inv = inv2.item;
        if ((KDRestraint(inv)?.heelpower)) {
            let power = KDRestraint(inv).power * KDRestraint(inv).heelpower;
            heelpower = Math.max(heelpower, power);
        }
    }
if (heelpower && heelpower < 2) heelpower = 2;
return Math.max(0, Math.pow(heelpower, 0.75)
    + KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "HeelPower")
    + Math.max(0, KinkyDungeonSleepiness));
```

Four things distinguish it from the slow level:

- **It multiplies the item's `power` by its `heelpower`**, so a heel is only as bad as the whole item is
  strict. The slow level never consults `power` at all.
- **It is gated on being upright**, and the gate is `!KDForcedToGround() && KinkyDungeonCanStand()` — so
  **the heel penalty disappears when she is put on the ground**, which is the opposite of what the slow
  level does (operator 4 *adds* when she is on the ground).
- **`pow(·, 0.75)` with a floor of 2** compresses the low end and leaves the high end unbounded.
- **`KinkyDungeonSleepiness` is simply added**, so being tired reads as wearing heels.

Two globals are produced by it, at `:1843-1845`:

```js
KDGameData.HeelPowerEffective = KinkyDungeonCalculateHeelLevel(delta);        // respects the pose gate
KDGameData.HeelPower         = KinkyDungeonCalculateHeelLevel(delta, true);   // overrideKneel: ignores it
```

**Two nearly identically named globals with different pose dependence.** Use:
`HeelPower` for training (`effect/KinkyDungeonEvents.ts:13124-13190`,
`prison/KinkyDungeonJail.ts:1082-1083`); `HeelPowerEffective` for balance damage
(`player/KinkyDungeonStats.ts:773-778`, `:2489`, `enemy/KinkyDungeonEnemyTeaseAttacks.ts:221`) and for
the score (`:1681`, `0.1 * clamp(HeelPowerEffective / 4)`).

`heelpower` in the content spans a **66× range** — 23 sites over 11 values:
`0.15 ×2, 0.2 ×2, 0.3, 0.35, 0.4, 0.5 ×4, 0.8 ×2, 1 ×4, 1.25 ×2, 2, 10 ×3`. The three `10`s are the
extreme ones, and `pow(10 · power, 0.75)` is a very different number from `pow(0.15 · power, 0.75)`.

## Track three: the balance pool

A fourth quantity, fed by the heel level and by knockback, spanking, orgasm and casting:

| Piece | Site |
| --- | --- |
| `KDBaseBalanceDmgLevel = 5` — *"higher = less loss"* | `player/KinkyDungeonStats.ts:6` |
| `KDChangeBalanceSrc(src, type, trig, Amount, NoFloater, allowFall?, forcePauseAmt?)` | `:1401` |
| `KDBalanceDmgMult()` — `PoorBalance ? 1.5 : 1`, times a buff | `:2576-2579` |
| `KDFitnessMult()` — `0.5 / WillMax + 0.5 / StaminaMax`, times a buff | `:2580-2583` |
| the heel's contribution | `(KDBaseBalanceDmgLevel + HeelPowerEffective) / KDBaseBalanceDmgLevel * …` — at `:775, :778, :2489`, `enemy/KinkyDungeonEnemyTeaseAttacks.ts:221`, `magic/KinkyDungeonMagic.ts:1500-1503, :1615-1618` |

So the heel level's real bite is **here**, as a multiplier on how hard she is knocked off balance, and
not in the slow level at all unless `ClassicHeels` is on. Its own cost also flows back into balance:
`KDGetBalanceCost` (`player/KDTraining.ts:88-100`) returns
`HeelPowerEffective * (KDHeelTrainingMult(player, mult) - 0.001)` with `mult *= 0.6` when the arms are
**not** bound.

## Track four: the tags, and the two that are broken

The lower body is governed through tags at least as much as through numbers, and the tag channels are
**not consistent**:

| Tag | Written by | Read by |
| --- | --- | --- |
| `BoundFeet` | `restraint/KinkyDungeonRestraints.ts:4236, :4348, :4486` → `PlayerTags` | `restraint/KinkyDungeonRestraints.ts:1730` (`PlayerTags`, correct) **and** `player/KinkyDungeonStats.ts:2100` (**`KinkyDungeonFlags`**) |
| `Hobble` | `restraint/KinkyDungeonRestraints.ts:4234, :4346, :4484` → `PlayerTags` | **nothing** |
| `ForceKneel` | as an item's `addTag`, so through `PlayerTags` | `KDForcedToGround` |
| `Hogties` | as an item's `shrine` entry, which `:4245-4248` copies into `PlayerTags` | `KDForcedToGround`, and `Data/Poses.ts` |
| `ForceHogtie` | **nothing** — its only carrier is a *model's* `AddPose` (`Data/ModelList_Bubble.ts:108`), which lands in `Poses`, never in the tag map | `KDForcedToGround` (player tags — always `undefined`) and `Data/Poses.ts:403` (via `CheckPoseOrTags`, which *does* see `Poses`) |

> **[read] `KinkyDungeonLegsBlocked()` (`player/KinkyDungeonStats.ts:2098-2101`) is therefore half dead.**
>
> ```js
> function KinkyDungeonLegsBlocked() {
>     if (KDIsHogtied()) return true;
>     return KinkyDungeonFlags.get("BoundFeet");
> }
> ```
>
> The tag is written to `KinkyDungeonPlayerTags` and read from `KinkyDungeonFlags` — **two different
> maps** — and nothing in the tree ever calls `KinkyDungeonSetFlag("BoundFeet", …)`. So the second line
> is always `undefined` and the function reduces to `KDIsHogtied()`. Its readers are
> `player/KinkyDungeonStats.ts:2643` (the `Grounded` perk) and `magic/KinkyDungeonMagic.ts:128` (the
> `Legs` spell component), **both of which therefore ignore `blockfeet` entirely.**

> **[read] `KDForcedToGround()` (`:2573-2575`) reads three player tags and no pose:**
>
> ```js
> return (KinkyDungeonPlayerTags.get("ForceKneel") || KinkyDungeonPlayerTags.get("ForceHogtie") || KinkyDungeonPlayerTags.get("Hogties"));
> ```
>
> The middle clause has no writer (above). Its consumers are numerous and load-bearing: `:2124` (whether
> heel power applies at all), `:2172-2174` (slow level `+1`, and `KneelTurns`), `fight/KinkyDungeonFight.ts:322-326`
> (the helpless melee branch), `player/KDTraining.ts:91` (balance cost `×0.6`),
> `restraint/KinkyDungeonRestraints.ts:1737` (whether the feet count as hands),
> `base/game/KinkyDungeonGame.ts:3480`, `base/game/KinkyDungeonHUD.ts:1210-1216`,
> `enemy/KinkyDungeonEnemyTeaseAttacks.ts:845`. **So a pose is not what decides any of those — a tag is.**

### The pose-side readers

- `KDIsHogtied(C?)` — `:2089-2092` — `KDCurrentModels.get(C)?.Poses.Hogtie`. **This one does read a pose.**
- `KDIsKneeling(C?)` — `:2093-2096` — `Poses.Kneel || Poses.KneelClosed`.
- `KinkyDungeonCanStand(player?)` — `:2113-2117` — `!KDIsKneeling() && !KDIsHogtied() && !KDIsOnKnees(KDPlayer())`.
- `KinkyDungeonLegsBlocked()` — the broken one above.
- `KinkyDungeonCanUseFeet(bootsPrevent = true, group?, item?)` — `restraint/KinkyDungeonRestraints.ts:1725-1733`:

```js
if (item && KDRestraint(item).noFlex) return false;
return KinkyDungeonStatsChoice.get("Flexible") && KinkyDungeonSlowLevel < 1
    && (!bootsPrevent || (!KinkyDungeonPlayerTags.get("HinderFeet") && !KinkyDungeonPlayerTags.get("BoundFeet")
        && !KinkyDungeonPlayerTags.get("Boots") && !KinkyDungeonPlayerTags.get("BootsArmor")));
```

  A perk, a **slow level below 1**, and four tags. `KinkyDungeonCanUseFeetLoose` (`:1735-1739`) is the
  same or `!KDForcedToGround()`.

## The content grid

| Property | Sites | Distribution |
| --- | --- | --- |
| `hobble` | **61** | `0.25 ×2, 0.5 ×3, 1 ×45, 2 ×9, 3 ×2` |
| `blockfeet: true` | **58** | — |
| `immobile` | **26** | — |
| `heelpower` | **23** | 11 values, `0.15`-`10` (see above) |
| `freeze` | **0** | **the field has no writer at all** |
| `corset` | 17 | a fifth track (`KinkyDungeonCalculateCorsetLevel`, `:2140-2151`), the same shape as the heel one |

> **[read] `hobble` is a boolean wearing a number's clothes.** 45 of 61 sites are exactly `1`, and the
> nine `2`s and two `3`s are the only items that mean more. Since operator 2 has a floor of `3` on the
> amount, **`hobble: 1`, `hobble: 2` and `hobble: 3` all contribute at least `3` to the first hobble
> alone** — the field's range is nearly decorative, and the real severity comes from *how many* items
> carry it.
>
> **[read] `freeze` is entirely unused.** The word `freeze` as a restraint property appears in zero
> records; every assignment of `.freeze` in the tree is `Enemy.freeze`, a different field on a different
> type. Yet it is read in five places — `restraint/KinkyDungeonRestraints.ts:785` (`KDIsBinding`),
> `:434-436` (enemy `status.bind`), `:7688` (`KDGetRestriction` `+2`), `player/KinkyDungeonStats.ts:2179`
> (a slow-level floor of `2`), and its declaration at `base/KDTypeDefs.ts:586`. **Four live readers, no
> writer.** It is in the register at [`docs/guide/known-issues.md`](../../../../docs/guide/known-issues.md).

## How to re-derive this

```powershell
$g = 'kd-structured/KinkyDungeon/Game/src'

# The nine operators, whole.
Select-String -Path "$g/player/KinkyDungeonStats.ts" -Pattern 'function KinkyDungeonCalculateSlowLevel' -CaseSensitive -Context 0,50
# The heel level, and the two globals it feeds.
Select-String -Path "$g/player/KinkyDungeonStats.ts" -Pattern 'function KinkyDungeonCalculateHeelLevel' -CaseSensitive -Context 0,16
Select-String -Path "$g/player/KinkyDungeonStats.ts" -Pattern 'HeelPowerEffective = |KDGameData.HeelPower = ' -CaseSensitive

# The broken tag pair, proved by both halves.
Get-ChildItem -Recurse -Filter *.ts "$g" | Select-String -Pattern '"BoundFeet"' -CaseSensitive
Get-ChildItem -Recurse -Filter *.ts "$g" | Select-String -Pattern '"Hobble"' -CaseSensitive
Get-ChildItem -Recurse -Filter *.ts "$g" | Select-String -Pattern 'KinkyDungeonSetFlag\("BoundFeet"' -CaseSensitive   # empty

# That freeze has no writer.
Get-ChildItem -Recurse -Filter *.ts "$g" | Select-String -Pattern '\bfreeze\s*:' -CaseSensitive     # nothing on a restraint
Get-ChildItem -Recurse -Filter *.ts "$g" | Select-String -Pattern '\.freeze\s*=' -CaseSensitive     # only Enemy.freeze

# The grid. Note the shape: Get-ChildItem recurses, Select-String -Path does not.
$f = "$g/restraint/KinkyDungeonRestraintsList.ts"
foreach ($p in 'hobble','heelpower') {
  Select-String -Path $f -Pattern ("^\s*{0}:\s*([0-9.]+)" -f $p) -CaseSensitive -AllMatches |
    ForEach-Object { $_.Matches } | ForEach-Object { $_.Groups[1].Value } |
    Group-Object | Sort-Object { [double]$_.Name } | Format-Table Name,Count
}
```
