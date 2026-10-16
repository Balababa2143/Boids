[boids](../../../../../../../../index.md) / [FactionMachine](../../../../../index.md) / [MachinePrime](../../../index.md) / [Coordinator](../index.md) / DescribeCandidates

# Function: DescribeCandidates()

> **DescribeCandidates**\<`Candidate`\>(`candidates`): readonly `object`[]

Defined in: src/FactionMachine/MachinePrime/Coordinator/Public/Selection.ts:91

Every candidate's dimensions, resolved. Exported because a console reader wants exactly this: what
each option *would* do under the current demand, before anything is equipped.

## Type Parameters

### Candidate

`Candidate` *extends* [`SelectableProvider`](../interfaces/SelectableProvider.md)

## Parameters

### candidates

readonly `Candidate`[]

What could be equipped.

## Returns

readonly `object`[]

One entry per candidate, carrying the resolution of each dimension it would cover.
