/**
 * The shipped text trees: which scopes registered, what the merge does, and what a path
 * resolves to.
 *
 * ## Why this suite exists
 *
 * The trees failed once in exactly the way a value-level test catches and a code reading does
 * not: the data was registered from one central import point, the suite reached `src/Api`
 * through another path first, and every registration resolved with **no trees at all** — so
 * item names came out empty while nothing threw. A test that asserts a *shipped* path resolves
 * is what turns that into a red test rather than a diff someone has to notice.
 *
 * The merge cases below are unit-level and register nothing: a scope added for a test would
 * leak into every later test in the process, which is a worse trade than asserting the pure
 * function directly.
 */

import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

// Side-effect import: the tree registrations happen while the mod graph is evaluated, so the
// graph has to be loaded before any of this can be observed.
import '../src/mod'

import {
    DeepMerge,
    MergedTreeFor,
    ResolveSlot,
    ResolveValue,
    TextScopeRank,
    TextTreeSources,
    TreesForResolution,
} from '../src/KDExtension'

describe('the shipped text trees', () => {
    it('registers one source per scope that ships text, each at its scope rank', () => {
        const sources = TextTreeSources()

        // As a set, not a sequence: two scopes at the same rank are ordered by whichever
        // module the bundler evaluated first, and asserting that would be asserting a bundler
        // detail — the failure this suite was written after.
        assert.deepEqual(
            sources.map(source => source.Scope).sort(),
            ['FactionMachine.Futuristic.GlassVisor', 'FactionMachine.Futuristic.Link']
        )
        for (const source of sources) {
            assert.equal(source.Rank, TextScopeRank.Family, source.Scope)
        }
    })

    it('hands the scopes back widest first, so a narrower one merges later', () => {
        const ranks = TextTreeSources().map(source => source.Rank)
        assert.deepEqual(ranks, [...ranks].sort((left, right) => left - right))
    })

    it('carries the language the mod authors in, and only that', () => {
        // No translation ships yet, and `en` is the one every source must carry because it is
        // the fallback for every other language.
        for (const source of TextTreeSources()) {
            assert.deepEqual(Object.keys(source.Languages), ['en'], source.Scope)
        }
    })

    it('resolves a variant path through its family path', () => {
        const tree = MergedTreeFor('en')

        assert.equal(ResolveSlot(tree, ['FactionMachine', 'Futuristic', 'Link', 'Arm'], 'Name'), 'Drone Arm Link')
        assert.equal(ResolveSlot(tree, ['FactionMachine', 'Futuristic', 'Link', 'Arm', 'BoxTie'], 'Name'), 'Drone Arm Link')
        assert.equal(ResolveSlot(tree, ['FactionMachine', 'Futuristic', 'Link', 'Leg', 'TiedThigh'], 'Name'), 'Drone Leg Link')

        assert.equal(ResolveSlot(tree, ['FactionMachine', 'Futuristic', 'GlassVisor', 'Goggle'], 'Name'), 'Drone Visor')
        assert.equal(ResolveSlot(tree, ['FactionMachine', 'Futuristic', 'GlassVisor', 'Mask'], 'Name'), 'Drone Mask')
    })

    it('answers nothing rather than inventing text', () => {
        const tree = MergedTreeFor('en')
        // The family carries only a name, so the slots nothing supplies stay unanswered and the
        // resolver falls through to the layers beneath the trees.
        assert.equal(ResolveSlot(tree, ['FactionMachine', 'Futuristic', 'Link', 'Arm'], 'Flavor'), undefined)
        assert.equal(ResolveValue(tree, ['FactionMachine', 'Futuristic', 'Link', 'Arm']), undefined)
    })

    it('answers from the English tree when the active language carries nothing', () => {
        const trees = TreesForResolution()
        const english = trees[trees.length - 1]
        assert.equal(ResolveSlot(english, ['FactionMachine', 'Futuristic', 'Link', 'Arm'], 'Name'), 'Drone Arm Link')
    })

    it('merges a narrower layer over a wider one, leaf by leaf', () => {
        const wide = { A: { Name: 'wide name', Flavor: 'wide flavour', B: { Name: 'wide B' } } }
        const narrow = { A: { Name: 'narrow name', B: { Flavor: 'narrow B flavour' } } }

        assert.deepEqual(DeepMerge(wide as never, narrow as never), {
            A: {
                Name: 'narrow name',
                Flavor: 'wide flavour',
                B: { Name: 'wide B', Flavor: 'narrow B flavour' },
            },
        })
    })

    it('keeps a base key in place and appends only new ones, so a merge is reproducible', () => {
        // The generated reference is compared byte for byte, so the merge's key order has to be
        // a function of its inputs and nothing else.
        assert.deepEqual(
            Object.keys(DeepMerge({ A: 'a', B: 'b' } as never, { B: 'b2', C: 'c' } as never)),
            ['A', 'B', 'C']
        )
    })
})
