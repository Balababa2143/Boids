[boids](../../../../../../../../../../index.md) / [FactionMachine](../../../../../../../index.md) / [Futuristic](../../../../../index.md) / [GlassVisor](../../../index.md) / [Variant](../index.md) / IsGoggleVariant

# Function: IsGoggleVariant()

> **IsGoggleVariant**(`variant`): variant is DollmakerGoggle \| BoidsGoggle

Defined in: src/FactionMachine/Futuristic/GlassVisor/Variant.ts:190

The variant-level form of `IsGoggle`: narrows a variant to the goggles,
which is how `Item.ts` picks a visor's preview sprite and how
`Item.CalcBlind` decides how much the glass blinds.

## Parameters

### variant

[`Variant`](../../../type-aliases/Variant.md)

## Returns

variant is DollmakerGoggle \| BoidsGoggle
