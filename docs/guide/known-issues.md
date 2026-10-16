# Known rough edges

> The rough edges that are tracked as issues rather than fixed where they were found.

Tracked as issues rather than fixed here:

* **The link families derive their names with no persisted variant key**, so the
  recomputation check in `Coordinator/Internal/Integrity.ts` can recompute only
  the visor families — the ones that store `VariantInfo` on the item. Giving the
  links the same record is a persisted-format change, and it belongs with the
  variant work rather than beside it. Until then that is a gap in the check, not a
  clean bill of health for the links.

**#48** is **closed by Phase 0**: the write and the read now both name
`KDGameData`, and `save-round-trip.property.test.ts` closes the loop through the
game's own save path rather than in memory — because a round-trip that never
leaves one object is exactly the bug #48 was.

**#47** was the second and is closed: webpack's `library` option published the async
entry's promise as the `Boids` global, so nothing could use it without `await`. The
option is gone and `src/mod.ts` assigns the namespace instead, which is the only
writer; `webpack/verify.ts` fails the build if a UMD wrapper ever comes back.

**#49** was the third and is closed: `MakeSwapLayerPose` tested its pose mask with
`|`, which is true for every mask, so every mitten band emitted both swap entries
whatever it passed — and the front-pose target was `FrontMitten<suffix>`, a group
that is in no layer table. The mask is a bit test again, the front-pose target is
`ForeMitten<suffix>` as the base game's own mitten models have it, and the mitten
factories assert both.

Also part of Phase 0, and not an issue because it never had a mechanism behind it:
the mod used to swap two entries of the game's own `LAYERS_BASE` at load. It was a
personal preference with no functional contribution, so it is gone, and the layer
table is now consumed exactly as the game ships it.

## Base-game defects the control model inherits

**None of these is fixed, and that is the recorded decision rather than an omission.** A defect in the
engine is the engine's: patching one inside this mod would make the mod's behaviour depend on a change
the player cannot see, and an inherited defect that a phase silently works around is a defect nobody can
find later. Each is named with its site so the phase that reaches it knows what it is standing on.

**The mechanism behind each one is traced in the
[base-game research notes](<../../design/report/Notes on Base game/AGENTS.md>)** — the notes there carry
the aggregate, the predicates and the reproducer for every claim, which is how the two wrong attributions
in this table were found.

| Defect | Where |
| --- | --- |
| **`KinkyDungeonIsArmsBoundFast` returns `undefined` on every path.** Nothing guards it, because `strictNullChecks` is off — so a caller that reads it gets neither `true` nor `false`. | `restraint/KinkyDungeonRestraints.ts:1812-1816` |
| **`blockPotions`'s `prevent` branch is unreachable.** The word appears only in two docblocks; nothing ever enters the branch. | `player/KinkyDungeonStats.ts:2227`, docblocks at `:2206` and `:2234` |
| **`gagMult` is never passed a non-default value**, so the multiplier the signature offers is inert. The parameter is `player/KinkyDungeonStats.ts:2209` and its only assignment is `:2210`; every caller passes a default or `1`. | `player/KinkyDungeonStats.ts:2209-2210` |
| **`forbidPose` has no consumer** — it is written and read by nothing, so a restraint that sets it changes nothing. | declared `base/KDTypeDefs.ts:537`, and nowhere else outside the generated declaration |
| **`KinkyDungeonDeaf` is only ever `false`.** The derived accessor has no writer that can make it true — the real expression is commented out at the assignment. It still has three readers. | assigned `player/KinkyDungeonStats.ts:1833`; read at `:364`, `base/KinkyDungeonVision.ts:585`, `base/game/KinkyDungeonDraw.ts:5183` |
| **`KDBlindnessCap`'s writers are commented out**, so the cap the field names is not applied. The only live write is the `7` at `player/KinkyDungeonStats.ts:1697`. | `effect/KinkyDungeonEvents.ts:6717, :6744` |
| **`BoundFeet` is written to `PlayerTags` and read from `Flags`** — two different maps, so the two halves never meet, and nothing ever sets the flag. **The attribution here was the wrong way round until it was re-read.** | **read** `player/KinkyDungeonStats.ts:2100` (`KinkyDungeonFlags`); **written** `restraint/KinkyDungeonRestraints.ts:4236, :4348, :4486` (`KinkyDungeonPlayerTags`) |
| **The `Hobble` tag has three writers and no reader.** | written `restraint/KinkyDungeonRestraints.ts:4234, :4346, :4484` |
| **The `ForceHogtie` tag has no writer**, so whatever reads it reads a value nothing sets. Its only carrier is a *model's* `AddPose`, which lands in `Poses` rather than in the tag map that `KDForcedToGround` reads. | declared nowhere as a tag; model `Data/ModelList_Bubble.ts:108`; read at `player/KinkyDungeonStats.ts:2574` and `Data/Poses.ts:403` |
| **A restraint's `freeze` field has no writer.** Every `.freeze` assignment in the tree is `Enemy.freeze`, a different field, and no record sets this one. | declared `base/KDTypeDefs.ts:586`; read at `restraint/KinkyDungeonRestraints.ts:785, :434-436, :7688` and `player/KinkyDungeonStats.ts:2179` |
| **`KinkyDungeonGetHearingRadius`'s enemy branch hardcodes `deaflevel = 0`**, so the player's deafness cannot reach an enemy's hearing. | `player/KinkyDungeonStats.ts:460-466` |

Two consequences are worth stating in the same place, because both look like our bugs and are not:

* **A posture resolution is never empty** (invariant 23) even though the game indexes the available set
  at `[0]`. The router's sentinel is why; the game's own cascade is the second net.
* **The legs' availability answer is also read as `legBondage`** (`fight/KinkyDungeonFight.ts:285`),
  which drives the helpless melee branch (`:322-326`). Subtracting `Spread` therefore reaches melee damage
  along a road that is **not** `Attack`'s own bid. §6.7's no-interaction-contract decision covers it: the
  effect is real, permitted, and **unspecified** — nothing asserts it and no part of the model relies on
  it.
