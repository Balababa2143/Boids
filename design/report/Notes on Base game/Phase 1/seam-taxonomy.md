# The kinds of interpolation point

> Research notes, not corpus — see [`AGENTS.md`](AGENTS.md). Every site below was read while the
> sentence citing it was written.

## First: the word

The design corpus calls a point the game lets a handler intervene at a **seam**, and it is the base
game's idiom rather than a coinage: a handler is registered against a trigger name, the game dispatches
that name with a payload, and the handler **mutates the payload in place** and the game reads it back.
Nothing is returned. That one contract is what the whole extension model rests on.

But "seam" covers five structurally different things, and **the family decides what a handler can do —
not the trigger's name.** Confusing two of them is how a change comes to look applied and do nothing.

## The five families

| Family | How a handler is reached | What it can do | Examples |
| --- | --- | --- | --- |
| **payload event** | `KinkyDungeonSendEvent(name, data)`; the handler mutates `data` | anything the payload exposes — values, aggregates, flags | every `calc*` below |
| **`forceResult` predicate** | the game asks a question, a handler may **override the answer** | flip a boolean, with a bidding convention | `getArmsBound`, `getHandsBound`, `getWeapon` |
| **action chokepoint** | one record of named actions, reached through a queue | veto or replace an entire player action | `KDInputTypes`, 86 entries |
| **declarative field** | nothing runs at all — the game reads a field or tag off the item | change a value the game already consults | `gag`, `blindfold`, `bindhands`, `addPose` |
| **global wrap** | a mod replaces a top-level function | take over a mechanism that has **no event** | the pose availability functions |

### The `forceResult` predicate

This is the one family with a *convention* rather than a payload. The shape, from
`KinkyDungeonIsArmsBound` (`restraint/KinkyDungeonRestraints.ts:1745-1781`):

```js
let data = { hasHelp, C, ApplyGhost, Other, group, forceResult: undefined, forceResultPower: 0, fast: true, query };
KinkyDungeonSendEvent("getArmsBound", data);
if (data.forceResult != undefined) return data.forceResult;   // short-circuit, and note `!=`
… compute the ordinary answer …
return (!ApplyGhost || !(hasHelp)) && blocked;
```

Three things follow, and all three matter:

- A handler **bids**: it raises `forceResultPower` only while it is winning, so the strongest wins.
  `effect/KinkyDungeonEvents.ts:263-282` is the reference implementation (`WaistToWrist`, which is a
  *geometry* test — `KDGetGroupHeight`/`KDGetGroupDepth` against `e.power`).
- `forceResult = false` is a legal value, and the check is `!= undefined` rather than truthiness, so
  **setting `false` grants** where `true` denies. No base-game caller uses the granting direction; a mod
  that wants to make a bound character able to act is the first.
- The predicate may still be overridden afterwards by `hasHelp` (`KinkyDungeonHasHelp`,
  `KinkyDungeonHasGhostHelp`, `KinkyDungeonHasAllyHelp`) — so the answer a caller sees is **not**
  necessarily what the handler forced.

`getWeapon` (`player/KinkyDungeonStats.ts:1584-1600`) runs the same shape but passes **flags** rather
than a result: `treatAsHandsBound`, `treatAsArmsBound`, `HandsFree`, `clumsy`
(`effect/KinkyDungeonEvents.ts:341-352`).

### The action chokepoint

**One record holds every action the player can take**, and the pipeline has three stages rather than one:

```js
let KDInputTypes: Record<string, (data: any) => string> = { "move": (data) => {…}, "doattack": …, … };  // :10-1667

function KDSendInput(type, data, _frame?, noUpdate?, process = true) {        // :1685
    KinkyDungeonInputQueue.push({type, data});
    if (process) return KDProcessInputs(true);
    else return "";
}

function KDProcessInputs(ReturnResult?) {                                    // :1704
    for (let i = 0; i < 3; i++) { … let res = KDProcessInput(input.type, input.data); if (ReturnResult) return res; … }
}

function KDProcessInput(type, data) {                                        // :1671
    if (KDInputTypes[type]) res = KDInputTypes[type](data);
    if (data.GameData) Object.assign(KDGameData, data.GameData);             // :1679-1681
    return res;
}
```

So:

- **86 named actions** live in one object literal, each `(data: any) => string`. The names are the
  vocabulary a gate would speak: `move`, `doattack`, `tryCastSpell`, `struggle`, `struggleCurse`,
  `curseUnlock`, `unlock`, `pick`, `lock`, `interact`, `pickup`, `consumable`, `foodInteract`,
  `closeDoor`, `dress`, `drop`, `equip`, `quickRestraint`, `switchWeapon`, `offhandswitch`, `talk`,
  `noise`, `tryPlay`, `tryOrgasm`, `shrineBuy` … `shrineBottle`, `safeword`.
- **It is a queue, not a call.** `KDSendInput` enqueues and, by default, drains immediately and returns
  the first result; with `process: false` the action stays queued and the drain takes **at most three
  per call**. A veto applied at the enqueue stage and one applied at the drain stage are therefore not
  the same thing.
