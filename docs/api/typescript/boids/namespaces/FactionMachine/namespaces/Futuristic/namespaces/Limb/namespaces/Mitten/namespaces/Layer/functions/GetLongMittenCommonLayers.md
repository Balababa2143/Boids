[boids](../../../../../../../../../../../../index.md) / [FactionMachine](../../../../../../../../../index.md) / [Futuristic](../../../../../../../index.md) / [Limb](../../../../../index.md) / [Mitten](../../../index.md) / [Layer](../index.md) / GetLongMittenCommonLayers

# Function: GetLongMittenCommonLayers()

> **GetLongMittenCommonLayers**(`suffix`): `ModelLayer`[]

Defined in: src/FactionMachine/Futuristic/Limb/Mitten/Layer.ts:138

Builds the fourteen bands every long mitten model shares: each of the nine
`CommonLayerBanks` crossed with the side it belongs to, so the five banks that also
exist on a forearm are emitted twice and the four `Upper*` banks once.

Each band claims the model's layer group, ties to the body band of the same side
(`TieToLayer`) and takes over the `Front` and `Crossed` poses as their global
default.

## Parameters

### suffix

`any`

Appended to every layer name and swap target; the models pass `Left`
  and `Right`.

## Returns

`ModelLayer`[]

The fourteen layer definitions, in bank order.
