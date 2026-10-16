/**
 * The generated API reference, without `typedoc`'s own launcher.
 *
 * `typedoc`'s `bin` unconditionally `fork()`s its CLI so that `--watch` can restart it, and a
 * `fork` needs an IPC pipe — which this project's development sandbox denies, so the stock
 * command dies with `spawn EPERM` before TypeDoc has read a single file. The CLI itself is
 * unchanged and still reads `typedoc.json`, so this entry bootstraps it **in process** instead.
 * `npx typedoc` remains an equivalent way to run it where nothing is sandboxed.
 *
 * `npm run docs:api` writes `docs/api/typescript`, which is committed and never hand-edited;
 * see `docs/api/README.md`.
 *
 * @module Script/ApiDocs
 */

import { Application, TSConfigReader, TypeDocReader } from 'typedoc'

const app = await Application.bootstrapWithPlugins(
    { options: 'typedoc.json' },
    [new TSConfigReader(), new TypeDocReader()]
)

const project = await app.convert()
if (project == null) {
    throw new Error('TypeDoc produced no project — see the errors above')
}

// `generateOutputs` rather than `generateDocs`: it honours the configured `out`, so the
// destination is declared in exactly one place.
await app.generateOutputs(project)

const warnings = app.logger.warningCount
console.log(
    `docs/api/typescript written from src/Api.ts${warnings === 0 ? '' : ` (${warnings} warning(s))`}`
)
