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
 * A `localStorage` stand-in backed by a `Map`, so a test can set the game's save keys the
 * way a player's browser would and read back what the mod wrote.
 *
 * It answers only the four members the game and the mod use — `getItem`, `setItem`,
 * `removeItem`, `clear` — and deliberately keeps the real signature shapes: `getItem`
 * returns `null` for a missing key, because the load path tests for that explicitly.
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
 * Reads whatever a test handed `KinkyDungeonLoadGame`: a save object as it stands, or a
 * string decoded the way the game decodes one.
 *
 * **No encoding step of its own.** The game's decode is LZString over base64, and the
 * harness stubs it as the identity — so a test writes an ordinary JSON string and the mod
 * reads that same string back. Making this function transform the text instead would mean
 * a test's save only round-trips through *this* function's idea of an encoding, which is
 * exactly how a test comes to compare a string nobody else uses.
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
 * The game clears this on a new game and re-reads it from the save on load; the harness is one
 * long-lived process, so without this a test would observe whatever an earlier test's load left
 * behind. That is not a hypothetical: it is how "a save with no coordinator state leaves the live
 * state alone" came to fail against a key an earlier case had written.
 *
 * It empties rather than replaces, because the mod's wrappers and the harness's loader all hold
 * this object by reference — a replacement would leave them writing to an object nobody reads.
 */
export const ResetGameData = (): Record<string, unknown> => {
    const gameData = HarnessGameData()
    for (const key of Object.keys(gameData)) {
        delete gameData[key]
    }
    return gameData
}

