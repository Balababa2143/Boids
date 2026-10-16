[boids](../../../../../../../../../../../../index.md) / [FactionMachine](../../../../../../../../../index.md) / [Futuristic](../../../../../../../index.md) / [Gag](../../../../../index.md) / [Common](../../../index.md) / [Variant](../index.md) / ToStringKey

# Function: ToStringKey()

> **ToStringKey**(`variant`): `string`

Defined in: src/FactionMachine/Futuristic/Gag/Common.ts:216

Renders the variant as the `_`-joined key that ends a generated model name, for
example `None_Strap-SideStrap_None_PerioralClip` for `FaceCover.SimpleHarness`.

The strap part is empty when the variant has no strap and the flags are joined
with `-`, so the key is one-to-one with the variant.

## Parameters

### variant

[`Variant`](../../../interfaces/Variant.md)

The variant to render.

## Returns

`string`

The key fragment, without the category or the `Boids.Asset.Gag` prefix.
