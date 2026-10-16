[boids](../../../../../../../../../../index.md) / [FactionMachine](../../../../../../../index.md) / [MachinePrime](../../../../../index.md) / [Coordinator](../../../index.md) / [SensoryControl](../index.md) / EventKeys

# Enumeration: EventKeys

Defined in: src/FactionMachine/MachinePrime/Coordinator/SensoryControl.ts:68

The keys the coordinator sends events under on the game's event bus.

They are GUIDs because the bus is shared with the game and every other mod, and a handler is
registered under its key alone: a name that another mod might also choose would collide at load
and crash both. **The value is unchanged from the limiter prototype**, so no handler registration
had to move with the rename.

A `const enum`, so TypeScript inlines the GUIDs at every use site and there is no `EventKeys`
object at runtime: a plain-JavaScript subscriber has to spell the GUID out. It is both the
`trigger` a handler registers under and the `Event` a `KinkyDungeonSendEvent` payload carries.

## Enumeration Members

### DimensionRateUpdate

> **DimensionRateUpdate**: `"26228B48-2471-481C-92B7-420F6F5513C9"`

Defined in: src/FactionMachine/MachinePrime/Coordinator/SensoryControl.ts:74

Sent after a dimension's applied strength actually changed, which is the signal every morph
handler in the machine-prime item set subscribes to. Carries
[DimensionRateUpdateEventArgs](../interfaces/DimensionRateUpdateEventArgs.md).
