/**
 * The published surface: the machine faction, and the UI the mod shares.
 *
 * `Common`'s barrel is not re-exported even though `CommonUI` comes from inside it, because the
 * published surface is a subset of that folder and the barrel would publish `CommonEvent` too.
 */
export * as FactionMachine from './FactionMachine'
export * as CommonUI from './Common/CommonUI'

declare global {
    /**
     * The namespace `src/mod.ts` publishes.
     *
     * Declared here rather than in a file of its own because TypeScript drops `/// <reference path>`
     * from declaration output, and a separate ambient module then never reaches the published types
     * package.
     */
    var Boids: typeof import('./Api')
}
