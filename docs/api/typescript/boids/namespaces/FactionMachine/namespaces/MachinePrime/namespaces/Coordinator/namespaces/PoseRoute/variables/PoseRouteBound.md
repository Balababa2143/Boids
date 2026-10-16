[boids](../../../../../../../../../../index.md) / [FactionMachine](../../../../../../../index.md) / [MachinePrime](../../../../../index.md) / [Coordinator](../../../index.md) / [PoseRoute](../index.md) / PoseRouteBound

# Variable: PoseRouteBound

> `const` **PoseRouteBound**: `false` = `false`

Defined in: src/FactionMachine/MachinePrime/Coordinator/PoseRoute.ts:111

Whether the wrap on the availability functions has been made.

**`false`, and it is a marker rather than a switch.** The catalogue already names the `Replace`
seam on both posture dimensions, which is what keeps a half-built dimension visible rather than
silently wrong (§6.2) — and this is the other half of the same statement: a caller can ask
whether the route is live without reading the source. The phase that binds the wrap replaces this
with `true` **in the same commit**, so the two can never disagree for longer than a diff.
