[boids](../../../../../../../../../../index.md) / [FactionMachine](../../../../../../../index.md) / [Futuristic](../../../../../index.md) / [GlassVisor](../../../index.md) / [Constant](../index.md) / MakeGlassLayerTemplate

# Function: MakeGlassLayerTemplate()

> **MakeGlassLayerTemplate**(`Name`): `object`

Defined in: src/FactionMachine/Futuristic/GlassVisor/Constant.ts:144

Shared shape of a glass layer definition, so a model set only supplies the sprite and the game
layer.

## Parameters

### Name

`string`

The layer's name, and its identity: each model set supplies its own.

## Returns

`object`

A partial `ModelLayer`, invariant and not hidden when a higher layer overrides it.

### HideWhenOverridden

> `readonly` **HideWhenOverridden**: `false` = `false`

### Invariant

> `readonly` **Invariant**: `true` = `true`

### Name

> **Name**: `string`
