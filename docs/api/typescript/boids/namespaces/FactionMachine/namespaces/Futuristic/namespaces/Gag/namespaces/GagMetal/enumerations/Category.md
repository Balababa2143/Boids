[boids](../../../../../../../../../../index.md) / [FactionMachine](../../../../../../../index.md) / [Futuristic](../../../../../index.md) / [Gag](../../../index.md) / [GagMetal](../index.md) / Category

# Enumeration: Category

Defined in: src/FactionMachine/Futuristic/Gag/GagMetal.ts:68

The five gag families: one knob deciding the layer base the model draws into (`Gag`, `GagFlat` or
`GagMuzzle`, with a `Straps` suffix for the strap layers), the game link set `Common.MakeItem`
links by, and the middle field of the generated model name.

`FlatGags` also swaps every layer into the `MaskOver` group for the `XrayFace` pose, so a flat
gag keeps drawing over a mask when the face is laid open.

## Enumeration Members

### BallGags

> **BallGags**: `"BallGags"`

Defined in: src/FactionMachine/Futuristic/Gag/GagMetal.ts:77

Ball gags; drawn in `Gag`, linked by `KDBallGagLink`.

***

### FlatGags

> **FlatGags**: `"FlatGags"`

Defined in: src/FactionMachine/Futuristic/Gag/GagMetal.ts:82

Flat harness gags; drawn in `GagFlat`, linked by `KDFlatGagLink`, and the only family in
`MaskOver`.

***

### MuzzleGags

> **MuzzleGags**: `"MuzzleGags"`

Defined in: src/FactionMachine/Futuristic/Gag/GagMetal.ts:84

Muzzles; drawn in `GagMuzzle`, linked by `KDMuzzleGagLink`.

***

### PlugGags

> **PlugGags**: `"PlugGags"`

Defined in: src/FactionMachine/Futuristic/Gag/GagMetal.ts:70

Plug gags; drawn in `Gag`, linked by `KDPlugGagLink`.

***

### Stuffing

> **Stuffing**: `"Stuffing"`

Defined in: src/FactionMachine/Futuristic/Gag/GagMetal.ts:75

Mouth-filling items -- the mufflers, balls and plug; drawn in `Gag`, linked by
`KDStuffingLink`.
