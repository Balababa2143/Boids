/**
 * The published surface one level below `public-api.test.ts`:
 * the children of each pinned namespace, as names only.
 */

import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { describe, it } from 'node:test'

import * as Api from '../src/Api'

import { UpdateApi } from './harness/flags'
import { ReadJsonAsync } from './harness/text'

const BaselinePath = join('test', '__manifest__', 'public-api-surface.json')

const ShouldUpdate = UpdateApi()

/**
 * The namespaces whose children are pinned, written out so a new namespace gets a deliberate line.
 */
const PinnedNamespaces: readonly (readonly string[])[] = [
    ['FactionMachine'],
    ['FactionMachine', 'Futuristic'],
    ['FactionMachine', 'MachinePrime'],
    ['FactionMachine', 'MachinePrime', 'Coordinator'],
    ['FactionMachine', 'MachinePrime', 'Coordinator', 'Catalog'],
    ['FactionMachine', 'MachinePrime', 'Item'],
]

/** The value at a path, or `undefined` when the path does not resolve. */
const At = (path: readonly string[]): unknown =>
    path.reduce<unknown>(
        (value, key) => (value == null ? undefined : (value as Record<string, unknown>)[key]),
        Api as unknown
    )

/**
 * The pinned surface: each namespace's path joined by `.`, mapped to its child names.
 *
 * A key whose path does not resolve is recorded as an empty list rather than
 * skipped, so a namespace that disappeared is a diff rather than a silence.
 */
const Surface = (): Record<string, string[]> =>
    Object.fromEntries(PinnedNamespaces.map(path => [
        path.join('.'),
        Object.keys((At(path) ?? {}) as object).sort(),
    ]))

describe('published surface, by namespace', () => {
    it('matches the committed shape', async () => {
        const surface = Surface()

        if (ShouldUpdate) {
            await mkdir(dirname(BaselinePath), { recursive: true })
            await writeFile(BaselinePath, JSON.stringify(surface, null, 2) + '\n', 'utf8')
            return
        }

        const baseline = await ReadJsonAsync<Record<string, string[]>>(BaselinePath)
        assert.deepEqual(
            surface,
            baseline,
            'a name appeared or disappeared under a published namespace. If the change is intended, ' +
            'run `npm run test:update-api` and read the diff; a consumer reading one of these ' +
            'namespaces sees exactly this list.'
        )
    })

    it('resolves every pinned namespace', () => {
        // Keeps the case above from passing on an empty tree.
        const missing = PinnedNamespaces
            .filter(path => At(path) == null)
            .map(path => path.join('.'))

        assert.deepEqual(
            missing,
            [],
            'a namespace this file pins no longer resolves, so its children cannot be checked'
        )
    })
})
