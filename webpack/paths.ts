import { readFileSync } from 'node:fs'
import * as path from 'node:path'

/**
 * Every path the two webpack configs touch, resolved once from the repository
 * root instead of being spelled as CWD-relative strings at each use.
 *
 * These modules are imported by the configs, which webpack-cli loads with Node's
 * own ESM loader, so relative specifiers here carry their `.ts` extension: Node
 * does no extension resolution, and dropping it breaks `webpack --config`.
 */

export const RepoRoot = path.resolve(import.meta.dirname, '..')

export const srcDir = path.join(RepoRoot, 'src')
export const testDir = path.join(RepoRoot, 'test')
export const assetDir = path.join(RepoRoot, 'Asset')
export const packageAssetDir = path.join(RepoRoot, 'PackageAsset')

/** Build output. All of it is gitignored; none of it is a source of truth. */
export const bundleDir = path.join(RepoRoot, 'Bundle')
export const deployDir = path.join(RepoRoot, 'Deploy')
export const declarationDir = path.join(RepoRoot, 'Declaration')
export const testOutputDir = path.join(RepoRoot, '.fake', 'test')

/** The mod archive the game is pointed at, and the types package beside it. */
export const modArchive = path.join(deployDir, 'Boids.zip')
export const typeArchive = path.join(declarationDir, 'Boids-types.zip')
export const typeBundleDir = path.join(deployDir, 'types')

/**
 * `kd-structured`'s own release archive, staged into `Deploy` so a release folder
 * carries both mods. That submodule has to be built first; `StageInterfaceArchives`
 * says so when it is missing.
 */
export const interfaceArchives = [
    path.join(RepoRoot, 'kd-structured', 'Deploy', 'kd-structured.zip'),
]

/** Copied verbatim into the bundle. `Artworks/` is source, never output. */
export const assetFolders = [assetDir]

/**
 * Entry modules, in evaluation order: the loader installs the function the
 * `kd-structured` external calls, so it has to precede the mod itself.
 */
export const loaderFile = path.join(srcDir, 'kd-structured-loader.ts')
export const entryFile = path.join(srcDir, 'mod.ts')

/** The one script the game evals, named relative to the bundle root. */
export const bundleScriptFile = 'main.bundle.js'

/** The mod manifest, which lists what the game loads and in what order. */
export const modManifestFile = 'mod.json'

/**
 * The source of truth for the release version inside the mod: the file that names
 * the current release and the root its identifiers are derived under.
 *
 * The build reads it to check it against `package.json` rather than importing it —
 * this config is loaded by Node, without a TypeScript transform.
 */
export const releaseSourceFile = path.join(srcDir, 'KDExtension', 'Release.ts')

export const rootPackageJson = path.join(RepoRoot, 'package.json')
export const testEntry = path.join(testDir, 'run-all.ts')
export const testTsConfig = path.join(RepoRoot, 'tsconfig.webpack-test.json')

/**
 * `declarationDir` as declared in `tsconfig.json`, resolved. Read rather than
 * repeated, because a comment promising the two agree is not a guarantee.
 */
export const declaredTypeDir = (() => {
    const tsconfig = JSON.parse(readFileSync(path.join(RepoRoot, 'tsconfig.json'), 'utf8')) as {
        compilerOptions?: { declarationDir?: string }
    }
    const declared = tsconfig.compilerOptions?.declarationDir
    if (typeof declared !== 'string') {
        throw new Error('tsconfig.json declares no compilerOptions.declarationDir')
    }
    return path.resolve(RepoRoot, declared)
})()

/**
 * Where ts-loader emits declarations: the folder *above* `declarationDir`, because
 * the types package re-roots that tree at `@type/` (see `CopyTypes`).
 */
export const typeEmitRoot = path.dirname(declaredTypeDir)
