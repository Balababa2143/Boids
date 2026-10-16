[boids](../../../../../../../../../../index.md) / [FactionMachine](../../../../../../../index.md) / [Futuristic](../../../../../index.md) / [Limb](../../../index.md) / [Boot](../index.md) / Heel

# Variable: Heel

> `const` **Heel**: `string`

Defined in: src/FactionMachine/Futuristic/Limb/Boot.ts:23

The `Drone Heel` boot, registered in the `ItemBoots` group and tagged
`Link.Socket.Ankle` so the ankle link set can be anchored to it.

It is weightless at level 0 on every floor, cannot be duplicated (`noDupe`), is
`unlimited` so the game always lets it be applied, and is `inaccessible` so nothing
linked under it can be reached. `heelpower: 2` doubles the heel level the game
tolerates while it is worn, and `remove: ['Shoes']` clears the game's own `Shoes`
outfit slot so the two cannot be worn together.
