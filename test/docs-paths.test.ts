/**
 * Every repository path the documentation names has to exist.
 *
 * The documentation is a set of files that point at each other and at the tree: the design corpus
 * cites the spec, a source comment cites a section of the guide, a test cites the step it holds.
 * Moving a document therefore breaks references that no compiler and no other suite can see — the
 * failure mode this repository has already had once, when the design corpus moved into a folder of
 * its own and every citation of it had to move too.
 *
 * So the rule is mechanical: **a backticked repository path in hand-written text is a claim that
 * the path exists**, and this gate reports the ones that are not. It is deliberately narrow, so
 * that it can never become the thing people switch off:
 *
 * - only the two roots the documentation lives under, `design/` and `docs/`;
 * - only backticked tokens, not prose, because a token is what a reader can paste;
 * - never the generated trees, whose text is not ours to correct.
 *
 * A historical citation — `design/design-brief.md`'s Appendix E rows name a path that no longer
 * exists on purpose — is written as prose rather than as a bare path token; the record keeps its
 * wording and this gate keeps its teeth.
 *
 * @module test/docs-paths
 */

import assert from 'node:assert/strict'
import { existsSync, readdirSync } from 'node:fs'
import * as path from 'node:path'
import { describe, it } from 'node:test'

import { ReadText } from './harness/text'

const RepoRoot = process.cwd()

/** Every file whose text is ours to keep true, relative to the repository root. */
const HandWrittenFiles = (): string[] => [
    'README.md',
    'AGENTS.md',
    'docs/README.md',
    'docs/api/README.md',
    ...Walk('design', '.md'),
    ...Walk('docs/guide', '.md'),
    ...Walk('src', '.ts'),
    ...Walk('test', '.ts'),
    ...Walk('webpack', '.ts'),
    ...Walk('Script', '.ts'),
]

/** Files under a directory, with forward slashes, filtered by extension. */
const Walk = (dir: string, extension: string): string[] => {
    const full = path.resolve(RepoRoot, dir)
    if (!existsSync(full)) return []

    return readdirSync(full, { recursive: true, encoding: 'utf8' })
        .map(entry => `${dir}/${entry.replaceAll('\\', '/')}`)
        .filter(entry => entry.endsWith(extension))
}

/**
 * A backticked repository path.
 *
 * The character class is the whole guard: it cannot match `*`, `…` or `<`, so a glob, an elided
 * folder and a placeholder source-file name are all skipped rather than special-cased. What is
 * left is a token a reader could paste into a shell.
 */
const Backticked = /`((?:design|docs)\/[A-Za-z0-9._/-]+)`/g

/** Every path token in a file's text, with its line number. */
const Tokens = (text: string): { token: string; line: number }[] => {
    const found: { token: string; line: number }[] = []
    const lines = text.split('\n')

    for (const [index, line] of lines.entries()) {
        for (const match of line.matchAll(Backticked)) {
            found.push({ token: match[1], line: index + 1 })
        }
    }

    return found
}

/** What is wrong with a file, or an empty list. */
const Offenders = (file: string): string[] =>
    Tokens(ReadText(path.resolve(RepoRoot, file)))
        .filter(({ token }) => !existsSync(path.resolve(RepoRoot, token)))
        .map(({ token, line }) => `${file}:${line}: ${token} does not exist`)

describe('documentation paths', () => {
    it('names only paths that exist', () => {
        const files = HandWrittenFiles()
        const tokens = files.flatMap(file => Tokens(ReadText(path.resolve(RepoRoot, file))))

        // A gate that stops matching its input reads as a pass, which is worse than being absent.
        assert.ok(
            tokens.length > 50,
            `expected the documentation to name well over fifty paths, found ${tokens.length}`
        )

        assert.deepEqual(
            files.flatMap(Offenders),
            [],
            'these documented paths are dead; move the reference with the file it names'
        )
    })
})
