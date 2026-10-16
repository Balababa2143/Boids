[boids](../../../../../../index.md) / [FactionMachine](../../../index.md) / [DebugStart](../index.md) / AddDroneSet

# Function: AddDroneSet()

> **AddDroneSet**(): `void`

Defined in: src/FactionMachine/DebugStart.ts:125

Equips the drone set on the player and puts them into the game's `DollSuit` outfit.

Every piece goes on through `KDEquipInventoryVariant` with a soft fit (`Tightness: 10`, `Bypass`,
`Deep`) and the Dollmaker faction, in three passes that differ only in the lock they use: `Cyber3`,
then `Cyber2`, then the plain `Cyber` for the links.

## The two visors are chosen, not written down

This used to spell out which glass to equip — a Dollmaker mask and a Boids mask, in that order,
each named inline. Nothing decided between them; the order of two calls did. They are now
**candidates with the dimensions they would cover**, handed to
`Coordinator.SelectProvider`, which keeps the ones the Host's current demand can be honoured on.

That is step 1.5 of the dev plan and it is the whole point: adding a third glass family is adding
a candidate, and a family that would cover a dimension the Host is not engaged with is passed over
rather than equipped and ignored.

The set is otherwise unchanged: the lock passes are preserved as found, and the `Lock` field they
share is restored before the outfit work.

This is what the `Drone Toys` perk calls, so it takes no arguments; it is exported for the console
as well.

## Returns

`void`
