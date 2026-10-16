[boids](../../../../../../../../index.md) / [FactionMachine](../../../../../index.md) / [Futuristic](../../../index.md) / [Cuff](../index.md) / GetCuff

# Function: GetCuff()

> **GetCuff**(`kind`): `string`

Defined in: src/FactionMachine/Futuristic/Cuff/Item.ts:281

The registered restraint for one kind, throwing rather than answering `undefined`.

## Parameters

### kind

[`CuffKind`](../type-aliases/CuffKind.md)

One of the eight. The parameter is the family's own union, so a typo cannot reach here
  from TypeScript; the throw is for a caller holding a string from somewhere untyped.

## Returns

`string`
