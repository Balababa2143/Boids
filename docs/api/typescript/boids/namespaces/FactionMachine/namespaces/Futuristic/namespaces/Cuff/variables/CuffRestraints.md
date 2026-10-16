[boids](../../../../../../../../index.md) / [FactionMachine](../../../../../index.md) / [Futuristic](../../../index.md) / [Cuff](../index.md) / CuffRestraints

# Variable: CuffRestraints

> `const` **CuffRestraints**: `IMMap`\<[`CuffKind`](../type-aliases/CuffKind.md), `string`\>

Defined in: src/FactionMachine/Futuristic/Cuff/Item.ts:272

The **registered restraint name** for each kind.

A lookup rather than eight exported names, because a name here is a generated identifier and a caller
has no use for the literal: `GetCuff(kind)` is typed by the same union the parts table is, so an
unknown kind is a compile error rather than an undefined name at runtime.

## It is the *restraint* name, not the variant name, and the difference matters

Each variant of this family is registered as a **restraint**, and `BuildVariantMap`'s key is the
restraint's name — so this is exactly what `KinkyDungeonGetRestraintByName` resolves, and exactly
what the game's equip entry points expect to be handed.

The *variant* name (`uuidv5(key, baseId)`) is minted separately, when the game equips a variant and
records it under `KinkyDungeonRestraintVariants`. Handing a variant name to a `ByName` lookup finds
nothing and the equip silently does nothing, which is the failure this comment exists to prevent.
