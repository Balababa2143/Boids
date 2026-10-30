/**
 * What the mod shares rather than what a faction is: the UI helpers and the item-event plumbing.
 * @module Common
 */

/**
 * Cross-cutting UI: the DOM warning dialog, which another mod's compatibility message can reuse
 * rather than reimplement.
 */
export * as CommonUI from './CommonUI'
/** The item-event builders: item data on apply, and the player-tag update. */
export * as CommonEvent from './CommonEvent'
