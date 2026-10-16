[boids](../../../../../../../../../../index.md) / [FactionMachine](../../../../../../../index.md) / [Futuristic](../../../../../index.md) / [Gag](../../../index.md) / [Common](../index.md) / Component

# Enumeration: Component

Defined in: src/FactionMachine/Futuristic/Gag/Common.ts:39

The optional hardware a variant may wear, as a flag set: each set flag adds its
own layers to the model and its own amount to the item's gag total, and no flag is
mandatory or exclusive.

`None` is a declared bit that nothing reads, so "no hardware" is written as a
variant that sets no flag at all rather than as `Component.None`.

- `PerioralClip`: the clip spanning the mouth, with a separate lit display band.
- `CheekDisplay`: a rim and display over each cheek.
- `GlabellaDisplay`: the display between the brows.
- `OTNRivets`: rivets tied to the muzzle layer, so they draw only with a muzzle.
- `OTNStrap`: the strap and its rivets over the muzzle, likewise tied to it.
- `Panel`: the flat plate the flat-gag category is built around.
- `Plug`: the plug sprite, and the heaviest single contribution to the gag total;
  it also forces the `StuffMouth` and `HideMouth` poses.
- `PlugPort`: the empty port, which is what puts a plug socket on the item and so
  what lets a `Muffler.Plug` be worn on top of it.

## Enumeration Members

### CheekDisplay

> **CheekDisplay**: `4`

Defined in: src/FactionMachine/Futuristic/Gag/Common.ts:42

***

### GlabellaDisplay

> **GlabellaDisplay**: `8`

Defined in: src/FactionMachine/Futuristic/Gag/Common.ts:43

***

### None

> **None**: `1`

Defined in: src/FactionMachine/Futuristic/Gag/Common.ts:40

***

### OTNRivets

> **OTNRivets**: `16`

Defined in: src/FactionMachine/Futuristic/Gag/Common.ts:44

***

### OTNStrap

> **OTNStrap**: `32`

Defined in: src/FactionMachine/Futuristic/Gag/Common.ts:45

***

### Panel

> **Panel**: `64`

Defined in: src/FactionMachine/Futuristic/Gag/Common.ts:46

***

### PerioralClip

> **PerioralClip**: `2`

Defined in: src/FactionMachine/Futuristic/Gag/Common.ts:41

***

### Plug

> **Plug**: `128`

Defined in: src/FactionMachine/Futuristic/Gag/Common.ts:47

***

### PlugPort

> **PlugPort**: `256`

Defined in: src/FactionMachine/Futuristic/Gag/Common.ts:48
