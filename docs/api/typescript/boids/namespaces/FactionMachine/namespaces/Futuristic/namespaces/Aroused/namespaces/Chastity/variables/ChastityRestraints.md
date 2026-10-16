[boids](../../../../../../../../../../index.md) / [FactionMachine](../../../../../../../index.md) / [Futuristic](../../../../../index.md) / [Aroused](../../../index.md) / [Chastity](../index.md) / ChastityRestraints

# Variable: ChastityRestraints

> `const` **ChastityRestraints**: `IMMap`\<[`ChastityKind`](../type-aliases/ChastityKind.md), `string`\>

Defined in: src/FactionMachine/Futuristic/Aroused/Chastity.ts:225

The **registered restraint name** for each kind — not the variant name.

`BuildVariantMap`'s key is the restraint's name, so this is what `KinkyDungeonGetRestraintByName`
resolves and what the game's equip entry points expect. The *variant* name is minted separately when
the game equips a variant; handing one to a `ByName` lookup silently finds nothing.

A lookup rather than four exported names, so an unknown kind is a compile error rather than an
undefined name at runtime.
