[boids](../../../../../../../../index.md) / [FactionMachine](../../../../../index.md) / [MachinePrime](../../../index.md) / [Coordinator](../index.md) / GetDossier

# Function: GetDossier()

> **GetDossier**(): `ControlState`

Defined in: src/FactionMachine/MachinePrime/Coordinator/Public/Control.ts:59

The Host's dossier for the active character.

The live tree, not a copy: every write produces a new tree and swaps this module's reference, so
a caller that holds onto the result of a read is holding the state as it was rather than a view
that will change under it.

## Returns

`ControlState`
