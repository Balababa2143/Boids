# The pose system

> Research notes, not corpus — see [`AGENTS.md`](AGENTS.md). Every site below was read while the
> sentence citing it was written.

Two files own it: the constants and the **availability** answer live in `Data/Poses.ts` (783 lines), and
the **commit** of a pose into the render state lives in `player/KinkyDungeonDress.ts` (1,445 lines).

**Two layers, and they answer different questions:**

| Layer | Functions | Answers |
| --- | --- | --- |
| availability | `KDGetAvailablePosesArms` (`Data/Poses.ts:477-563`), `KDGetAvailablePosesLegs` (`:382-474`) | *which poses may she take* — a **list** |
| commit | `CurrentExpression.ArmPose` / `LegPose` → `KDGeneratePoseArray` → `KDUpdateTempPoses` | *which one is she in* — a **record** |

## The four attachment points

Where a change can be made, and what each one can and cannot do.

| Attach point | What it is | To forbid | To grant |
| --- | --- | --- | --- |
| the **availability list** — `KDGetAvailablePosesArms` / `Legs` | a list of allowed poses | remove from the list, and `Dress.ts:713-717` **evicts her** from a pose no longer in it | add to the list |
| `CurrentExpression.ArmPose` / `LegPose` — `Dress.ts:713-724` | the *chosen* pose | — | **forces** a pose outright |
| `KDGetExtraPoses` — `Dress.ts:1207-1240` | poses to **add** to the final record | — | adds |
| `KDGetRemovePoses` — `Dress.ts:1177-1202` | poses to **delete** from the final record | deletes | — |

> **[read] The availability list is the only point that does both, which is why it is the right one.**
> Removing from it is not a display change: `Dress.ts:713-717` re-picks when the current pose has left
> the list, so **forbidding by elimination is how a pose is enforced**, with no force-write anywhere.
> Forcing a single pose outright is *also* achievable by removing every other member.

**Callers of the availability functions** — all three of them:
`player/KinkyDungeonDress.ts:657-658`, `player/wardrobe/KDWardrobe.ts:1023-1024`, and
`fight/KinkyDungeonFight.ts:285`.

## The constants

```js
let ARMPOSES = ["Free", "Boxtie", "Wristtie", "Yoked", "Front", "Up", "Crossed"];   // :1
let LEGPOSES = ["Spread", "Closed", "Kneel", "KneelClosed", "Hogtie"];              // :16
let KNEELPOSES = ["Kneel", "KneelClosed"];                                          // :23
let HOGTIEPOSES = ["Hogtie"];                                                       // :24
let STANDPOSES = ["Spread", "Closed"];                                              // :25
let CLOSEDPOSES = ["KneelClosed", "Closed"];                                        // :26
let SPREADPOSES = ["Spread", "Kneel"];                                              // :27
let KDLEGBINDTAGS = ["FeetLinked", "Legbinders", "LegBind", "Hobbleskirts"];        // :781-783
```

Seven arm poses, five leg poses, and a set of overlapping subsets used as *groups* by the removal
cascades. **`ARMPOSES` and `LEGPOSES` are disjoint ladders** — no pose belongs to both — which is why a
model that needs two pose dimensions needs two ladders rather than one vocabulary with a filter.

`PoseProperties[...].global_default` (`:43` onward) is a **substitution table**: `Front` falls back to
`Boxtie` (`:305-307`), `Crossed` to `Boxtie` (`:308-310`). `ModelGetMaxPose(Poses, CheckVar, FilterVar?)`
(`:316-328`) is how a *rendering* priority is chosen among the poses present.

## The arm cascade is a singleton assignment

`KDGetAvailablePosesArms` (`:477-563`) does not filter a set first — it **assigns one**:

