import type webpack from 'webpack'

import { bundleDir, entryFile, loaderFile } from './webpack/paths.ts'
import { PostBuild, PreBuild } from './webpack/staging.ts'
import { resolveExtensions, typescriptRule } from './webpack/typescript.ts'

/** Quiet under watch, verbose for a one-off dev build, plain for production. */
function StatsFor(argv: Record<string, unknown>): webpack.Configuration['stats'] {
    if (argv['watch']) {
        return 'errors-warnings'
    }
    return argv['mode'] === 'production' ? 'normal' : 'detailed'
}

function Configurate(_env: Record<string, unknown>, argv: Record<string, unknown>): webpack.Configuration {
    return {
        // Order matters: the loader installs `globalThis.__loadKDStructured`, which
        // is the expression the `kd-structured` external below evaluates.
        entry: [
            loaderFile,
            entryFile,
        ],
        output: {
            path: bundleDir,
            filename: '[name].bundle.js',
            clean: true,
            // No `library` on purpose. It used to publish this async entry's promise
            // as the `Boids` global; `src/mod.ts` assigns the namespace itself and is
            // the only writer, so a promise never reaches that name (issue #47).
        },
        externalsType: 'promise',
        externals: {
            // Loaded at runtime through the import map published by the kd-structured mod.
            'kd-structured': 'globalThis.__loadKDStructured()',
        },
        module: {
            rules: [
                typescriptRule(),
            ],
        },
        resolve: {
            extensions: resolveExtensions,
        },
        devtool: argv['mode'] === 'production' ? false : 'inline-source-map',
        plugins: [
            PreBuild(),
            PostBuild(),
        ],
        stats: StatsFor(argv),
    }
}

export default Configurate
