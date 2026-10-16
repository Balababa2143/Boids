[boids](../../../../../../../../index.md) / [FactionMachine](../../../../../index.md) / [MachinePrime](../../../index.md) / [Coordinator](../index.md) / Register

# Function: Register()

> **Register**(`args`): `State`

Defined in: src/FactionMachine/MachinePrime/Coordinator/Public/ItemManagement.ts:28

Records that an item is now on the active player and belongs to one archetype's
slot.

The write is read-modify-write through UpdateStateIn, so a name already
in the set leaves the state as it was. Registering the same item twice therefore
costs nothing and cannot duplicate it.

## Parameters

### args

#### restraint

`Named`

The item being applied; only its name is stored.

#### type

`ItemArchetype`

The archetype whose slot it joins, which is also the tag the
item was applied under.

## Returns

`State`
