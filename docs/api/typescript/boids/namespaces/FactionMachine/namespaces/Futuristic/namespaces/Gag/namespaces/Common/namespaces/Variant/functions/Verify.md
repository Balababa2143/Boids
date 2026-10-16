[boids](../../../../../../../../../../../../index.md) / [FactionMachine](../../../../../../../../../index.md) / [Futuristic](../../../../../../../index.md) / [Gag](../../../../../index.md) / [Common](../../../index.md) / [Variant](../index.md) / Verify

# Function: Verify()

> **Verify**(`v`): `void`

Defined in: src/FactionMachine/Futuristic/Gag/Common.ts:182

Checks that every axis is a known member and that a strap carries a numeric
`Detail`, throwing through `ThrowInvalid` if not. Nothing else calls
`ThrowInvalid`, so an invalid variant fails loudly at registration instead of
silently drawing nothing.

`Component` is only checked to be a number, so unknown bits are ignored rather
than rejected.

## Parameters

### v

[`Variant`](../../../interfaces/Variant.md)

The variant to check.

## Returns

`void`

## Throws

If the variant is not a legal combination of axes.
