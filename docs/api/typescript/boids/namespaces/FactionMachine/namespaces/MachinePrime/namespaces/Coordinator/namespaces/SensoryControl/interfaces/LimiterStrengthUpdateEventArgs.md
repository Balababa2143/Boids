[boids](../../../../../../../../../../index.md) / [FactionMachine](../../../../../../../index.md) / [MachinePrime](../../../../../index.md) / [Coordinator](../../../index.md) / [SensoryControl](../index.md) / LimiterStrengthUpdateEventArgs

# Interface: LimiterStrengthUpdateEventArgs

Defined in: src/FactionMachine/MachinePrime/Coordinator/SensoryControl.ts:36

The payload of [EventKeys.SensoryLimiterStrengthUpdate](../enumerations/EventKeys.md#sensorylimiterstrengthupdate): which limiter
moved, and the strengths either side of the move, so a subscriber can pick its
feedback from the direction of the change as well as the new value.

## Properties

### NewStrength

> **NewStrength**: `number`

Defined in: src/FactionMachine/MachinePrime/Coordinator/SensoryControl.ts:39

***

### OldStrength

> **OldStrength**: `number`

Defined in: src/FactionMachine/MachinePrime/Coordinator/SensoryControl.ts:38

***

### Type

> **Type**: `SensoryController`

Defined in: src/FactionMachine/MachinePrime/Coordinator/SensoryControl.ts:37
