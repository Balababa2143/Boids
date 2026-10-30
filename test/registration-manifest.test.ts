/**
 * The registration surface gate: imports the mod with KD globals stubbed,
 * then compares counts and per-entry digests against the committed
 * summary. The summary is committed, so determinism is enforced.
 */

import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'
import * as path from 'node:path'
import { describe, it } from 'node:test'

import { InstallKDGlobals } from './harness/kd-globals'
import { AuditSkipReason, UpdateManifest } from './harness/flags'
import {
    BuildManifest,
    BuildSummary,
    CanonicalJson,
    Counts,
    DescribeDigestDiff,
    DigestManifest,
    type RegistrationManifest,
    type RegistrationSummary,
} from './harness/manifest'
import { ReadJsonAsync } from './harness/text'

const ManifestDir = path.resolve(process.cwd(), 'test/__manifest__')
/** The tracked summary: compared on every run, and small enough to review. */
const SummaryPath = path.resolve(ManifestDir, 'registration-summary.json')
/** The untracked record the audit writes, and compares against when one has been kept. */
const FullRecordPath = path.resolve(ManifestDir, 'registration-manifest.full.json')
/** The untracked candidate, written only when the summary disagrees with what was registered. */
const DiagnosticPath = path.resolve(ManifestDir, 'registration-manifest.next.json')

/**
 * `GameDataStateKey` from `Coordinator/Internal/StateStorage.ts`
 * — the randomised `Entry.ID` lives under it.
 */
const CoordinatorStateKey = '68C84945-3A9A-4024-8CC6-E3CE092E9154'

/**
 * uuid v7 encodes a Unix-millisecond timestamp in its leading 48 bits.
 *
 * A v7-shaped constant in the source decodes to when the author generated it, not
 * to this run, so only values near now are treated as generated during the run.
 */
