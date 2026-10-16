[boids](../../../../../../../../index.md) / [FactionMachine](../../../../../index.md) / [MachinePrime](../../../index.md) / [Coordinator](../index.md) / UnRegister

# Function: UnRegister()

> **UnRegister**(`args`): `State`

Defined in: src/FactionMachine/MachinePrime/Coordinator/Public/ItemManagement.ts:43

Records that an item has left the active player, releasing its archetype's slot.

Removing a name that was never registered is harmless: the set simply does not
change, and `SetState` drops a write that changes nothing.

## Parameters

### args

#### restraint

`Named`

The item being removed; matched by name.

#### type

`ItemArchetype`

The archetype whose slot it leaves.

## Returns

`State`
