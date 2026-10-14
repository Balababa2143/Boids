import * as path from 'path'
import webpack from 'webpack'

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
 * `kd-structured` is a runtime import-map module in production (webpack
 * `externals` on the main build); here it is aliased to the test stub.
 */

const TestEntry = 'test/run-all.ts'
const TestOutputDir = '.fake/test'
const TestTsConfig = 'tsconfig.webpack-test.json'

function Configurate(): webpack.Configuration {
    return {
        mode: 'development',
        target: 'node',
        entry: path.resolve(TestEntry),
        output: {
            path: path.resolve(TestOutputDir),
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
                {
                    test: /\.ts?$/,
                    use: {
                        loader: 'ts-loader',
                        options: {
                            configFile: TestTsConfig,
                        },
                    },
                    exclude: /node_modules/,
                },
            ],
        },
        resolve: {
            extensions: ['.tsx', '.ts', '.js'],
            alias: {
                'kd-structured': path.resolve('test/stubs/kd-structured.ts'),
            },
        },
        devtool: false,
        stats: 'errors-warnings',
    }
}

export default Configurate
