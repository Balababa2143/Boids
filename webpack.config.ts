import * as fs from 'fs'
import * as path from 'path'
import * as archiver from 'archiver'
import webpack, { EnvironmentPlugin } from 'webpack'

const EntryFile = 'src/Boids/ModInit.ts'
const BundleDir = 'Bundle'
const ArchiveFile = 'Deploy/Boids.zip'
const AssetFolders = [
    'Asset',
    'ArtworkOutput'
]

interface BundleOptions {
    production?: true
    watch?: true
}

async function CopyAssets() {
    await Promise.all(
        AssetFolders.map(
            assetFolder =>
                fs.promises.cp(assetFolder, BundleDir, { recursive: true })
        )
    )
}

function SetArchiverEventHandlers(writeStream: fs.WriteStream, archiver: archiver.Archiver) {
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
    // const archiveDir = path.dirname(archiveFilePath)
    // if (!fs.existsSync(archiveDir)) {
    //     fs.mkdirSync(archiveDir)
    // }

    // if (fs.existsSync(archiveFilePath)) {
    //     fs.unlinkSync(archiveFilePath)
    // }
    const stream = fs.createWriteStream(archiveFilePath)
    const zipArchiver = archiver('zip', {
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
                    fs.mkdirSync(archiveDir)
                }

                if (fs.existsSync(archiveFilePath)) {
                    fs.unlinkSync(archiveFilePath)
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
                }
            })
        }
    }
}

function Configurate(env: Record<string, unknown>, argv: Record<string, string>): webpack.Configuration {

    return {
        entry: path.resolve(EntryFile),
        output: {
            path: path.resolve(BundleDir),
            filename() {
                // Minifier don't understand ks extension.
                return /*production ? 'index.ks' :*/ 'index.js'
            },
            clean: true
        },
        module: {
            rules: [
                {
                    test: /\.ts?$/,
                    use: {
                        'loader': 'ts-loader',
                        'options': {
                            'projectReferences': true,
                            ignoreDiagnostics: [2742]
                        }
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
        ]
    }
}

export default Configurate