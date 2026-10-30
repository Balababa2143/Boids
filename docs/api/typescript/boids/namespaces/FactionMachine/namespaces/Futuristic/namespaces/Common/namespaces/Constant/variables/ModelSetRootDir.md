[boids](../../../../../../../../../../index.md) / [FactionMachine](../../../../../../../index.md) / [Futuristic](../../../../../index.md) / [Common](../../../index.md) / [Constant](../index.md) / ModelSetRootDir

# Variable: ModelSetRootDir

> `const` **ModelSetRootDir**: `"Boids/Futuristic"` = `'Boids/Futuristic'`

Defined in: src/FactionMachine/Futuristic/Common/Constant.ts:12

Root directory of the Futuristic models, relative to the game's `Model/` folder.

`Boids/` is the asset namespace the packed atlases name their frames by, not the source folder;
renaming it to match `src/FactionMachine/` leaves every model with no sprite, silently.
