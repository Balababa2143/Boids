import * as Api from './Api'

/**
 * Published here rather than by webpack's `library` option, which used to put a
 * promise on the page: this entry is an async module, because `kd-structured` is
 * resolved at runtime through the import map that mod publishes. This body only
 * runs once that has resolved, so the namespace is complete when it is assigned —
 * and `Boids` is never a promise at any point.
 *
 * `./Api` is the curated surface, and importing it is also what runs the mod's
 * registration tree.
 */
globalThis.Boids = Api
