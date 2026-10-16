[boids](../../../../../../../../../../index.md) / [FactionMachine](../../../../../../../index.md) / [Futuristic](../../../../../index.md) / [GlassVisor](../../../index.md) / [Model](../index.md) / MaskMountModel

# Variable: MaskMountModel

> `const` **MaskMountModel**: `string`

Defined in: src/FactionMachine/Futuristic/GlassVisor/Model.ts:95

The model for the `Mask Mount` restraint: one metal rim on the `MaskOver`
layer, wearing the base-metal faction colour at a fixed priority.

It is the family's only model that is not keyed by a variant — the mount is a
single restraint rather than a set — and it is exported so `Item.ts` can name
it. Invariant and `NoOverride` mean the rim neither changes with the pose nor
takes part in overriding the layers under it.
