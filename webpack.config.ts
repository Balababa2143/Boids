import * as fs from 'fs'
import * as path from 'path'
import { ZipArchive, Archiver } from 'archiver'
import webpack from 'webpack'

const EntryFile = 'src/Boids/index.ts'
const LoaderFile = 'src/kd-structured-loader.ts'
const BundleDir = 'Bundle'
const ArchiveFile = 'Deploy/Boids.zip'
const AssetFolders = [
    'Asset',
    // 'ArtworkOutput'
]

async function CopyAssets() {
    await Promise.all(
        AssetFolders.map(
            assetFolder =>
                fs.promises.cp(assetFolder, BundleDir, { recursive: true })
        )
    )
}

async function CopyInterface() {
    await fs.promises.cp('kd-structured/Deploy/kd-structured.zip', 'Deploy/kd-structured.zip')
}

function SetArchiverEventHandlers(writeStream: fs.WriteStream, archiver: Archiver) {
    writeStream.on('close', function () {
        console.log(archiver.pointer() + ' total bytes');
        console.log('archiver has been finalized and the output file descriptor has closed.');
    })
    writeStream.on('end', function () {
        console.log('Data has been drained');
    })
    archiver.on('warning', function (err) {
        if (err.code === 'ENOENT') {
            // log warning
        } else {
            // throw error
            throw err;
        }
    })
    archiver.on('error', function (err) {
        throw err;
    })
}

/**
 * execute build
 * @param {BundleOptions} options 
 */
async function BuildArchive() {
    const archiveFilePath = path.resolve(ArchiveFile)
    const stream = fs.createWriteStream(archiveFilePath)
    const zipArchiver = new ZipArchive({
        zlib: {
            level: 9
        }
    })
    SetArchiverEventHandlers(stream, zipArchiver)
    // pipe archive data to the file
    zipArchiver.pipe(stream)
    await zipArchiver
        .directory(BundleDir, false)
        .finalize()
    await new Promise<void>(resolve => stream.on("close", resolve))
}

function PreBuild(): webpack.WebpackPluginInstance {
    return {
        apply: (compiler) => {
            compiler.hooks.beforeCompile.tapPromise('DoneArchiveBuilding', async (_) => {
                const archiveFilePath = path.resolve(ArchiveFile)
                const archiveDir = path.dirname(archiveFilePath)
                if (!fs.existsSync(archiveDir)) {
                    await fs.promises.mkdir(archiveDir)
                }
                if (fs.existsSync(archiveFilePath)) {
                    await fs.promises.rm(archiveFilePath)
                }
            })
        }
    }
}

function PostBuild(): webpack.WebpackPluginInstance {
    return {
        apply: (compiler) => {
            compiler.hooks.done.tapPromise('DoneArchiveBuilding', async (stats) => {
                if (!stats.hasErrors()) {
                    await CopyAssets()
                    await BuildArchive()
                    await CopyInterface()
                }
            })
        }
    }
}

function Configurate(env: Record<string, unknown>, argv: Record<string, string>): webpack.Configuration {

    return {
        entry: [
            path.resolve(LoaderFile),
            path.resolve(EntryFile)
        ],
        output: {
            path: path.resolve(BundleDir),
            filename: '[name].bundle.js',
            clean: true,
            library: {
                name: 'Boids',
                type: 'umd'
            }
        },
        externalsType: 'promise',
        externals: {
            // Loaded at runtime through the import map published by the kd-structured mod.
            'kd-structured': 'globalThis.__loadKDStructured()'
        },
        module: {
            rules: [
                {
                    test: /\.ts?$/,
                    use: {
                        'loader': 'ts-loader'
                    },
                    exclude: /node_modules/,
                },
            ],
        },
        resolve: {
            extensions: ['.tsx', '.ts', '.js'],
        },
        devtool: (argv['mode'] === 'production') ? false : 'inline-source-map',
        plugins: [
            PreBuild(),
            PostBuild(),
        ],
        stats: 
            argv['watch'] ? 
            'errors-warnings' :
            argv['mode'] === 'production' ?
                'normal' :
                'detailed'
    }
}

export default Configurate