[boids](../../../../../../../../../../index.md) / [FactionMachine](../../../../../../../index.md) / [Futuristic](../../../../../index.md) / [Cuff](../../../index.md) / [Model](../index.md) / InheritColor

# Variable: InheritColor

> `const` **InheritColor**: `object`

Defined in: src/FactionMachine/Futuristic/Cuff/Model.ts:32

The colour banks the copied models' layers inherit from, named once so `Cuff/Item` can key its
`factionFilters` by them instead of repeating string literals. A bank is what `InheritColor` on a
model layer points at, so these are the keys through which a faction can recolour a whole group of
layers at once.

## Type Declaration

### BaseMetal

> `readonly` **BaseMetal**: `"BaseMetal"` = `'BaseMetal'`

### Display

> `readonly` **Display**: `"Display"` = `'Display'`

### Lock

> `readonly` **Lock**: `"Lock"` = `'Lock'`

### Screen

> `readonly` **Screen**: `"Screen"` = `'Screen'`
