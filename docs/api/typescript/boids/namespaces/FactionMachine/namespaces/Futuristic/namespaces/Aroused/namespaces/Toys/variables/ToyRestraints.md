[boids](../../../../../../../../../../index.md) / [FactionMachine](../../../../../../../index.md) / [Futuristic](../../../../../index.md) / [Aroused](../../../index.md) / [Toys](../index.md) / ToyRestraints

# Variable: ToyRestraints

> `const` **ToyRestraints**: `IMMap`\<[`ToyKind`](../type-aliases/ToyKind.md), `string`\>

Defined in: src/FactionMachine/Futuristic/Aroused/Toys.ts:192

The **registered restraint name** for each kind — not the variant name.

`BuildVariantMap`'s key is the restraint's name, so this is what `KinkyDungeonGetRestraintByName`
resolves and what the game's equip entry points expect. The *variant* name is minted separately when
the game equips a variant; handing one to a `ByName` lookup silently finds nothing.

A lookup rather than three exported names, so an unknown kind is a compile error rather than an
undefined name at runtime.
