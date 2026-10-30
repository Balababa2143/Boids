/**
 * Paths shared by the Futuristic model set.
 * @module FactionMachine/Futuristic/Common/Constant
 */

/**
 * Root directory of the Futuristic models, relative to the game's `Model/` folder.
 *
 * `Boids/` is the asset namespace the packed atlases name their frames by, not the source folder;
 * renaming it to match `src/FactionMachine/` leaves every model with no sprite, silently.
 */
export const ModelSetRootDir = 'Boids/Futuristic'
