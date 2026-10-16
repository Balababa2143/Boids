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
 *
 * The shipped strings are **not** what this file checks. Naming them here once made every reworded
 * line a test edit, so one canary path is named — enough to catch the failure above — and the
 * surface is covered by a general property instead: every slot the registry reports as coming from
 * a tree has to still resolve there.
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
    SlotNames,
    TextRegistry,
    TextScopeRank,
    TextTreeSources,
    TreesForResolution,
    type SlotName,
} from '../src/KDExtension'

/** The one shipped path this file names, as a canary that a family's text is really reachable. */
const ArmPath = ['FactionMachine', 'Futuristic', 'Link', 'Arm'] as const

describe('the shipped text trees', () => {
    it('registers a scope for every family whose text is authored in a tree', () => {
        const sources = TextTreeSources()

        // Not an exact set: a new family's `Data` folder is a normal part of content work, and an
        // equality here would make adding one a test edit while proving nothing a rank check does
        // not. What matters is that a scope exists at all, and that its rank comes from the one
        // scale — a rank invented per scope is a precedence nobody can reason about.
        assert.ok(sources.length > 0, 'no text tree scope registered')
        for (const source of sources) {
            assert.ok(
                Object.values(TextScopeRank).includes(source.Rank as never),
                `${source.Scope} declares rank ${source.Rank}, which is not on the shared scale`
            )
            assert.match(source.Scope, /^[A-Za-z][A-Za-z0-9]*(\.[A-Za-z][A-Za-z0-9]*)+$/, source.Scope)
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

        // The canary: a variant's own node carries nothing, so this answers from the family's node
        // one segment up. It is the case that failed when the trees were not loaded at all.
        const family = ResolveSlot(tree, ArmPath, 'Name')
        assert.ok(family != null && family !== '', 'the arm family carries no name')
        assert.equal(ResolveSlot(tree, [...ArmPath, 'BoxTie'], 'Name'), family)
    })

    it('resolves every slot the registry says came from a tree', () => {
        // The general form of the canary, and the reason the shipped strings are not named here:
        // this covers a family added tomorrow, catches a `Data` module that stopped being imported,
        // and cannot be broken by rewording a line.
        const tree = MergedTreeFor('en')
        const fromTree = TextRegistry().filter(entry => entry.Source === 'tree')
        assert.ok(fromTree.length > 0, 'no slot reported a tree source, so this proves nothing')

        const missing: string[] = []
        for (const entry of fromTree) {
            const path = entry.Path
            if (path == null) {
                missing.push(`${entry.Key} (reports a tree source and carries no path)`)
                continue
            }

            const carried = SlotNames.includes(entry.Slot as SlotName)
                ? ResolveSlot(tree, path, entry.Slot as SlotName)
                : ResolveValue(tree, path)
            if (carried == null || carried === '') {
                missing.push(`${entry.Key} (${path.join('.')})`)
            }
        }
        assert.deepEqual(missing, [], 'these slots report a tree source that the tree does not carry')
    })

    it('answers nothing rather than inventing text', () => {
        const tree = MergedTreeFor('en')
        // The family carries only a name, so the slots nothing supplies stay unanswered and the
        // resolver falls through to the layers beneath the trees.
        assert.equal(ResolveSlot(tree, ArmPath, 'Flavor'), undefined)
        assert.equal(ResolveValue(tree, ArmPath), undefined)
    })

    it('answers from the English tree when the active language carries nothing', () => {
        const trees = TreesForResolution()
        const english = trees[trees.length - 1]
        // Named by path, not by value: the fallback answering is the property, and a reworded name
        // is not a regression.
        const answered = ResolveSlot(english, ArmPath, 'Name')
        assert.ok(answered != null && answered !== '', 'the English tree did not answer as the fallback')
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
