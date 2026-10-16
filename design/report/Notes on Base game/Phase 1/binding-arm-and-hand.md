# Binding: arms and hands

> Research notes, not corpus — see [`AGENTS.md`](AGENTS.md). Every site below was read while the
> sentence citing it was written; every count was re-derived, and the commands are at the end.

## The write side is three fields, and two of them are numbers

`base/KDTypeDefs.ts:487-492`, verbatim:

```js
/** Binding arms hurts a lot of things but isn't as punishing as hands */
bindarms?: boolean,
/** Hands count as bound for struggling purposes */
restricthands?: number,
/** Binding hands prevents use of weapons and picks */
bindhands?: number,
```

Three things to notice before reading any consumer:

1. **`bindarms` is a boolean and the other two are numbers.** The two numeric ones are summed into one
   quantity; the boolean is not summed at all.
2. **The comments state an intended hierarchy** — arms hurt, hands hurt more, `restricthands` is for
   struggling specifically. The implementation does not preserve that split; see *The `Other` flag*.
3. **The two numeric fields share a single aggregate.** Whatever distinction the author intended between
   them is not visible at any consumer.

## The tag copy, and the three sites it happens at

A restraint's field becomes a **player tag** in `KinkyDungeonUpdateRestraints`, and that function
contains the copy **three separate times** — roughly `restraint/KinkyDungeonRestraints.ts:4233-4244`,
`:4345-4356` and `:4483-4492`. Each is:

```js
if (KDRestraint(inv).bindarms)     playerTags.set("BoundArms", true);
if (KDRestraint(inv).bindhands)    playerTags.set("BoundHands", true);
if (KDRestraint(inv).hobble)       playerTags.set("Hobble", true);
if (KDRestraint(inv).blockfeet)    playerTags.set("BoundFeet", true);
```

So there are **two copies of the field in circulation at once**: the number, read by the aggregate, and
the boolean tag, read by the fast predicates. They cannot agree in general — a `bindhands: 0.25` sets
`BoundHands`, and a threshold of `0.5` says the hands are not bound while the tag says they are.

**The tag is also a different *kind* of fact:** it is set on truthiness, so it carries no magnitude, and
any change that assumes one copy will miss the other.

## The aggregate

`KDHandBondageTotal(Other = false)` — `restraint/KinkyDungeonRestraints.ts:1713-1723`:

```js
function KDHandBondageTotal(Other: boolean = false): number {
    let total = 0;
    for (let rest of KinkyDungeonAllRestraintDynamic()) {
        let inv = rest.item;
        if (KDRestraint(inv).bindhands) total += KDRestraint(inv).bindhands;
        if (!Other && KDRestraint(inv).restricthands) total += KDRestraint(inv).restricthands;
    }
    if (KinkyDungeonStatsChoice.get("SomaticMinus")) total *= 2;
    else if (KinkyDungeonStatsChoice.get("SomaticPlus") && total < 0.99) total *= 0.75;
    return total;
}
```

Four properties of it, each with a consequence:

- **It is a plain sum, over the dynamic list** — so a restraint linked under another counts, and a
  restraint carrying both fields counts twice.
- **`restricthands` is added only when `Other` is false.**
- **The two perks are applied at the aggregate, not per item**, and `SomaticPlus`'s discount is
  conditional on `total < 0.99` — so it does nothing once the total saturates.
- **Nothing clamps it.** The maximum reachable is well above `1` (`1.5` + `1.33` × 5 ships), and every
  consumer that wants a `0..1` value clamps it itself.

### The `Other` flag is the only thing that distinguishes `restricthands`

`Other` means "is this about someone else", and it is passed `true` by a set of callers and `false` by
another. Measured across the call sites:

