[boids](../../../../../../../../index.md) / [FactionMachine](../../../../../index.md) / [Futuristic](../../../index.md) / [GlassVisor](../index.md) / GetVariant

# Function: GetVariant()

> **GetVariant**(`variant`): `string`

Defined in: src/FactionMachine/Futuristic/GlassVisor/Item.ts:197

The registered restraint name for a visor variant: the entry point a downstream mod calls to make
a visor of a given glass, and a lookup rather than a factory, because every valid variant is
already registered by the time this module has finished evaluating.

## Parameters

### variant

`VariantKeyOrImmutable`\<[`Variant`](../type-aliases/Variant.md)\>

## Returns

`string`

The restraint's registered name, the string to hand to the game as an item name or as a
  morph `template`.

## Throws

For a key `AddValidVariants` does not enumerate — an unknown glass, a layering the glass
  cannot take, or a `HideBrows` contradicting the level.
