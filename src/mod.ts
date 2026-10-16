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
 *
 * ### Why the layer table is built here, in the body
 *
 * `export * as … from …` declarations are hoisted and their targets evaluated first, so by
 * the time this body runs the whole registration tree exists: the models are in `ModelDefs`,
 * and the layer priorities they name are resolved by name at render time, which is what lets
 * every model have been registered before the table is built. The README's "entry module's
 * body runs after everything it imports" is the long form; read it before moving any of this.
 *
 * The block **writes back the priorities `InitLayers(LAYERS_BASE)` already produced when the
 * game booted**, because the one edit it used to make — swapping `LAYERS_BASE[219]` with
 * `LAYERS_BASE[220]` — went out with Phase 0: a base-game edit with no mechanism behind it is
 * a claim about the game that nothing in the repository can defend. It is therefore a no-op
 * today, and removing it is a reviewed change rather than a cleanup, because it would empty
 * the registration manifest's `initLayersArgs` and `modelLayers` sections.
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

globalThis.Boids = Api
