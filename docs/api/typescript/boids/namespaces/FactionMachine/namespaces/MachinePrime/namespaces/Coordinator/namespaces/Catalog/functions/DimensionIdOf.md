[boids](../../../../../../../../../../index.md) / [FactionMachine](../../../../../../../index.md) / [MachinePrime](../../../../../index.md) / [Coordinator](../../../index.md) / [Catalog](../index.md) / DimensionIdOf

# Function: DimensionIdOf()

> **DimensionIdOf**(`name`): `string`

Defined in: src/FactionMachine/MachinePrime/Coordinator/Catalog/Name.ts:150

The id a readable name derives to.

**A lookup rather than a fresh derivation**, so an id can only be obtained for a name this
table declares: deriving an id for a name nobody registered would mint an identifier for a
dimension that does not exist, and it would be a legal key in the dossier forever.

## Parameters

### name

[`DimensionName`](../type-aliases/DimensionName.md)

A name from [DimensionName](../variables/DimensionName.md). Unknown names throw, because every caller
  holds a literal from this table.

## Returns

`string`
