[boids](../../../../../../../../../../index.md) / [FactionMachine](../../../../../../../index.md) / [Futuristic](../../../../../index.md) / [GlassVisor](../../../index.md) / [Variant](../index.md) / IsGoggle

# Function: IsGoggle()

> **IsGoggle**(`glassType`): `boolean`

Defined in: src/FactionMachine/Futuristic/GlassVisor/Variant.ts:172

Whether a glass is goggle-shaped, and so worn over the eyes or as a
blindfold, rather than mask-shaped.

## Parameters

### glassType

[`GlassType`](../../Constant/enumerations/GlassType.md)

One of the four glasses.

## Returns

`boolean`

`true` for the two goggle glasses, `false` for the two masks.

## Throws

A `TypeError` for a value that is not a `GlassType`, so an
unknown number cannot quietly read as a mask.
