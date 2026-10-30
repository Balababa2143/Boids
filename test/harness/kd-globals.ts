/**
 * Installs the KD global stubs the mod needs in order to be imported outside the game:
 * faithful, and deterministic, so one module graph always produces the same manifest.
 */

import {
    BASE_LAYER_ORDER,
    BuildBaseModels,
    BuildBaseRestraints,
    BuildBaseTagCollections,
    BuildBaseText,
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
 * A `localStorage` stand-in answering the four members the game and the mod use.
 *
 * `getItem` returns `null` for a missing key, because the load path tests for that explicitly.
 */
const CreateLocalStorageStub = (recorder: KDRecorder) => {
    const store = new Map<string, string>()
    return {
        getItem: (key: string): string | null => store.get(key) ?? null,
        setItem: (key: string, value: string): void => {
            recorder.localStorageWrites.push([key, value])
            store.set(key, String(value))
        },
        removeItem: (key: string): void => {
            store.delete(key)
        },
        clear: (): void => {
            store.clear()
        },
    }
}

/**
 * Reads a save object as it stands, or a string decoded through `DecompressB64`.
 *
 * No encoding step of its own: the stub decode is the identity, so a test writes ordinary JSON.
 */
const ReadSaveForLoad = (source: string | KinkyDungeonSave): KinkyDungeonSave | undefined => {
    if (typeof source !== 'string') {
        return source
    }
    if (!source.trim()) {
        return undefined
    }
    const decompressed = (globalThis as unknown as { DecompressB64: (_: string) => string }).DecompressB64(source.trim())
    if (!decompressed) {
        return undefined
    }
    try {
        return JSON.parse(decompressed) as KinkyDungeonSave
    }
    catch {
        return undefined
    }
}

/** The `KDGameData` the harness installed, which the game's loader adopts saves into. */
export const HarnessGameData = (): Record<string, unknown> =>
    (globalThis as unknown as { KDGameData: Record<string, unknown> }).KDGameData

/**
 * Empties `KDGameData` and returns it, for a test that needs a character with no past.
 *
 * It empties rather than replaces, because the mod's wrappers hold this object by reference.
 */
export const ResetGameData = (): Record<string, unknown> => {
    const gameData = HarnessGameData()
    for (const key of Object.keys(gameData)) {
        delete gameData[key]
    }
    return gameData
}

/** Installs (or reinstalls) every KD global the mod touches and resets the call log. Idempotent. */
export const InstallKDGlobals = (): InstalledKD => {
    const recorder = CreateRecorder()
    SetRecorder(recorder)

    const g = globalThis as unknown as Record<string, unknown>
    const tags = BuildBaseTagCollections()

    /**
     * The mod's wrappers, captured before this function replaces them.
     *
     * A reinstall must put them back, or every later suite drives a loader with no gate on it.
     */
    const captured = {
        GenerateSaveData: g.KinkyDungeonGenerateSaveData,
        LoadGame: g.KinkyDungeonLoadGame,
    }

    /**
     * `KDGameData` is the same object across reinstalls.
     *
     * The mod's save wrapper closes over it and the game's loader assigns into it,
     * so replacing it would leave the closure writing to an object nothing reads.
     */
    const stableGameData = (g.KDGameData ?? {}) as Record<string, unknown>
    for (const key of Object.keys(stableGameData)) {
        delete stableGameData[key]
    }

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
        KDGameData: stableGameData,
        KDGameDataBase: {},
        KDSaveSlot: 1,
        loadedsaveslots: [],
        /** Placeholders; the real functions are installed below, after the event bus exists. */
        KinkyDungeonGenerateSaveData: undefined as never,
        KinkyDungeonLoadGame: undefined as never,
        KinkyDungeonFullInventory: () => [...recorder.inventory],
        /** The game's save decode, as the identity so the gate's input stays observable. */
        DecompressB64: (str: string) => {
            recorder.decompressions.push(str)
            return str
        },
        localStorage: CreateLocalStorageStub(recorder),
    }
    recorder.globals = globals

    Object.assign(g, globals)

    /**
     * The game's loader: adopts `KDGameData` and dispatches `afterLoadGame`, as the game does.
     *
     * The recorder and the game data are resolved at call time, because the mod captures this
     * function once and a reinstall must not leave it pointing at an older installation.
     */
    const LoadForGame = (source: string | KinkyDungeonSave, kdloadconsent: boolean = false): boolean => {
        const current = GetRecorder()
        const saveData = ReadSaveForLoad(source)
        if (saveData == null || saveData.KDGameData == null) {
            return false
        }
        Object.assign(current.globals.KDGameData, JSON.parse(JSON.stringify(saveData.KDGameData)))
        current.loads.push(saveData)
        // Through the global send-event stub, so tests observe bus traffic in one place.
        ;(g.KinkyDungeonSendEvent as ((args: { Event: string, data: unknown }) => void))({ Event: 'afterLoadGame', data: {} })
        void kdloadconsent
        return true
    }

    /**
     * The game's save generator: hands back the `KDGameData`
     * the mod just stamped, resolving the current recorder.
     */
    const GenerateSaveData = () => {
        const current = GetRecorder()
        current.saveGenerations++
        return { KDGameData: current.globals.KDGameData } as unknown as KinkyDungeonSave
    }

    /**
     * The installed wrappers are captured, not re-made: the mod wraps both
     * globals once, and new closures would delegate to a superseded recorder.
     */
    const installedWrappers = (g.__boidsHarnessWrappers as
        { GenerateSaveData: () => KinkyDungeonSave, LoadGame: typeof LoadForGame } | undefined)
        ?? { GenerateSaveData, LoadGame: LoadForGame }
    g.__boidsHarnessWrappers = installedWrappers

    g.KinkyDungeonLoadGame = installedWrappers.LoadGame
    g.KinkyDungeonGenerateSaveData = installedWrappers.GenerateSaveData
    globals.KinkyDungeonLoadGame = installedWrappers.LoadGame
    globals.KinkyDungeonGenerateSaveData = installedWrappers.GenerateSaveData

    /** The same pair under the recorder, so a test can see past the mod's wrappers. */
    recorder.originalLoadGame = installedWrappers.LoadGame
    recorder.originalGenerateSaveData = installedWrappers.GenerateSaveData
    recorder.modWrappers = captured

    /**
     * Puts the mod's own wrappers back when the module graph has already been evaluated.
     *
     * A no-op before the mod is evaluated, when there is nothing to restore.
     */
    const restoreModWrappers = () => {
        if (captured.LoadGame !== LoadForGame && captured.LoadGame != null) {
            g.KinkyDungeonLoadGame = captured.LoadGame
            globals.KinkyDungeonLoadGame = captured.LoadGame as KDGlobals['KinkyDungeonLoadGame']
        }
        if (captured.GenerateSaveData !== GenerateSaveData && captured.GenerateSaveData != null) {
            g.KinkyDungeonGenerateSaveData = captured.GenerateSaveData
            globals.KinkyDungeonGenerateSaveData = captured.GenerateSaveData as KDGlobals['KinkyDungeonGenerateSaveData']
        }
    }
    restoreModWrappers()

    g.addTextKey = (key: string, text: string) => {
        recorder.textKeys.push([key, text])
    }

    /** Matches the game's declared signature, so every key passed in is kept. */
    g.ToMap = (Array: string[], ...Extra: string[]) =>
        Object.fromEntries([...Array, ...Extra].map(key => [key, true]))

    /** Keyed by `Name`, keeping each whole layer object. */
    g.ToLayerMap = (Layers: ModelLayer[]) =>
        Object.fromEntries(Layers.map(layer => [layer.Name, layer]))

    /** Returns a layer-name-to-index table in array order, as the game does. */
    g.InitLayers = (layers: string[]) => {
        recorder.initLayersArgs.push([...layers])
        return Object.fromEntries(layers.map((name, index) => [name, index]))
    }

    for (const name of TAG_COLLECTION_NAMES) {
        g[name] = [...tags[name]]
    }
    g.ARMPOSES = [...tags.ARMPOSES]
    g.FOREARMPOSES = [...tags.FOREARMPOSES]

    g.KDRestraint = (named: Named) => {
        const key = (named as unknown as { name?: string, Name?: string })?.name
            ?? (named as unknown as { Name?: string })?.Name
        const variant = (named as unknown as { inventoryVariant?: string })?.inventoryVariant
        // Variant-aware, as the engine's is: an item resolves
        // through `inventoryVariant` to its template.
        const template = recorder.restraintVariants[variant ?? key ?? '']
        return recorder.globals.KinkyDungeonRestraints.find(r => r.name === (template?.template ?? key))
    }
    g.KDRest = (name: string) => {
        const template = recorder.restraintVariants[name]
        return recorder.globals.KinkyDungeonRestraints.find(r => r.name === (template?.template ?? name))
    }
    g.KinkyDungeonGetRestraintByName = (name: string) =>
        recorder.globals.KinkyDungeonRestraints.find(r => r.name === name)

    /**
     * The engine's text provider.
     *
     * The stores are per group, as the engine's are, so a key
     * written to the mod's group is not readable from the engine's.
     */
    const TextGroups = new Map<string, Map<string, string>>()
    const TextGroup = (groupId: string) => {
        let group = TextGroups.get(groupId)
        if (group == null) {
            group = new Map<string, string>()
            TextGroups.set(groupId, group)
        }
        return group
    }

    /** The engine's own text, kept separate from the mod's registrations. */
    const BaseGameText = BuildBaseText()

    /** The engine's own value, set from the player's locale before any mod runs. */
    g.TranslationLanguage = 'EN'

    g.TextProvider = {
        instance: {
            defaultGroupId: 'default',
            getText: (tag: string) => `<text:${tag}>`,
            getGroupManager: () => ({
                appendText: (groupId: string, key: string, value: string) => {
                    recorder.modTextKeys.push([key, value])
                    TextGroup(groupId).set(key, value)
                },
            }),
            getTextFromGroup: (groupId: string, tag: string) =>
                TextGroup(groupId).get(tag) ?? `[NotFound] ${tag}`,
            getTextFromGroupStrict: (groupId: string, tag: string) => TextGroup(groupId).get(tag),
            getTranslationService: (_groupId: string) => ({
                appendTranslation: (
                    language: string,
                    resources: { tagTranslationMap: Map<string, string> },
                ) => {
                    for (const [tag, value] of resources.tagTranslationMap) {
                        recorder.translationPins.push({ Language: language, Tag: tag, Value: value })
                    }
                },
            }),
        },
    }

    /**
     * The game's own text lookup, which is what the mod's `TextGet` calls.
     *
     * An unregistered key resolves to its own tag, so a missing registration shows in the failure.
     */
    const TextFor = (tag: string) =>
        recorder.textKeys.find(([key]) => key === tag)?.[1] ?? BaseGameText[tag] ?? tag

    g.TextGet = (tag: string) => TextFor(tag)

    /**
     * Whether the engine holds a text entry for a tag:
     * its own text or an `addTextKey` registration.
     */
    g.HasText = (tag: string) =>
        BaseGameText[tag] != null || recorder.textKeys.some(([key]) => key === tag)

    g.KinkyDungeonAdvanceTime = (amount: number) => {
        recorder.advancedTime.push(amount)
    }
    g.KDSoundEnabled = () => true
    g.AudioPlayInstantSoundKD = () => true
    g.KinkyDungeonRootDirectory = 'KinkyDungeon/'

    /**
     * The game's status-line message, recorded because a refusal
     * that says nothing is indistinguishable from a bug.
     */
    g.KinkyDungeonSendTextMessage = (
        priority: number,
        text: string,
        color: string,
        time?: number,
        noPush?: boolean,
        noDupe?: boolean,
    ) => {
        recorder.sentTextMessages.push({ priority, text, color, time, noPush, noDupe })
        return true
    }

    /** The palette constants the mod's UI reads. */
    g.KDBaseWhite = '#ffffff'
    g.KDBaseBlack = '#000000'
    g.KDBaseDarkGrey = '#282828'
    g.KDBaseRed = '#ff0000'
    g.KDButtonColor = '#404040'
    g.KDBorderColor = '#808080'

    let nextItemId = 0
    g.KinkyDungeonGetItemID = () => `test-item-${nextItemId++}`
    g.KinkyDungeonInventoryGet = () => undefined
    g.KinkyDungeonInventoryAdd = (item: item) => {
        recorder.inventory.push(item)
    }
    g.KinkyDungeonSetDress = () => undefined
    g.Outfit = 'outfit'

    /**
     * The character's inventory, as the game flattens
     * it: the item objects themselves, not templates.
     */
    g.KinkyDungeonFullInventory = () => [...recorder.inventory]

    /**
     * What is on the character's body, as `{ item, host
     * }` with `host` null for a top-level restraint.
     *
     * Separate from `recorder.inventory`: the control model reads capability from the
     * body, and seeding the wrong one yields a baseline answer however much gear exists.
     */
    g.KinkyDungeonAllRestraintDynamic = () => [...recorder.worn]

    /** The same walk flattened to items, which the game also provides. */
    g.KDAllRestraintDynamicList = () => recorder.worn.map(worn => worn.item)

    /**
     * The game's synchronous base64/LZString decode; identity here, so a test can own both ends.
     */
    g.DecompressB64 = (str: string) => {
        recorder.decompressions.push(str)
        return str
    }

    /**
     * The game's event bus: records the send, then dispatches to `KDEventMapGeneric` handlers.
     *
     * It dispatches because the mod's load-time work is registered as `afterLoadGame`
     * handlers; a stub that only recorded would leave them unreachable and report a pass.
     * A handler that returns true is removed, which is the game's one-shot convention.
     */
    g.KinkyDungeonSendEvent = (args: { Event: string, data: unknown }) => {
        recorder.sentEvents.push({ Event: args.Event, data: args.data })

        // Read off `globalThis`: `recorder.globals` is an
        // installation copy and never sees later registrations.
        const eventMaps = globalThis as unknown as Record<string, Record<string, Record<string, unknown>> | undefined>
        const handlers = eventMaps['KDEventMapGeneric']?.[args.Event]
        if (handlers == null) {
            return
        }

        const remove: string[] = []
        for (const type of Object.keys(handlers)) {
            const handler = handlers[type] as ((_: string, __: unknown) => unknown) | undefined
            if (typeof handler === 'function' && handler(args.Event, args.data)) {
                remove.push(type)
            }
        }
        for (const type of remove) {
            delete handlers[type]
        }
    }

    for (const eventMapName of EVENT_MAP_NAMES) {
        g[eventMapName] = {}
    }

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
