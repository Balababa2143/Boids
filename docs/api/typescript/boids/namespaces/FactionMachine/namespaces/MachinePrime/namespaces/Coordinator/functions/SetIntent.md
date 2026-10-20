[boids](../../../../../../../../index.md) / [FactionMachine](../../../../../index.md) / [MachinePrime](../../../index.md) / [Coordinator](../index.md) / SetIntent

# Function: SetIntent()

> **SetIntent**(`args`): `WriteOutcome`

Defined in: src/FactionMachine/MachinePrime/Coordinator/Public/Control.ts:111

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

**The grant is read, never supplied.** A caller cannot hand the validator a capability the
equipment does not have: when the demand is `OverrideAllowed`, this function enumerates the worn
set once and takes the promise on the dimension's own channel. Every other write leaves the body
unread, because the grant has no bearing on it.

## Parameters

### args

#### dimension

`string`

The dimension to write. Must be registered, or the write is refused
  rather than stored under an id nothing will ever read.

#### intent

`IntentParameters`

The demand to record.

## Returns

`WriteOutcome`

`Accepted`, or the refusal naming the dimension and the rule.
