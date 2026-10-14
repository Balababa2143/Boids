export { }

declare global {
    /** The namespace `src/mod.ts` publishes as the mod's only global. */
    var Boids: typeof import('./Api')
}
