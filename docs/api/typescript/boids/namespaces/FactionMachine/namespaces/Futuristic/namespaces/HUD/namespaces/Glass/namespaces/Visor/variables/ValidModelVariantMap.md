[boids](../../../../../../../../../../../../index.md) / [FactionMachine](../../../../../../../../../index.md) / [Futuristic](../../../../../../../index.md) / [HUD](../../../../../index.md) / [Glass](../../../index.md) / [Visor](../index.md) / ValidModelVariantMap

# Variable: ValidModelVariantMap

> `const` **ValidModelVariantMap**: `Map`\<[`ModelVariant`](../type-aliases/ModelVariant.md), `string`\>

Defined in: src/FactionMachine/Futuristic/HUD/Glass/Visor.ts:70

The registered model names, keyed by variant key.

The map is built and the 32 models are registered into `ModelDefs` as a side
effect of this module being imported, which is currently the only thing that
happens to them; see the module header for what is still missing before
something can read the map.
