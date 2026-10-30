[boids](../../../../../../../../index.md) / [FactionMachine](../../../../../index.md) / [MachinePrime](../../../index.md) / [Coordinator](../index.md) / SelectProvider

# Function: SelectProvider()

> **SelectProvider**\<`Candidate`\>(`candidates`): `Candidate` \| `null`

Defined in: src/FactionMachine/MachinePrime/Coordinator/Public/Selection.ts:29

Picks a candidate whose covered dimensions the Host's demand can actually be honoured on. The
rule is a filter, not a ranking: a candidate qualifies when the router engages at least one of
its dimensions, and the first qualifying candidate is returned, so order is the caller's. When no
candidate covers an engaged dimension, the first one is returned anyway — equipping while the
Host is not engaged injects nothing. A caller that needs strict refusal asks [WhichQualify](WhichQualify.md)
instead and gets an empty list.

## Type Parameters

### Candidate

`Candidate` *extends* [`SelectableProvider`](../interfaces/SelectableProvider.md)

## Parameters

### candidates

readonly `Candidate`[]

What could be equipped, in the caller's own preference order.

## Returns

`Candidate` \| `null`

The chosen candidate, or `null` when there were none.
