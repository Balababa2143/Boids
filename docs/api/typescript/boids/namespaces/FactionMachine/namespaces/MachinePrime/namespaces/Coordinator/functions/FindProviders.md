[boids](../../../../../../../../index.md) / [FactionMachine](../../../../../index.md) / [MachinePrime](../../../index.md) / [Coordinator](../index.md) / FindProviders

# Function: FindProviders()

> **FindProviders**(): readonly `ProviderBid`[]

Defined in: src/FactionMachine/MachinePrime/Coordinator/Public/Control.ts:188

Every provider bid the worn set is declaring right now.

The enumeration `Resolve` performs itself when it is handed no bids, re-exported so a console
caller — or the seam layer that resolves several dimensions per event — can walk the body **once**
and pass the same list to each resolution.

## Returns

readonly `ProviderBid`[]

The bids, in wear order. The order is the tie-break for equal power.
