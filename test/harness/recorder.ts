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
}
