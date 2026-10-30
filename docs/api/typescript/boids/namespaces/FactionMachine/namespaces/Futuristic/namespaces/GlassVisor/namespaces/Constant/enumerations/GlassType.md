[boids](../../../../../../../../../../index.md) / [FactionMachine](../../../../../../../index.md) / [Futuristic](../../../../../index.md) / [GlassVisor](../../../index.md) / [Constant](../index.md) / GlassType

# Enumeration: GlassType

Defined in: src/FactionMachine/Futuristic/GlassVisor/Constant.ts:33

Which glass a visor is made of: the two Dollmaker glasses and the two Boids ones, a goggle and a
mask each.

The members are serialised into the variant key as their numeric values, so the order below is
load-bearing: moving one changes every name derived from a key of that glass. A `const enum`, so
a plain-JavaScript consumer reading `GlassType` off the global finds `undefined`.

## Enumeration Members

### BoidsGoggle

> **BoidsGoggle**: `2`

Defined in: src/FactionMachine/Futuristic/GlassVisor/Constant.ts:36

***

### BoidsMask

> **BoidsMask**: `3`

Defined in: src/FactionMachine/Futuristic/GlassVisor/Constant.ts:37

***

### DollmakerGoggle

> **DollmakerGoggle**: `0`

Defined in: src/FactionMachine/Futuristic/GlassVisor/Constant.ts:34

***

### DollmakerMask

> **DollmakerMask**: `1`

Defined in: src/FactionMachine/Futuristic/GlassVisor/Constant.ts:35
