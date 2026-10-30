[boids](../../../../../../../../../../index.md) / [FactionMachine](../../../../../../../index.md) / [Futuristic](../../../../../index.md) / [Cuff](../../../index.md) / [Model](../index.md) / CuffModelNames

# Variable: CuffModelNames

> `const` **CuffModelNames**: `IMMap`\<[`CuffKind`](../../../type-aliases/CuffKind.md), `string`\>

Defined in: src/FactionMachine/Futuristic/Cuff/Model.ts:90

Every copied model, registered under its derived name.

`AddModelVariantMapToGame` registers at module evaluation; the map it returns is the lookup
`Cuff/Item` needs so a restraint can name the model registered for its own kind.
