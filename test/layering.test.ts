/**
 * The layering arrow, as a source-level gate.
 *
 * `src/` is organised so that dependencies point one way:
 *
 *   Utilities < KDInterface < KDExtension < Common < FactionMachine
 *
 * `Utilities` is generic helpers, `KDInterface` describes the game's own surface,
 * `KDExtension` is the mod's infrastructure, `Common` is what the mod shares across
 * factions, and `FactionMachine` is one faction's content. A file may import from its own
 * layer or from a layer to its left, never to its right — which is what keeps the
 * infrastructure from growing a dependency on the content that happens to exist today. A
 * second faction is where this pays: it may use `Common` and `KDExtension` unchanged, and
 * nothing below it has to learn its name.
 *
 * Reading the files rather than the loaded module graph is what makes this cover code that
 * is not yet reachable, and it is the same reasoning `guid-uniqueness.test.ts` states: the
 * invariant is about imports, so the check is about imports.
 *
 * The one deliberate exception is `src/Utilities/ModMetadata.ts` importing `Asset/mod.json`.
 * `Asset/` is not a layer — it is shipped data — so leaving `src/` is allowed and is asserted
 * to be the *only* such import, rather than being an unstated hole in the rule.
 */

import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import * as path from 'node:path'
import { describe, it } from 'node:test'

const RepoRoot = process.cwd()
const SrcDir = path.resolve(RepoRoot, 'src')

/** Left to right: each layer may import from itself and from everything to its left. */
const Layers = ['Utilities', 'KDInterface', 'KDExtension', 'Common', 'FactionMachine'] as const
type Layer = typeof Layers[number]

/** A file directly under `src/`: the bundle entry, the published surface, the promise loader. */
const Top = 'top'
/** Anything outside `src/`: shipped data, not a layer. */
const External = 'external'
type FileLayer = Layer | typeof Top | typeof External

/** Every `.ts` file under `src/`, relative and with forward slashes. */
const SourceFiles = (): string[] =>
    readdirSync(SrcDir, { recursive: true, encoding: 'utf8' })
        .map(entry => entry.replaceAll('\\', '/'))
        .filter(entry => entry.endsWith('.ts'))
        .sort()

/**
 * Source text with its comments blanked, so a doc comment that names a path is not read as
 * an import. Both comment forms are removed; the `[^:]` guard keeps a `://` in a URL from
 * starting a line comment.
 */
const WithoutComments = (text: string): string =>
    text
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/(^|[^:])\/\/.*$/gm, '$1')

/** Every relative specifier the text imports or re-exports, in source order. */
const RelativeSpecifiers = (text: string): string[] => {
    const found: string[] = []
    for (const pattern of [
        /\bfrom\s*['"]([^'"]+)['"]/g,               // import … from '…' / export … from '…'
        /\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g,   // import('…')
        /\bimport\s+['"]([^'"]+)['"]/g,             // import '…'
    ]) {
        for (const match of text.matchAll(pattern)) {
            if (match[1].startsWith('.')) {
                found.push(match[1])
            }
        }
    }
    return found
}

/** The layer a `src/`-relative path belongs to, or `External` when it leaves `src/`. */
const LayerOf = (resolved: string): FileLayer => {
    if (resolved.startsWith('..')) {
        return External
    }
    const [first] = resolved.split('/')
    return (Layers as readonly string[]).includes(first) ? first as Layer : Top
}

interface Import {
    /** `src/`-relative path of the importing file. */
    readonly From: string
    /** `src/`-relative path the specifier resolves to, or `../…` when it leaves `src/`. */
    readonly To: string
    /** The specifier exactly as written. */
    readonly Specifier: string
}

const CollectImports = (): Import[] => {
    const imports: Import[] = []
    for (const file of SourceFiles()) {
        const text = WithoutComments(readFileSync(path.resolve(SrcDir, file), 'utf8'))
        for (const specifier of RelativeSpecifiers(text)) {
            // Resolved against the *directory* of the importing file, which is how the
            // bundler resolves it. No extension resolution: the check only needs the layer.
            const resolved = path.posix.normalize(path.posix.join(path.posix.dirname(file), specifier))
            imports.push({ From: file, To: resolved, Specifier: specifier })
        }
    }
    return imports
}

/** Whether `from` may import `to`. Same layer, or any layer to its left; `top` may import all. */
const IsAllowed = (from: FileLayer, to: FileLayer): boolean => {
    if (to === External) {
        return true
    }
    // An importer is always a file under `src/`, so `External` is unreachable here; it is
    // named anyway so the predicate is total over its own signature rather than relying on
    // a caller's invariant.
    if (from === Top || from === External) {
        return true
    }
    if (to === Top) {
        // Nothing imports the entry or the published surface from below: a layer reaching up
        // for the surface would make the surface part of the content it is meant to publish.
        return false
    }
    return Layers.indexOf(to) <= Layers.indexOf(from)
}

/**
 * The scan runs once at module scope: it touches the filesystem, and every case below
 * asserts a different property of the same reading.
 */
const Occurrences = CollectImports()

describe('source layering', () => {
    it('collects a plausible number of relative imports', () => {
        // Guards against a broken scan reporting a clean bill of health because it read
        // nothing — the same reasoning the manifest and GUID suites use.
        assert.ok(
            Occurrences.length > 100,
            `expected to collect relative imports under src/, found ${Occurrences.length}`
        )
    })

    it('points every relative import at its own layer or one to its left', () => {
        const crossings = Occurrences
            .map(occurrence => ({
                ...occurrence,
                FromLayer: LayerOf(occurrence.From),
                ToLayer: LayerOf(occurrence.To),
            }))
            .filter(occurrence => !IsAllowed(occurrence.FromLayer, occurrence.ToLayer))

        const report = crossings
            .map(crossing => `  src/${crossing.From} imports src/${crossing.To} (${crossing.FromLayer} -> ${crossing.ToLayer})`)
            .join('\n')

        assert.deepEqual(
            crossings.map(crossing => `${crossing.From} -> ${crossing.To}`),
            [],
            'a file imports from a layer to its right, so the arrow no longer points one way ' +
            '(Utilities < KDInterface < KDExtension < Common < FactionMachine). Move the shared ' +
            'piece down to the layer that owns it, or invert the dependency.\n' + report
        )
    })

    it('leaves src/ only to read the shipped mod manifest', () => {
        const leaving = Occurrences.filter(occurrence => LayerOf(occurrence.To) === External)
        const unexpected = leaving.filter(occurrence => !occurrence.To.startsWith('../Asset/'))

        assert.deepEqual(
            unexpected.map(occurrence => `src/${occurrence.From} imports ${occurrence.Specifier}`),
            [],
            'an import leaves src/ for something that is not shipped data. `Asset/` is data and ' +
            'may be read; `test/`, `webpack/` and the repository root may not.'
        )
    })
})
