[boids](../../../../../../../../../../index.md) / [FactionMachine](../../../../../../../index.md) / [Futuristic](../../../../../index.md) / [Link](../../../index.md) / [Arm](../index.md) / Variant

# Type Alias: Variant

> **Variant** = keyof *typeof* `DescriptorMap`

Defined in: src/FactionMachine/Futuristic/Link/Arm.ts:139

The arm link variants: `BetweenWristCuff` and `BetweenElbowCuff` run a chain
between the two cuffs of a joint, `WristToCollar` runs one from each wrist to
the collar, and `BoxTie` and `ElbowTie` bind the arms without a chain at all.

A key is both the lookup argument for [GetRestraintVariant](../variables/GetRestraintVariant.md) and the seed
of the name every registered variant gets, so renaming one renames saved items.
