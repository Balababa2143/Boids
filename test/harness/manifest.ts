/**
 * Builds the registration manifest: a canonical, deterministic record of everything the mod
 * registers into the game at load time.
 *
 * ## Two tiers, because the refactors are over
 *
 * Phase 0 and 0.5 built this to prove that a large rearrangement changed nothing: a
 * behaviour-preserving refactor had to leave it **byte-identical**, and that is how the
 * reorganization and the text surface were shown to be neutral. Those refactors are done, and from
 * here every registration change is *meant* — so the full record is no longer what the suite
 * compares, and keeping it as the gate would tax every content commit with a 16,000-line diff.
 *
 *   - `test/__manifest__/registration-summary.json` is compared on every run: per-section
 *     **counts** plus {@link DigestManifest}'s per-entry **digests**. That still catches a dropped
 *     model, a renamed restraint, or a payload that moved under an existing name, and it names the
 *     entry — in a few hundred lines instead of sixteen thousand.
 *   - The **full record** is written on demand, by `npm run test:audit`, and on a summary mismatch
 *     to the ignored `registration-manifest.full.json`. It is for reading and diffing, not for
 *     gating: a dump everyone regenerates without reading is worse than no gate at all.
 *
 * Object key order is deliberately preserved (never sorted) because insertion order *is*
 * observable behaviour here: it is the order the game sees models, restraints, text keys and event
 * handlers in.
 */

import { createHash } from 'node:crypto'
import { GetRecorder, type KDRecorder } from './recorder'
import { NormalizeEol } from './text'

export interface RegistrationManifest {
    models: Record<string, unknown>
    restraints: Record<string, unknown>
    /** The engine half: keys the engine looks up for itself, registered in `default`. */
    textKeys: [string, string][]
    /** The mod half: keys the mod resolves and the engine only displays. */
    modTextKeys: [string, string][]
    eventHandlers: Record<string, Record<string, string[]>>
    restraintsCacheKeys: string[]
    categoriesStart: unknown[]
    startPerkNames: string[]
    statsPresets: Record<string, unknown>
    layersBase: string[]
    modelLayers: Record<string, number>
    initLayersArgs: string[][]
    getModelLayersCalls: Record<string, unknown>[]
    pixiLoads: unknown[]
}

/** The 12 KD event maps the manifest inspects, matching `KDEventMap`. */
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

/** Handler values are functions; only the `trigger -> type` shape is observable data. */
const ReadEventHandlers = (): Record<string, Record<string, string[]>> => {
    const g = globalThis as unknown as Record<string, Record<string, Record<string, unknown>> | undefined>
    const result: Record<string, Record<string, string[]>> = {}
    for (const eventMapName of EVENT_MAP_NAMES) {
        const eventMap = g[eventMapName]
        if (eventMap == null) {
            continue
        }
        const triggers: Record<string, string[]> = {}
        for (const trigger of Object.keys(eventMap)) {
            triggers[trigger] = Object.keys(eventMap[trigger] ?? {})
        }
        if (Object.keys(triggers).length > 0) {
            result[eventMapName] = triggers
        }
    }
    return result
}

/** Restraints indexed by `name`, preserving registration order. */
const IndexByName = (items: readonly { name?: string }[]): Record<string, unknown> =>
    Object.fromEntries(items.map(item => [String(item.name), item]))

export const BuildManifest = (recorder: KDRecorder = GetRecorder()): RegistrationManifest => {
    const globals = recorder.globals
    return {
        models: { ...globals.ModelDefs },
        restraints: IndexByName(globals.KinkyDungeonRestraints),
        textKeys: recorder.textKeys.map(([key, text]) => [key, text] as [string, string]),
        modTextKeys: recorder.modTextKeys.map(([key, text]) => [key, text] as [string, string]),
        eventHandlers: ReadEventHandlers(),
        restraintsCacheKeys: [...globals.KinkyDungeonRestraintsCache.keys()],
        categoriesStart: [...globals.KDCategoriesStart],
        startPerkNames: Object.keys(globals.KDPerkStart),
        statsPresets: { ...globals.KinkyDungeonStatsPresets },
        layersBase: [...globals.LAYERS_BASE],
        modelLayers: { ...globals.ModelLayers },
        initLayersArgs: recorder.initLayersArgs.map(args => [...args]),
        getModelLayersCalls: recorder.getModelLayersCalls.map(call => ({ ...call })),
        pixiLoads: [...recorder.pixiLoads],
    }
}

/**
 * {@link NormalizeEol} through arrays and plain objects, leaving everything else alone.
 *
 * Only the shapes a manifest is built from are walked. A `Map` or a class instance would serialise
 * to `{}` under `JSON.stringify` anyway, so there is nothing inside one to normalise.
 */
const NormalizeEolDeep = (value: unknown): unknown => {
    if (typeof value === 'string') {
        return NormalizeEol(value)
    }
    if (Array.isArray(value)) {
        return value.map(NormalizeEolDeep)
    }
    if (value != null && typeof value === 'object') {
        return Object.fromEntries(
            Object.entries(value).map(([key, entry]) => [key, NormalizeEolDeep(entry)])
        )
    }
    return value
}

/**
 * The canonical text of anything a manifest can hold: what the summary is *written* as, what it is
 * *compared* as, and what every digest is taken over.
 *
 * It normalises line endings on the way through, so two values that differ only by CRLF are the same
 * value here. That is what makes this comparison and every hash in {@link DigestManifest} independent
 * of the platform that checked the file out — and doing it **inside the serializer** rather than at
 * the call sites is the point: a hash is a comparison, so there is one definition of "the same
 * content" and no call site to forget.
 */
