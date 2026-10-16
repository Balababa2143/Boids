[boids](../../../../../../../../../../index.md) / [FactionMachine](../../../../../../../index.md) / [Futuristic](../../../../../index.md) / [Gag](../../../index.md) / [GagMetal](../index.md) / GetGagMetal

# Function: GetGagMetal()

> **GetGagMetal**(`args`): `string`

Defined in: src/FactionMachine/Futuristic/Gag/GagMetal.ts:533

Returns the model name for a category and variant, creating and registering the
model the first time that combination is asked for. Deferring registration keeps a
variant nothing wears from costing anything, and the name is derived from the
category plus `Variant.ToStringKey`, so it is readable rather than a GUID:
`Boids.Asset.Gag.GagMetal_FlatGags_None_Strap-SideStrap_None_PerioralClip`.

The model is registered without model text, so it carries no display name of its own
and the restraint wearing it supplies one.

## Parameters

### args

#### category

[`Category`](../enumerations/Category.md)

The gag family, which sets the layer base and, for
  `FlatGags`, the `MaskOver` swap.

#### variant

[`Variant`](../../Common/interfaces/Variant.md)

The hardware to draw; see `Common.Variant`.

## Returns

`string`

The model name, which is also the key it is registered under in `ModelDefs`.

## Throws

If the variant is not a legal combination, via `Variant.Verify`.
