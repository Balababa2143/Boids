/**
 * Builds the registration manifest: a canonical, deterministic record of
 * everything the mod registers into the game at load time.
 *
 * The manifest is compared against a committed artifact
 * (`test/__manifest__/registration-manifest.json`) by
 * `test/registration-manifest.test.ts`. The contract is:
 *
 *   - dead-code removal and duplication-extraction commits must leave it
 *     byte-identical, and
 *   - commits that fix a defect must show a reviewed, minimal diff.
 *
 * Object key order is deliberately preserved (never sorted) because insertion
 * order *is* observable behaviour here: it is the order the game sees models,
 * restraints, text keys and event handlers in.
 */

import { createHash } from 'node:crypto'
import { GetRecorder, type KDRecorder } from './recorder'

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

export const CanonicalJson = (value: unknown): string => JSON.stringify(value, null, 2)

/**
 * A stable digest of anything the manifest can hold.
 *
 * The `?? 'undefined'` is for the first run after a section is *added*: the committed baseline
 * has no such key, and a crash while describing the difference would hide the difference. A
 * missing section then reads as a changed digest, which is what a reviewer needs to see.
 */
const Sha256 = (value: unknown): string =>
    createHash('sha256').update(CanonicalJson(value) ?? 'undefined').digest('hex')

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
