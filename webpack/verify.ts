import { readFile, stat } from 'node:fs/promises'
import { readFileSync } from 'node:fs'
import * as path from 'node:path'

import {
    bundleDir,
    bundleScriptFile,
    modManifestFile,
    releaseSourceFile,
    RepoRoot,
    rootPackageJson,
    typeBundleDir,
} from './paths.ts'

/**
 * Packaging assertions, run by `PostBuild` before the archives are written.
 *
 * These are properties nothing else checks, and the game
 * discovers a broken layout only at load time, in a browser.
 */

/**
 * Throwing is the point: a failed check has to stop the build, and the
 * explicit `never` return type lets callers narrow with `if (bad) Fail(...)`.
 */
const Fail: (_: string) => never = (message) => {
    throw new Error(`Boids build check failed: ${message}`)
}

/**
 * One line ending, so a comparison is over content rather than the platform's checkout.
 *
 * It cannot import `test/harness/text.ts`: this config is loaded without a TypeScript transform.
 */
const NormalizeEol = (text: string) => text.replace(/\r\n?/g, '\n')

const ReadText = async (file: string) => NormalizeEol(await readFile(file, 'utf8'))

export interface StagedModManifest {
    fileorder?: string[]
    modbuild?: string
}

export const ReadStagedManifest = async (): Promise<StagedModManifest> =>
    JSON.parse(await ReadText(path.join(bundleDir, modManifestFile))) as StagedModManifest

export const ReadRootVersion = async (): Promise<string> => {
    const pkg = JSON.parse(await ReadText(rootPackageJson)) as { version?: string }
    if (typeof pkg.version !== 'string') Fail('package.json declares no version')
    return pkg.version
}

/**
 * The version as `src/KDExtension/Release.ts` declares it, or `undefined` when it cannot be found.
 *
 * Read by pattern because this config runs without a TypeScript transform.
 * `test/harness/release.ts` carries the same pattern and cannot be shared for the same reason.
 */
const ReadReleaseVersion = (): string | undefined => {
    try {
        const source = NormalizeEol(readFileSync(releaseSourceFile, 'utf8'))
        return /export const Release:\s*RootedReleaseRecord\s*=\s*\{[\s\S]*?Version:\s*'([^']+)'/.exec(source)?.[1]
    }
    catch {
        return undefined
    }
}

/**
 * The release the mod says it is has to be the release it is stamped as.
 *
 * `Asset/mod.json` and the types package are stamped from `package.json`; the load gate compares
 * against `Release.ts`. A mismatch would refuse saves by a version the player never sees.
 */
export const VerifyReleaseVersion = async () => {
    const version = await ReadRootVersion()
    const declared = ReadReleaseVersion()

    if (declared == null) {
        Fail(
            `${path.relative(RepoRoot, releaseSourceFile)} declares no readable \`export const Release\` ` +
            `with a \`Version: '<semver>'\` field, so the release version cannot be checked against ` +
            `${path.relative(RepoRoot, rootPackageJson)}`
        )
    }
    if (declared !== version) {
        Fail(
            `src/KDExtension/Release.ts declares release ${declared}, while package.json says ${version}. ` +
            `Bump both together: package.json stamps modbuild and the types package, and Release.Version is ` +
            `what the load gate compares a save's root against.`
        )
    }
}

/**
 * The staged tree has to contain what the mod manifest promises, and the emitted
 * script has to keep the global contract: the entry assigns `globalThis.Boids`,
 * and no UMD wrapper publishes its promise under the same name.
 */
export const VerifyStagedBundle = async () => {
    const manifest = await ReadStagedManifest()
    const fileorder = manifest.fileorder
    if (!fileorder?.length) Fail(`${modManifestFile} lists no fileorder`)

    for (const entry of fileorder) {
        const staged = path.join(bundleDir, ...entry.split('/'))
        try {
            await stat(staged)
        }
        catch {
            Fail(`${modManifestFile} lists ${entry}, which is not in the bundle`)
        }
    }

    let script: string
    try {
        script = await ReadText(path.join(bundleDir, bundleScriptFile))
    }
    catch {
        return Fail(`the bundle emitted no ${bundleScriptFile}`)
    }

    if (!/globalThis\s*\.\s*Boids\s*=/.test(script)) {
        Fail(`${bundleScriptFile} does not assign globalThis.Boids`)
    }
    if (script.includes('webpackUniversalModuleDefinition')) {
        Fail(`${bundleScriptFile} still carries a UMD wrapper, which would publish the entry's promise as the Boids global`)
    }

    // The late binding is the only reason the two mods may load in either order.
    if (!script.includes('__loadKDStructured')) {
        Fail(`${bundleScriptFile} no longer references __loadKDStructured`)
    }
    if (!/import\([^)]*kd-structured/.test(script)) {
        Fail(`${bundleScriptFile} no longer imports kd-structured natively`)
    }

    // One file is what the zip is trusted to hold; a chunk
    // would be fetched relative to the eval'd script.
    if (script.includes('__webpack_require__.e(')) {
        Fail(`${bundleScriptFile} loads a chunk; stage chunks in fileorder before shipping`)
    }

    const version = await ReadRootVersion()
    if (manifest.modbuild !== version) {
        Fail(`${modManifestFile} carries modbuild ${manifest.modbuild}, package.json says ${version}`)
    }
}

/** The types package has to describe the same surface the bundle publishes. */
export const VerifyTypes = async () => {
    const version = await ReadRootVersion()

    let staged: { version?: string, types?: string }
    try {
        staged = JSON.parse(await ReadText(path.join(typeBundleDir, 'package.json'))) as typeof staged
    }
    catch {
        return Fail('the types package was not staged')
    }

    if (staged.version !== version) {
        Fail(`the types package carries version ${staged.version}, package.json says ${version}`)
    }
    if (staged.types !== '@type/boids/Api.d.ts') {
        Fail(`the types package points at ${staged.types} instead of the published surface`)
    }

    const apiDeclaration = path.join(typeBundleDir, '@type', 'boids', 'Api.d.ts')
    let api: string
    try {
        api = await ReadText(apiDeclaration)
    }
    catch {
        return Fail(`the types package has no ${path.relative(RepoRoot, apiDeclaration)}`)
    }

    if (!/declare global[\s\S]*var Boids\s*:/.test(api)) {
        Fail('Api.d.ts dropped its global declaration, so consumers lose the Boids global')
    }
    if (!/export\s*\*\s*as\s+FactionMachine\s+from\s*['"]\.\/FactionMachine['"]/.test(api)) {
        Fail(
            'Api.d.ts no longer declares the FactionMachine namespace, so the published surface ' +
            'would have been flattened: consumers would read a different Boids'
        )
    }
    if (!api.includes("'./Common/CommonUI'")) {
        Fail('Api.d.ts no longer republishes CommonUI')
    }
}

/**
 * What goes into the mod archive, checked against the file list rather than read back out of
 * the zip: the archiver is handed exactly these entries, so the list is the archive's contents.
 */
export const VerifyArchiveInput = async (files: readonly string[]) => {
    const entries = new Set(files)
    const manifest = await ReadStagedManifest()

    for (const entry of manifest.fileorder ?? []) {
        if (!entries.has(entry)) Fail(`the mod archive would not contain the listed ${entry}`)
    }
    for (const required of [modManifestFile, bundleScriptFile]) {
        if (!entries.has(required)) Fail(`the mod archive would not contain ${required}`)
    }
}
