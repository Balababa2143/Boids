[boids](../../../../../../../../../../index.md) / [FactionMachine](../../../../../../../index.md) / [Futuristic](../../../../../index.md) / [Cuff](../../../index.md) / [Model](../index.md) / CuffModelNames

# Variable: CuffModelNames

> `const` **CuffModelNames**: `IMMap`\<[`CuffKind`](../../../type-aliases/CuffKind.md), `string`\>

Defined in: src/FactionMachine/Futuristic/Cuff/Model.ts:108

Every copied model, registered under its derived name.

`AddModelVariantMapToGame` is what registers them, and it is called at module evaluation: the
registration is the point, and the map it returns is the lookup `Cuff/Item` needs so a restraint
can name the model registered for its own kind.
