[boids](../../../../../../../../../../index.md) / [FactionMachine](../../../../../../../index.md) / [MachinePrime](../../../../../index.md) / [Coordinator](../../../index.md) / [PoseRoute](../index.md) / PoseDrivingShrineWords

# Variable: PoseDrivingShrineWords

> `const` **PoseDrivingShrineWords**: readonly `string`[]

Defined in: src/FactionMachine/MachinePrime/Coordinator/PoseRoute.ts:35

The pose-driver words a mod restraint may not carry in its `shrine` list. `shrine` is the
membership tag and the game bulk-copies the whole list into the wearer's tag map, which makes it
a second, invisible route into the pose system: a controlled item carrying one of these would
move the body's configuration outside the controller. `Hogties` matters most: `KDForcedToGround`
reads it, and its consumers include the heel level, the slow level and the melee penalty.
