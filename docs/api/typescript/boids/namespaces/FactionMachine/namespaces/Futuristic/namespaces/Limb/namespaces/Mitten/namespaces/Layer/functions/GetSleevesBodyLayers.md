[boids](../../../../../../../../../../../../index.md) / [FactionMachine](../../../../../../../../../index.md) / [Futuristic](../../../../../../../index.md) / [Limb](../../../../../index.md) / [Mitten](../../../index.md) / [Layer](../index.md) / GetSleevesBodyLayers

# Function: GetSleevesBodyLayers()

> **GetSleevesBodyLayers**(`suffix`): (\{ `Folder`: `string`; `GlobalDefaultOverride`: \{\[`_`: `string`\]: `boolean`; \}; `InheritColor`: `"6C1C38FE-D89C-43E5-8DBB-8A67CE48B17D"`; `Layer`: `string`; `Name`: `string`; `Poses`: \{\[`_`: `string`\]: `boolean`; \}; `Pri`: `number`; `SwapLayerPose?`: `undefined`; \} \| \{ `Folder`: `string`; `GlobalDefaultOverride`: \{\[`_`: `string`\]: `boolean`; \}; `InheritColor`: `"6C1C38FE-D89C-43E5-8DBB-8A67CE48B17D"`; `Layer`: `string`; `Name`: `string`; `Poses`: \{\[`_`: `string`\]: `boolean`; \}; `Pri`: `number`; `SwapLayerPose`: \{ `Crossed?`: `string`; `Front?`: `string`; \}; \})[]

Defined in: src/FactionMachine/Futuristic/Limb/Mitten/Layer.ts:157

Builds the two sleeve bands that carry the sleeve art, named `LongMitten<suffix>` and
`ForeLongMitten<suffix>` and drawn from the base game's `CyberArms` folder. The
sleeve model is these two plus the common bands; the wire cuff is their empty twin.

## Parameters

### suffix

`any`

Appended to both names and to the forearm band's swap target.

## Returns

(\{ `Folder`: `string`; `GlobalDefaultOverride`: \{\[`_`: `string`\]: `boolean`; \}; `InheritColor`: `"6C1C38FE-D89C-43E5-8DBB-8A67CE48B17D"`; `Layer`: `string`; `Name`: `string`; `Poses`: \{\[`_`: `string`\]: `boolean`; \}; `Pri`: `number`; `SwapLayerPose?`: `undefined`; \} \| \{ `Folder`: `string`; `GlobalDefaultOverride`: \{\[`_`: `string`\]: `boolean`; \}; `InheritColor`: `"6C1C38FE-D89C-43E5-8DBB-8A67CE48B17D"`; `Layer`: `string`; `Name`: `string`; `Poses`: \{\[`_`: `string`\]: `boolean`; \}; `Pri`: `number`; `SwapLayerPose`: \{ `Crossed?`: `string`; `Front?`: `string`; \}; \})[]

The sleeve band and its forearm counterpart.
