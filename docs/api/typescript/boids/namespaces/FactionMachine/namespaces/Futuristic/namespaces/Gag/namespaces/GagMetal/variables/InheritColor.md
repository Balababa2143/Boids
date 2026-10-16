[boids](../../../../../../../../../../index.md) / [FactionMachine](../../../../../../../index.md) / [Futuristic](../../../../../index.md) / [Gag](../../../index.md) / [GagMetal](../index.md) / InheritColor

# Variable: InheritColor

> `const` **InheritColor**: `object`

Defined in: src/FactionMachine/Futuristic/Gag/GagMetal.ts:27

The colour keys the metal gag layers inherit, and the keys `Common.MakeItem` lists
in its `factionFilters` with the colour a faction should repaint them to:
`BaseMetal` for the structural plates, `DecorationMetal` for the trim, `Ball` for
the ball and its teeth, and `Light` for the emissive display bands.

Each layer below names one of these, so recolouring a key repaints every layer
using it.

## Type Declaration

### Ball

> `readonly` **Ball**: `"Ball"` = `'Ball'`

### BaseMetal

> `readonly` **BaseMetal**: `"BaseMetal"` = `'BaseMetal'`

### DecorationMetal

> `readonly` **DecorationMetal**: `"DecorationMetal"` = `'DecorationMetal'`

### Light

> `readonly` **Light**: `"Light"` = `'Light'`
