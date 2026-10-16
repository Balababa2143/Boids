[boids](../../../../../../../../../../index.md) / [FactionMachine](../../../../../../../index.md) / [MachinePrime](../../../../../index.md) / [Coordinator](../../../index.md) / [PoseRoute](../index.md) / PoseDrivingShrineWords

# Variable: PoseDrivingShrineWords

> `const` **PoseDrivingShrineWords**: readonly `string`[]

Defined in: src/FactionMachine/MachinePrime/Coordinator/PoseRoute.ts:80

The pose-driver words a mod restraint may **not** carry in its `shrine` list.

`shrine` is the membership tag (§6.12 clause 1) and the game bulk-copies the whole list into the
wearer's tag map (`restraint/KinkyDungeonRestraints.ts:4245-4248`), which makes it a **second,
invisible route into the pose system**. A controlled item that carried one of these would move the
body's configuration outside the controller — which is precisely what this route exists to
prevent.

The list is the cascade's own words (`Data/Poses.ts:484-521`), `BallGags` and `PlugGags`
(`:683-686`), and the lower-body family. **`Hogties` matters most of all:**
`KDForcedToGround` reads it (`player/KinkyDungeonStats.ts:2573-2575`) and its consumers include
the heel level, the slow level and the melee penalty — so one word there moves the lower body's
numbers outside the controller.
