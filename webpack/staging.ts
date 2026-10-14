import { createWriteStream, readFileSync, writeFileSync } from 'node:fs'
import { cp, mkdir, readdir, rm } from 'node:fs/promises'
import * as path from 'node:path'
import { ZipArchive } from 'archiver'
import type webpack from 'webpack'

import {
    assetFolders,
    bundleDir,
    deployDir,
    interfaceArchives,
    modArchive,
    modManifestFile,
    packageAssetDir,
    RepoRoot,
    typeArchive,
    typeBundleDir,
    typeEmitRoot,
} from './paths.ts'
import {
    ReadRootVersion,
    VerifyArchiveInput,
    VerifyStagedBundle,
    VerifyTypes,
} from './verify.ts'

/**
 * Staging and archiving for the mod build: copy the assets in, stamp the version
 * both packages report, hand the archiver an explicit file list, and verify the
 * result before either archive is written.
 */

/**
 * Rewrites `"field": "value"` in place rather than re-serialising, so a staged
 * file keeps its own formatting, and a renamed field fails the build instead of
 * silently going unstamped.
 */
const StampJsonField = (file: string, field: string, value: string) => {
    const text = readFileSync(file, 'utf8')
    const pattern = new RegExp(`("${field}"\\s*:\\s*)"[^"]*"`)
    if (!pattern.test(text)) {
        throw new Error(`Boids build failed: ${path.relative(RepoRoot, file)} has no ${field} to stamp`)
    }
    writeFileSync(file, text.replace(pattern, `$1"${value}"`), 'utf8')
}

const CopyAssets = async () => {
    for (const folder of assetFolders) {
        await cp(folder, bundleDir, { recursive: true })
    }
    StampJsonField(path.join(bundleDir, modManifestFile), 'modbuild', await ReadRootVersion())
}

/**
 * Stages the declarations next to the package manifest, so unpacking the types
 * archive yields something `node_modules/boids` accepts as is. The mod archive
 * keeps scripts and assets only, which is what keeps the mod load fast.
 */
const CopyTypes = async () => {
    await rm(typeBundleDir, { recursive: true, force: true })
    await mkdir(typeBundleDir, { recursive: true })
    try {
        await cp(typeEmitRoot, path.join(typeBundleDir, '@type'), { recursive: true })
    }
    catch {
        throw new Error(
            `Boids build failed: no declarations in ${path.relative(RepoRoot, typeEmitRoot)}; is declaration emit on?`
        )
    }
    await cp(packageAssetDir, typeBundleDir, { recursive: true })
    StampJsonField(path.join(typeBundleDir, 'package.json'), 'version', await ReadRootVersion())
}

/**
 * Stages the other mod's release archive so a release folder carries both. That
 * mod is a submodule and has to be built first, so a missing archive says which
 * build produced it instead of failing with a bare ENOENT.
 */
const StageInterfaceArchives = async () => {
    await mkdir(deployDir, { recursive: true })
    for (const archive of interfaceArchives) {
        try {
            await cp(archive, path.join(deployDir, path.basename(archive)))
        }
        catch {
            throw new Error(
                `Boids build failed: ${path.relative(RepoRoot, archive)} is missing; build the kd-structured submodule first`
            )
        }
    }
}

/** Every file under `dir`, relative to it and with `/` separators for the zip. */
const ListFiles = async (dir: string, prefix = ''): Promise<string[]> => {
    const entries = await readdir(path.join(dir, prefix), { withFileTypes: true })
    const files: string[] = []
    for (const entry of entries) {
        const relative = prefix ? `${prefix}/${entry.name}` : entry.name
        if (entry.isDirectory()) {
            files.push(...await ListFiles(dir, relative))
        }
        else {
            files.push(relative)
        }
    }
    return files.sort()
}

/**
 * Writes one archive from an explicit file list, so the caller can assert what
 * goes in before anything is written.
 */
const Archive = async (
    sourceDir: string,
    archiveFile: string,
    verify?: (_: readonly string[]) => Promise<void>
) => {
    const files = await ListFiles(sourceDir)
    if (verify) {
        await verify(files)
    }
    await mkdir(path.dirname(archiveFile), { recursive: true })

    await new Promise<void>((resolve, reject) => {
        const stream = createWriteStream(archiveFile)
        const zip = new ZipArchive({ zlib: { level: 9 } })
        stream.on('close', () => {
            console.log(`${path.relative(RepoRoot, archiveFile)}: ${zip.pointer()} bytes, ${files.length} entries`)
            resolve()
        })
        stream.on('error', reject)
        zip.on('error', reject)
        zip.on('warning', error => {
            if (error.code !== 'ENOENT') {
                reject(error)
            }
        })
        zip.pipe(stream)
        for (const file of files) {
            zip.file(path.join(sourceDir, ...file.split('/')), { name: file })
        }
        zip.finalize().catch(reject)
    })
}

export const PreBuild = (): webpack.WebpackPluginInstance => ({
    apply: (compiler) => {
        compiler.hooks.beforeCompile.tapPromise('BoidsPreBuild', async () => {
            // All of it is build output. Clearing it is what keeps a previous
            // layout, a stale archive, or half-written declarations from shipping.
            await rm(bundleDir, { recursive: true, force: true })
            await mkdir(bundleDir, { recursive: true })
            await rm(modArchive, { force: true })
            await rm(typeArchive, { force: true })
            // Regenerated by ts-loader during this very compile.
            await rm(typeEmitRoot, { recursive: true, force: true })
        })
    },
})

export const PostBuild = (): webpack.WebpackPluginInstance => {
    /**
     * Serialised: under `--watch` a rebuild can finish while the previous staging
     * is still writing, and two archivers would race over the same file.
     */
    let queue: Promise<void> = Promise.resolve()

    const Stage = async () => {
        await CopyAssets()
        await VerifyStagedBundle()
        await CopyTypes()
        await VerifyTypes()
        await StageInterfaceArchives()
        await Archive(bundleDir, modArchive, VerifyArchiveInput)
        await Archive(typeBundleDir, typeArchive)
    }

    return {
        apply: (compiler) => {
            compiler.hooks.done.tapPromise('BoidsPostBuild', async (stats) => {
                if (stats.hasErrors()) {
                    return
                }
                // A failed staging must not poison every later rebuild, but this
                // compile still has to report it.
                const staged = queue.then(Stage, Stage)
                queue = staged.catch(() => { })
                return staged
            })
        },
    }
}
