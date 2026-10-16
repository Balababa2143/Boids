[boids](../../../../../../../../../../index.md) / [FactionMachine](../../../../../../../index.md) / [Futuristic](../../../../../index.md) / [Common](../../../index.md) / [Constant](../index.md) / ModelSetRootDir

# Variable: ModelSetRootDir

> `const` **ModelSetRootDir**: `"Boids/Futuristic"` = `'Boids/Futuristic'`

Defined in: src/FactionMachine/Futuristic/Common/Constant.ts:16

Root directory of the Futuristic models, relative to the game's `Model/` folder.
Every `Folder` in this mod is built from it, one subfolder per item family.

**`Boids/` here is the asset namespace, not the source folder.** It is what the packed
atlases name their frames by — `Asset/TextureAtlas/*.json` carry entries like
`Models/Boids/Futuristic/Visor/MaskDark1.png` — so renaming it to match
`src/FactionMachine/` would leave every model with no sprite, silently. Moving it means
re-packing the atlases from `Artworks/`, and nothing checks the two against each other.
