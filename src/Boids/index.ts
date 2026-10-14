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

// The mod's own three namespaces, and nothing else: `src/Api.ts` re-exports this
// file wholesale, so anything listed here is part of the published surface. The
// variant infrastructure (`src/KDExtension`), the utilities and the mod manifest
// stay internal for now.
export * as Futuristic from './Futuristic'
export * as MachinePrime from './MachinePrime'
export * as DebugStart from './DebugStart'