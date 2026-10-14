/// <reference path="./globalExport.ts" />
/**
 * The whole published surface: everything under `src/Boids/`, and nothing else.
 *
 * The variant infrastructure in `src/KDExtension`, the helpers in `src/Utilities`
 * and the mod's own manifest stay internal until the mod is worth extending;
 * widening this file is the intended way to change that, and
 * `test/public-api.test.ts` pins the result so a widening or a narrowing shows up
 * as one reviewed diff rather than as a surprise for a downstream mod.
 */
export * from './Boids'
