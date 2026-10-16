/**
 * The generated text reference: every string the mod can put in front of a player.
 *
 * It exists because the text surface is now addressed rather than listed. A translator needs to
 * know two things that no source file says in one place: which line is *which* after the engine's
 * `Desc` / `Desc2` mapping, and which lines can be reached at all. The second is the one that
 * matters — a slot with a path can be overridden without touching code, and a slot without one
 * cannot be reached from a language tree, so the reference reports the split rather than leaving a
 * translator to discover it.
 *
 * The document is committed, and generated: `npm run test:update-text` writes it. Its *content* is
 * compared in the delivery gate rather than on every run, because a translator deliverable should
 * not fail the workday gate on every reworded string; what stays on every run is that it exists and
 * carries a row per registered slot. That keeps it true by construction, which a hand-written index
 * would not.
 */

import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { describe, it } from 'node:test'

// Side-effect import, static for the same reason as the other surface suites: the registry is read
// at this module's scope, and only a static dependency guarantees the graph has been evaluated.
import '../src/mod'

import { ModGroup, TextRegistry, type RegisteredText } from '../src/KDExtension'
import { AuditSkipReason, UpdateText } from './harness/flags'
import { ReadTextAsync } from './harness/text'

const ReferencePath = join('docs', 'localization', 'text-reference.md')

/**
 * The comparison is over **content**, and a checkout's line-ending policy is not content: this
 * repository normalises to LF in the index and checks it out as CRLF on Windows, so comparing raw
 * file bytes passes in the session that has just written the file and fails in every fresh clone.
 * That is exactly how this gate was found broken — by landing the work and running it again, rather
 * than by running it where the file had only just been generated.
 *
 * The normalising now lives in `harness/text`, which every file read in the suite goes through, so
 * the same class of failure is closed for the whole suite rather than for this comparison.
 */

/** A table cell: pipes escaped, line breaks shown, and a blank made visible. */
const Cell = (value: string): string =>
    value === ''
        ? '*(blank)*'
        : value.replaceAll('\\', '\\\\').replaceAll('|', '\\|').replaceAll('\n', '\\n')

const Row = (entry: RegisteredText): string =>
    `| ${[
        entry.Group === ModGroup ? 'mod' : 'engine',
        entry.Slot,
        entry.Path == null ? '—' : entry.Path.join('.'),
        Cell(entry.Value),
        entry.Source,
    ].join(' | ')} |`

/** The whole document, as text. Deterministic: the registry's order is registration order. */
export const BuildReference = (): string => {
    const entries = TextRegistry()
    const addressable = entries.filter(entry => entry.Path != null).length
    const unaddressable = entries.length - addressable

    return [
        '# Boids — text reference',
        '',
        '> **Generated.** `npm run test:update-text` writes this file, and',
        '> `test/text-reference.test.ts` compares it in the delivery gate (`npm run verify:full`).',
        '> Do not edit it by hand.',
        '',
        'Every string the mod can put in front of a player, with the address a translation overrides',
        'it at. **Two groups**, because the engine resolves one half of the surface and the mod',
        'resolves the other (`spec` §4.6):',
        '',
        '- **engine** — the engine composes the key from an identity the mod holds, so *Address* is',
        '  the tree path when the slot has one and `—` when the value is registered beside the item.',
        '  These are item names, tooltip lines, perk and category labels, and the variant prefix.',
        '- **mod** — the mod resolves the value and the engine only displays it. *Address* is the',
        '  dotted path, which is also the key.',
        '',
        '**Where a line came from** is the *From* column: `tree` (authored in a JSON tree), `local`',
        '(registered beside the item), `engine` (read from the base game\'s own text for the item',
        'this one is derived from), or `blank` (a slot nothing supplies yet).',
        '',
        '## Addressability',
        '',
        `**${addressable} of ${entries.length}** slots carry a path, so a translator can override them`,
        `without touching code. The other **${unaddressable}** cannot be reached from a language tree`,
        'at all: they belong to the hand-written item families, whose lines are registered beside the',
        'item and have no path yet. Giving each family its paths is an authoring task rather than a',
        'mechanism change, and it is the first thing Phase 6 should do.',
        '',
        'To override a line, add its path to the language tree beside the scope that owns it —',
        '`…/Data/cn.json` — with the same shape the English tree uses. A value at a **shorter** path',
        'covers everything beneath it, so one entry can translate a whole family.',
        '',
        `| Group | Slot | Address | English | From |`,
        '| --- | --- | --- | --- | --- |',
        ...entries.map(Row),
        '',
    ].join('\n')
}

describe('the generated text reference', () => {
    it('is present, covers every registered slot exactly once, and regenerates on request', async () => {
        const entries = TextRegistry()
        assert.ok(entries.length > 200, `registered slots: ${entries.length}`)

        if (UpdateText()) {
            await mkdir(dirname(ReferencePath), { recursive: true })
            await writeFile(ReferencePath, BuildReference(), 'utf8')
            return
        }

        const committed = await ReadTextAsync(ReferencePath).catch(() => undefined)
        if (committed == null) {
            assert.fail(`${ReferencePath} does not exist. Run \`npm run test:update-text\` to write it.`)
        }

        // Coverage is the part that survives content work: a row per slot, whatever the strings say.
        const rows = committed.split('\n').filter(line => line.startsWith('| engine |') || line.startsWith('| mod |'))
        assert.equal(rows.length, entries.length, 'a row per registered slot')
    })

    it(
        'matches the committed document',
        { skip: AuditSkipReason('The generated reference') },
        async () => {
            // The document is a translator deliverable, not a behaviour: comparing it byte for byte
            // on every run would fail the workday gate on every reworded string, and the diff is
            // 40 KB. It is compared at delivery instead, where a stale document is a real problem.
            const committed = await ReadTextAsync(ReferencePath)
            assert.equal(
                committed === BuildReference(),
                true,
                `${ReferencePath} is out of date. Run \`npm run test:update-text\`, review the diff, ` +
                'and commit it alongside the change that moved the text.'
            )
        }
    )
})
