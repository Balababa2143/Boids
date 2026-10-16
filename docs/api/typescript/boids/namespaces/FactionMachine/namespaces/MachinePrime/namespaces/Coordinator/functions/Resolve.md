[boids](../../../../../../../../index.md) / [FactionMachine](../../../../../index.md) / [MachinePrime](../../../index.md) / [Coordinator](../index.md) / Resolve

# Function: Resolve()

> **Resolve**(`dimension`, `bids?`): `DimensionResolution`

Defined in: src/FactionMachine/MachinePrime/Coordinator/Public/Control.ts:186

Resolves one dimension: the Host's demand, what the equipment offers, and which provider won.

The bids are enumerated fresh from the worn set unless the caller supplies them, so the answer is
a function of the body as it is. A caller that needs answers for several dimensions should call
`FindProviders` once and pass the result to each, rather than pay for a worn-set walk per
dimension.

## Parameters

### dimension

`string`

The dimension to resolve. Must be registered — `GetDimension` throws for one
  that is not, because a resolution of an unknown dimension would have to invent its facets.

### bids?

readonly `ProviderBid`[]

The bids to resolve against. Omitted means "ask the body".

## Returns

`DimensionResolution`
