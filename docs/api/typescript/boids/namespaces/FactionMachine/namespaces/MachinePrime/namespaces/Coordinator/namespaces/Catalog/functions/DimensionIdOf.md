[boids](../../../../../../../../../../index.md) / [FactionMachine](../../../../../../../index.md) / [MachinePrime](../../../../../index.md) / [Coordinator](../../../index.md) / [Catalog](../index.md) / DimensionIdOf

# Function: DimensionIdOf()

> **DimensionIdOf**(`name`): `string`

Defined in: src/FactionMachine/MachinePrime/Coordinator/Catalog/Name.ts:108

The id a readable name derives to. A lookup rather than a fresh derivation, so an id can only be
obtained for a name this table declares: an id minted for an unregistered name would be a legal
dossier key forever. Unknown names throw.

## Parameters

### name

[`DimensionName`](../type-aliases/DimensionName.md)

A name from [DimensionName](../variables/DimensionName.md).

## Returns

`string`
