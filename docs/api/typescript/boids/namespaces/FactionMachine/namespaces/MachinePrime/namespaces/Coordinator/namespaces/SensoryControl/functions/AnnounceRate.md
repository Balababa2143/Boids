[boids](../../../../../../../../../../index.md) / [FactionMachine](../../../../../../../index.md) / [MachinePrime](../../../../../index.md) / [Coordinator](../../../index.md) / [SensoryControl](../index.md) / AnnounceRate

# Function: AnnounceRate()

> **AnnounceRate**(`args`): `void`

Defined in: src/FactionMachine/MachinePrime/Coordinator/SensoryControl.ts:48

Announces that a dimension's applied strength moved, and lets the game react. It compares nothing
against what was there before: the applied strength is derived, so a caller that wants to report
only real changes compares the resolutions itself. Ends with `KinkyDungeonAdvanceTime(1)`, so it
must never be called from inside a tick handler: that re-enters the game's own dispatch.

## Parameters

### args

#### dimension

`string`

The dimension that moved.

#### NewStrength

`number`

The strength after it.

#### OldStrength

`number`

The strength before the move.

## Returns

`void`