| `Other` | Callers | Effect |
| --- | --- | --- |
| `false` | the struggle maths (`:2408`), the spell-component miscast (`magic/KinkyDungeonMagic.ts:97, :108`), the HUD's *partial* state (`base/game/KinkyDungeonHUD.ts:2909`) | `restricthands` **counts** |
| `true` | combat (`fight/KinkyDungeonFight.ts:283`), weapon use (`player/KinkyDungeonStats.ts:1596`), pick and unlock (`restraint/KinkyDungeonRestraints.ts:2013, :2067`), doors (`map/KinkyDungeonTilesList.ts:1854`, `base/game/KinkyDungeonGame.ts:4089`), tethers (`restraint/KDTethers.ts:88`), shrines (`map/KinkyDungeonShrine.ts:813`), enemy helper speed (`enemy/KinkyDungeonEnemies.ts:1951`), the HUD's *full* state (`base/game/KinkyDungeonHUD.ts:2906`) | `restricthands` **does not** |

> **[read] So `restricthands` is not a third axis — it is a bid-set difference.** Its comment says *"for
> struggling purposes"*, and that is close to right: it counts for the wearer's own body-centric actions
> (struggling, casting) and for the UI's partial indicator, and it is excluded from everything
> tool-mediated or visible to a third party. All three shipped carriers also carry `bindarms: true`
> (below), which is consistent with reading it as *the arms' geometry leaking into what the hands can
> do* rather than as a separate property.

## The four predicates that answer "are her hands bound"

| Predicate | Site | What it reads | Threshold |
| --- | --- | --- | --- |
| `KinkyDungeonIsHandsBound(ApplyGhost?, Other?, Threshold = 0.99, group?, NoEvent?, query?)` | `restraint/KinkyDungeonRestraints.ts:1630-1667` | `KDHandBondageTotal(Other) > Threshold` | passed in — see the census |
| `KinkyDungeonIsHandsBoundFast(…)` | `:1674-1706` | the `BoundHands` **tag** only (`:1700`) | none |
| `KDHandBondageTotal(Other)` | `:1713-1723` | the sum | none |
| `KinkyDungeonPotionCollar()` | `item/KinkyDungeonConsumables.ts:472-484` | `return KinkyDungeonCanTalk(!strict)` — **it is a speech predicate wearing a potion's name** | none |

Plus, inside `KinkyDungeonIsHandsBound`, a **fold-in from the arms**: if `Butterfingers` is taken and the
arms are bound, the hands count as bound too (`:1664`). So "hands bound" can be true with a hand-bondage
total of zero.

And the arms side, for symmetry:

| Predicate | Site | Reads |
| --- | --- | --- |
| `KinkyDungeonIsArmsBound(ApplyGhost?, Other?, group?, NoEvent?, query?)` | `:1745-1781` | `KDGroupBlocked("ItemArms")` **or** the `BoundArms` tag |
| `KinkyDungeonIsArmsBoundC(C, …)` | `:1846-1883` | **the `bindarms` field per item**, for a non-player character (`:1876-1881`) — the only place the field is read as a property rather than through a tag |
| `KinkyDungeonIsArmsBoundFast(…)` | `:1786-1817` | **nothing on most paths** — see the defect below |

> **[read] The numeric loop the arms predicate would need is commented out.** `:1773-1778` contains a
> `for (… AllRestraintDynamic()) if (KDRestraint(inv.item).bindarms) { blocked = true; break; }` with its
> body commented away. So `bindarms` is a boolean *and* is never even counted.