```js
if (CheckPoseOrTags(C, "Yokes", tags))            poses = {Yoked: true};
else if (CheckPoseOrTags(C, "Armbinders", tags))  poses = {Wristtie: true};
else if (CheckPoseOrTags(C, "Boxbinders", tags))  poses = {Boxtie: true};
else if (CheckPoseOrTags(C, "Straitjackets", tags) || CheckPoseOrTags(C, "Crossties", tags)) poses = {Crossed: true};
else if (CheckPoseOrTags(C, "Boxties", tags))     poses = {Boxtie: true};
else if (CheckPoseOrTags(C, "Wristties", tags))   poses = {Wristtie: true};
else if (CheckPoseOrTags(C, "Petsuits", tags) || CheckPoseOrTags(C, "Fiddles", tags)) poses = {Front: true};
if (KinkyDungeonIsArmsBoundC(C, false, false)) {
    delete poses.Free;
    … conditional deletes of Front, Crossed, Yoked, Up, Boxtie, Wristtie, guarded by more tags …
}
if (CheckPoseOrTags(C, "DiscourageYoked", tags) && poses.Yoked && Object.keys(poses).length > 1) delete poses.Yoked;
```

**This has a consequence that decides an implementation order:** once a shrine word matches, the answer
is a **one-element set**, and **a one-element set cannot be widened by removing from it.** Anything that
means to *grant* a pose must therefore replace this answer rather than filter it, or the grant is
unreachable for exactly the items that need it.

Note also `:483` in the source is a comment the author left: `// TODO make this extensible!!!!`.

## The leg cascade is a set of deletions with a sentinel

`KDGetAvailablePosesLegs` (`:382-474`) starts from **all** of `LEGPOSES` and deletes:

| Condition | Deletes |
| --- | --- |
| any of `KDLEGBINDTAGS` | `Spread`, `Kneel` (and sets `closed`) |
| `ForceKneel` | `Spread`, `Closed` |
| `FeetSpreader` | `Closed` |
| `Hogties` **or** `ForceHogtie` | every stand and kneel pose |
| `BlockHogtie` / `BlockKneel` / `BlockClosed` / `BlockKneelClosed` | that one pose |
| `DiscourageHogtie` / `DiscourageKneel` / `DiscourageStand` | that group — but **only if more than the subset remains**, which is a guard against emptying the set |

…and then the **sentinel** at `:459-467`:

```js
if (Object.keys(poses).length == 0) {
    if (CheckPoseOrTags(C, "DefaultStand", tags, tagsOnly))      poses = {Closed: true};
    else if (CheckPoseOrTags(C, "DefaultKneel", tags, tagsOnly)) poses = {Kneel: true};
    else                                                          poses = {Hogtie: true};
}
```

> **[read] The sentinel is not decoration, because the consumer indexes the list.**
> `player/KinkyDungeonDress.ts:713-717`:
>
> ```js
> if (!AllowedArmPoses.includes(CurrentExpression.ArmPose))
>     CurrentExpression.ArmPose = (AllowedArmPoses.includes(DefaultBound) && KinkyDungeonIsArmsBound(false, false))
>         ? DefaultBound : AllowedArmPoses[0];
> if (!AllowedLegPoses.includes(CurrentExpression.LegPose))
>     CurrentExpression.LegPose = (AllowedLegPoses.includes(DefaultHobbled)) ? DefaultHobbled : AllowedLegPoses[0];
> ```
>
> **`AllowedArmPoses[0]` on an empty list is `undefined`, and `undefined` is then handed to
> `KDGeneratePoseArray` (`:782-793`).** The sentinel is what stops that, and its three fallbacks are the
> poses every rig can draw — which is the property to preserve if a replacement answer is ever computed.
> Note too that the whole availability layer is conditional: `let AllowedArmPoses = StandalonePatched ?
> KDGetAvailablePosesArms(Character, customPlayerTags) : [];` (`:657`).

## The feedback loop, and the one caller that opts out

`CheckPoseOrTags(C, tag, tags?, tagsOnly?)` — `Data/Poses.ts:364-380`:

```js
if (C == KinkyDungeonPlayer || tags) {
    if (tags ? tags.get(tag) : KinkyDungeonPlayerTags.get(tag)) return true;
} else if (NPCTags.get(C)) { … }
if (!tagsOnly) {
    if (KDCurrentModels.get(C)?.Poses[tag]) return true;
    if (KDCurrentModels.get(C)?.TempPoses && KDCurrentModels.get(C)?.TempPoses[tag]) return true;
}
return false;
```

