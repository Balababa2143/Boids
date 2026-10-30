[boids](../../../../../../../../../../index.md) / [FactionMachine](../../../../../../../index.md) / [Futuristic](../../../../../index.md) / [Gag](../../../index.md) / [Common](../index.md) / StrapKind

# Type Alias: StrapKind

> **StrapKind** = \{ `__Type`: [`None`](../enumerations/StrapKindTags.md#none); \} \| \{ `__Type`: [`Strap`](../enumerations/StrapKindTags.md#strap); `Detail`: [`StrapDetail`](../enumerations/StrapDetail.md); \} \| \{ `__Type`: [`Harness`](../enumerations/StrapKindTags.md#harness); `Detail`: [`StrapDetail`](../enumerations/StrapDetail.md); \}

Defined in: src/FactionMachine/Futuristic/Gag/Common.ts:80

The strap or harness a variant wears, discriminated on `__Type`: `Detail` exists only on the two
branches that have a strap.
