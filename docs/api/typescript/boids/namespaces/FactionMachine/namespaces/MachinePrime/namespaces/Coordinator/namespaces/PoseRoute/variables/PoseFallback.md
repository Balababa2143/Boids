[boids](../../../../../../../../../../index.md) / [FactionMachine](../../../../../../../index.md) / [MachinePrime](../../../../../index.md) / [Coordinator](../../../index.md) / [PoseRoute](../index.md) / PoseFallback

# Variable: PoseFallback

> `const` **PoseFallback**: `Readonly`\<`Record`\<`"Arms"` \| `"Legs"`, `PoseKey`\>\>

Defined in: src/FactionMachine/MachinePrime/Coordinator/PoseRoute.ts:77

The pose the route falls back to when its own algebra empties the set, per limb. The ladder's own
first member, derived from the ladders rather than written out, so a reordered ladder cannot
leave this map behind.
