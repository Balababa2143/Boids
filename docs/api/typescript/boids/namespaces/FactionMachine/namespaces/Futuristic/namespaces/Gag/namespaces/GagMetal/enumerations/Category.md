[boids](../../../../../../../../../../index.md) / [FactionMachine](../../../../../../../index.md) / [Futuristic](../../../../../index.md) / [Gag](../../../index.md) / [GagMetal](../index.md) / Category

# Enumeration: Category

Defined in: src/FactionMachine/Futuristic/Gag/GagMetal.ts:76

The five gag families. The member is a single knob that decides three things: the
layer base the model draws into (`Gag`, `GagFlat` or `GagMuzzle`, with a `Straps`
suffix for the strap layers), the game link set `Common.MakeItem` lets the item be
linked by, and the middle field of the generated model name.

`FlatGags` differs in behaviour as well as in sprite: every layer of a flat gag also
swaps into the `MaskOver` group for the `XrayFace` pose, so a flat gag keeps drawing
over a mask when the face is laid open.

## Enumeration Members

### BallGags

> **BallGags**: `"BallGags"`

Defined in: src/FactionMachine/Futuristic/Gag/GagMetal.ts:85

Ball gags; drawn in `Gag`, linked by `KDBallGagLink`.

***

### FlatGags

> **FlatGags**: `"FlatGags"`

Defined in: src/FactionMachine/Futuristic/Gag/GagMetal.ts:90

Flat harness gags; drawn in `GagFlat`, linked by `KDFlatGagLink`, and the one
family whose layers swap into `MaskOver` for the x-ray face pose.

***

### MuzzleGags

> **MuzzleGags**: `"MuzzleGags"`

Defined in: src/FactionMachine/Futuristic/Gag/GagMetal.ts:92

Muzzles; drawn in `GagMuzzle`, linked by `KDMuzzleGagLink`.

***

### PlugGags

> **PlugGags**: `"PlugGags"`

Defined in: src/FactionMachine/Futuristic/Gag/GagMetal.ts:78

Plug gags; drawn in `Gag`, linked by `KDPlugGagLink`.

***

### Stuffing

> **Stuffing**: `"Stuffing"`

Defined in: src/FactionMachine/Futuristic/Gag/GagMetal.ts:83

Mouth-filling items -- the mufflers, balls and plug; drawn in `Gag`, linked by
`KDStuffingLink`.
