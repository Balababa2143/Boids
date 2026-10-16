[boids](../../../../../../../../../../index.md) / [FactionMachine](../../../../../../../index.md) / [MachinePrime](../../../../../index.md) / [Coordinator](../../../index.md) / [SensoryControl](../index.md) / SetLimiterStrength

# Function: SetLimiterStrength()

> **SetLimiterStrength**(`type`, `newStrength`): `void`

Defined in: src/FactionMachine/MachinePrime/Coordinator/SensoryControl.ts:92

Writes the target strength of one sensory limiter, in the range 0 to 1, where 0
is no restriction at all and 1 is the most severe.

A write that changes the value updates the state and sends
[EventKeys.SensoryLimiterStrengthUpdate](../enumerations/EventKeys.md#sensorylimiterstrengthupdate) on the game's event bus, which is
how the worn item learns it has to morph; a write of the value already stored does
neither. Game time advances by one on every call, changed or not — see the
"Time advances from inside the game's tick dispatch" invariant in `AGENTS.md`
for why that is deliberate and what it costs.

## Parameters

### type

`ItemArchetype`

The limiter to write: a `Blinder`, `Deafener` or `Gag`. Any other
archetype throws.

### newStrength

`number`

The new target. Nothing here clamps it, so keeping it inside
0 to 1 is the caller's job.

## Returns

`void`
