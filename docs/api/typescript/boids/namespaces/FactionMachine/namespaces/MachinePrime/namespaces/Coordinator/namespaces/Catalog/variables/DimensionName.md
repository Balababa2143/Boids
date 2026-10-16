[boids](../../../../../../../../../../index.md) / [FactionMachine](../../../../../../../index.md) / [MachinePrime](../../../../../index.md) / [Coordinator](../../../index.md) / [Catalog](../index.md) / DimensionName

# Variable: DimensionName

> `const` **DimensionName**: `object`

Defined in: src/FactionMachine/MachinePrime/Coordinator/Catalog/Name.ts:37

Every dimension this mod declares, by subsystem.

The split is by **mechanism**, not by body part (`design/spec.md` §6.3), and the three
subsystems ship separately and in a fixed order. `Sensory` and `Behavior` are implemented
progressively; **`Stats` is declared now and left unused** until the resource system exists,
which is a decision rather than an omission.

`sight` and `vision` are one dimension, not two: the engine derives both from the single
`KinkyDungeonBlindLevel`, and §6.3's word list names the sense rather than the two ways of
reading it.

## Type Declaration

### Arousal

> `readonly` **Arousal**: `"Arousal"` = `'Arousal'`

Whether she can reach her own arousal.

### Attack

> `readonly` **Attack**: `"Attack"` = `'Attack'`

Whether she can attack.

### Casting

> `readonly` **Casting**: `"Casting"` = `'Casting'`

Whether she can cast.

### Crit

> `readonly` **Crit**: `"Crit"` = `'Crit'`

Critical chance.

### Damage

> `readonly` **Damage**: `"Damage"` = `'Damage'`

Damage dealt.

### Defense

> `readonly` **Defense**: `"Defense"` = `'Defense'`

Whether she can block — raise something against an incoming blow.

### Escape

> `readonly` **Escape**: `"Escape"` = `'Escape'`

Whether she can escape what she is in.

### Evasion

> `readonly` **Evasion**: `"Evasion"` = `'Evasion'`

Evasion.

### Hearing

> `readonly` **Hearing**: `"Hearing"` = `'Hearing'`

How deaf the wearer is.

### Interaction

> `readonly` **Interaction**: `"Interaction"` = `'Interaction'`

What her hands do to the world: doors, picking things up, eating and drinking, tethers and
shrines.

### Movement

> `readonly` **Movement**: `"Movement"` = `'Movement'`

Whether she can move. `immobile`-based movement has no seam of its own (§3.2).

### Noise

> `readonly` **Noise**: `"Noise"` = `'Noise'`

How much noise she makes — the shout and moan radii.

### PoseArms

> `readonly` **PoseArms**: `"PoseArms"` = `'PoseArms'`

Which configurations her arms may take.

### PoseLegs

> `readonly` **PoseLegs**: `"PoseLegs"` = `'PoseLegs'`

Which configurations her legs may take.

### ResourceCost

> `readonly` **ResourceCost**: `"ResourceCost"` = `'ResourceCost'`

What an action costs in a resource. Higher target means dearer.

### Sight

> `readonly` **Sight**: `"Sight"` = `'Sight'`

How blind the wearer is. The dimension the game calls blindness.

### Speech

> `readonly` **Speech**: `"Speech"` = `'Speech'`

Whether she can speak — and, through the chokepoint, who she can speak to.

### SpellAccuracy

> `readonly` **SpellAccuracy**: `"SpellAccuracy"` = `'SpellAccuracy'`

Spell accuracy.

### SpellRange

> `readonly` **SpellRange**: `"SpellRange"` = `'SpellRange'`

How far the wearer's spells reach.

### Sprint

> `readonly` **Sprint**: `"Sprint"` = `'Sprint'`

How far she can sprint.

### StatCeiling

> `readonly` **StatCeiling**: `"StatCeiling"` = `'StatCeiling'`

The ceiling a stat may reach.

### Struggle

> `readonly` **Struggle**: `"Struggle"` = `'Struggle'`

How hard the wearer can struggle against what holds her.

### WeaponUse

> `readonly` **WeaponUse**: `"WeaponUse"` = `'WeaponUse'`

Whether she can use what her hands hold — weapons, tools, keys.
