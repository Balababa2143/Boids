[boids](../../../../../../../../index.md) / [FactionMachine](../../../../../index.md) / [MachinePrime](../../../index.md) / [Coordinator](../index.md) / SetIntent

# Function: SetIntent()

> **SetIntent**(`args`): `WriteOutcome`

Defined in: src/FactionMachine/MachinePrime/Coordinator/Public/Control.ts:108

Records the Host's demand for one dimension.

The write validators run first, and a refusal is returned **instead of** being stored — which is the
whole contract: rejection happens where the value is written rather than as a silent runtime failure
six calls later.

**The demand is a record, not a value**, because a dimension composes facets (`design/spec.md`
§6.5): a rate takes a `Target`, a gate an `Intent`, and a dimension that composes both takes both.
A parameter the dimension does not take is refused rather than stored and ignored — so
`{ Intent: 'OverrideForbidden' }` for a rate-only `Sight` comes back as a refusal naming `Sight`,
while `{ Target: 0.4 }` is how a rate dimension's severity is asked for.

An empty record is legal and means the baseline, which is how a demand is removed: there is no
separate "unset", because an absent entry and an empty one are the same statement.

## Parameters

### args

#### dimension

`string`

The dimension to write. Must be registered, or the write is refused
  rather than stored under an id nothing will ever read.

#### grants?

`ReadonlySet`\<`string`\>

What the equipment promises for this dimension right now, by capability key.
  Read from what is worn rather than stored, which is what makes "the Host cannot promise a
  substitute the equipment does not offer" a fact about now. Omitted means nothing is promised,
  which is the truth in a delivery that ships no capability keys.

#### intent

`IntentParameters`

The demand to record.

## Returns

`WriteOutcome`

`Accepted`, or the refusal naming the dimension and the rule.
