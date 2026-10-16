/**
 * The cross-cutting UI helpers: a dialog the mod can put in front of the player, and the
 * problems that come with one in a game whose own buttons live on a canvas.
 *
 * Per the repository convention, a folder other folders import from has a barrel, and code
 * outside it imports the barrel. `src/Boids/index.ts` publishes this namespace.
 * @module Common/CommonUI
 */

/** The DOM warning dialog, and its reuse guard. */
export * as Prompt from './Prompt'
