[boids](../../../../../../../../../../index.md) / [FactionMachine](../../../../../../../index.md) / [Futuristic](../../../../../index.md) / [GlassVisor](../../../index.md) / [Constant](../index.md) / MakeGlassLayerTemplate

# Function: MakeGlassLayerTemplate()

> **MakeGlassLayerTemplate**(`Name`): `object`

Defined in: src/FactionMachine/Futuristic/GlassVisor/Constant.ts:165

Shared shape of a glass layer definition: the fields every glass layer has in
common, so a model set only has to supply the sprite and the game layer.

The `Name` is the layer's identity, so each model set supplies its own: the
visor models and the HUD models are distinct layers that happen to share this
shape.

## Parameters

### Name

`string`

The layer's name. The game identifies a layer by it, and a
`LayerFilter` is looked up under the same string.

## Returns

`object`

A new partial `ModelLayer` that is invariant, so the game uses the
layer's name exactly as given, and that is not hidden when a higher-priority
layer overrides it.

### HideWhenOverridden

> `readonly` **HideWhenOverridden**: `false` = `false`

### Invariant

> `readonly` **Invariant**: `true` = `true`

### Name

> **Name**: `string`