export const CanonicalJson = (value: unknown): string => JSON.stringify(NormalizeEolDeep(value), null, 2)

/**
 * A stable digest of anything the manifest can hold.
 *
 * Truncated to 16 hex characters — 64 bits — because the job is to tell two registrations apart,
 * not to resist an adversary: a collision would have to happen between two versions of the same
 * section, and a shorter line keeps a 300-entry baseline readable and cheap to commit.
 *
 * The `?? 'undefined'` is for the first run after a section is *added*: the committed summary
 * has no such key, and a crash while describing the difference would hide the difference. A
 * missing section then reads as a changed digest, which is what a reviewer needs to see.
 */
const Sha256 = (value: unknown): string =>
    createHash('sha256').update(CanonicalJson(value) ?? 'undefined').digest('hex').slice(0, 16)

/**
 * How many entries each section holds.
 *
 * Redundant with the digests for *detection* — a count change moves its section's digest — and kept
 * anyway, because a count is the part of a mismatch a reader can act on first: `restraints: 128 ->
 * 127` says what to look for before the per-entry diff says which entry it was.
 *
 * `eventHandlers` counts handler types per trigger and keeps a trigger at `0` rather than omitting
 * it, so the shape does not shift when a handler is removed.
 */
export const Counts = (manifest: RegistrationManifest): Record<string, unknown> => ({
    models: Object.keys(manifest.models).length,
    restraints: Object.keys(manifest.restraints).length,
    textKeys: manifest.textKeys.length,
    modTextKeys: manifest.modTextKeys.length,
    eventHandlers: Object.fromEntries(
        Object.entries(manifest.eventHandlers).map(([eventMap, triggers]) => [
            eventMap,
            Object.fromEntries(
                Object.entries(triggers).map(([trigger, types]) => [trigger, types.length])
            ),
        ])
    ),
    restraintsCacheKeys: manifest.restraintsCacheKeys.length,
    categoriesStart: manifest.categoriesStart.length,
    startPerkNames: manifest.startPerkNames.length,
    statsPresets: Object.keys(manifest.statsPresets).length,
    layersBase: manifest.layersBase.length,
    modelLayers: Object.keys(manifest.modelLayers).length,
    initLayersArgs: manifest.initLayersArgs.length,
    getModelLayersCalls: manifest.getModelLayersCalls.length,
    pixiLoads: manifest.pixiLoads.length,
})

/** The tracked summary: how much the surface holds, and a digest of each part of it. */
export interface RegistrationSummary {
    counts: Record<string, unknown>
    digests: Record<string, unknown>
}

export const BuildSummary = (manifest: RegistrationManifest): RegistrationSummary => ({
    counts: Counts(manifest),
    digests: DigestManifest(manifest),
})

/** Per-section, per-entry digests: compact, and precise about what changed. */
export const DigestManifest = (manifest: RegistrationManifest): Record<string, unknown> => {
    const digestRecord = (record: Record<string, unknown>) =>
        Object.fromEntries(Object.entries(record).map(([key, value]) => [key, Sha256(value)]))

    return {
        models: digestRecord(manifest.models),
        restraints: digestRecord(manifest.restraints),
        textKeys: Sha256(manifest.textKeys),
        modTextKeys: Sha256(manifest.modTextKeys),
        eventHandlers: digestRecord(manifest.eventHandlers as unknown as Record<string, unknown>),
        restraintsCacheKeys: Sha256(manifest.restraintsCacheKeys),
        categoriesStart: Sha256(manifest.categoriesStart),
        startPerkNames: Sha256(manifest.startPerkNames),
        statsPresets: digestRecord(manifest.statsPresets),
        layersBase: Sha256(manifest.layersBase),
        modelLayers: Sha256(manifest.modelLayers),
        initLayersArgs: Sha256(manifest.initLayersArgs),
        getModelLayersCalls: Sha256(manifest.getModelLayersCalls),
        pixiLoads: Sha256(manifest.pixiLoads),
    }
}

/** Human-readable, bounded description of what differs between two digests. */
export const DescribeDigestDiff = (
    expected: Record<string, unknown>,
    actual: Record<string, unknown>
): string => {
    const lines: string[] = []
    const allSections = [...new Set([...Object.keys(expected), ...Object.keys(actual)])]

    for (const section of allSections) {
        const expectedValue = expected[section]
        const actualValue = actual[section]

        if (typeof expectedValue === 'string' || typeof actualValue === 'string') {
            if (expectedValue !== actualValue) {
                lines.push(`  ${section}: changed`)
            }
            continue
        }

        const expectedEntries = (expectedValue ?? {}) as Record<string, unknown>
        const actualEntries = (actualValue ?? {}) as Record<string, unknown>
        const added = Object.keys(actualEntries).filter(key => !(key in expectedEntries))
        const removed = Object.keys(expectedEntries).filter(key => !(key in actualEntries))
        const changed = Object.keys(expectedEntries).filter(
            key => key in actualEntries && expectedEntries[key] !== actualEntries[key]
        )

        const describe = (label: string, keys: string[]) => {
            if (keys.length === 0) {
                return
            }
            const shown = keys.slice(0, 5)
            const suffix = keys.length > shown.length ? `, … +${keys.length - shown.length} more` : ''
            lines.push(`  ${section} ${label} (${keys.length}): ${shown.join(', ')}${suffix}`)
        }

        describe('added', added)
        describe('removed', removed)
        describe('changed', changed)
    }

    return lines.length > 0 ? lines.join('\n') : '  (no per-entry differences; overall order or scalar section changed)'
}
