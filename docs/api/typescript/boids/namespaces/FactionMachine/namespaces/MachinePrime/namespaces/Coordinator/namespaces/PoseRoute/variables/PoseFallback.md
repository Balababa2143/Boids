[boids](../../../../../../../../../../index.md) / [FactionMachine](../../../../../../../index.md) / [MachinePrime](../../../../../index.md) / [Coordinator](../../../index.md) / [PoseRoute](../index.md) / PoseFallback

# Variable: PoseFallback

> `const` **PoseFallback**: `Readonly`\<`Record`\<`"Arms"` \| `"Legs"`, `PoseKey`\>\>

Defined in: src/FactionMachine/MachinePrime/Coordinator/PoseRoute.ts:134

The pose the route falls back to when its own algebra empties the set, per limb.

It is **the ladder's own first member**, which is the same value the router's non-empty sentinel
uses (§6.7, invariant 23) and the same pose the game's own cascade reaches for first
(`Data/Poses.ts:459-467`). Rule 4 has the game's sentinel run after both operations; this is the
controller's half of the same guarantee, and the two agree because every ladder is ordered so its
first member is the one every rig can draw.

Derived from the ladders rather than written out, so a ladder that was reordered could not leave
this map behind — which is the one way the two halves of the guarantee could come to disagree.
