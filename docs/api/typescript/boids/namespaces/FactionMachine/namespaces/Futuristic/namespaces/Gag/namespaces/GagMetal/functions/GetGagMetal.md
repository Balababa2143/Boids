[boids](../../../../../../../../../../index.md) / [FactionMachine](../../../../../../../index.md) / [Futuristic](../../../../../index.md) / [Gag](../../../index.md) / [GagMetal](../index.md) / GetGagMetal

# Function: GetGagMetal()

> **GetGagMetal**(`args`): `string`

Defined in: src/FactionMachine/Futuristic/Gag/GagMetal.ts:519

Returns the model name for a category and variant, creating and registering the model the first
time that combination is asked for.

The name is derived from the category plus `Variant.ToStringKey`, so it is readable rather than a
GUID, and the model is registered without model text, so the restraint wearing it supplies the
display name.

## Parameters

### args

#### category

[`Category`](../enumerations/Category.md)

#### variant

[`Variant`](../../Common/interfaces/Variant.md)

## Returns

`string`

## Throws

If the variant is not a legal combination, via `Variant.Verify`.
