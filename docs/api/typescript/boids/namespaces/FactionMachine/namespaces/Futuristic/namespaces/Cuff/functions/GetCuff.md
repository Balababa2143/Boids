[boids](../../../../../../../../index.md) / [FactionMachine](../../../../../index.md) / [Futuristic](../../../index.md) / [Cuff](../index.md) / GetCuff

# Function: GetCuff()

> **GetCuff**(`kind`): `string`

Defined in: src/FactionMachine/Futuristic/Cuff/Item.ts:246

The registered restraint for one kind, throwing rather than answering `undefined`.

## Parameters

### kind

[`CuffKind`](../type-aliases/CuffKind.md)

The family's own union, so a typo cannot reach here from TypeScript. The throw is
  for a caller holding a string from somewhere untyped.

## Returns

`string`
