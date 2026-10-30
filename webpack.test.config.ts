import * as path from 'node:path'
import type webpack from 'webpack'

import { testDir, testEntry, testOutputDir, testTsConfig } from './webpack/paths.ts'
import { resolveExtensions, typescriptRule } from './webpack/typescript.ts'

/**
 * Bundles the test suite for Node.
 *
 * Why webpack rather than a dedicated test runner: the mod is only runnable
 * inside the game, so tests have to import `src/**` with the KD globals stubbed.
 * The project's existing webpack + ts-loader pipeline already solves the hard
 * parts (TypeScript with `enum`/`namespace`, extensionless specifiers, JSON
 * modules, ESM interop) and needs no subprocesses — so the tests are compiled by
 * exactly the same toolchain as the mod itself, and the only added dependency is
 * `fast-check`.
 *
 * `kd-structured` is a runtime import-map module in production (a webpack
 * external in the main build); here it is aliased to the test stub.
 */

function Configurate(_env: Record<string, unknown>, argv: Record<string, unknown>): webpack.Configuration {
    return {
        mode: argv['mode'] === 'production' ? 'production' : 'development',
        target: 'node',
        entry: testEntry,
        output: {
            path: testOutputDir,
            filename: 'run.mjs',
            module: true,
            chunkFormat: 'module',
            clean: true,
        },
        experiments: {
            outputModule: true,
        },
        // Keep every node builtin (`node:test`, `node:assert`, `node:fs`, …) external.
        externalsPresets: {
            node: true,
        },
        module: {
            rules: [
                typescriptRule(testTsConfig),
            ],
        },
        resolve: {
            extensions: resolveExtensions,
            alias: {
                'kd-structured': path.join(testDir, 'stubs', 'kd-structured.ts'),
            },
        },
        devtool: false,
        stats: 'errors-warnings',
    }
}

export default Configurate
