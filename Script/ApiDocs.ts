/**
 * Generates the API reference in process instead of through `typedoc`'s own launcher, whose `fork`
 * needs an IPC pipe.
 *
 * `npm run docs:api` writes `docs/api/typescript`, which is committed and never hand-edited.
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

// `generateOutputs` honours the configured `out`, so the destination is declared in one place.
await app.generateOutputs(project)

const warnings = app.logger.warningCount
console.log(
    `docs/api/typescript written from src/Api.ts${warnings === 0 ? '' : ` (${warnings} warning(s))`}`
)
