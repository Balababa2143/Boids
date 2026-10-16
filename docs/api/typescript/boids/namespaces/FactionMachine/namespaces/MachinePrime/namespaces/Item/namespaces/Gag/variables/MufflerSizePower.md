[boids](../../../../../../../../../../index.md) / [FactionMachine](../../../../../../../index.md) / [MachinePrime](../../../../../index.md) / [Item](../../../index.md) / [Gag](../index.md) / MufflerSizePower

# Variable: MufflerSizePower

> `const` **MufflerSizePower**: `1` = `1`

Defined in: src/FactionMachine/MachinePrime/Item/Gag.ts:66

How full the muffler is declared to look, **separately from how hard it bids**.

It would be simpler to let the look follow the bid, and that is exactly what the base game's
single `gag` property does — which is why a bigger ball there is necessarily a stricter one.
Declaring the two apart is what makes *a small ball on a strict mechanism* and *a large one that
only blocks the words* expressible, and they are two item variants rather than two demands.
