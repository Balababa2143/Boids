[boids](../../../../../../../../../../index.md) / [FactionMachine](../../../../../../../index.md) / [MachinePrime](../../../../../index.md) / [Coordinator](../../../index.md) / [SensoryControl](../index.md) / GetLimiterStrength

# Function: GetLimiterStrength()

> **GetLimiterStrength**(`type`): `number`

Defined in: src/FactionMachine/MachinePrime/Coordinator/SensoryControl.ts:71

Reads the target strength stored for one sensory limiter.

## Parameters

### type

`ItemArchetype`

The limiter to read: a `Blinder`, `Deafener` or `Gag`. Any other
archetype throws rather than answering about a slot that has no limiter.

## Returns

`number`

The stored target, 0 to 1: 0 is no restriction at all, 1 is the most
severe the item can make it.
