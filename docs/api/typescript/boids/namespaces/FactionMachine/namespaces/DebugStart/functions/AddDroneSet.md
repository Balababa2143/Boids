[boids](../../../../../../index.md) / [FactionMachine](../../../index.md) / [DebugStart](../index.md) / AddDroneSet

# Function: AddDroneSet()

> **AddDroneSet**(): `void`

Defined in: src/FactionMachine/DebugStart.ts:106

Equips the drone set on the player and puts them into the game's `DollSuit` outfit. Every piece
goes on through `KDEquipInventoryVariant` with a soft fit (`Tightness: 10`, `Bypass`, `Deep`) and
the Dollmaker faction, in three passes that differ only in the lock they use. The visors are
candidates with the dimensions they would cover, handed to `Coordinator.SelectProvider`, which
keeps the ones the Host's current demand can be honoured on: a family that would cover a
dimension the Host is not engaged with is passed over rather than equipped and ignored. This is
what the `Drone Toys` perk calls, so it takes no arguments; it is exported for the console as
well.

## Returns

`void`
