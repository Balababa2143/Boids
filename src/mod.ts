import * as Api from './Api'

/**
 * The bundle entry: publishes the namespace as `globalThis.Boids`. The layer-table block runs in
 * this body because `export * as … from …` is hoisted, so the body executes after the whole
 * registration tree; moving the block into a module of its own changes when `ModelLayers` is
 * populated.
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
