/**
 * Pins the published surface.
 *
 * `src/Api.ts` is what the bundle assigns to the `Boids` global and what the
 * published types package exposes; `PackageAsset/package.json` maps its `exports`
 * entry at that same file, so the runtime and the typings cannot describe
 * different things. The surface is **two** namespaces: `FactionMachine`, one level
 * per major faction so that a second faction is a sibling rather than a fourth
 * name, and `CommonUI`, which is shared UI rather than content. Everything else is
 * internal on purpose, so a change to this list has to be a deliberate edit rather
 * than a side effect of moving a re-export around.
 *
 * Regenerate with `npm run test:update-api`.
 */

import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { describe, it } from 'node:test'

import * as Api from '../src/Api'
// Side-effect import: this is the bundle entry, and importing it is what
// publishes the global the second test below reads.
import '../src/mod'

import { UpdateApi } from './harness/flags'
import { ReadJsonAsync } from './harness/text'

const BaselinePath = join('test', '__manifest__', 'public-api.json')

const ShouldUpdate = UpdateApi()

/** Names the mod publishes, independent of how `Api` reaches them. */
const PublishedNames = () => Object.keys(Api).sort()

/**
 * Names that must never reach the top level.
 *
 * The three the `FactionMachine` namespace demoted sit beside the infrastructure on
 * purpose: flattening the surface is the change this file exists to refuse. A
 * consumer written against `Boids.Futuristic` would otherwise keep working by
 * accident, and the surface would quietly stop enumerating factions.
 */
const InternalNames = [
    'Common',
    'CommonEvent',
    'DebugStart',
    'Futuristic',
    'Immutable',
    'KDExtension',
    'KDInterface',
    'MachinePrime',
    'ModJson',
    'Utilities',
]

/** The one faction the mod ships, and everything published under it. */
const FactionMachineNames = ['DebugStart', 'Futuristic', 'MachinePrime']

describe('published surface', () => {
    it('matches the committed baseline', async () => {
        const names = PublishedNames()

        if (ShouldUpdate) {
            await mkdir(dirname(BaselinePath), { recursive: true })
            await writeFile(BaselinePath, JSON.stringify(names, null, 2) + '\n', 'utf8')
            return
        }

        const baseline = await ReadJsonAsync<string[]>(BaselinePath)
        assert.deepEqual(
            names,
            baseline,
            'the published surface changed; see src/Api.ts and re-run `npm run test:update-api`'
        )
    })

    it('is what the bundle entry publishes as the global', () => {
        const published = globalThis.Boids
        assert.notEqual(typeof published, 'undefined', 'src/mod.ts did not publish the global')
        assert.deepEqual(Object.keys(published).sort(), PublishedNames())
    })

    it('publishes the machine faction one level down, and nothing else under it', () => {
        const published = globalThis.Boids
        assert.deepEqual(
            Object.keys(published.FactionMachine).sort(),
            FactionMachineNames,
            'the faction namespace no longer holds exactly its own namespaces'
        )
    })

    it('re-exposes no internals, and does not flatten the faction namespace', () => {
        const names = PublishedNames()
        for (const internal of InternalNames) {
            assert.ok(!names.includes(internal), `${internal} must not be published at the top level`)
        }
    })
})
