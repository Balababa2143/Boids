/**
 * The mod's content, in three namespaces: `Futuristic` (the model and restraint
 * set), `MachinePrime` (the drone coordinator) and `DebugStart` (console drivers).
 *
 * `src/Api.ts` re-exports this file wholesale, so everything listed below is part
 * of what the bundle publishes as `globalThis.Boids`, and `test/public-api.test.ts`
 * pins the names against a committed baseline.
 *
 * Everything above the exports is order-sensitive: `export * as … from …`
 * declarations are hoisted and their targets evaluated first, so `ModelLayers` is
 * built and the atlases requested only once the entire registration tree exists —
 * which is what lets the models be registered into `ModelDefs` before the layer
 * priorities they name are resolved. The README's "entry module's body runs after
 * everything it imports" is the long form; read it before moving any of this.
 *
 * This body used to open by swapping `LAYERS_BASE[219]` with `LAYERS_BASE[220]`. That
 * was a personal preference with no functional contribution, and it went out with
 * Phase 0: a base-game edit with no mechanism behind it is a claim about the game that
 * nothing in the repository can defend. `LAYERS_BASE` is now consumed exactly as the
 * game ships it.
 * @module Boids
 */

for(const [k, v] of Object.entries(InitLayers(LAYERS_BASE))){
    ModelLayers[k] = v
}

PIXI.Assets.load({
    src: 'TextureAtlas/BoidsAsset0.json',
    loadParser: 'modAtlasLoader'
})
PIXI.Assets.load({
    src: 'TextureAtlas/BoidsAsset1.json',
    loadParser: 'modAtlasLoader'
})

/** The restraint set: cuffs, straps, suits, gags, visors, links and their models. */
export * as Futuristic from './Futuristic'
/** The coordinator: the sensory limiters, their state, and the items that drive them. */
export * as MachinePrime from './MachinePrime'
/**
 * Cross-cutting UI: the DOM warning dialog, which another mod's compatibility message can
 * reuse rather than reimplement.
 */
export * as CommonUI from './CommonUI'
/** Console drivers; importing them also registers the `Drone Toys` start perk. */
export * as DebugStart from './DebugStart'