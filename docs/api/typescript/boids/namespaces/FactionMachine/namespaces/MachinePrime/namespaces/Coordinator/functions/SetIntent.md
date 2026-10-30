[boids](../../../../../../../../index.md) / [FactionMachine](../../../../../index.md) / [MachinePrime](../../../index.md) / [Coordinator](../index.md) / SetIntent

# Function: SetIntent()

> **SetIntent**(`args`): `WriteOutcome`

Defined in: src/FactionMachine/MachinePrime/Coordinator/Public/Control.ts:75

Records the Host's demand for one dimension. The write validators run first, and a refusal is
returned instead of the value being stored. The demand is a record rather than a value, because a
dimension composes facets: a parameter the dimension does not take is refused rather than stored
and ignored, and an empty record means the baseline, which is how a demand is removed. The grant
is read, never supplied: an `OverrideAllowed` demand makes this enumerate the worn set once and
take the promise on the dimension's own channel.

## Parameters

### args

#### dimension

`string`

The dimension to write. Must be registered, or the write is refused.

#### intent

`IntentParameters`

The demand to record.

## Returns

`WriteOutcome`

`Accepted`, or the refusal naming the dimension and the rule.
