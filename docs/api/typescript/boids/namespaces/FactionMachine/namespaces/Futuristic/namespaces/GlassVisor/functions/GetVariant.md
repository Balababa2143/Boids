[boids](../../../../../../../../index.md) / [FactionMachine](../../../../../index.md) / [Futuristic](../../../index.md) / [GlassVisor](../index.md) / GetVariant

# Function: GetVariant()

> **GetVariant**(`variant`): `string`

Defined in: src/FactionMachine/Futuristic/GlassVisor/Item.ts:215

The registered restraint name for a visor variant — the entry point a
downstream mod calls to make a visor of a given glass.

Every valid variant is already a restraint by the time this module has
finished evaluating, so this is a lookup rather than a factory. The key is
normalised the same way the map's keys were, so a plain literal and its
Immutable equivalent resolve to the same entry.

## Parameters

### variant

`VariantKeyOrImmutable`\<[`Variant`](../type-aliases/Variant.md)\>

The variant to look up: the glass, the layering, whether it
is socketed and hides the brows, and for the Boids glass also the colouring
and the level.

## Returns

`string`

The restraint's registered name, which is the string to hand to the
game as an item name or as a morph `template`.

## Throws

If the key is not one of the variants `AddValidVariants` enumerates —
an unknown glass, a layering the glass cannot take, or a `HideBrows` that
contradicts the level all describe a restraint that was never registered.
