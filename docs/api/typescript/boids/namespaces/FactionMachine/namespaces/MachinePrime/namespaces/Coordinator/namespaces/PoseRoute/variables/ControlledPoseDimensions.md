[boids](../../../../../../../../../../index.md) / [FactionMachine](../../../../../../../index.md) / [MachinePrime](../../../../../index.md) / [Coordinator](../../../index.md) / [PoseRoute](../index.md) / ControlledPoseDimensions

# Variable: ControlledPoseDimensions

> `const` **ControlledPoseDimensions**: `ReadonlyMap`\<`"Arms"` \| `"Legs"`, `DimensionId`\>

Defined in: src/FactionMachine/MachinePrime/Coordinator/PoseRoute.ts:117

The two controlled posture dimensions, resolved through the catalogue rather than written as
literals, so a rename in the catalogue is a compile error here rather than a second spelling.
