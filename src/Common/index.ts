/**
 * What the mod shares rather than what a faction is: the UI helpers, the item-event
 * plumbing, and the text data that belongs to no faction in particular.
 *
 * Nothing here is faction content, so nothing here is published under `Boids.FactionMachine`.
 * `src/Api.ts` republishes `CommonUI` on its own, and deliberately reaches into that folder
 * rather than importing this barrel, because the published surface is a *subset* of what this
 * folder holds — the barrel would publish `CommonEvent` along with it. That exception is
 * recorded where it happens (`src/Api.ts`) and in `AGENTS.md`.
 * @module Common
 */

/**
 * Cross-cutting UI: the DOM warning dialog, which another mod's compatibility message can
 * reuse rather than reimplement.
 */
export * as CommonUI from './CommonUI'
/** The item-event builders: item data on apply, and the player-tag update. */
export * as CommonEvent from './CommonEvent'
