[boids](../../../../../../../../index.md) / [FactionMachine](../../../../../index.md) / [MachinePrime](../../../index.md) / [Coordinator](../index.md) / SetConfig

# Function: SetConfig()

> **SetConfig**(`args`): `WriteOutcome`

Defined in: src/FactionMachine/MachinePrime/Coordinator/Public/Control.ts:117

Records the semantic extra fields a dimension's facets need. The same contract as
[SetIntent](SetIntent.md): a field the descriptor does not declare is refused rather than stored where
nothing will read it.

## Parameters

### args

#### config

`Config`

The fields to record; an empty object clears them, which is how a config is
  removed.

#### dimension

`string`

The dimension the config belongs to.

## Returns

`WriteOutcome`