So the availability functions read **their own output**: a pose present in `Poses` satisfies the tag check
on the next call — and `Poses` doubles as a tag source for the whole cascade. **`tagsOnly` is the escape
hatch**, and the game itself uses it in the one place where the feedback would be wrong:
`fight/KinkyDungeonFight.ts:285` passes `tagsOnly = true`.

> **[read] Two of the three callers pass no tags at all and therefore read the player tag map; the third
> passes `customPlayerTags`.** (`Dress.ts:657-658` passes a tag map, `KDWardrobe.ts:1023-1024` does not,
> `Fight.ts:285` does not but sets `tagsOnly`.) So the same function answers from three different
> sources depending on who asks.

## The commit layer, and its order

`RefreshTempPoses(C, Restraints, Buffs)` — `Data/Poses.ts:565-617` — is one entry point:

1. `KDRefreshPoseOptions(C)`
2. delete every `TempPoses` key from `Poses`, then reset `TempPoses = {}`
3. buffs with a `.pose` field, when `Buffs` is true → `TempPoses`
4. restraints' `addPose`, and `addPoseIfTopLevel` **only when the item is top-level in its group**
   (`KinkyDungeonGetRestraintItem(KDRestraint(inv).Group) == inv`) → `TempPoses`
5. `KDRefreshPoseOptions(C)` again

`KDUpdateTempPoses(Character)` — `player/KinkyDungeonDress.ts:1274-1297` — is the other:

```js
KDRefreshPoseOptions(Character);
for (let pose of Object.keys(KDCurrentModels.get(Character).TempPoses)) {
    if (KDCurrentModels.get(Character).Poses[pose]) delete KDCurrentModels.get(Character).TempPoses[pose];
    else KDCurrentModels.get(Character).Poses[pose] = true;      // ADD (temp)
}
let extraPose = KDGetExtraPoses(Character);
if (extraPose) for (let pose of extraPose) KDCurrentModels.get(Character).Poses[pose] = true;   // ADD
let removePose = KDGetRemovePoses(Character, KDCurrentModels.get(Character).Poses);
if (removePose) for (let pose of removePose) delete KDCurrentModels.get(Character).Poses[pose]; // REMOVE
```

> **[read] The game's own order is add-then-remove, and it matters.** `KDGetRemovePoses` takes the
> *current* `Poses` record as an argument, and a removal runs after the additions — so a pose that both
> an item adds and a tag removes ends up **removed**. A design that wants a grant to win must impose its
> own order rather than reuse this one.

`KDGetExtraPoses(C)` (`:1207-1240`) adds three poses and is driven by names, not fields: `HandsBound`
(asked as `KinkyDungeonIsHandsBound()` — a **speech-and-hands predicate, not a pose**), `FeetLinked`
(the `LinkFeet` tag) and `Pulled` (tethered and leashed).

`KDGetRemovePoses(C, PoseList)` (`:1177-1202`) removes two: `FeetLinked` under `DontLinkFeet`, `LegBind`
under `DontBindLegs`.

## `KDRefreshPoseOptions`, and the third route in

`Data/Poses.ts:619-695` writes poses for **toggles, UI state and worn items**:

```js
if (Character == KinkyDungeonPlayer) {
    let restraints = KinkyDungeonAllRestraintDynamic();
    for (let inv of restraints) {
        KDCurrentModels.get(Character).Poses[inv.item.name + "Worn"] = true;
        if (KDRestraint(inv.item)?.shrine?.includes("BallGags"))  KDCurrentModels.get(Character).Poses["BallMouth"] = true;
        else if (KDRestraint(inv.item)?.shrine?.includes("PlugGags")) KDCurrentModels.get(Character).Poses["PlugMouth"] = true;
    }
}
```

Two things to take from it:

- **`<name>Worn` is a per-item rendering pose**, not a body configuration. Every worn restraint injects
  one, so `Poses` is both the body's arrangement and the item-visibility set at once.
- **`shrine` is a route into the pose system here too** — a *third* one, after the availability cascade
  and the player-tag copy. `BallGags` and `PlugGags` are shrine words that a restraint carries purely to
  select a mouth pose.