- **An unknown action type is a silent no-op** — `KDProcessInput` returns `""` and nothing warns.
- `data.GameData`, if present, is **assigned onto `KDGameData` after** the action runs, which is a
  data-flow channel worth knowing before patching one of these.

### The declarative field

No handler runs; the game reads the field off the restraint template and acts. This is the cheapest
family and the one with the least reach — a field can only say what the game already knows how to
consult. `addPose`, `addPoseIfTopLevel`, `removePose` and `noRenderPose`
(`base/KDTypeDefs.ts:530-538`) are the pose family's instance, and `forbidPose` sits in the same block
with **no reader at all** — see [`docs/guide/known-issues.md`](../../../../docs/guide/known-issues.md).

### The global wrap

Some mechanisms have no event to hang on. The pose availability functions are the case in point: they
are **pure functions** (`Data/Poses.ts:382, :477`) with no dispatch anywhere, so the only way in is to
replace the global. That is possible because the game is built with a single `outFile` and every
top-level function is therefore a property of one global object — see
[`base-game-map.md`](base-game-map.md). This repository already wraps two game globals at module
evaluation, and [`docs/guide/invariants.md`](../../../../docs/guide/invariants.md) records the ordering
hazard: two wrappers around the same global are ordered by module evaluation, and the last one
installed is outermost.

## The four algebras a payload event can have

**This is the finding that generalises.** Given any `calc*` trigger, read the function that dispatches
it — not the handler, not the name — and classify what the handler is expected to do to the payload.

| Kind | The payload holds | A handler does | Confirmed example |
| --- | --- | --- | --- |
| **addition** | accumulators, and often the weights themselves | adds to them | `calcDeaf` (`player/KinkyDungeonStats.ts:413-435`): `maxDeaf`, `totalDeaf`, and the `deafMaxWeight` / `deafTotalWeight` the final combination uses |
| **absolute value** | a number already computed | **replaces** it | `calcBlind` (`:2063-2075`): `data.blindness = blindness ? blindness * 1.5 : 0`, and the one handler takes a `Math.max` of it (`effect/KinkyDungeonEvents.ts:1005-1011`) |
| **multiplier** | a coefficient | multiplies it | `calcHearing` (`:440-454`): `data.hearingMult *= e.mult` (`effect/KinkyDungeonEvents.ts:7264-7266`) |
| **replacement** | *nothing* — there is no event | is not possible; the function itself must be wrapped | `KDGetAvailablePosesArms` / `KDGetAvailablePosesLegs` (`Data/Poses.ts:477, 382`) |

### How to tell which one you have

1. **Find the dispatcher**: grep the trigger name. It is a `KinkyDungeonSendEvent("trigger", data)` in
   the file that owns the quantity.
2. **Read up** from the dispatch to the payload's declaration. The initialisers are the tell:
   - zeros plus a name ending in `Max`/`Total`/`Sum` → **addition**, and check whether the *weights* are
     in the payload, because that means a handler can re weight the whole aggregate;
   - a filled-in number → **absolute value**, so a handler that *adds* is writing a bug;
   - `1` or `1.0` on a field called `…Mult` → **multiplier**;
   - **no dispatcher at all** → replacement, and the function is your only entry.
3. **Read down** from the dispatch to where the payload is turned into the answer. That line is the
   algebra, and it is the thing being changed.

> **[read] The reason this matters is that the three event kinds cannot be treated alike.** A handler
> written for an absolute-value seam that adds instead will produce a value that looks plausible and
> drifts with how many items are worn. A handler written for an addition seam that assigns will
> *discard every other provider*, including the base game's own. And a replacement mechanism cannot be
> reached by a handler at all, however the trigger is named.

## The seams that have been verified

Kind per the taxonomy above, with the site that dispatches it. "Handlers" is filled in only where the
handler tables were actually enumerated.

| Trigger | Kind | Dispatched at | Handler tables |
| --- | --- | --- | --- |
| `calcBlind` | absolute value | `player/KinkyDungeonStats.ts:2073` | one, `effect/KinkyDungeonEvents.ts:1004` (`DollmakerMask`) |
| `calcDeaf` | addition | `player/KinkyDungeonStats.ts:430` | **none — the name appears exactly once in the game, at this dispatch** |
| `calcHearing` | multiplier | `player/KinkyDungeonStats.ts:450` | **two**, `effect/KinkyDungeonEvents.ts:7263` (`Multiply`) and `:13750` (`KeenHearing`) |
| `calcEntityHearing` | payload | `player/KinkyDungeonStats.ts:403` | not enumerated |
| `calcEnemyHearing` | payload | `player/KinkyDungeonStats.ts:463` | not enumerated |
| `calcMiscast` | payload | `player/KinkyDungeonStats.ts:2058` | not enumerated |
| `calcGagRed` | payload | `player/KDTraining.ts:399` | not enumerated |
| `calcBondageStatus` | payload | `restraint/KinkyDungeonRestraints.ts:456` | not enumerated |
| `calcBondageConditions` | payload | `restraint/KinkyDungeonRestraints.ts:392` | not enumerated |
| `calcEscapePenalty` | payload | `restraint/KinkyDungeonRestraints.ts:2418` | not enumerated |
| `restriction` | payload | `restraint/KinkyDungeonRestraints.ts:7699` | not enumerated |
| `getArmsBound` | `forceResult` | `restraint/KinkyDungeonRestraints.ts:1760` | one, `effect/KinkyDungeonEvents.ts:263` (`WaistToWrist`) |
| `getHandsBound` | `forceResult` | `restraint/KinkyDungeonRestraints.ts:1651` | one, `effect/KinkyDungeonEvents.ts:284` (`WaistToWrist`, `Yoke`, `Fiddle`) |
| `getWeapon` | flags | `player/KinkyDungeonStats.ts:1593` | one, `effect/KinkyDungeonEvents.ts:341` (`TreatAsBound`, `NoTwoHanded`) |
| `updatePlayerTags` | mutable tag map | `restraint/KinkyDungeonRestraints.ts:4304` | not enumerated |
| `updateCustomTags` | mutable tag map | `restraint/KinkyDungeonRestraints.ts:4369` | not enumerated |
| `afterNoise` | **fires too late** | `magic/KinkyDungeonMagic.ts:809` | one, `effect/KinkyDungeonEvents.ts:13757` |

