/**
 * Guards the suite's own wiring: every `*.test.ts` is listed in `run-all.ts`, and file
 * text is read through `harness/text` so a comparison does not depend on line endings.
 */

import assert from 'node:assert/strict'
import { readdirSync } from 'node:fs'
import * as path from 'node:path'
import { describe, it } from 'node:test'

import { ReadText } from './harness/text'

const RepoRoot = process.cwd()
const TestDir = path.resolve(RepoRoot, 'test')
const Aggregator = path.resolve(TestDir, 'run-all.ts')

/** The one file allowed to read a file itself; every other read goes through it. */
const Reader = 'harness/text.ts'

/**
 * A call to `readFile` or `readFileSync`.
 *
 * `[ ]*` rather than `\s*` keeps the pattern from matching its own source text.
 */
const ReadCall = /\breadFile(?:Sync)?[ ]*\(/

/** Every `.ts` file under `test/`, relative to `test/` and with forward slashes. */
const TestFiles = (): string[] =>
    readdirSync(TestDir, { recursive: true, encoding: 'utf8' })
        .map(entry => entry.replaceAll('\\', '/'))
        .filter(entry => entry.endsWith('.ts'))

describe('test suite wiring', () => {
    it('runs from the repository root', () => {
        assert.ok(
            path.resolve(RepoRoot, 'package.json').startsWith(RepoRoot),
            'expected tests to be run from the repository root'
        )
        assert.ok(
            ReadText(path.resolve(RepoRoot, 'package.json')).includes('"name": "boids"'),
            `expected ${RepoRoot} to be the Boids repository root`
        )
    })

    it('lists every test file in run-all.ts', () => {
        const aggregatorSource = ReadText(Aggregator)

        const testFiles = TestFiles()
            .filter(entry => entry.endsWith('.test.ts'))
            .map(entry => `./${entry.replace(/\.ts$/, '')}`)

        assert.ok(testFiles.length > 0, 'expected to find at least one *.test.ts file')

        const missing = testFiles.filter(specifier => !aggregatorSource.includes(specifier))
        assert.deepEqual(
            missing,
            [],
            `these test files are not imported by test/run-all.ts and would never run: ${missing.join(', ')}`
        )
    })

    it('reads file text only through the harness reader', () => {
        const offenders = TestFiles()
            .filter(file => file !== Reader)
            .filter(file => ReadCall.test(ReadText(path.resolve(TestDir, file))))

        assert.deepEqual(
            offenders,
            [],
            'these files read a file themselves, so what they compare depends on the line endings ' +
            "the platform checked out: read through './harness/text' instead -- " + offenders.join(', ')
        )
    })
})
