[boids](../../../../../../../../../../index.md) / [FactionMachine](../../../../../../../index.md) / [MachinePrime](../../../../../index.md) / [Coordinator](../../../index.md) / [SensoryControl](../index.md) / EventKeys

# Enumeration: EventKeys

Defined in: src/FactionMachine/MachinePrime/Coordinator/SensoryControl.ts:54

The keys the coordinator sends events under on the game's event bus.

They are GUIDs because the bus is shared with the game and every other mod, and a
handler is registered under its key alone: a name that another mod might also
choose would collide at load and crash both.

A `const enum`, so TypeScript inlines the GUIDs at every use site and there is no
`EventKeys` object at runtime: a plain-JavaScript subscriber has to spell the GUID
out. It is both the `trigger` a handler registers under and the `Event` a
`KinkyDungeonSendEvent` payload carries.

## Enumeration Members

### SensoryLimiterStrengthUpdate

> **SensoryLimiterStrengthUpdate**: `"26228B48-2471-481C-92B7-420F6F5513C9"`

Defined in: src/FactionMachine/MachinePrime/Coordinator/SensoryControl.ts:60

Sent after a limiter strength actually changed, which is the signal every
morph handler in the machine-prime item set subscribes to. Carries
[LimiterStrengthUpdateEventArgs](../interfaces/LimiterStrengthUpdateEventArgs.md).
