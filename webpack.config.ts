import * as fs from 'fs'
import * as path from 'path'
import * as archiver from 'archiver'
import webpack from 'webpack'

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

// function ProcessArgs() {
//     const cliArgs = process.argv.slice(2)
//     const productionMode = cliArgs.includes('-p'); // production flag
//     const watchMode = cliArgs.includes('-w'); // production flag

//     const ret: BundleOptions = {
//         productionMode,
//         watchMode
//     }
//     return ret
// }


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

function Configurate(env: BundleOptions): webpack.Configuration {
    const {
        production,
        watch
    } = env

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
        mode: production ? 'production' : 'development',
        devtool: production ? false : 'inline-source-map',
        plugins: [
            PreBuild(),
            PostBuild(),
        ],
        watch: watch
    }
}

export default Configurate