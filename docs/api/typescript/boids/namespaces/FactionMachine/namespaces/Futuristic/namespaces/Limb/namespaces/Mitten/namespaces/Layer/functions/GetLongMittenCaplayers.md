[boids](../../../../../../../../../../../../index.md) / [FactionMachine](../../../../../../../../../index.md) / [Futuristic](../../../../../../../index.md) / [Limb](../../../../../index.md) / [Mitten](../../../index.md) / [Layer](../index.md) / GetLongMittenCaplayers

# Function: GetLongMittenCaplayers()

> **GetLongMittenCaplayers**(`suffix`): (\{ `GlobalDefaultOverride`: \{\[`_`: `string`\]: `boolean`; \}; `HideWhenOverridden`: `boolean`; `InheritColor`: `"9C464FC0-BA59-4B4F-8212-A8BFC7B64B5D"`; `Layer`: `string`; `Name`: `string`; `Poses`: \{\[`_`: `string`\]: `boolean`; \}; `Pri`: `number`; `SwapLayerPose?`: `undefined`; `TieToLayer`: `string`; \} \| \{ `GlobalDefaultOverride`: \{\[`_`: `string`\]: `boolean`; \}; `HideWhenOverridden`: `boolean`; `InheritColor`: `"9C464FC0-BA59-4B4F-8212-A8BFC7B64B5D"`; `Layer`: `string`; `Name`: `string`; `Poses`: \{\[`_`: `string`\]: `boolean`; \}; `Pri`: `number`; `SwapLayerPose`: \{ `Crossed?`: `string`; `Front?`: `string`; \}; `TieToLayer`: `string`; \})[]

Defined in: src/FactionMachine/Futuristic/Limb/Mitten/Layer.ts:266

Builds the two cap bands, drawn over the body bands they tie to and hidden as soon
as a higher layer overrides them (`HideWhenOverridden`). Only the long mitten model
wears them.

## Parameters

### suffix

`any`

Appended to both names and to the forearm band's swap target.

## Returns

(\{ `GlobalDefaultOverride`: \{\[`_`: `string`\]: `boolean`; \}; `HideWhenOverridden`: `boolean`; `InheritColor`: `"9C464FC0-BA59-4B4F-8212-A8BFC7B64B5D"`; `Layer`: `string`; `Name`: `string`; `Poses`: \{\[`_`: `string`\]: `boolean`; \}; `Pri`: `number`; `SwapLayerPose?`: `undefined`; `TieToLayer`: `string`; \} \| \{ `GlobalDefaultOverride`: \{\[`_`: `string`\]: `boolean`; \}; `HideWhenOverridden`: `boolean`; `InheritColor`: `"9C464FC0-BA59-4B4F-8212-A8BFC7B64B5D"`; `Layer`: `string`; `Name`: `string`; `Poses`: \{\[`_`: `string`\]: `boolean`; \}; `Pri`: `number`; `SwapLayerPose`: \{ `Crossed?`: `string`; `Front?`: `string`; \}; `TieToLayer`: `string`; \})[]

The cap band and its forearm counterpart.
