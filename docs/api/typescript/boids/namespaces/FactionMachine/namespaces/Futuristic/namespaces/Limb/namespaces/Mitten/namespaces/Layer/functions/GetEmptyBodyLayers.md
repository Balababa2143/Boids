[boids](../../../../../../../../../../../../index.md) / [FactionMachine](../../../../../../../../../index.md) / [Futuristic](../../../../../../../index.md) / [Limb](../../../../../index.md) / [Mitten](../../../index.md) / [Layer](../index.md) / GetEmptyBodyLayers

# Function: GetEmptyBodyLayers()

> **GetEmptyBodyLayers**(`suffix`): (\{ `GlobalDefaultOverride`: \{\[`_`: `string`\]: `boolean`; \}; `InheritColor`: `"6C1C38FE-D89C-43E5-8DBB-8A67CE48B17D"`; `Layer`: `string`; `Name`: `string`; `Poses`: \{\[`_`: `string`\]: `boolean`; \}; `Pri`: `number`; `Sprite`: `string`; `SwapLayerPose?`: `undefined`; \} \| \{ `GlobalDefaultOverride`: \{\[`_`: `string`\]: `boolean`; \}; `InheritColor`: `"6C1C38FE-D89C-43E5-8DBB-8A67CE48B17D"`; `Layer`: `string`; `Name`: `string`; `Poses`: \{\[`_`: `string`\]: `boolean`; \}; `Pri`: `number`; `Sprite`: `string`; `SwapLayerPose`: \{ `Crossed?`: `string`; `Front?`: `string`; \}; \})[]

Defined in: src/FactionMachine/Futuristic/Limb/Mitten/Layer.ts:165

The same two band names as `GetSleevesBodyLayers` with an empty sprite and no folder, so a model
can claim the long mitten's layer groups and layering without drawing a sleeve.

## Parameters

### suffix

`any`

The side, appended to both names and to the forearm band's swap target.

## Returns

(\{ `GlobalDefaultOverride`: \{\[`_`: `string`\]: `boolean`; \}; `InheritColor`: `"6C1C38FE-D89C-43E5-8DBB-8A67CE48B17D"`; `Layer`: `string`; `Name`: `string`; `Poses`: \{\[`_`: `string`\]: `boolean`; \}; `Pri`: `number`; `Sprite`: `string`; `SwapLayerPose?`: `undefined`; \} \| \{ `GlobalDefaultOverride`: \{\[`_`: `string`\]: `boolean`; \}; `InheritColor`: `"6C1C38FE-D89C-43E5-8DBB-8A67CE48B17D"`; `Layer`: `string`; `Name`: `string`; `Poses`: \{\[`_`: `string`\]: `boolean`; \}; `Pri`: `number`; `Sprite`: `string`; `SwapLayerPose`: \{ `Crossed?`: `string`; `Front?`: `string`; \}; \})[]