Note `updatePlayerTags` and `updateCustomTags`: **two dispatches, two payload shapes** (`{tags, player}`
and `{tags, npc: id}`), both handing out the mutable tag map.

## Three hazards this table exposes

1. **One trigger, several handler tables.** `calcHearing` has two, in different event maps, and they are
   driven by different things: one takes a **spell effect** and multiplies by `e.mult`
   (`magic/KinkyDungeonMagicList.ts:520` uses `1.15`, `:1847` uses `3.0`), the other reads a **stat
   choice** and ignores its event argument entirely (`KeenHearing` → `× 2`). So the same coefficient
   carries both a per-effect and a character-level multiplier, and "who else writes this" has more than
   one answer.
2. **A seam with no handler is a seam nobody has used.** `calcDeaf` is dispatched once and handled
   nowhere: the aggregate runs, the payload is thrown away. A mod adding a handler there is the first
   consumer — which is a clean opportunity, and also means there is no base-game precedent for the
   expected algebra beyond the payload's own initialisers.
3. **A seam can fire after the decision.** `KinkyDungeonMakeNoise` (`magic/KinkyDungeonMagic.ts:768`)
   dispatches `afterNoise` at `:809`, once the noise exists. **[read] This confirms the corpus's own
   claim** that noise has a seam which cannot change the outcome: an `afterNoise` handler can react to a
   sound, never prevent one.

## Why this matters for a model whose rates are 0..1

The mod's model holds every severity as a number in `0..1`, uniformly, so that one clamp and one set of
properties cover all of it. **No base-game quantity is on that scale**, and this file is why:

| Quantity | Its actual scale |
| --- | --- |
| a blind level | an integer, `0..7` after a cap, from an aggregate that computes up to `0..12` |
| a deaf level | an unbounded weighted sum — the shipped content reaches `3.75` |
| a hearing radius | `round((8 · 5 / (5 + level)) · mult)` — a hyperbola that never reaches zero |
| a slow level | an integer where `> 9` means immobility and `+100` is used as a sentinel |
| a heel level | `pow(heelpower, 0.75) + buff + sleepiness`, over `heelpower` spanning `0.15` to `10` |
| a gag total | a sum with a saturating floor, which *is* roughly `0..1` — and it is the exception |

So the conversion is not a detail: each dimension needs its own function from the model's `0..1` to the
engine's units, and the function is as much a part of the mechanism as the seam is. This is also why a
**replacement** mechanism needs one *twice* — once to read the engine's answer before overriding it,
and once to write the model's back in the engine's own units.

## How to re-derive this

```powershell
$g = 'kd-structured/KinkyDungeon/Game/src'

# Every dispatch of a trigger, and every handler table that answers it.
# Get-ChildItem does the recursion: Select-String -Path does not accept -Recurse.
Get-ChildItem -Recurse -Filter *.ts "$g" | Select-String -Pattern '"calcDeaf"' -CaseSensitive
Get-ChildItem -Recurse -Filter *.ts "$g" | Select-String -Pattern 'calcDeaf' -CaseSensitive   # the wider net

# The four aggregates this table was built from.
Select-String -Path "$g/player/KinkyDungeonStats.ts" -Pattern 'SendEvent\("calc' -CaseSensitive

# The chokepoint's size and its lookup.
Select-String -Path "$g/base/KinkyDungeonInput.ts" -Pattern '^\t"?[A-Za-z][A-Za-z0-9_]*"?:\s*\(data\)\s*=>' -CaseSensitive
Select-String -Path "$g/base/KinkyDungeonInput.ts" -Pattern 'KinkyDungeonSendEvent\("afterNoise"'
```

> **[inferred] Prefer the unquoted search when checking whether a seam is used at all.** A handler table
> is declared as `calcDeaf: {`, without quotes, so a search for `"calcDeaf"` finds only the dispatch and
> would report a used seam as unused — and the reverse search, for the bare name, is what proved it
> genuinely has no consumer.
