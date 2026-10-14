import * as Boids from './Boids'

/**
 * Published here rather than by webpack's `library` option, which used to put a
 * promise on the page: this entry is an async module, because `kd-structured` is
 * resolved at runtime through the import map that mod publishes. This body only
 * runs once that has resolved, so the namespace is complete when it is assigned —
 * and `Boids` is never a promise at any point.
 */
globalThis.Boids = Boids