> **[read] `KinkyDungeonIsArmsBoundFast` is broken in a specific way.** Compare it with its strict twin:
> the strict function does `if (!blocked && KinkyDungeonPlayerTags.get("BoundArms")) blocked = true;`
> (`:1771-1772`), while the fast one (`:1812-1816`) has
>
> ```js
> let blocked = KDGroupBlocked("ItemArms");
> if (!blocked)
>     if (KinkyDungeonPlayerTags.get("BoundArms"))
> return (!ApplyGhost || !(hasHelp)) && blocked;
> ```
>
> The `return` is **not nested** inside either `if`, so the inner `if`'s only statement *is* the return,
> and every other path falls off the end of the function returning `undefined`. With
> `strictNullChecks` off (see [`base-game-map.md`](base-game-map.md)) that compiles. **Consumers:
> `KinkyDungeonIsHandsBoundFast`'s `Butterfingers` fallback (`:1702-1703`), `KDEnemyCanDom`
> (`enemy/KinkyDungeonEnemies.ts:8850-8852`) and `:8881-8882`.** The practical consequence is that the
> base game's dominance check effectively reads only the `Gagged` tag. The register entry is in
> [`docs/guide/known-issues.md`](../../../../docs/guide/known-issues.md).

## The threshold census

Every caller of `KinkyDungeonIsHandsBound` passes its own threshold, and the spread is the whole story of
why a single "bound / not bound" boolean cannot express this property.

| Threshold | Callers |
| --- | --- |
| **0.01** | `item/KinkyDungeonItem.ts:272` (may she pick things up), `magic/KinkyDungeonMagic.ts:98, :108`, `effect/KinkyDungeonEvents.ts:13282` |
| **0.2** | `dialogue/KinkyDungeonDialogueList.ts:4889, :5027, :5095` |
| **0.45** | `dialogue/KinkyDungeonDialogueList.ts:4926, :5060, :5276`; `map/KinkyDungeonTilesList.ts:1854` (the doorknob roll); `effect/KinkyDungeonEvents.ts:3080` |
| **0.50** | `restraint/KDTethers.ts:88`; `base/game/KinkyDungeonGame.ts:4089` (closing a door) |
| **0.55** | `fight/KinkyDungeonFight.ts:226`; `restraint/KinkyDungeonRestraints.ts:2013` (picking a lock) |
| **0.65** | `player/KinkyDungeonStats.ts:1674` (the bound-power score) |
| **0.70** | `restraint/KinkyDungeonRestraints.ts:1622` (`KinkyDungeonCanUseKey`) |
| **0.80** | `restraint/KinkyDungeonRestraints.ts:68` (`StruggleTypeHandThresh.Remove`) |
| **0.85** | `restraint/KinkyDungeonRestraints.ts:2067` (the unlock attempt) |
| **0.90** | `map/KinkyDungeonShrine.ts:813` |
| **0.99** | the default; `player/KinkyDungeonStats.ts:1675`; `magic/KinkyDungeonMagic.ts:97`; `base/game/KinkyDungeonHUD.ts:2906` |

**Eleven distinct thresholds.** The one table that names them in one place is
`StruggleTypeHandThresh` (`restraint/KinkyDungeonRestraints.ts:63-69`): `Struggle 0.01`, `Unlock 0.7`,
`Pick 0.45`, `Cut 0.7`, `Remove 0.8`.

### The consumers that use the number rather than a threshold

These are the ones a boolean model cannot represent at all, and they are few:

| Site | Formula |
| --- | --- |
| `fight/KinkyDungeonFight.ts:339-345` | `chance *= 0.5 + 0.5 · clamp01(handBondage)`, and the same on `damage` |
| `restraint/KinkyDungeonRestraints.ts:2640-2645` | `escapeChance - 0.07 - 0.1 · handBondage` |
| `magic/KinkyDungeonMagic.ts:106-115` | the `Arms` component's `partialMiscastChance = clamp01(handsTotal)` |
| `base/game/KinkyDungeonHUD.ts:2906-2913` | **three display states** — bound, partial, free |
| `player/KinkyDungeonStats.ts:1674-1675` | `+0.075` crossing `0.65`, `+0.075` more crossing `0.99` |

> **[read] The HUD is the strongest evidence that this property is continuous.** Its *full* state asks
> with `Other = true` (`:2906`) and its *partial* state asks `KDHandBondageTotal()` with the default
> `Other = false` (`:2909`) — so an item carrying only `restricthands` renders as "hands partially
> bound" with no `bindhands` at all. The base game draws the partial band even though no boolean
> predicate admits it exists.

