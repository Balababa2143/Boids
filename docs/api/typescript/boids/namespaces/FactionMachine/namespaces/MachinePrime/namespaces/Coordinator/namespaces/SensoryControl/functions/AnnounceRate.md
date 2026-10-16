[boids](../../../../../../../../../../index.md) / [FactionMachine](../../../../../../../index.md) / [MachinePrime](../../../../../index.md) / [Coordinator](../../../index.md) / [SensoryControl](../index.md) / AnnounceRate

# Function: AnnounceRate()

> **AnnounceRate**(`args`): `void`

Defined in: src/FactionMachine/MachinePrime/Coordinator/SensoryControl.ts:89

Announces that a dimension's applied strength moved, and lets the game react.

**It does not compare against what was there before**, because there is nothing stored to compare
against: the applied strength is derived, and a caller that wants to report only real changes
compares the resolutions itself. That is the honest shape — a module that kept a shadow copy of
the last value would be the cache this refactor exists to delete.

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
