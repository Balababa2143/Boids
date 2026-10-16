/**
 * Shared recording state for the KD global stubs.
 *
 * Lives in its own module so that both `test/harness/kd-globals.ts` (which
 * installs the stubs) and `test/stubs/kd-structured.ts` (which records calls
 * made through the aliased external) can reach the same instance without an
 * import cycle.
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
     * The save slot the game is pointed at, and the pre-slot save list the load path falls
     * back to. Both are read by the mod's load gate, so both have to exist before the
     * module graph is evaluated.
     */
    KDSaveSlot: number
    loadedsaveslots: unknown[]
    /**
     * The game's save generator and loader. The mod **wraps both** at module evaluation, so
     * these entries are the originals it captures, and they have to behave like the game's
     * own for the wrappers to be exercised rather than replaced.
     */
    KinkyDungeonGenerateSaveData: () => KinkyDungeonSave
    KinkyDungeonLoadGame: (_: string | KinkyDungeonSave, __?: boolean) => boolean
    /** Flattens the character's inventory to the objects themselves, as the game does. */
    KinkyDungeonFullInventory: () => unknown[]
    /** The game's synchronous save decode; identity in the harness. */
    DecompressB64: (_: string) => string
    /** The four-member `localStorage` surface the game and the mod use. */
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

    /** Every `addTextKey(key, text)` call, in call order. */
    textKeys: [string, string][]

    /** Every `InitLayers(layers)` argument, in call order. */
    initLayersArgs: string[][]

    /** Every `GetModelLayers(args)` call made through the `kd-structured` stub. */
    getModelLayersCalls: Record<string, unknown>[]

    /** Calls the mod makes into the game, captured so behaviour changes surface. */
    sentEvents: { Event: string, data: unknown }[]
    sentTextMessages: Record<string, unknown>[]
    equippedVariants: Record<string, unknown>[]
    morphs: Record<string, unknown>[]
    removals: Record<string, unknown>[]
    linkUnders: Record<string, unknown>[]
    advancedTime: number[]
    pixiLoads: Record<string, unknown>[]

    /**
     * The character's inventory, as `KinkyDungeonFullInventory` flattens it. Tests seed it
     * to put a worn item in front of the mod's item-facing code, which is the only way to
     * reach per-instance `data` without a real game.
     */
    inventory: item[]

    /** Every string handed to `DecompressB64`, so a test can see what the gate inspected. */
    decompressions: string[]

    /** The parsed saves the game's loader actually adopted, in call order. */
    loads: KinkyDungeonSave[]

    /** Every `localStorage.setItem`, so the mod's persisted keys are observable. */
    localStorageWrites: [string, string][]

    /** How many times the game's own save generator was reached through the mod's wrapper. */
    saveGenerations: number
}

const EmptyGlobals = (): KDGlobals =>
    ({} as unknown) as KDGlobals

export const CreateRecorder = (): KDRecorder => ({
    globals: EmptyGlobals(),
    textKeys: [],
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
    decompressions: [],
    loads: [],
    localStorageWrites: [],
    saveGenerations: 0,
})

let current: KDRecorder | undefined

export const GetRecorder = (): KDRecorder => {
    if (current == null) {
        throw new Error(
            'KD global stubs are not installed. Is test/setup/install.ts still listed in vitest.config.ts setupFiles?'
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
    recorder.decompressions.length = 0
    recorder.loads.length = 0
    recorder.localStorageWrites.length = 0
    recorder.saveGenerations = 0
}
