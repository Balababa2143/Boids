[boids](../../../../../../../../../../index.md) / [FactionMachine](../../../../../../../index.md) / [Futuristic](../../../../../index.md) / [GlassVisor](../../../index.md) / [Constant](../index.md) / Layering

# Enumeration: Layering

Defined in: src/FactionMachine/Futuristic/GlassVisor/Constant.ts:53

The four ways a visor can be worn, ordered from bottom to top: `Goggle` over
the eyes, `Mask` across the face, `Blindfold` in the goggle slot, and `Hood`
worn over a mask, which `Item.ts` labels "Over Mask".

`ItemTags` and `GlassLayerFragments` are keyed by it and iterate in this order,
and the same save-format caveat as `GlassType` applies to the member values — as
does its absence at runtime, this being a `const enum` too.

## Enumeration Members

### Blindfold

> **Blindfold**: `2`

Defined in: src/FactionMachine/Futuristic/GlassVisor/Constant.ts:56

***

### Goggle

> **Goggle**: `0`

Defined in: src/FactionMachine/Futuristic/GlassVisor/Constant.ts:54

***

### Hood

> **Hood**: `3`

Defined in: src/FactionMachine/Futuristic/GlassVisor/Constant.ts:57

***

### Mask

> **Mask**: `1`

Defined in: src/FactionMachine/Futuristic/GlassVisor/Constant.ts:55
