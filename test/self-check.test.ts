/**
 * Guards the suite's own wiring, and the two rules a test file cannot be trusted to remember.
 *
 * - **A new `*.test.ts` has to be listed in `test/run-all.ts`.** The aggregator is explicit, so a
 *   suite nobody imports would be silently skipped and the run would still report a pass.
 * - **File text is read through `harness/text`.** A comparison against raw file bytes passes on the
 *   machine that has just written the file and fails on the next one, because the index stores LF
 *   while a Windows checkout materialises CRLF. That is how the generated text reference shipped
 *   broken, and the second rule below is why it cannot happen again.
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
 * The `[ ]*` rather than `\s*` is not cosmetic: it keeps this pattern from matching **its own
 * source text**, which sits in this file and would otherwise make the gate report itself. A bare
 * `\(` after the name has that effect, because the pattern's own literal puts a `(` there.
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
