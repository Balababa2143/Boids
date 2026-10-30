/**
 * Shared recording state for the KD global stubs, kept apart so the installer
 * and the `kd-structured` stub reach one instance without an import cycle.
 */

export interface KDGlobals {
    ModelDefs: Record<string, Model>
    ModelLayers: Record<string, number>
    LAYERS_BASE: string[]
    KinkyDungeonRestraints: restraint[]
    KinkyDungeonRestraintsCache: Map<string, restraint>
    KDCategoriesStart: unknown[]
    KDPerkStart: Record<string, unknown>
    KinkyDungeonStatsPresets: Record<string, unknown>
    KinkyDungeonPlayerTags: Map<string, unknown>
    KDGameData: Record<string, unknown>
    KDGameDataBase: Record<string, unknown>
    /**
     * The save slot the game is pointed at, and the pre-slot save list the load path falls back to.
     */
    KDSaveSlot: number
    loadedsaveslots: unknown[]
    /** The mod wraps both at module evaluation, so these must behave like the game's originals. */
    KinkyDungeonGenerateSaveData: () => KinkyDungeonSave
    KinkyDungeonLoadGame: (_: string | KinkyDungeonSave, __?: boolean) => boolean
    KinkyDungeonFullInventory: () => unknown[]
    /** The game's synchronous save decode; identity in the harness. */
    DecompressB64: (_: string) => string
    localStorage: {
        getItem: (_: string) => string | null
        setItem: (_: string, __: string) => void
        removeItem: (_: string) => void
        clear: () => void
    }
    [extra: string]: unknown
}

export interface KDRecorder {
    /** The stub globals themselves, so the manifest can read registration results. */
    globals: KDGlobals

    textKeys: [string, string][]
    modTextKeys: [string, string][]

    /**
     * Every translation pin the sink writes, so the engine's
     * by-source map cannot rewrite a translated string.
     */
    translationPins: { Language: string, Tag: string, Value: string }[]

    initLayersArgs: string[][]

    getModelLayersCalls: Record<string, unknown>[]

    sentEvents: { Event: string, data: unknown }[]
    sentTextMessages: Record<string, unknown>[]
    equippedVariants: Record<string, unknown>[]
    morphs: Record<string, unknown>[]
    removals: Record<string, unknown>[]
    linkUnders: Record<string, unknown>[]
    advancedTime: number[]
    pixiLoads: Record<string, unknown>[]

    /**
     * Seeded to put a worn item in front of the mod's item-facing
     * code, which is how per-instance `data` is reached.
     */
    inventory: item[]

    /**
     * The restraints on the body, as `KinkyDungeonAllRestraintDynamic` flattens them.
     *
     * The control model reads capability from here, not from {@link inventory}.
     */
    worn: { item: item, host: item | null }[]

    /**
     * The variant registry, as the game serialises it.
     *
     * `KDRestraint` resolves an item through its `inventoryVariant` to its
     * template, so a stub that skipped that step would find no template.
     */
    restraintVariants: Record<string, KDRestraintVariant>

    decompressions: string[]

    loads: KinkyDungeonSave[]

    localStorageWrites: [string, string][]

    saveGenerations: number

    /**
     * The harness's own generator and loader;
     * `globalThis.KinkyDungeonLoadGame` is the mod's gate, not these.
     */
    originalLoadGame?: (_: string | KinkyDungeonSave, __?: boolean) => boolean
    originalGenerateSaveData?: () => KinkyDungeonSave

    /** The wrappers captured at install; a reinstall puts them back rather than replacing them. */
    modWrappers?: { GenerateSaveData?: unknown, LoadGame?: unknown }
}

const EmptyGlobals = (): KDGlobals =>
    ({} as unknown) as KDGlobals

export const CreateRecorder = (): KDRecorder => ({
    globals: EmptyGlobals(),
    textKeys: [],
    modTextKeys: [],
    translationPins: [],
    initLayersArgs: [],
    getModelLayersCalls: [],
    sentEvents: [],
    sentTextMessages: [],
    equippedVariants: [],
    morphs: [],
    removals: [],
    linkUnders: [],
    advancedTime: [],
    pixiLoads: [],
    inventory: [],
    worn: [],
    restraintVariants: {},
    decompressions: [],
    loads: [],
    localStorageWrites: [],
    saveGenerations: 0,
})

let current: KDRecorder | undefined

export const GetRecorder = (): KDRecorder => {
    if (current == null) {
        throw new Error(
            'KD global stubs are not installed. Is test/setup/install.ts still listed in test/run-all.ts?'
        )
    }
    return current
}

export const SetRecorder = (recorder: KDRecorder): void => {
    current = recorder
}

/** Clears the call logs while keeping the installed globals, for determinism checks. */
export const ResetRecorderLogs = (): void => {
    const recorder = GetRecorder()
    recorder.textKeys.length = 0
    recorder.modTextKeys.length = 0
    recorder.translationPins.length = 0
    recorder.initLayersArgs.length = 0
    recorder.getModelLayersCalls.length = 0
    recorder.sentEvents.length = 0
    recorder.sentTextMessages.length = 0
    recorder.equippedVariants.length = 0
    recorder.morphs.length = 0
    recorder.removals.length = 0
    recorder.linkUnders.length = 0
    recorder.advancedTime.length = 0
    recorder.pixiLoads.length = 0
    recorder.inventory.length = 0
    recorder.worn.length = 0
    for (const name of Object.keys(recorder.restraintVariants)) {
        delete recorder.restraintVariants[name]
    }
    recorder.decompressions.length = 0
    recorder.loads.length = 0
    recorder.localStorageWrites.length = 0
    recorder.saveGenerations = 0
}

/**
 * Empties the world a case builds while keeping the identity of everything the module graph holds.
 *
 * Unlike {@link ResetRecorderLogs} it also clears the restraint registries, and it keeps `globals`
 * and its `KDGameData` by reference so the mod's wrappers stay pointed at the same objects.
 */
export const ResetRecorderWorld = (): void => {
    const recorder = GetRecorder()
    ResetRecorderLogs()
    recorder.globals.KinkyDungeonRestraints.length = 0
    recorder.globals.KinkyDungeonRestraintsCache.clear()
    recorder.globals.KinkyDungeonPlayerTags.clear()
    for (const key of Object.keys(recorder.globals.KDGameData)) {
        delete recorder.globals.KDGameData[key]
    }
}
