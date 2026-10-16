[boids](../../../../../../../../../../index.md) / [FactionMachine](../../../../../../../index.md) / [MachinePrime](../../../../../index.md) / [Coordinator](../../../index.md) / [SensoryControl](../index.md) / DimensionRateUpdateEventArgs

# Interface: DimensionRateUpdateEventArgs

Defined in: src/FactionMachine/MachinePrime/Coordinator/SensoryControl.ts:47

The payload of [EventKeys.DimensionRateUpdate](../enumerations/EventKeys.md#dimensionrateupdate): which dimension moved, and the strengths
either side of the move.

Both directions are carried so a subscriber can pick its feedback from the direction of the
change as well as from the new value — and so a family whose model changes only at a *crossing*
can compare the two rather than guess.

## Properties

### Dimension

> **Dimension**: `string`

Defined in: src/FactionMachine/MachinePrime/Coordinator/SensoryControl.ts:49

The dimension whose applied strength moved.

***

### NewStrength

> **NewStrength**: `number`

Defined in: src/FactionMachine/MachinePrime/Coordinator/SensoryControl.ts:53

The applied strength after it.

***

### OldStrength

> **OldStrength**: `number`

Defined in: src/FactionMachine/MachinePrime/Coordinator/SensoryControl.ts:51

The applied strength before the move.
