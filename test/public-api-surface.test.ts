/**
 * The published surface, one level deeper than `public-api.test.ts` pins it.
 *
 * `public-api.test.ts` holds the **top** of the surface — `FactionMachine` and `CommonUI` — and the
 * three namespaces directly under `FactionMachine`. That is enough to refuse a flattening, which is
 * what it was written for. It is not enough to make a widening *visible*: the control model landed
 * under `MachinePrime`, three levels down, and nothing in the suite would have said so.
 *
 * This file is the same discipline applied one level deeper: it records the children of the
 * namespaces that exist, so **adding a name to the published surface is a reviewed diff here** rather
 * than something a downstream consumer discovers. It records names and not values — this is a surface
 * check, not a behaviour one, and the values are covered by the suites that exercise them.
 *
 * Regenerate with `npm run test:update-api`.
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
 * The namespaces whose children are pinned, as paths from the published root.
 *
 * Written out rather than walked, so a namespace that appears gets a deliberate line here. The list
 * is empty of the top level itself, which `public-api.test.ts` already holds.
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
 * A key whose path does not resolve is recorded as an empty list rather than skipped, so a namespace
 * that disappeared is a diff rather than a silence.
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
        // The guard that keeps the case above from passing on an empty tree: a walk that stopped
        // resolving would report every namespace as having no children, and an empty expectation
        // agrees with itself.
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
