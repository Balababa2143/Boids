/**
 * The HUD set: hard-light glass drawn as layers rather than worn as an item of
 * its own.
 *
 * `Common` is the vocabulary the set is built from and `Glass` is the models
 * built from it. They are registered at import time like the rest of the mod, but
 * nothing picks a HUD visor for a player yet.
 * @module Boids/Futuristic/HUD
 */

/** The HUD set's own vocabulary: its glass layer template and model template. */
export * as Common from './Common'
/** The hard-light HUD glass: the visor models and the keys they are built from. */
export * as Glass from './Glass'