[boids](../../../../../../../../../../index.md) / [FactionMachine](../../../../../../../index.md) / [Futuristic](../../../../../index.md) / [Gag](../../../index.md) / [Muffler](../index.md) / Plug

# Variable: Plug

> `const` **Plug**: `string`

Defined in: src/FactionMachine/Futuristic/Gag/Muffler.ts:156

The one stuffing item that wears `Component.Plug` rather than a ball, which gives it the plug
sprite and the heaviest gag of the four.

It hangs on `PlugSocket` instead of `BallSocket`, and unlike the balls it is not
`alwaysInaccessible`; its `linkSize` of 0.6 leaves room for the lighter empty muffler.
