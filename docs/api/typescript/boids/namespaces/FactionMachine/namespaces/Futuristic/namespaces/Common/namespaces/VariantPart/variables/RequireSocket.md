[boids](../../../../../../../../../../index.md) / [FactionMachine](../../../../../../../index.md) / [Futuristic](../../../../../index.md) / [Common](../../../index.md) / [VariantPart](../index.md) / RequireSocket

# Variable: RequireSocket

> `const` **RequireSocket**: `IRequireSocket`

Defined in: src/FactionMachine/Futuristic/Common/VariantPart.ts:40

A restraint part requiring the player to be carrying every one of a set of
shrine tags before the item may be worn, and tying the item's linking and
rendering to the same set.

It is written for the sockets the link families use, where each tag is an
attachment point that a cuff or a boot offers, but nothing in it is specific to
them: any shrine tag works. The variant part it returns gives the item:

- `requireAllTagsToEquip`, so it cannot be put on at all until every tag is
  worn;
- a `postRemoval` `RequireTag` event per tag, so it takes itself off as soon as
  the last thing carrying that tag is removed;
- `LinkableBy`, so it may only be linked onto an item offering one of the tags,
  and
- `renderWhenLinked`, when that is asked for, so it stays invisible until it is
  linked onto such an item.

Both call shapes are in use: positional, as `RequireSocket(tags)` or
`RequireSocket(tags, renderWhenLinkedBySocket)`, and object, as
`RequireSocket({ sockets, renderWhenLinkedBySocket })`.
