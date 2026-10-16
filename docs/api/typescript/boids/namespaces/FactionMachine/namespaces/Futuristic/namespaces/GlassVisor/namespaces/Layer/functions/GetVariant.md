[boids](../../../../../../../../../../index.md) / [FactionMachine](../../../../../../../index.md) / [Futuristic](../../../../../index.md) / [GlassVisor](../../../index.md) / [Layer](../index.md) / GetVariant

# Function: GetVariant()

> **GetVariant**(`variant`): `ModelLayer`

Defined in: src/FactionMachine/Futuristic/GlassVisor/Layer.ts:90

The layer definition for one visor variant.

It is built from the same variant list as the restraint and the model, so every
restraint this family registers has exactly one layer behind it.

## Parameters

### variant

`VariantKeyOrImmutable`\<[`Variant`](../../../type-aliases/Variant.md)\>

The variant key, as a plain literal or already Immutable.

## Returns

`ModelLayer`

The `ModelLayer` to put in a model's `Layers`: its `Sprite`, the
`Layer` and `Pri` of its layering, and `InheritColor: 'Glass'` when the glass
is colourised.

## Throws

If the key is not one of the variants `AddValidVariants` enumerates.
