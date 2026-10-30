[boids](../../../../../../../../../../index.md) / [FactionMachine](../../../../../../../index.md) / [MachinePrime](../../../../../index.md) / [Coordinator](../../../index.md) / [Catalog](../index.md) / DimensionNamesBySubsystem

# Variable: DimensionNamesBySubsystem

> `const` **DimensionNamesBySubsystem**: `object`

Defined in: src/FactionMachine/MachinePrime/Coordinator/Catalog/Name.ts:63

The name table, grouped the way the subsystems ship. Every subsystem in `Subsystem` has to appear
here, and a name whose descriptor claims a different subsystem than this table lists it under is
an error.

## Type Declaration

### Behavior

> `readonly` **Behavior**: readonly \[`"Struggle"`, `"Speech"`, `"Movement"`, `"Attack"`, `"Casting"`, `"WeaponUse"`, `"Escape"`, `"Arousal"`, `"Defense"`, `"Interaction"`, `"PoseArms"`, `"PoseLegs"`, `"Noise"`\]

### Sensory

> `readonly` **Sensory**: readonly \[`"Sight"`, `"Hearing"`, `"SpellRange"`\]

### Stats

> `readonly` **Stats**: readonly \[`"Damage"`, `"Evasion"`, `"Crit"`, `"SpellAccuracy"`, `"ResourceCost"`, `"StatCeiling"`, `"Sprint"`\]
