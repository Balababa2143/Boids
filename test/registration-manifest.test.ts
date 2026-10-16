/**
 * The equivalence gate.
 *
 * Imports the mod's entry module (the same graph the webpack bundle uses) with
 * KD globals stubbed, then compares the resulting registration manifest against
 * the committed baseline in `test/__manifest__/registration-manifest.json`.
 *
 * Contract for refactors:
 *   - dead-code removal and duplication extraction must leave the baseline
 *     byte-identical, and
 *   - a defect fix may change it, but only with a reviewed, minimal diff.
 *
 * Because the baseline is committed, determinism is enforced *across runs*: a
 * nondeterministic registration would fail this test the next time it runs.
 * Nothing randomised may be captured — see the exclusion test below.
 *
 * Regenerate deliberately with `UPDATE_REGISTRATION_MANIFEST=1 npm test`.
 */

import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'
import * as path from 'node:path'
import { describe, it } from 'node:test'

import { InstallKDGlobals } from './harness/kd-globals'
import {
    BuildManifest,
    CanonicalJson,
    DescribeDigestDiff,
    DigestManifest,
    type RegistrationManifest,
} from './harness/manifest'
import { ReadJsonAsync } from './harness/text'

const ManifestDir = path.resolve(process.cwd(), 'test/__manifest__')
const BaselinePath = path.resolve(ManifestDir, 'registration-manifest.json')
const DiagnosticPath = path.resolve(ManifestDir, 'registration-manifest.next.json')

/** `GameDataStateKey` from `Coordinator/Internal/StateStorage.ts` — the randomised `Entry.ID` lives under it. */
const CoordinatorStateKey = '68C84945-3A9A-4024-8CC6-E3CE092E9154'

/**
 * uuid v7 encodes a Unix-millisecond timestamp in its leading 48 bits, so a v7
 * string that decodes to roughly "now" was generated during this run. Static
 * v7-shaped constants in the source (for example the glass layer `Name`) decode
 * to whenever the author generated them and are therefore ignored.
 */
const UuidV7Pattern = /[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[0-9a-f]{4}-[0-9a-f]{12}/gi

const UuidV7Timestamp = (uuid: string): number =>
    Number.parseInt(uuid.slice(0, 8) + uuid.slice(9, 13), 16)

/** Values generated within this window before the test are treated as "generated during this run". */
const GeneratedDuringRunWindowMs = 60_000

const ShouldUpdate = process.env.UPDATE_REGISTRATION_MANIFEST === '1'

const ReadBaseline = async (): Promise<RegistrationManifest | undefined> => {
    try {
        return await ReadJsonAsync<RegistrationManifest>(BaselinePath)
    }
    catch {
        return undefined
    }
}

const WriteManifest = async (filePath: string, value: RegistrationManifest): Promise<void> => {
    await mkdir(ManifestDir, { recursive: true })
    await writeFile(filePath, CanonicalJson(value) + '\n', 'utf8')
}

// Load the whole mod against freshly installed stubs, exactly once, through the
// same entry the bundle ships.
InstallKDGlobals()
await import('../src/mod')

/**
 * Settle the deferred engine pass before the surface is recorded.
 *
 * A text slot whose only source is the engine's own text is normally read while the mod loads,
 * because the engine fetches its text long before any mod runs; the flush exists for the case
 * where that has not happened yet. Sending it here makes the recorded surface the settled one
 * either way, so what this file pins does not depend on whether the engine's text happened to
 * be available — and with the harness's base-game fixture it is, which makes this a no-op today
 * and a guard tomorrow.
 */
;(globalThis as unknown as { KinkyDungeonSendEvent: (_: { Event: string, data: unknown }) => void })
    .KinkyDungeonSendEvent({ Event: 'afterLoadMods', data: {} })

const manifest = BuildManifest()
const baseline = await ReadBaseline()

describe('registration manifest', () => {
    it('registers the expected order of magnitude', () => {
        // Guards against a broken harness producing a trivially small manifest
        // that would then silently become the baseline on regeneration.
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
        // Which line ending a checkout materialised is not content: this repository stores LF in the
        // index and checks it out as CRLF on Windows, so a value carrying one has to compare and
        // digest the same as the other. `harness/text` normalises what the suite *reads*; this is the
        // half that covers what it writes and hashes, and it is one function rather than a rule the
        // call sites have to remember.
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

    it('matches the committed baseline', async () => {
        if (ShouldUpdate || baseline == null) {
            await WriteManifest(BaselinePath, manifest)
            if (baseline == null) {
                assert.fail(
                    'Wrote a fresh baseline to test/__manifest__/registration-manifest.json. ' +
                    'Review it, then re-run the suite.'
                )
            }
            return
        }

        if (CanonicalJson(manifest) === CanonicalJson(baseline)) {
            return
        }

        await WriteManifest(DiagnosticPath, manifest)

        assert.fail(
            'Registration manifest changed.\n' +
            DescribeDigestDiff(DigestManifest(baseline), DigestManifest(manifest)) + '\n\n' +
            'Full new manifest written to test/__manifest__/registration-manifest.next.json for review.\n' +
            'If the change is intended, re-run with UPDATE_REGISTRATION_MANIFEST=1 and commit the baseline alongside it.'
        )
    })
})
