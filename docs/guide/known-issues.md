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

| Defect | Where |
| --- | --- |
| **`KinkyDungeonIsArmsBoundFast` returns `undefined` on every path.** Nothing guards it, because `strictNullChecks` is off — so a caller that reads it gets neither `true` nor `false`. | `restraint/KinkyDungeonRestraints.ts:1812-1816` |
| **`blockPotions`'s `prevent` branch is unreachable.** The word appears only in two docblocks; nothing ever enters the branch. | `player/KinkyDungeonStats.ts:2227`, docblocks at `:2206` and `:2234` |
| **`gagMult` is never passed a non-default value**, so the multiplier the signature offers is inert. | `player/KinkyDungeonStats.ts` |
| **`forbidPose` has no consumer** — it is written and read by nothing, so a restraint that sets it changes nothing. | `base/KDTypeDefs.ts` |
| **`KinkyDungeonDeaf` is only ever `false`.** The derived accessor has no writer that can make it true. | `player/KinkyDungeonStats.ts:1833` |
| **`KDBlindnessCap`'s writers are commented out**, so the cap the field names is not applied. | `effect/KinkyDungeonEvents.ts:6717, :6744` |
| **`BoundFeet` is written to `PlayerTags` and read from `Flags`** — two different maps, so the two halves never meet. | written `player/KinkyDungeonStats.ts:2100`, read `restraint/KinkyDungeonRestraints.ts:4236` |
| **The `Hobble` tag has three writers and no reader.** | `player/KinkyDungeonStats.ts` |
| **The `ForceHogtie` tag has no writer**, so whatever reads it reads a value nothing sets. | — |
| **A restraint's `freeze` field has no writer.** | — |
| **`KinkyDungeonGetHearingRadius`'s enemy branch hardcodes `deaflevel = 0`**, so the player's deafness cannot reach an enemy's hearing. | `player/KinkyDungeonStats.ts:460-466` |

Two consequences are worth stating in the same place, because both look like our bugs and are not:

* **A posture resolution is never empty** (invariant 23) even though the game indexes the available set
  at `[0]`. The router's sentinel is why; the game's own cascade is the second net.
* **The legs' availability answer is also read as `legBondage`** (`fight/KinkyDungeonFight.ts:285`),
  which drives the helpless melee branch (`:322-326`). Subtracting `Spread` therefore reaches melee damage
  along a road that is **not** `Attack`'s own bid. §6.7's no-interaction-contract decision covers it: the
  effect is real, permitted, and **unspecified** — nothing asserts it and no part of the model relies on
  it.
