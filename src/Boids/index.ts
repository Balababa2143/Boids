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

export * as Futuristic from './Futuristic'
export * as MachinePrime from './MachinePrime'
export * as KDExtension from '../KDExtension'
export * as DebugStart from './DebugStart'
import ModJson from '../../Asset/mod.json'
export {ModJson}

import * as Immutable from 'immutable'

export { Immutable }