[boids](../../../../../../../../../../../../index.md) / [FactionMachine](../../../../../../../../../index.md) / [Futuristic](../../../../../../../index.md) / [Limb](../../../../../index.md) / [Mitten](../../../index.md) / [Layer](../index.md) / GetLongMittenBodyLayers

# Function: GetLongMittenBodyLayers()

> **GetLongMittenBodyLayers**(`suffix`): (\{ `EraseLayers`: \{\[`_`: `string`\]: `boolean`; \}; `EraseSprite`: `string`; `GlobalDefaultOverride`: \{\[`_`: `string`\]: `boolean`; \}; `InheritColor`: `"6C1C38FE-D89C-43E5-8DBB-8A67CE48B17D"`; `Layer`: `string`; `Name`: `string`; `NoOverride`: `boolean`; `Poses`: \{\[`_`: `string`\]: `boolean`; \}; `Pri`: `number`; `Sprite`: `string`; `SwapLayerPose?`: `undefined`; \} \| \{ `EraseLayers`: \{\[`_`: `string`\]: `boolean`; \}; `EraseSprite`: `string`; `GlobalDefaultOverride`: \{\[`_`: `string`\]: `boolean`; \}; `InheritColor`: `"6C1C38FE-D89C-43E5-8DBB-8A67CE48B17D"`; `Layer`: `string`; `Name`: `string`; `NoOverride`: `boolean`; `Poses`: \{\[`_`: `string`\]: `boolean`; \}; `Pri`: `number`; `Sprite?`: `undefined`; `SwapLayerPose`: \{ `Crossed?`: `string`; `Front?`: `string`; \}; \})[]

Defined in: src/FactionMachine/Futuristic/Limb/Mitten/Layer.ts:226

Builds the two bands that draw the mitten itself, and erase the base game's `Mitts`
sprite and layer while they are worn (`EraseSprite` / `EraseLayers`), so the bare
hand does not show through them.

## Parameters

### suffix

`any`

Appended to both names and to the forearm band's swap target.

## Returns

(\{ `EraseLayers`: \{\[`_`: `string`\]: `boolean`; \}; `EraseSprite`: `string`; `GlobalDefaultOverride`: \{\[`_`: `string`\]: `boolean`; \}; `InheritColor`: `"6C1C38FE-D89C-43E5-8DBB-8A67CE48B17D"`; `Layer`: `string`; `Name`: `string`; `NoOverride`: `boolean`; `Poses`: \{\[`_`: `string`\]: `boolean`; \}; `Pri`: `number`; `Sprite`: `string`; `SwapLayerPose?`: `undefined`; \} \| \{ `EraseLayers`: \{\[`_`: `string`\]: `boolean`; \}; `EraseSprite`: `string`; `GlobalDefaultOverride`: \{\[`_`: `string`\]: `boolean`; \}; `InheritColor`: `"6C1C38FE-D89C-43E5-8DBB-8A67CE48B17D"`; `Layer`: `string`; `Name`: `string`; `NoOverride`: `boolean`; `Poses`: \{\[`_`: `string`\]: `boolean`; \}; `Pri`: `number`; `Sprite?`: `undefined`; `SwapLayerPose`: \{ `Crossed?`: `string`; `Front?`: `string`; \}; \})[]

The mitten band and its forearm counterpart.
