[boids](../../../../../../../../index.md) / [FactionMachine](../../../../../index.md) / [MachinePrime](../../../index.md) / [Coordinator](../index.md) / SelectProvider

# Function: SelectProvider()

> **SelectProvider**\<`Candidate`\>(`candidates`): `Candidate` \| `null`

Defined in: src/FactionMachine/MachinePrime/Coordinator/Public/Selection.ts:56

Picks a candidate whose covered dimensions the Host's demand can actually be honoured on.

**The rule is a filter, not a ranking**, and it is stated as one so it cannot pretend to be more:
a candidate qualifies when the router engages at least one of its dimensions, and the first
qualifying candidate is returned. Order is the caller's, and a caller that cares about order says
so by the order it passes.

The fallback is deliberate and spelled out rather than hidden: **when no candidate covers an
engaged dimension, the first one is returned anyway.** That is the right answer for a caller
presenting a set that has to contain something — a demo that equips a full outfit — because
equipping a piece while the Host is not engaged is harmless: `Free` means the controller injects
nothing, so the piece is worn and the game behaves exactly as it would with no mod installed. A
caller that needs strict refusal asks [WhichQualify](WhichQualify.md) instead and gets an empty list.

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