## The two classification readers

Neither is a gameplay reader, and both are easy to mistake for one.

`KDIsBinding(item)` — `restraint/KinkyDungeonRestraints.ts:776-793` — decides whether an item counts as
binding for shrine and exclusion purposes:

```js
return !(!(!r.nonbinding && (
    r.bindarms || r.bindhands
    || r.blindfold > 1 || r.gag > 0.25 || r.blockfeet || r.freeze
    || r.immobile || r.hobble > 1 || r.enclose || r.binding
)));
```

Note the thresholds: `blindfold > 1` and `gag > 0.25` and `hobble > 1` are **classification cut-offs on
the same numbers the mechanics use**, which is why a `gag: 0.2` item is not binding while a `0.3` one is.

`KDGetRestriction()` — `:7677-7702` — a score, where the same three fields buy different amounts:

```js
if (restraint.blockfeet || restraint.bindarms || restraint.hobble || restraint.freeze) data.restriction += 2;
else if (restraint.bindhands || restraint.blindfold || restraint.gag || restraint.restricthands) data.restriction += 1;
```

So an arms-bound item scores **2** and a hands-bound item **1**, and an item with both scores 2 — the
`else` swallows the second contribution.

## The content grid

**Scope matters here, and this is where a count goes wrong.** `KinkyDungeonRestraintsList.ts` is 18,479
lines in three parts:

| Lines | What |
| --- | --- |
| 1-52 | the link and render tag arrays (`KDArmbinderLink`, `KDBindable`, …) |
| **61-16556** | **`const KinkyDungeonRestraints: restraint[]` — the literal restraint array** |
| 16558-17360 | **21 generator calls** — `KDAddRopeVariants` ×4, `KDAddCuffVariants` ×10, `KDAddHardSlimeVariants` ×7 — which mint further restraints from a base template plus an override object |
| 18114-18479 | `KDControlHarnessCategories`, `KDSFXGroups`, `KDNPCRestraintBondageTypesByTag` |

> **[read] The property counts are identical whether the file is scanned whole or only inside the array
> (61-16556)** — verified field by field. That is not true of the *group* attribution, where nested
> `Group:` fields inside `factionFilters` blocks and the generators' override objects produce values like
> `"Leather"` and `"Rubber"`. Attribute at the record-field indentation (`^\t\t`) and reset on each
> `name:`, or the buckets are wrong.

Counted that way, at record-field indentation, over the literal array:

| Property | Sites | Distribution |
| --- | --- | --- |
| `bindarms: true` | **100** | `ItemArms` 91, `ItemDevices` 8, `ItemFeet` 1 |
| `bindarms: false` | **5** | `ItemArms` 5 |
| `bindhands` | **66** | `ItemArms` 46, `ItemHands` 16, `ItemDevices` 3, **one record with no `Group` field at all** (`EnchantedMittens`) |
| `restricthands` | **3** | `ItemArms` 3 |

`bindhands` value distribution: `0.25 ×1, 0.3 ×1, 0.35 ×1, 0.4 ×1, 0.5 ×3, 0.65 ×1, 0.7 ×1, 0.9 ×3,
1.0 ×47, 1.33 ×5, 1.4 ×1, 1.5 ×1`.

### What the grid says

- **47 of 66 `bindhands` values are exactly `1.0`**, and seven more are above it (`1.33`-`1.5`). Since
  every threshold tops out at `0.99` and every continuous consumer clamps to `1`, **anything at or above
  `1.0` is arithmetically identical** — so `1.33`, `1.4` and `1.5` are the author writing *"definitely,
  definitely bound"*, with no mechanical consequence whatever. **`bindhands` is a boolean wearing a
  number's clothes, with a genuine partial band of eleven items underneath it.**
