/**
 * The whole published surface: the machine major faction, and the UI the mod shares.
 *
 * The faction is published **one level down**, under its own name, so the surface reads as
 * *factions, plus shared UI*: a second faction is a sibling of `src/FactionMachine/` rather
 * than a fourth name at the top level. `CommonUI` stays flat because it is not content — it
 * exists for other mods' compatibility messages rather than for anything this mod ships.
 *
 * The variant infrastructure in `src/KDExtension` (the text adapter included), the helpers in
 * `src/Utilities` and the mod's own manifest stay internal until the mod is worth extending;
 * widening this file is the intended way to change that, and `test/public-api.test.ts` pins
 * the result so a widening or a narrowing shows up as one reviewed diff rather than as a
 * surprise for a downstream mod.
 *
 * `Common`'s barrel is **not** re-exported here, even though `CommonUI` comes from inside it,
 * because the published surface is a subset of that folder: importing the barrel would
 * publish `CommonEvent` too. This is the second deliberate exception to the repository's
 * barrel rule, spelled out where it happens; the first is the glass visor barrel exporting
 * `Variant` by name, because consumers use it as a type as well as a value.
 */
export * as FactionMachine from './FactionMachine'
export * as CommonUI from './Common/CommonUI'

declare global {
    /**
     * The namespace `src/mod.ts` publishes.
     *
     * Declared here rather than in a file of its own: TypeScript drops
     * `/// <reference path>` from declaration output, so a separate ambient module
     * never reached the published types package, which the build now checks.
     */
    var Boids: typeof import('./Api')
}
