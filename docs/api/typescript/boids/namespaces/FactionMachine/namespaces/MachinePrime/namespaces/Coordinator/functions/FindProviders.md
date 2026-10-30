[boids](../../../../../../../../index.md) / [FactionMachine](../../../../../index.md) / [MachinePrime](../../../index.md) / [Coordinator](../index.md) / FindProviders

# Function: FindProviders()

> **FindProviders**(): readonly `ProviderBid`[]

Defined in: src/FactionMachine/MachinePrime/Coordinator/Public/Control.ts:145

Every provider bid the worn set is declaring right now. Re-exported so a caller resolving several
dimensions per event can walk the body once and pass the same list to each resolution.

## Returns

readonly `ProviderBid`[]

The bids, in wear order, which is the tie-break for equal power.
