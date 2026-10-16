[boids](../../../../../../../../../../index.md) / [FactionMachine](../../../../../../../index.md) / [Futuristic](../../../../../index.md) / [GlassVisor](../../../index.md) / [Constant](../index.md) / ItemTags

# Variable: ItemTags

> `const` **ItemTags**: `ItemTags`

Defined in: src/FactionMachine/Futuristic/GlassVisor/Constant.ts:104

The socket and shrine tags this family's restraints are joined by, one triple
per layering.

Within a triple, `Socket` is the attachment point: a socketed visor demands it
on whatever it is worn under, and every mount that offers one lists it in its
`shrine`. `SocketedItem` and `NonSocketedItem` are the shrine categories the
socketed and the free-standing variant are registered under, which is what other
items name in `LinkableBy` and `renderWhenLinked` to react to a visor.

`Sockets`, `SocketedItems` and `NonSocketedItems` are getters over the same
object; each yields one tag per layering, in `Layering` order.
