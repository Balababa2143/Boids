[boids](../../../../../../../../index.md) / [FactionMachine](../../../../../index.md) / [MachinePrime](../../../index.md) / [Coordinator](../index.md) / WhichQualify

# Function: WhichQualify()

> **WhichQualify**\<`Candidate`\>(`candidates`): `Candidate`[]

Defined in: src/FactionMachine/MachinePrime/Coordinator/Public/Selection.ts:47

Every candidate whose covered dimensions the Host's demand can be honoured on. A candidate
qualifies when at least one of its dimensions resolves as engaged. An empty list is a real answer
— the Host is not interested in anything on offer — and differs from "there were no candidates",
which is why the caller sees a list rather than a single value.

## Type Parameters

### Candidate

`Candidate` *extends* [`SelectableProvider`](../interfaces/SelectableProvider.md)

## Parameters

### candidates

readonly `Candidate`[]

What could be equipped.

## Returns

`Candidate`[]

The qualifying candidates, in the order they were passed.