/**
 * A DOM stand-in is not installed here: the prompt tests own that, in
 * `test/harness/fake-dom.ts`, because the mod's dialogs are the only thing that needs one.
 */

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
        KDSaveSlot: 1,
        loadedsaveslots: [],
        /**
         * Both of these are the game's own functions, and the mod **wraps both** at module
         * evaluation. They are placeholders here and are installed for real below the
         * `Object.assign`, because the loader has to dispatch an event on a bus that does
         * not exist yet at this point in the installation.
         */
        KinkyDungeonGenerateSaveData: undefined as never,
        KinkyDungeonLoadGame: undefined as never,
        KinkyDungeonFullInventory: () => [...recorder.inventory],
        /**
         * The game's save decode. **The identity, deliberately.**
         *
         * A faithful stub would run LZString, which is a detail the harness does not need to
         * carry: what matters is that the mod decodes the string it was handed and reads the
         * result, and an identity makes that observable — `recorder.decompressions` holds
         * exactly what the gate looked at. A stub that *also* transformed the text would
         * make a test's save encoding depend on the stub's implementation, which is how the
         * first draft of these tests came to compare the wrong string.
         */
        DecompressB64: (str: string) => {
            recorder.decompressions.push(str)
            return str
        },
        localStorage: CreateLocalStorageStub(recorder),
    }
    recorder.globals = globals

    Object.assign(g, globals)

    /**
     * The game's loader. It is the seam under test rather than a stub to bypass: the mod
     * **wraps it** at module evaluation, so this original has to behave the way the game's
     * does — adopt `KDGameData` and then dispatch `afterLoadGame` — or the round-trip test
     * would only be restating the wrapper.
     *
     * It accepts a **string or a parsed save** so a test can drive a load without encoding
     * a save the way the game does; a string is decoded through the `DecompressB64` stub.
     *
     * @returns The game's own contract: whether a save was adopted.
     */
    const LoadForGame = (source: string | KinkyDungeonSave, kdloadconsent: boolean = false): boolean => {
        const saveData = ReadSaveForLoad(source)
        if (saveData == null || saveData.KDGameData == null) {
            return false
        }
        // The game's own adoption, matching `KDGameData = Object.assign({}, saveData.KDGameData)`.
        Object.assign(globals.KDGameData, JSON.parse(JSON.stringify(saveData.KDGameData)))
        recorder.loads.push(saveData)
        // The game's own signature, and the same entry point the `kd-structured` stub
        // records through, so tests observe bus traffic in one place.
        ;(g.KinkyDungeonSendEvent as ((args: { Event: string, data: unknown }) => void))({ Event: 'afterLoadGame', data: {} })
        void kdloadconsent
        return true
    }

    /**
     * The game's save generator. The mod wraps this and writes into `KDGameData` before
     * calling through, so the original's job is to hand back that very object — which is
     * what makes the stop on the way out observable at all.
     */
    const GenerateSaveData = () => {
        recorder.saveGenerations++
        return { KDGameData: globals.KDGameData } as unknown as KinkyDungeonSave
    }

    g.KinkyDungeonLoadGame = LoadForGame
    g.KinkyDungeonGenerateSaveData = GenerateSaveData
    globals.KinkyDungeonLoadGame = LoadForGame
    globals.KinkyDungeonGenerateSaveData = GenerateSaveData

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

    /**
     * The game's own text lookup, which is what the mod's `TextGet` calls.
     *
     * A registered key resolves to the text the mod registered, so a test asserting on a
     * message the mod wrote reads the same string a player would. An unregistered key
     * resolves to its own tag, which is the game's own fallback — and makes a missing
     * registration visible in a failure message instead of showing up as blank text.
     *
     * `TextProvider` above keeps its `<text:…>` shape on purpose: it is the harness's own
     * marker for "the mod asked the text provider for a key", and the existing tests rely on
     * that marker rather than on the text.
     */
    const TextFor = (tag: string) => recorder.textKeys.find(([key]) => key === tag)?.[1] ?? tag

    g.TextGet = (tag: string) => TextFor(tag)

    // --- Game effects the mod invokes -------------------------------------------

    g.KinkyDungeonAdvanceTime = (amount: number) => {
        recorder.advancedTime.push(amount)
    }
    g.KDSoundEnabled = () => true
    g.AudioPlayInstantSoundKD = () => true
    g.KinkyDungeonRootDirectory = 'KinkyDungeon/'

    /**
     * The game's status-line message, the only channel the load gate has for telling the
     * player what it decided. Recorded rather than ignored, because a refusal that says
     * nothing is indistinguishable from a bug.
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

    /**
     * The palette constants the mod's UI reads. They are values the game sets, so the harness
     * supplies plain colours rather than inventing a palette: nothing in the mod branches on
     * them, and a test asserting on a specific hex would be asserting on the base game.
     */
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
     * The character's inventory, as the game flattens it: `KinkyDungeonFullInventory`
     * walks every inventory category and returns the objects themselves. The coordinator's
     * integrity check reads this to reach the worn items — the definitions in
     * `KinkyDungeonRestraints` carry no per-instance data — so the stub has to hand back
     * real objects rather than templates.
     */
    g.KinkyDungeonFullInventory = () => [...recorder.inventory]

    /** The game's synchronous base64/LZString decode; identity here, so a test can own both ends. */
    g.DecompressB64 = (str: string) => {
        recorder.decompressions.push(str)
        return str
    }

    /**
     * The game's event bus, as the mod sees it.
     *
     * **It dispatches, and that is not incidental.** The mod registers its load-time work as
     * `afterLoadGame` handlers — the save round-trip, the migration steps, the integrity check —
     * and a stub that only recorded sends would leave all of it unreachable in tests: a migration
     * could be collected by the gate and never run, and the suite would report a pass.
     *
     * The dispatch matches the game's own generic handler
     * (`effect/KinkyDungeonEvents.ts:13878-13884`): every handler under `KDEventMapGeneric[Event]`
     * is called with `(Event, data)`, and a handler that returns true is removed afterwards —
     * which is the game's one-shot listener convention, kept here so a handler that removes
     * itself behaves the same way in a test.
     */
    g.KinkyDungeonSendEvent = (args: { Event: string, data: unknown }) => {
        recorder.sentEvents.push({ Event: args.Event, data: args.data })

        // Read off `globalThis`, which is where `AddEventHandler` and the mod's own reads both
        // resolve. `recorder.globals` is a *copy* made at installation, so it holds the values the
        // harness installed and never sees a handler or a model the mod registered afterwards —
        // which is exactly the set this dispatch is looking for.
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
