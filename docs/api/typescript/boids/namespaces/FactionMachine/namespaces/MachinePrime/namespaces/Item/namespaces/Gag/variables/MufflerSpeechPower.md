[boids](../../../../../../../../../../index.md) / [FactionMachine](../../../../../../../index.md) / [MachinePrime](../../../../../index.md) / [Item](../../../index.md) / [Gag](../index.md) / MufflerSpeechPower

# Variable: MufflerSpeechPower

> `const` **MufflerSpeechPower**: `1` = `1`

Defined in: src/FactionMachine/MachinePrime/Item/Gag.ts:56

How hard the muffler bids for the **severity** of `Speech`.

A muffler fills the mouth, so it bids the whole dimension. The bid is a **ceiling**: how far it
actually gets is the router's answer from the Host's demand and every other provider's bid.
