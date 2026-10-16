[boids](../../../../../../../../../../index.md) / [FactionMachine](../../../../../../../index.md) / [Futuristic](../../../../../index.md) / [GlassVisor](../../../index.md) / [Model](../index.md) / GetGlassModelVariant

# Function: GetGlassModelVariant()

> **GetGlassModelVariant**(`variant`): `string`

Defined in: src/FactionMachine/Futuristic/GlassVisor/Model.ts:84

The name the model for a visor variant was registered under.

`Item.ts` asks for it once per variant, which is what keeps a restraint and its
model from drifting apart: both are keyed by the same variant list.

## Parameters

### variant

`VariantKeyOrImmutable`\<[`Variant`](../../../type-aliases/Variant.md)\>

The variant key, as a plain literal or already Immutable.

## Returns

`string`

The registered model name, the string a restraint uses as its `Model`.

## Throws

If the key is not one of the variants `AddValidVariants` enumerates.
