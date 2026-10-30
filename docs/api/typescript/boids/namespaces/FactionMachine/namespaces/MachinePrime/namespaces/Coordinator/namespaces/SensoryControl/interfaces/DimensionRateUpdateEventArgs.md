[boids](../../../../../../../../../../index.md) / [FactionMachine](../../../../../../../index.md) / [MachinePrime](../../../../../index.md) / [Coordinator](../../../index.md) / [SensoryControl](../index.md) / DimensionRateUpdateEventArgs

# Interface: DimensionRateUpdateEventArgs

Defined in: src/FactionMachine/MachinePrime/Coordinator/SensoryControl.ts:17

The payload of [EventKeys.DimensionRateUpdate](../enumerations/EventKeys.md#dimensionrateupdate): which dimension moved, and the strengths
either side of the move. Both directions are carried so a subscriber can pick its feedback from
the direction of the change, and so a family whose model changes only at a crossing can compare
the two.

## Properties

### Dimension

> **Dimension**: `string`

Defined in: src/FactionMachine/MachinePrime/Coordinator/SensoryControl.ts:18

***

### NewStrength

> **NewStrength**: `number`

Defined in: src/FactionMachine/MachinePrime/Coordinator/SensoryControl.ts:20

***

### OldStrength

> **OldStrength**: `number`

Defined in: src/FactionMachine/MachinePrime/Coordinator/SensoryControl.ts:19