- **The out-of-slot carriers are the interesting content.** `bindarms` rides eight `ItemDevices` items
  (`BallSuit`, `LatexSphere`, `DisplayTrap`, `BedTrap`, `ShadowBallSuit`, `Crystal`, `Resin`,
  `IceCrystal`) and one `ItemFeet` item (`RopeSnakeHogtieLink`) — a full-body suit and a hogtie link.
  **`bindhands` rides three `ItemDevices` items as well.** So the property is an *effect*, not a slot.
- **The five `bindarms: false` items are all `ItemArms` cuffs** — `HighSecCuffsFull`, `MagneticArmCuffs`,
  `BanditArmCuffs`, `TemplateArmCuffs`, `CyberArmCuffs` — records that exist in the arm slot and
  deliberately bind nothing.
- **Families vary the two axes independently.** `ShadowHandArms` is arms-only while
  `ShadowHandArmsHeavy` adds `bindhands: 0.5`; `SlimeArms` is `0.25` against `SlimeHands` at `0.5`;
  `ComfyStraitjacket` stops at `0.9` on purpose. So the 2×2 is the *content's* own model, not an
  invention.
- **The three `restricthands` carriers all also carry `bindarms: true`.** No item uses `restricthands`
  on its own.

> **[inferred] A correction worth keeping, because it is the exact error this folder exists to prevent.**
> An earlier pass reported that `bindhands` rides an `ItemNeck` item (`CyberMittens`). **That is wrong.**
> It came from a whole-file scan whose group tracker inherited a nested `Group:` value, and `CyberMittens`
> is a mittens record in the hand/arm families. Nothing in the verified grid supports a neck carrier. The
> lesson is the one in [`AGENTS.md`](AGENTS.md): scope the search, anchor the pattern, and reset the
> tracker per record.

## How to re-derive this

```powershell
$g = 'kd-structured/KinkyDungeon/Game/src'
$f = "$g/restraint/KinkyDungeonRestraintsList.ts"

# The three fields and their comments.
Select-String -Path "$g/base/KDTypeDefs.ts" -Pattern 'bindarms|bindhands|restricthands' -CaseSensitive -Context 1,0

# The aggregate and the tag copy (three sites).
Select-String -Path "$g/restraint/KinkyDungeonRestraints.ts" -Pattern 'function KDHandBondageTotal' -CaseSensitive
Select-String -Path "$g/restraint/KinkyDungeonRestraints.ts" -Pattern 'playerTags.set\("(BoundArms|BoundHands)"' -CaseSensitive

# The threshold census: every call, with the argument that is the threshold.
# Note the shape: Get-ChildItem recurses, because Select-String -Path does not accept -Recurse.
Get-ChildItem -Recurse -Filter *.ts "$g" | Select-String -Pattern 'KinkyDungeonIsHandsBound\(' -CaseSensitive

# Counts, scoped to the literal array and to record-field indentation.
$lines = Get-Content $f
$name=''; $group=''; $rows=@()
for ($i = 59; $i -lt 16556; $i++) {
  $l = $lines[$i]
  if ($l -match '^\t\tname:\s*"([^"]+)"') { $name=$Matches[1]; $group='(none)' }
  if ($l -match '^\t\tGroup:\s*"([^"]+)"') { $group=$Matches[1] }
  if ($l -match '^\t\tbindarms:\s*(true|false)') { $rows += "arms=$($Matches[1])`t$group" }
  if ($l -match '^\t\tbindhands:') { $rows += "hands`t$group" }
}
$rows | Group-Object | Format-Table Count,Name

# The three parts of the file, and the generators.
Select-String -Path $f -Pattern '^const KinkyDungeonRestraints|^\];|^KDAdd\w+\(' -CaseSensitive
Select-String -Path "$g/restraint/KinkyDungeonRestraints.ts" -Pattern 'function KDAddRopeVariants' -CaseSensitive
```
