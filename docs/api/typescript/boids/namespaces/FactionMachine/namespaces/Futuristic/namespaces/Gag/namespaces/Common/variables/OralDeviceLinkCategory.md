[boids](../../../../../../../../../../index.md) / [FactionMachine](../../../../../../../index.md) / [Futuristic](../../../../../index.md) / [Gag](../../../index.md) / [Common](../index.md) / OralDeviceLinkCategory

# Variable: OralDeviceLinkCategory

> `const` **OralDeviceLinkCategory**: `"39C79AA5-74A9-4391-8FBA-2B7F23C2D6E0"` = `'39C79AA5-74A9-4391-8FBA-2B7F23C2D6E0'`

Defined in: src/FactionMachine/Futuristic/Gag/Common.ts:235

The link category the mod's oral devices stack under, set on every muffler by
`Muffler.MakeMuffler`.

The game totals the `linkSize` of the equipped items sharing this key and refuses
one that would take the total past 1, which is why the empty muffler's 0.4 leaves
exactly room for the plug's 0.6 while a ball's 0.7 does not.
