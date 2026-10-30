[boids](../../../../../../../../../../index.md) / [FactionMachine](../../../../../../../index.md) / [Futuristic](../../../../../index.md) / [GlassVisor](../../../index.md) / [Constant](../index.md) / ItemTags

# Variable: ItemTags

> `const` **ItemTags**: `ItemTags`

Defined in: src/FactionMachine/Futuristic/GlassVisor/Constant.ts:94

The socket and shrine tags this family's restraints are joined by, one triple per layering.

`Socket` is the attachment point a socketed visor demands on what it is worn under;
`SocketedItem` and `NonSocketedItem` are the shrine categories the two variants register under,
which other items name in `LinkableBy` and `renderWhenLinked`. The plural getters yield one tag
per layering.
