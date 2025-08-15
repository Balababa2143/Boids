const tmp = LAYERS_BASE[219]
LAYERS_BASE[219] = LAYERS_BASE[220]
LAYERS_BASE[220] = tmp
for(const [k, v] of Object.entries(InitLayers(LAYERS_BASE))){
    ModelLayers[k] = v
}

PIXI.Assets.load({
    src: 'TextureAtlas/DroneModAsset-0.json',
    loadParser: 'modAtlasLoader'
})
PIXI.Assets.load({
    src: 'TextureAtlas/DroneModAsset-1.json',
    loadParser: 'modAtlasLoader'
})
import * as Futuristic from './Futuristic'
import * as MachinePrime from './MachinePrime'
import * as DebugStart from './DebugStart'
import ModDesc from '../../Asset/mod.json'


const globalExport = {
    Futuristic,
    MachinePrime,
    DebugStart
}
globalThis[ModDesc.modname] = globalExport