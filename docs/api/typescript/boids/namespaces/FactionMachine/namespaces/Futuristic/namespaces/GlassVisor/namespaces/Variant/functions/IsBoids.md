[boids](../../../../../../../../../../index.md) / [FactionMachine](../../../../../../../index.md) / [Futuristic](../../../../../index.md) / [GlassVisor](../../../index.md) / [Variant](../index.md) / IsBoids

# Function: IsBoids()

> **IsBoids**(`glassType`): `boolean`

Defined in: src/FactionMachine/Futuristic/GlassVisor/Variant.ts:201

Whether a glass belongs to the Boids family, the glass that has a level and
a colouring choice, rather than to the fixed Dollmaker skin.

## Parameters

### glassType

[`GlassType`](../../Constant/enumerations/GlassType.md)

One of the four glasses.

## Returns

`boolean`

`true` for the two Boids glasses, `false` for the Dollmaker ones.

## Throws

A `TypeError` for a value that is not a `GlassType`.
