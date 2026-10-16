[boids](../../../../../../../../index.md) / [FactionMachine](../../../../../index.md) / [MachinePrime](../../../index.md) / [Coordinator](../index.md) / SetConfig

# Function: SetConfig()

> **SetConfig**(`args`): `WriteOutcome`

Defined in: src/FactionMachine/MachinePrime/Coordinator/Public/Control.ts:151

Records the semantic extra fields a dimension's facets need.

The same contract as [SetIntent](SetIntent.md): a field the descriptor does not declare is refused
rather than stored where nothing will read it.

## Parameters

### args

#### config

`Config`

The fields to record. An empty object clears them, which is how a config is
  removed — there is no separate "unset", because a dimension with no entry reads the baseline.

#### dimension

`string`

The dimension the config belongs to.

## Returns

`WriteOutcome`
