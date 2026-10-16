[boids](../../../../../../../../../../index.md) / [FactionMachine](../../../../../../../index.md) / [Futuristic](../../../../../index.md) / [Link](../../../index.md) / [Leg](../index.md) / Variant

# Type Alias: Variant

> **Variant** = keyof *typeof* `DescriptorMap`

Defined in: src/FactionMachine/Futuristic/Link/Leg.ts:123

The leg link variants: `BetweenAnkleCuff` and `BetweenThighCuff` run a chain
between the two cuffs of a joint, while `TiedAnkle` and `TiedThigh` bind the
legs together instead, blocking the feet and hobbling the wearer further.

A key is both the lookup argument for [GetRestraintVariant](../variables/GetRestraintVariant.md) and the seed
of the name every registered variant gets, so renaming one renames saved items.
