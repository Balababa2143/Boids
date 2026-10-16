[boids](../../../../../../../../../../index.md) / [FactionMachine](../../../../../../../index.md) / [Futuristic](../../../../../index.md) / [Gag](../../../index.md) / [Common](../index.md) / MakeItem

# Function: MakeItem()

> **MakeItem**(`args`): `restraint`

Defined in: src/FactionMachine/Futuristic/Gag/Common.ts:309

Builds the restraint template for one gag or face cover from a category and a
variant. It does not register the restraint: the caller hands the result to
`AddRestraintWithTextThenGetName`. Asking for the template does register its model,
because `Model` comes from `GagMetal.GetGagMetal`.

The template is where the family's shared decisions live: the `ItemMouth` group, a
shrine tag list of `Gags` plus the category, the gag strength the variant adds up
to, the faction filters the layers inherit their colour from, the escape chances the
flat harnesses and muzzles share, and the "weightless, level 0, every floor"
availability trio. The category also picks the link set the item can be linked by,
and `noShrine` keeps a shrine from taking the item off.

## Parameters

### args

#### category

[`Category`](../../GagMetal/enumerations/Category.md)

Which gag family the item belongs to. It selects the link
  set, the layer base the model draws into, and the second tag in the shrine list.

#### name

`string`

The restraint name to register under, not shown to the player;
  the display name comes from the text passed to the registration helper.

#### variant

[`Variant`](../interfaces/Variant.md)

The layers to draw and the gag strength to add; see `Variant`
  for the axes.

## Returns

`restraint`

A restraint template, not registered.

## Throws

If the variant is not a legal combination, via `Variant.Verify`.
