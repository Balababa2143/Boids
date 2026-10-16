[boids](../../../../../../../../../../index.md) / [FactionMachine](../../../../../../../index.md) / [Futuristic](../../../../../index.md) / [GlassVisor](../../../index.md) / [Variant](../index.md) / BoidsHideBrowsThreshold

# Variable: BoidsHideBrowsThreshold

> `const` **BoidsHideBrowsThreshold**: `2`

Defined in: src/FactionMachine/Futuristic/GlassVisor/Variant.ts:228

The highest level that still shows the brows: 2. `AddValidVariants` sets a
Boids variant's `HideBrows` from `Level > BoidsHideBrowsThreshold`, which
is what keeps the `BoidsShowBrows`/`BoidsHideBrows` split true by
construction, and `FactionMachine.MachinePrime.Item.Visor.Boids` makes the same
comparison when it maps a limiter strength onto a level.
