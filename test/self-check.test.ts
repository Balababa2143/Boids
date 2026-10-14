/**
 * Guards the test entry point: because `test/run-all.ts` lists suites
 * explicitly, a new `*.test.ts` that nobody added there would be silently
 * skipped. This makes that omission fail loudly instead.
 */

import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import * as path from 'node:path'
import { describe, it } from 'node:test'

const RepoRoot = process.cwd()
const TestDir = path.resolve(RepoRoot, 'test')
const Aggregator = path.resolve(TestDir, 'run-all.ts')

describe('test suite wiring', () => {
    it('runs from the repository root', () => {
        assert.ok(
            path.resolve(RepoRoot, 'package.json').startsWith(RepoRoot),
            'expected tests to be run from the repository root'
        )
        assert.ok(
            readFileSync(path.resolve(RepoRoot, 'package.json'), 'utf8').includes('"name": "boids"'),
            `expected ${RepoRoot} to be the Boids repository root`
        )
    })

    it('lists every test file in run-all.ts', () => {
        const aggregatorSource = readFileSync(Aggregator, 'utf8')

        const testFiles = readdirSync(TestDir, { recursive: true, encoding: 'utf8' })
            .map(entry => entry.replaceAll('\\', '/'))
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
})