The rest of the function is toggles: `ChastityOption`, `OptionCrotchRope`, `Menu`, `NoPrisonerMarkings`,
`HideNipples`, `DynamicArmor`, `NoPrisonerMarkings`, and `KDArmorPoses` in the wardrobe state.

## The shrine-to-player-tag copy, and what it moves

Every shrine word on a worn restraint is bulk-copied into the player tag map — at **three** sites in
`restraint/KinkyDungeonRestraints.ts`: `:4245-4248`, `:4357-4361`, `:4493-4497`:

```js
if (KDRestraint(inv).shrine) {
    for (let tag of KDRestraint(inv).shrine) {
        if (!playerTags.get(tag)) playerTags.set(tag, true);
    }
}
```

Which produces a chain that is easy to miss: a restraint's `shrine` entry becomes a **player tag**,
`CheckPoseOrTags` reads player tags, so **a shrine word is an indirect route into the pose cascade** —
after `addPose` (a second route) and the `BallGags`/`PlugGags` branch above (a third). And some of those
tags are read outside the pose system entirely: `player/KinkyDungeonStats.ts:2573-2575`'s
`KDForcedToGround()` reads `ForceKneel` and `Hogties` **as player tags**, so one word in a `shrine` list
moves the slow level, the heel level and the melee penalty. See [`lower-body.md`](lower-body.md).

## The leak into combat

`fight/KinkyDungeonFight.ts:285`:

```js
legBondage: !KDGetAvailablePosesLegs(KinkyDungeonPlayer, undefined, true).includes("Spread"),
```

and `:322-326` uses `data.legBondage` to enter the helpless melee branch (chance `× 0.5`, damage `÷ 2`,
and `× 0.01` when also hogtied). **So removing `Spread` from the leg availability answer reaches melee
damage through a road that is not any combat dimension's own value.** It is real, permitted, and
*unspecified* — nothing asserts it and no model relies on it.

## A declarative field with no reader

`forbidPose?: string[]` — `base/KDTypeDefs.ts:537` — sits in the same block as `addPose` (`:530`),
`addPoseIfTopLevel` (`:536`) and `removePose` (`:538`), and **appears nowhere else in the game** except
the generated declaration file. A restraint that sets it changes nothing. The register entry is in
[`docs/guide/known-issues.md`](../../../../docs/guide/known-issues.md).

## How to re-derive this

```powershell
$g = 'kd-structured/KinkyDungeon'
$p = "$g/Data/Poses.ts"

# The constants, the cascades, the sentinel, and the feedback read.
Select-String -Path $p -Pattern '^(let (ARMPOSES|LEGPOSES|KNEELPOSES|HOGTIEPOSES|STANDPOSES|CLOSEDPOSES|SPREADPOSES)|let KDLEGBINDTAGS)' -CaseSensitive
Select-String -Path $p -Pattern 'function (KDGetAvailablePosesArms|KDGetAvailablePosesLegs|CheckPoseOrTags|KDRefreshPoseOptions|RefreshTempPoses)' -CaseSensitive
Select-String -Path $p -Pattern 'Object.keys\(poses\).length == 0' -CaseSensitive -Context 0,6

# The commit layer and the [0] index.
Select-String -Path "$g/Game/src/player/KinkyDungeonDress.ts" -Pattern 'function KDUpdateTempPoses|AllowedArmPoses\[0\]|AllowedLegPoses\[0\]|KDGetExtraPoses|KDGetRemovePoses' -CaseSensitive

# All three callers of the availability functions.
Get-ChildItem -Recurse -Filter *.ts "$g/Game/src" | Select-String -Pattern 'KDGetAvailablePoses' -CaseSensitive

# The shrine copy, all three sites, and the combat leak.
Select-String -Path "$g/Game/src/restraint/KinkyDungeonRestraints.ts" -Pattern 'KDRestraint\(inv\).shrine\) \{' -CaseSensitive
Select-String -Path "$g/Game/src/fight/KinkyDungeonFight.ts" -Pattern 'legBondage' -CaseSensitive

# That forbidPose has no consumer.
Get-ChildItem -Recurse -Filter *.ts $g | Select-String -Pattern 'forbidPose' -CaseSensitive
```
