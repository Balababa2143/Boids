[boids](../../../../../../../../index.md) / [FactionMachine](../../../../../index.md) / [MachinePrime](../../../index.md) / [Debug](../index.md) / SetBlindStrength

# Function: SetBlindStrength()

> **SetBlindStrength**(`value?`): `void`

Defined in: src/FactionMachine/MachinePrime/Debug.ts:191

Demands a given severity of the sight dimension, or a random one when none is given.

It is the driver's console entry point and it is deliberately **continuous**: 0 is no restriction,
1 is the strictest the dimension admits, and anything between is the Host asking for a partial
squeeze. What the wearer actually gets is this demand clamped to the worn set's capability.

## Parameters

### value?

`number`

## Returns

`void`
