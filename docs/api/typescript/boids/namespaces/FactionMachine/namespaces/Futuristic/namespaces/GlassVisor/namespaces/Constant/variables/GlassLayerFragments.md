[boids](../../../../../../../../../../index.md) / [FactionMachine](../../../../../../../index.md) / [Futuristic](../../../../../index.md) / [GlassVisor](../../../index.md) / [Constant](../index.md) / GlassLayerFragments

# Variable: GlassLayerFragments

> `const` **GlassLayerFragments**: `object`

Defined in: src/FactionMachine/Futuristic/GlassVisor/Constant.ts:138

The game layer each layering draws into, with its priority offset.

Keyed by `Layering`, so iteration follows the bottom-to-top order. Shared by
every glass model set: the visor models and the HUD models must stack against
each other consistently or the hood/over-mask ordering breaks.

## Type Declaration

### 0

> `readonly` **0**: `object`

#### 0.Layer

> `readonly` **Layer**: `"Goggles"` = `'Goggles'`

#### 0.Pri

> `readonly` **Pri**: `14` = `14`

### 1

> `readonly` **1**: `object`

#### 1.Layer

> `readonly` **Layer**: `"Mask"` = `'Mask'`

#### 1.Pri

> `readonly` **Pri**: `-10` = `-10`

### 2

> `readonly` **2**: `object`

#### 2.Layer

> `readonly` **Layer**: `"Blindfold"` = `'Blindfold'`

#### 2.Pri

> `readonly` **Pri**: `14` = `14`

### 3

> `readonly` **3**: `object`

#### 3.Layer

> `readonly` **Layer**: `"Hood"` = `'Hood'`

#### 3.Pri

> `readonly` **Pri**: `-10` = `-10`
