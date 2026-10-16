[boids](../../../../../../../../../../index.md) / [FactionMachine](../../../../../../../index.md) / [MachinePrime](../../../../../index.md) / [Item](../../../index.md) / [Gag](../index.md) / MakeGagVariantWithBallSocket

# Function: MakeGagVariantWithBallSocket()

> **MakeGagVariantWithBallSocket**(`template`): `KDRestraintVariant`

Defined in: src/FactionMachine/MachinePrime/Item/Gag.ts:232

Wraps a registered face cover as a machine-prime gag that opens a ball socket.

This is the entry point of the module: a consumer — or the console — equips the
result where it would equip the face cover, and the muffler is linked under it a
moment later, already matching the current limiter strength.

## Parameters

### template

`string`

Name of the registered restraint to build on, such as
`Boids.FactionMachine.Futuristic.Gag.FaceCover.AdvanceHarness`. A restraint name,
not a variant.

## Returns

`KDRestraintVariant`

A machine-prime variant, not a registered restraint: the name the game
resolves it by follows from the variant key, so it is a recipe rather than a new
restraint definition.
