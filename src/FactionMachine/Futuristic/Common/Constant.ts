/**
 * Paths shared by the Futuristic model set.
 * @module FactionMachine/Futuristic/Common/Constant
 */

/**
 * Root directory of the Futuristic models, relative to the game's `Model/` folder.
 * Every `Folder` in this mod is built from it, one subfolder per item family.
 *
 * **`Boids/` here is the asset namespace, not the source folder.** It is what the packed
 * atlases name their frames by — `Asset/TextureAtlas/*.json` carry entries like
 * `Models/Boids/Futuristic/Visor/MaskDark1.png` — so renaming it to match
 * `src/FactionMachine/` would leave every model with no sprite, silently. Moving it means
 * re-packing the atlases from `Artworks/`, and nothing checks the two against each other.
 */
export const ModelSetRootDir = 'Boids/Futuristic'

// TODO: Write a event that debuff player combat capability if pose is selected