const UuidV7Pattern = /[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[0-9a-f]{4}-[0-9a-f]{12}/gi

const UuidV7Timestamp = (uuid: string): number =>
    Number.parseInt(uuid.slice(0, 8) + uuid.slice(9, 13), 16)

/**
 * Values generated within this window before the test are treated as "generated during this run".
 */
const GeneratedDuringRunWindowMs = 60_000

const ReadSummary = async (): Promise<RegistrationSummary | undefined> => {
    try {
        return await ReadJsonAsync<RegistrationSummary>(SummaryPath)
    }
    catch {
        return undefined
    }
}

const WriteJson = async (filePath: string, value: unknown): Promise<void> => {
    await mkdir(ManifestDir, { recursive: true })
    await writeFile(filePath, CanonicalJson(value) + '\n', 'utf8')
}

/**
 * Which sections changed size, before the per-entry diff says which entries did.
 *
 * A digest that moved says only that something did,
 * while `restraints: 128 -> 127` says what to look for.
 */
const DescribeCountsDiff = (
    expected: Record<string, unknown>,
    actual: Record<string, unknown>
): string => {
    const show = (value: unknown) => value === undefined ? 'absent' : CanonicalJson(value)
    const sections = [...new Set([...Object.keys(expected), ...Object.keys(actual)])]
        .filter(section => show(expected[section]) !== show(actual[section]))

    return sections.length > 0
        ? sections.map(section => `  ${section}: ${show(expected[section])} -> ${show(actual[section])}`).join('\n')
        : '  (no section changed size)'
}

// Load the whole mod against freshly installed stubs,
// exactly once, through the entry the bundle ships.
InstallKDGlobals()
await import('../src/mod')

/**
 * Settles the deferred engine pass before the surface is recorded, so the recorded
 * surface does not depend on whether the engine's text happened to be available.
 */
;(globalThis as unknown as { KinkyDungeonSendEvent: (_: { Event: string, data: unknown }) => void })
    .KinkyDungeonSendEvent({ Event: 'afterLoadMods', data: {} })

const manifest = BuildManifest()
const committedSummary = await ReadSummary()

describe('registration manifest', () => {
    it('registers the expected order of magnitude', () => {
        // Guards against a broken harness producing a trivially
        // small manifest that would become the baseline.
        assert.ok(Object.keys(manifest.models).length > 100, `models: ${Object.keys(manifest.models).length}`)
        assert.ok(Object.keys(manifest.restraints).length > 100, `restraints: ${Object.keys(manifest.restraints).length}`)
        assert.ok(manifest.textKeys.length > 50, `textKeys: ${manifest.textKeys.length}`)
        assert.ok(manifest.modTextKeys.length > 10, `modTextKeys: ${manifest.modTextKeys.length}`)
        assert.ok(manifest.layersBase.length > 220, `layersBase: ${manifest.layersBase.length}`)
    })

    it('captures no value generated during this run', () => {
        const serialized = CanonicalJson(manifest)

        // The coordinator's save slot holds a uuid v7 `Entry.ID`; it must stay out.
        assert.ok(!serialized.includes(CoordinatorStateKey), 'the coordinator save slot leaked into the manifest')

        const generatedBefore = Date.now() - GeneratedDuringRunWindowMs
        const generatedNow = [...serialized.matchAll(UuidV7Pattern)]
            .map(match => match[0])
            .filter(uuid => UuidV7Timestamp(uuid) > generatedBefore)

        assert.deepEqual(
            generatedNow,
            [],
            'a uuid v7 generated during this run appeared in the manifest, so randomised state is being captured'
        )
    })

    it('treats line endings as the same content, in the comparison and in the digest', () => {
        // Which line ending a checkout materialised is not
        // content; this covers what the suite writes and hashes.
        const lf = { Text: 'first\nsecond', List: ['a\nb'] }
        const crlf = { Text: 'first\r\nsecond', List: ['a\r\nb'] }
        const loneCr = { Text: 'first\rsecond', List: ['a\rb'] }

        assert.equal(CanonicalJson(crlf), CanonicalJson(lf))
        assert.equal(CanonicalJson(loneCr), CanonicalJson(lf))

        // The digest is a comparison too, so it goes through the same definition of the same value.
        // The cast is for the sections this probe does not fill: `DigestManifest` reads the record
        // fields with `Object.entries`, and an absent section digests as the literal `'undefined'`.
        const digestOf = (textKeys: [string, string][]) =>
            DigestManifest({
                models: {},
                restraints: {},
                textKeys,
                eventHandlers: {},
                statsPresets: {},
            } as unknown as RegistrationManifest).textKeys

        assert.equal(digestOf([['TrapVibeProtoDesc', 'a\r\nb']]), digestOf([['TrapVibeProtoDesc', 'a\nb']]))
    })

    it('matches the committed summary', async () => {
        const summary = BuildSummary(manifest)

        if (UpdateManifest() || committedSummary == null) {
            await WriteJson(SummaryPath, summary)
            if (committedSummary == null) {
                assert.fail(
                    `Wrote a fresh summary to ${path.relative(process.cwd(), SummaryPath)}. ` +
                    'Review it, then re-run the suite.'
                )
            }
            return
        }

        if (CanonicalJson(summary) === CanonicalJson(committedSummary)) {
            return
        }

        await WriteJson(DiagnosticPath, manifest)

        assert.fail(
            'The registration surface changed.\n' +
            DescribeCountsDiff(committedSummary.counts, summary.counts) + '\n' +
            DescribeDigestDiff(committedSummary.digests, summary.digests) + '\n\n' +
            `The full record is written to ${path.basename(DiagnosticPath)} for review.\n` +
            'If the change is intended, run `npm run test:update-manifest` and commit the summary alongside it.'
        )
    })

    it(
        'agrees with the kept full record, or writes it when none is kept',
        { skip: AuditSkipReason('The full registration record') },
        async () => {
            // Opt-in byte-level check; the full record is not tracked.
            const kept = await ReadJsonAsync<RegistrationManifest>(FullRecordPath).catch(() => undefined)
            if (kept == null) {
                await WriteJson(FullRecordPath, manifest)
                return
            }

            if (CanonicalJson(kept) === CanonicalJson(manifest)) {
                return
            }

            await WriteJson(DiagnosticPath, manifest)
            assert.fail(
                `The registration record differs from the kept copy at ${path.basename(FullRecordPath)}.\n` +
                DescribeCountsDiff(
                    Counts(kept),
                    Counts(manifest)
                ) + '\n' +
                DescribeDigestDiff(DigestManifest(kept), DigestManifest(manifest)) + '\n\n' +
                `The candidate is written to ${path.basename(DiagnosticPath)}. A refactor that meant to ` +
                'preserve behaviour has changed it; a change that meant to alter the surface should be ' +
                `reviewed and the kept copy replaced with ${path.basename(DiagnosticPath)}.`
            )
        }
    )
})
