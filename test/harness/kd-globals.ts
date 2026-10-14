/**
 * Installs the KD global stubs the mod needs in order to be imported outside the game.
 *
 * Every stub here is a *faithful, lossless* mock of the game's interface:
 *
 *  - `ToMap` / `ToLayerMap` / `InitLayers` match their declared signatures and
 *    preserve all of their input, so every layer the mod builds is visible in the
 *    manifest snapshot.
 *  - Collection globals keep the mod's insertion order.
 *  - Everything that the mod only *calls* (sfx, messages, time advance, PIXI asset
 *    loads) is recorded rather than ignored.
 *
 * Nothing is randomised, and no stub reads `Date`/`Math.random`, so a given module
 * graph always produces the same manifest.
 */

import {
    BASE_LAYER_ORDER,
    BuildBaseModels,
    BuildBaseRestraints,
    BuildBaseTagCollections,
} from '../fixtures/base-game'
import { CreateRecorder, GetRecorder, SetRecorder, type KDGlobals, type KDRecorder } from './recorder'

/** The 12 KD event maps listed by `KDEventMap` in `src/KDInterface/Event.ts`. */
const EVENT_MAP_NAMES = [
    'KDEventMapAlt',
    'KDEventMapBuff',
    'KDEventMapBullet',
    'KDEventMapEnemy',
    'KDEventMapFacility',
    'KDEventMapGeneric',
    'KDEventMapInventory',
    'KDEventMapInventoryIcon',
    'KDEventMapInventorySelected',
    'KDEventMapOutfit',
    'KDEventMapSpell',
    'KDEventMapWeapon',
] as const

/** Tag collections from the fixture that are installed as bare globals. */
const TAG_COLLECTION_NAMES = [
    'KDDevices',
    'KDBindable',
    'KDBindableMinusCuffs',
    'KDCollarLink',
    'KDCollarRender',
    'KDVisorLink',
    'KDMaskLink',
    'KDBlindfoldLink',
    'KDPlugGagLink',
    'KDStuffingLink',
    'KDBallGagLink',
    'KDFlatGagLink',
    'KDMuzzleGagLink',
    'KDHarnessLink',
    'KDDialogueRemoteLinkTether',
    'KDMsgRemoteLinkCHTether',
] as const

export interface InstalledKD {
    recorder: KDRecorder
    globals: KDGlobals
}

/**
 * Installs (or reinstalls) every KD global the mod touches and resets the call log.
 * Idempotent, so tests can call it between re-imports of the module graph.
 */
export const InstallKDGlobals = (): InstalledKD => {
    const recorder = CreateRecorder()
    SetRecorder(recorder)

    const g = globalThis as unknown as Record<string, unknown>
    const tags = BuildBaseTagCollections()

    const globals: KDGlobals = {
        ModelDefs: BuildBaseModels(),
        ModelLayers: {},
        LAYERS_BASE: [...BASE_LAYER_ORDER],
        KinkyDungeonRestraints: BuildBaseRestraints(),
        KinkyDungeonRestraintsCache: new Map<string, restraint>(),
        KDCategoriesStart: [],
        KDPerkStart: {},
        KinkyDungeonStatsPresets: {},
        KinkyDungeonPlayerTags: new Map<string, unknown>(),
        KDGameData: {},
        KDGameDataBase: {},
    }
    recorder.globals = globals

    Object.assign(g, globals)

    // --- Registration primitives -------------------------------------------------

    g.addTextKey = (key: string, text: string) => {
        recorder.textKeys.push([key, text])
    }

    /** Matches the declared signature: `ToMap(Array, ...Extra): { [_: string]: boolean }`. */
    g.ToMap = (Array: string[], ...Extra: string[]) =>
        Object.fromEntries([...Array, ...Extra].map(key => [key, true]))

    /** Keyed by `Name`, preserving the whole layer object so no input variation is lost. */
    g.ToLayerMap = (Layers: ModelLayer[]) =>
        Object.fromEntries(Layers.map(layer => [layer.Name, layer]))

    /** "Returns a table with the priorities for each layer based on order of the array". */
    g.InitLayers = (layers: string[]) => {
        recorder.initLayersArgs.push([...layers])
        return Object.fromEntries(layers.map((name, index) => [name, index]))
    }

    // --- Base-game reads --------------------------------------------------------

    for (const name of TAG_COLLECTION_NAMES) {
        g[name] = [...tags[name]]
    }
    g.ARMPOSES = [...tags.ARMPOSES]
    g.FOREARMPOSES = [...tags.FOREARMPOSES]

    g.KDRestraint = (named: Named) => {
        const key = (named as unknown as { name?: string, Name?: string })?.name
            ?? (named as unknown as { Name?: string })?.Name
        return recorder.globals.KinkyDungeonRestraints.find(r => r.name === key)
    }
    g.KinkyDungeonGetRestraintByName = (name: string) =>
        recorder.globals.KinkyDungeonRestraints.find(r => r.name === name)

    g.TextProvider = {
        instance: {
            getText: (tag: string) => `<text:${tag}>`,
        },
    }

    // --- Game effects the mod invokes -------------------------------------------

    g.KinkyDungeonAdvanceTime = (amount: number) => {
        recorder.advancedTime.push(amount)
    }
    g.KDSoundEnabled = () => true
    g.AudioPlayInstantSoundKD = () => true
    g.KinkyDungeonRootDirectory = 'KinkyDungeon/'

    let nextItemId = 0
    g.KinkyDungeonGetItemID = () => `test-item-${nextItemId++}`
    g.KinkyDungeonInventoryGet = () => undefined
    g.KinkyDungeonInventoryAdd = () => undefined
    g.KinkyDungeonSetDress = () => undefined
    g.Outfit = 'outfit'

    let nextSaveData = 0
    g.KinkyDungeonGenerateSaveData = () => {
        nextSaveData++
        return undefined
    }

    // --- Event maps -------------------------------------------------------------

    for (const eventMapName of EVENT_MAP_NAMES) {
        g[eventMapName] = {}
    }

    // --- Rendering --------------------------------------------------------------

    g.PIXI = {
        Assets: {
            load: (options: unknown) => {
                recorder.pixiLoads.push(options as Record<string, unknown>)
                return Promise.resolve()
            },
        },
    }

    return { recorder, globals }
}

export { GetRecorder }
