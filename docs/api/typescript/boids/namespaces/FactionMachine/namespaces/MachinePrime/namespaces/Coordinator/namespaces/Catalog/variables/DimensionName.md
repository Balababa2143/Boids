[boids](../../../../../../../../../../index.md) / [FactionMachine](../../../../../../../index.md) / [MachinePrime](../../../../../index.md) / [Coordinator](../../../index.md) / [Catalog](../index.md) / DimensionName

# Variable: DimensionName

> `const` **DimensionName**: `object`

Defined in: src/FactionMachine/MachinePrime/Coordinator/Catalog/Name.ts:17

Every dimension this mod declares, by subsystem. The split is by mechanism, not by body part, and
the three subsystems ship separately in a fixed order. `sight` and `vision` are one dimension, not
two: the engine derives both from the single `KinkyDungeonBlindLevel`.

## Type Declaration

### Arousal

> `readonly` **Arousal**: `"Arousal"` = `'Arousal'`

### Attack

> `readonly` **Attack**: `"Attack"` = `'Attack'`

### Casting

> `readonly` **Casting**: `"Casting"` = `'Casting'`

### Crit

> `readonly` **Crit**: `"Crit"` = `'Crit'`

### Damage

> `readonly` **Damage**: `"Damage"` = `'Damage'`

### Defense

> `readonly` **Defense**: `"Defense"` = `'Defense'`

### Escape

> `readonly` **Escape**: `"Escape"` = `'Escape'`

### Evasion

> `readonly` **Evasion**: `"Evasion"` = `'Evasion'`

### Hearing

> `readonly` **Hearing**: `"Hearing"` = `'Hearing'`

### Interaction

> `readonly` **Interaction**: `"Interaction"` = `'Interaction'`

What her hands do to the world: doors, picking things up, eating, drinking, tethers, shrines.

### Movement

> `readonly` **Movement**: `"Movement"` = `'Movement'`

`immobile`-based movement has no seam of its own.

### Noise

> `readonly` **Noise**: `"Noise"` = `'Noise'`

The shout and moan radii.

### PoseArms

> `readonly` **PoseArms**: `"PoseArms"` = `'PoseArms'`

### PoseLegs

> `readonly` **PoseLegs**: `"PoseLegs"` = `'PoseLegs'`

### ResourceCost

> `readonly` **ResourceCost**: `"ResourceCost"` = `'ResourceCost'`

What an action costs in a resource. Higher target means dearer.

### Sight

> `readonly` **Sight**: `"Sight"` = `'Sight'`

How blind the wearer is: the dimension the game calls blindness.

### Speech

> `readonly` **Speech**: `"Speech"` = `'Speech'`

Whether she can speak — and, through the chokepoint, who she can speak to.

### SpellAccuracy

> `readonly` **SpellAccuracy**: `"SpellAccuracy"` = `'SpellAccuracy'`

### SpellRange

> `readonly` **SpellRange**: `"SpellRange"` = `'SpellRange'`

### Sprint

> `readonly` **Sprint**: `"Sprint"` = `'Sprint'`

### StatCeiling

> `readonly` **StatCeiling**: `"StatCeiling"` = `'StatCeiling'`

### Struggle

> `readonly` **Struggle**: `"Struggle"` = `'Struggle'`

Both a permission and a difficulty; its config names the struggle types it governs.

### WeaponUse

> `readonly` **WeaponUse**: `"WeaponUse"` = `'WeaponUse'`

Whether she can use what her hands hold — weapons, tools, keys.
