[boids](../../../../../../../../../../index.md) / [FactionMachine](../../../../../../../index.md) / [Futuristic](../../../../../index.md) / [Common](../../../index.md) / [VariantPart](../index.md) / RequireSocket

# Variable: RequireSocket

> `const` **RequireSocket**: `IRequireSocket`

Defined in: src/FactionMachine/Futuristic/Common/VariantPart.ts:28

A restraint part requiring every one of a set of shrine tags before the item may be worn, and
tying the item's linking and rendering to the same set.

The returned part sets `requireAllTagsToEquip` and `LinkableBy` to the set, adds a `postRemoval`
`RequireTag` event per tag so the item removes itself when the last carrier goes, and sets
`renderWhenLinked` when asked, which keeps the item invisible until it is linked.

Both call shapes are in use: `(sockets, renderWhenLinkedBySocket?)` and
`({ sockets, renderWhenLinkedBySocket })`.
