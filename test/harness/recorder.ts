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

    /** Every `addTextKey(key, text)` call, in call order: the engine half of the text surface. */
    textKeys: [string, string][]

    /** Every mod-group `appendText(key, value)` call, in call order: the mod half. */
    modTextKeys: [string, string][]

    /**
     * Every translation pin the sink writes: the language, and the tag it pinned there.
     *
     * A pin exists so the engine's by-source translation map cannot rewrite a string the mod
     * already translated, so these are asserted rather than merely recorded.
     */
    translationPins: { Language: string, Tag: string, Value: string }[]

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

    /**
     * The restraints on the character's body, as `KinkyDungeonAllRestraintDynamic` flattens them.
     *
     * Separate from {@link inventory} because they answer different questions: the inventory is
     * everything the character holds and is where a **loose** item's instance data lives, while this
     * is what is **on the body** — which is what the control model computes capability from. A test
     * that seeded only the inventory and then asked what the equipment could do would be asking about
     * a character's luggage.
     */
    worn: { item: item, host: item | null }[]

    /**
     * The variant registry, as the game serialises it (`save.inventoryVariants`).
     *
     * It matters to the harness because **`KDRestraint` is variant-aware**: an item whose name is not
     * a registered restraint resolves through its `inventoryVariant` to the template the variant points
     * at (`restraint/KinkyDungeonRestraints.ts:272-275`). A stub that skipped that step would report
     * every generated variant as having no template at all, which is the opposite of what the game
     * does and would make membership look broken when it is not.
     */
    restraintVariants: Record<string, KDRestraintVariant>

    /** Every string handed to `DecompressB64`, so a test can see what the gate inspected. */
    decompressions: string[]

    /** The parsed saves the game's loader actually adopted, in call order. */
    loads: KinkyDungeonSave[]

    /** Every `localStorage.setItem`, so the mod's persisted keys are observable. */
    localStorageWrites: [string, string][]

    /** How many times the game's own save generator was reached through the mod's wrapper. */
    saveGenerations: number
    /**
     * The harness's own save generator and loader, kept so a test can reach past the mod's wrappers.
     *
     * The mod wraps both globals at module evaluation, so ``globalThis.KinkyDungeonLoadGame`` is the
     * mod's gate rather than the game's loader. A test that wants the loader itself — to see what the
     * gate forwarded to, or to drive a load without a gate — reads it here.
     */
    originalLoadGame?: (_: string | KinkyDungeonSave, __?: boolean) => boolean
    originalGenerateSaveData?: () => KinkyDungeonSave

    /**
     * Whatever the mod's wrappers were when the globals were last installed.
     *
     * Captured rather than only installed, because **the mod wraps them once**. A suite that
     * reinstalls the globals replaces both with the harness's own functions, and every later suite
     * would then be driving a loader with no gate on it — so the installer puts these back. See
     * `InstallKDGlobals`.
     */
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
 * Empties the **world** a case builds, while keeping the identity of everything the module graph
 * holds — which is what makes it usable from a suite that is not the first.
 *
 * It differs from {@link ResetRecorderLogs} in exactly one way that matters: it also clears the
 * **restraint registries**, because a case that pushes a template into them is building a world rather
 * than logging a call. It keeps `globals` and its `KDGameData` by reference, so the mod's wrappers, its
 * closure over the game data and the harness's own stubs all keep pointing at the same objects.
 *
 * See `test/harness/world.ts`, which is the front door for a suite that wants one.
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
