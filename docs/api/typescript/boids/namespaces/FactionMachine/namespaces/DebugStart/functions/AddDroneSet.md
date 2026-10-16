[boids](../../../../../../index.md) / [FactionMachine](../../../index.md) / [DebugStart](../index.md) / AddDroneSet

# Function: AddDroneSet()

> **AddDroneSet**(): `void`

Defined in: src/FactionMachine/DebugStart.ts:117

Equips the drone set on the player and puts them into the game's `DollSuit` outfit.

Every piece goes on through `KDEquipInventoryVariant` with a soft fit
(`Tightness: 10`, `Bypass`, `Deep`) and the Dollmaker faction, in three passes that
differ only in the lock they use: `Cyber3`, then `Cyber2`, then the plain `Cyber` for
the links. The visors and gags are variants built by
`FactionMachine.MachinePrime.Item` rather than plain restraints, so the set arrives
already able to morph with the sensory limiters.
The `Lock` field the passes share is restored before the outfit work, and the outfit
is added to the inventory only if it is not already there, before being set as the
current dress.

This is what the `Drone Toys` perk calls, so it takes no arguments; it is exported
for the console as well.

## Returns

`void`
