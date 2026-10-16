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
