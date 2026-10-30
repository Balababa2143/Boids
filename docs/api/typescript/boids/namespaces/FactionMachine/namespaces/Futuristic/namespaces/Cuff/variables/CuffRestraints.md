[boids](../../../../../../../../index.md) / [FactionMachine](../../../../../index.md) / [Futuristic](../../../index.md) / [Cuff](../index.md) / CuffRestraints

# Variable: CuffRestraints

> `const` **CuffRestraints**: `IMMap`\<[`CuffKind`](../type-aliases/CuffKind.md), `string`\>

Defined in: src/FactionMachine/Futuristic/Cuff/Item.ts:237

The registered restraint name for each kind, which is the name `KinkyDungeonGetRestraintByName`
resolves and what the game's equip entry points expect to be handed.

A variant name — minted per equip and recorded under `KinkyDungeonRestraintVariants` — resolves
to nothing here, and the equip silently does nothing.
