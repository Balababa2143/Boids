/**
 * The mod's content, in three namespaces: `Futuristic` (the model and restraint
 * set), `MachinePrime` (the drone coordinator) and `DebugStart` (console drivers).
 *
 * `src/Api.ts` re-exports this file wholesale, so everything listed below is part
 * of what the bundle publishes as `globalThis.Boids`, and `test/public-api.test.ts`
 * pins the names against a committed baseline.
 *
 * Everything above the exports is order-sensitive: `export * as … from …`
 * declarations are hoisted and their targets evaluated first, so the layer table is
 * patched and the atlases requested only once the entire registration tree exists.
 * The README's "entry module's body runs after everything it imports" is the long
 * form; read it before moving any of this.
 * @module Boids
 */

const tmp = LAYERS_BASE[219]
LAYERS_BASE[219] = LAYERS_BASE[220]
LAYERS_BASE[220] = tmp
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
/** Console drivers; importing them also registers the `Drone Toys` start perk. */
export * as DebugStart from './DebugStart'