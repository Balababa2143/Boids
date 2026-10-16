[boids](../../../../../../../../../../../../index.md) / [FactionMachine](../../../../../../../../../index.md) / [Futuristic](../../../../../../../index.md) / [HUD](../../../../../index.md) / [Glass](../../../index.md) / [Visor](../index.md) / ModelVariant

# Type Alias: ModelVariant

> **ModelVariant** = `RecordOf`\<`IModelVariant`\>

Defined in: src/FactionMachine/Futuristic/HUD/Glass/Visor.ts:44

A HUD visor variant key as an Immutable `Record`: the three HUD choices plus
the layer the model is drawn on.

A `Record` rather than a literal is what fixes the field order the generated
model names are hashed from, so the key order of this type and of the
`ModelVariant` default below is part of the save format.
