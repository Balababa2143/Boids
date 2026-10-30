[boids](../../../../../../../../../../index.md) / [FactionMachine](../../../../../../../index.md) / [Futuristic](../../../../../index.md) / [Gag](../../../index.md) / [Common](../index.md) / MakeItem

# Function: MakeItem()

> **MakeItem**(`args`): `restraint`

Defined in: src/FactionMachine/Futuristic/Gag/Common.ts:250

Builds the restraint template for one gag or face cover from a category and a variant.

It does not register the restraint — the caller hands the result to
`AddRestraintWithTextThenGetName` — but asking for the template does register its model, through
`GagMetal.GetGagMetal`.

## Parameters

### args

#### category

[`Category`](../../GagMetal/enumerations/Category.md)

Which gag family the item belongs to: it selects the link set, the layer
  the model draws into, and the second tag in the shrine list.

#### name

`string`

The restraint name to register under, not shown to the player.

#### variant

[`Variant`](../interfaces/Variant.md)

The layers to draw and the gag strength to add.

## Returns

`restraint`

A restraint template, not registered.

## Throws

If the variant is not a legal combination, via `Variant.Verify`.
