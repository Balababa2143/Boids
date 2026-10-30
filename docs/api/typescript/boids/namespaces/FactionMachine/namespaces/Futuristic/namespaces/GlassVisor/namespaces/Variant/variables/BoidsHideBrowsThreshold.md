[boids](../../../../../../../../../../index.md) / [FactionMachine](../../../../../../../index.md) / [Futuristic](../../../../../index.md) / [GlassVisor](../../../index.md) / [Variant](../index.md) / BoidsHideBrowsThreshold

# Variable: BoidsHideBrowsThreshold

> `const` **BoidsHideBrowsThreshold**: `2`

Defined in: src/FactionMachine/Futuristic/GlassVisor/Variant.ts:183

The highest level that still shows the brows: 2.

`AddValidVariants` sets `HideBrows` from `Level > BoidsHideBrowsThreshold`, and
`FactionMachine.MachinePrime.Item.Visor.Boids` makes the same comparison when it maps a
limiter strength onto a level.
