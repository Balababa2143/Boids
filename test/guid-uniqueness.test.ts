/**
 * Invariant 2 (`design/spec.md` §4.5): a handler GUID is globally unique across the
 * game and every other mod.
 *
 * `AddEventHandler` throws on a duplicate *registration* at load time, which is too
 * late to be a design signal — and because the mod is one evaluated bundle, a
 * copy-pasted literal in a module nobody imported yet is invisible until the day it
 * is imported. So the check is a source-level one over **every** GUID literal under
 * `src/`, exactly as the spec words it, rather than a narrower scan of handler
 * `type` fields.
 *
 * Reading the files rather than the loaded module graph is what makes the check
 * cover code that is not yet reachable. The invariant is stated over literals, so
 * the check is stated over literals.
 *
 * ## The litmus test, stated so nobody has to guess
 *
 * The scan matches a **canonical UUID literal**: `8-4-4-4-12`, a version nibble of
 * 1–8 and a variant nibble of 8, 9, a or b. That admits the hand-written constants
 * in `src/` and rejects two deliberate sentinels, which is the correct call rather
 * than an oversight:
 *
 * | Rejected | Where | Why it is not a GUID |
 * | --- | --- | --- |
 * | `00000000-0000-0000-0000-000000000000` | `KDExtension/Text.ts` | the "no text key" sentinel — a UUID the game can never mint, because a v5 hash of anything will not be all-zero |
 * | `FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFFF` | `KDExtension/Model.ts` | an explicitly invalid layer group, chosen to be unrecognisable |
 * | the DNS namespace | `KDExtension/Release.ts` | an *input* to deriving the root, not an identifier this mod mints |
 *
 * Their whole point is to be recognisable as "not a real identifier". A GUID
 * uniqueness rule that insisted on policing them would be the rule misunderstanding
 * its own subject.
 *
 * ## Why the expectation is an enumerated set rather than a count
 *
 * A pinned count says "the number changed" and stops there — it cannot tell an
 * intended new identifier from a copy-paste, which is the one thing this suite
 * exists to distinguish. Enumerating the values makes both a new literal and a
 * removed one a **reviewed diff in this file**, so the check is self-verifying: the
 * expectation cannot drift from the tree without the diff saying exactly how.
 */

import assert from 'node:assert/strict'
import { readdirSync } from 'node:fs'
import * as path from 'node:path'
import { describe, it } from 'node:test'

import { ReadText } from './harness/text'

const RepoRoot = process.cwd()
const SrcDir = path.resolve(RepoRoot, 'src')

/**
 * A canonical UUID literal. `\b` on both sides so a longer hex run is not matched
 * from its middle, and version/variant nibbles so a bare hex string of the right
 * shape is not mistaken for an identifier.
 *
 * Any version from 1 to 8, rather than only the v4 and v5 this mod mints, because
 * the claim being checked is *uniqueness* and a future identifier may be minted at
 * another version.
 */
const GuidPattern = /\b[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/gi

/**
 * Every GUID literal the committed tree carries, lower-cased, sorted.
 *
 * Hand-written identifiers are the exception now: the mod's own bases are **derived** from the root
 * (`KDExtension/Release.ts`), so they are not literals and do not appear here. What remains is the
 * handful that must be written out — an event handler's `type`, a link category — and adding one is
 * meant to be a deliberate act, which is why the list is enumerated rather than counted: a new
 * literal is a reviewed diff in this file.
 *
 * The per-phase history of additions is deliberately not recorded here; `git log` answers that
 * better than a comment that has to be maintained.
 */
const ExpectedGuids: readonly string[] = [
    '019f89e6-0e42-7f7d-b5e0-606dc1c0bd58',
    '0307649c-e62d-4aaf-bfff-bf5f87ee2106',
    '0377ec29-363a-4280-9e4e-d01189a0b833',
    '0a5e497e-952f-44f8-905b-dc45c9a746eb',
    '0ca9a21b-5222-48b2-b5b5-2c8aaaa210b9',
    '11d8dfae-f831-4d7c-bb21-8987b8234a63',
    '1234d2f9-22fb-4d47-974a-da7fa5f284a4',
    '17954016-cb1a-4c61-a312-a1675ee128cb',
    '1a320e06-cae9-4607-a0b3-f722992f87ee',
    '2084306e-a3ab-449d-8766-48b5272791fe',
    '211fbbc1-0e8d-4cff-82e3-ada9713142ed',
    '21446d52-f0e9-4c73-8326-52ed150b6f63',
    '23ad0a99-32dc-4caa-95c4-34c7e3b02edb',
    '26228b48-2471-481c-92b7-420f6f5513c9',
    '29db8b83-cdc4-45a5-a3aa-481ae1f85193',
    '2c8ca1c4-48e1-4e38-9019-15715fb80692',
    '33790c6f-4629-4387-896e-a999e6641b40',
    '373643cb-501a-435e-9edc-0c7f733d3507',
    '3978c22d-e2ac-49f3-8d89-689ce4aa0590',
    '39c79aa5-74a9-4391-8fba-2b7f23c2d6e0',
    '3a0ec533-6672-4daf-9e0d-da4bcd01e187',
    '3ad95579-5641-4cf0-a039-6c7a9c933579',
    '3b5d5a69-ca6b-42c9-ac78-278dc11a0b07',
    '3c58669e-8a81-4a27-83ae-1885fa318ce1',
    '3f0fdd62-dbc6-4089-b31d-843e79fb8381',
    '4cb992e7-88cf-469f-8a41-0152bda9c896',
    '4ea907a6-cf47-404a-aa12-833abeeec93a',
    '4f575103-e9a2-4c34-bead-9e7173b1913d',
    '512a0bfc-db53-49f6-a741-7b14ca5260a7',
    '53660f42-1dc0-474d-a819-938e39015046',
    '5aa74a4b-7f42-4b70-b68f-ba85631a9473',
    '63db7078-2520-56f8-88ce-fcf641af137b',
    '654c7580-d30c-4c5e-b126-648fe6d2af27',
    '6798ed87-6698-481a-98d2-7bd037700dfc',
    '68c84945-3a9a-4024-8cc6-e3ce092e9154',
    '6972c883-57b8-4a0f-b965-f0a42654415b',
    '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
    '6c035995-f25a-4275-82d5-9cc157093e3f',
    '6c1c38fe-d89c-43e5-8dbb-8a67ce48b17d',
    '74668098-8709-4c77-82be-5fe53d109d54',
    '74e4e3b1-436a-4bb8-b7a2-0448e260a23c',
    '76c06708-b150-414c-b402-a57a1a78bc53',
    '7a5e12de-49e1-4681-9067-ec6d977475db',
    '7bc556d7-a37b-486b-a3b1-923630edd1ff',
    '7bcc6086-764d-42a6-b92c-93e230e7086f',
    '7fc08acf-b177-4103-ad07-157af174647f',
    '805f7c18-e33d-4596-9ad6-afa1a0391a66',
    '809300ea-3aae-4615-803c-bdcd4b2a81f5',
    '884c4320-844d-4b26-a708-0be135980b80',
    '89cb8e40-cde3-4d12-b24a-150b61c7ff8b',
    '8b3d8ff7-d09e-4e56-b014-233a1bb54140',
    '8d4a3f0d-1270-46b3-a1e3-cd6a056af7bb',
    '9c464fc0-ba59-4b4f-8212-a8bfc7b64b5d',
    'a2c4bb95-0c66-4461-905e-35e3186403e9',
    'a4f264b6-5ad2-40bc-94d4-f928d8f23040',
    'a533fa99-24b9-429d-b603-1bae2237ad9f',
    'a76d546d-d8d9-40ad-86a7-c7c69b396dd4',
    'a7d2e4b1-6c58-4f39-9e02-3b8d1a5c7f60',
    'a8e9a555-1442-4297-b747-7de609d8b9ed',
    'a9a9b0ae-bf70-4125-b89c-60984246debf',
    'ae5e02cb-268d-448a-956c-ee7a5442330f',
    'b4a7bcf3-da11-4ec5-907f-d1e02c4a2203',
    'b599d065-0bea-4ca7-8e17-7f4be959a0a8',
    'b63736c6-b5e9-49cd-a320-add991dace31',
    'b8d7875f-edc2-41aa-b96b-3c91e905c761',
    'ba399b36-175f-4417-9930-36fe47dfd2da',
    'ba7c3009-d024-4875-9be9-6cd3610e8faf',
    'bd1559c9-773c-4be4-9439-5140666771f3',
    'bd587e0a-854f-46fd-88a8-7ee100571e2f',
    'bfd88931-19d2-4909-b88c-20e8d08edfe4',
    'c38f27c2-0df8-425a-aa80-01da5cbe6bc4',
    'c48efd5e-e76f-4ed5-aedd-c2110fc09eb4',
    'c4e1f2a7-9b3d-4e58-8a16-2f7c0d5b6e94',
    'cb291d66-08d1-4f56-a72b-a6ea35df150f',
    'cb46bb91-4b03-45c8-85e2-200d615fdc40',
    'ceb2873b-e378-4c2b-a1ed-47618fd801db',
    'd61157b2-2a92-4e3f-aa64-0c0b0543ccb9',
    'd76f027d-e788-42c3-9b49-94b52f0f3c7f',
    'd985c637-0514-49c6-bd00-17db7c63d2d7',
    'e15bc39c-544c-49b2-9969-af5e4e19b14c',
    'e581a8af-515f-42c1-86d2-bfefb614ac30',
    'eb7b7d31-e29b-42d4-9d83-8d395ae981a8',
    'ef0f0539-c955-42cc-b258-39762179b14c',
    'f10bad9f-53f1-439b-9a00-ba5db504a646',
    'f913d9bf-e661-4f6e-88ea-e5f509a1a0e9',
    'fc75f4cb-a745-45d4-a7f4-fa9a786f70ec',
]

/**
 * GUIDs that are the same value in more than one place **on purpose**, with the
 * reason. Empty today, and it exists so a deliberate sharing has somewhere honest
 * to go instead of being copied under a second literal. An entry that is not needed
 * is itself a failure, so the list cannot rot into a list of lies.
 */
const SharedGuidExceptions: ReadonlyMap<string, string> = new Map()

interface GuidOccurrence {
    /** Lower-cased, so two literals differing only in casing are one value. */
    Guid: string
    /** Repository-relative, with forward slashes, as the repository spells paths. */
    File: string
    Line: number
}

/** Every `.ts` file under `src/`, relative to `src/` and with forward slashes. */
const SourceFiles = (): string[] =>
    readdirSync(SrcDir, { recursive: true, encoding: 'utf8' })
        .map(entry => entry.replaceAll('\\', '/'))
        .filter(entry => entry.endsWith('.ts'))
        .sort()

/** Every GUID literal under `src/`, one entry per occurrence. */
const CollectGuidOccurrences = (): GuidOccurrence[] => {
    const found: GuidOccurrence[] = []
    for (const file of SourceFiles()) {
        // The reader hands back LF, so splitting on `\n` is the whole story; the line numbers this
        // reports are the file's own, because normalising does not add or remove a line.
        const lines = ReadText(path.resolve(SrcDir, file)).split('\n')
        lines.forEach((line, index) => {
            for (const match of line.matchAll(GuidPattern)) {
                found.push({ Guid: match[0].toLowerCase(), File: `src/${file}`, Line: index + 1 })
            }
        })
    }
    return found
}

/**
 * Values used more than once, each carrying every place it was found, sorted so the
 * report is stable across runs. Sorted by value and by position, because an
 * unstable failure message is a failure message nobody trusts.
 */
const DuplicateGroups = (occurrences: readonly GuidOccurrence[]): [string, GuidOccurrence[]][] => {
    const byGuid = new Map<string, GuidOccurrence[]>()
    for (const occurrence of occurrences) {
        const group = byGuid.get(occurrence.Guid)
        if (group == null) {
            byGuid.set(occurrence.Guid, [occurrence])
        }
        else {
            group.push(occurrence)
        }
    }
    return [...byGuid.entries()]
        .filter(([guid, group]) => group.length > 1 && !SharedGuidExceptions.has(guid))
        .sort(([left], [right]) => left.localeCompare(right))
}

const DescribeOccurrence = (occurrence: GuidOccurrence) =>
    `${occurrence.File}:${occurrence.Line}`

/**
 * The scan runs once at module scope: it touches the filesystem, and every case
 * below asserts a different property of the same reading.
 */
const Occurrences = CollectGuidOccurrences()

describe('GUID uniqueness', () => {
    it('collects a plausible number of literals from src/', () => {
        // Guards against a broken scan — a bad path, a regex that stopped matching —
        // reporting a clean bill of health because it read nothing at all. The same
        // reasoning `registration-manifest.test.ts` uses for its order-of-magnitude
        // assertion.
        assert.ok(
            Occurrences.length > 50,
            `expected to collect GUID literals under src/, found ${Occurrences.length}`
        )
    })

    it('uses every GUID value exactly once', () => {
        const duplicates = DuplicateGroups(Occurrences)

        const report = duplicates
            .map(([guid, group]) =>
                `  ${guid} appears ${group.length} times:\n` +
                group.map(occurrence => `      ${DescribeOccurrence(occurrence)}`).join('\n')
            )
            .join('\n')

        assert.deepEqual(
            duplicates.map(([guid]) => guid),
            [],
            'a GUID literal is used more than once. Two handlers registered under one value ' +
            'throw at load, and two identifiers sharing one value collide in the game\'s ' +
            'registries. Derive the new value from the mod root instead ' +
            '(src/KDExtension/Release.ts), or — only if the sharing is deliberate — record ' +
            'it in SharedGuidExceptions with the reason.\n' + report
        )
    })

    it('carries no exception that is no longer needed', () => {
        const counts = new Map<string, number>()
        for (const occurrence of Occurrences) {
            counts.set(occurrence.Guid, (counts.get(occurrence.Guid) ?? 0) + 1)
        }

        const stale = [...SharedGuidExceptions.keys()].filter(guid => (counts.get(guid) ?? 0) < 2)
        assert.deepEqual(
            stale,
            [],
            'these SharedGuidExceptions entries are no longer duplicated, or no longer present, ' +
            'and must be deleted so the list stays a record of real sharing: ' + stale.join(', ')
        )
    })

    it('detects a duplicate, so the scan cannot pass by finding nothing', () => {
        // The load-bearing case. `matches the enumerated expectation` compares the tree
        // *against* the collection, so a scan that silently collected nothing — or that
        // de-duplicated as it went — would still agree with itself and report health. This
        // feeds the collection two copies of one literal and requires it to say so.
        const duplicated = 'AAAAAAAA-AAAA-4AAA-8AAA-AAAAAAAAAAAA'
        const source = [
            `const a = '${duplicated}'`,
            `const b = '${duplicated.toLowerCase()}'`,
            `const c = 'BBBBBBBB-BBBB-4BBB-8BBB-BBBBBBBBBBBB'`,
        ].join('\n')

        const found = [...source.matchAll(GuidPattern)].map(match => ({
            Guid: match[0].toLowerCase(),
            File: 'src/pretend.ts',
            Line: 1,
        }))
        assert.equal(found.length, 3, 'the pattern must see every literal on every line')

        const groups = DuplicateGroups(found)
        assert.deepEqual(
            groups.map(([guid]) => guid),
            [duplicated.toLowerCase()],
            'the duplicate detector missed a literal used twice, or flagged a literal used once'
        )
        assert.equal(groups[0][1].length, 2, 'the report must carry both places')
    })

    it('matches the enumerated expectation', () => {
        const actual = [...new Set(Occurrences.map(occurrence => occurrence.Guid))].sort()
        const expected = [...new Set(ExpectedGuids)].sort()

        assert.deepEqual(
            actual,
            expected,
            'the set of GUID literals under src/ changed. An intended new identifier is added ' +
            'to ExpectedGuids in this file as part of the same reviewed change; a value that ' +
            'is gone is removed from it. Anything else is a copy-paste or a lost identifier.'
        )
    })

    it('keeps the expectation itself free of duplicates and sorted', () => {
        // The expectation is hand-maintained, so it gets the same discipline as the
        // thing it checks: a duplicated or unsorted entry would make the diff above
        // harder to read exactly when it matters most.
        assert.deepEqual(ExpectedGuids, [...ExpectedGuids].sort(), 'ExpectedGuids is sorted')
        assert.equal(
            new Set(ExpectedGuids).size,
            ExpectedGuids.length,
            'ExpectedGuids carries a duplicated value'
        )
    })

    it('treats case as insignificant, and counts each occurrence', () => {
        // Both halves are load-bearing and both are cheap to get wrong: a scan that
        // normalised one side only would miss `aa…` duplicating `AA…`, and a scan that
        // de-duplicated per file would miss the copy-paste inside a single module,
        // which is the likeliest kind.
        const repeated = [
            `const A = 'AAAAAAAA-AAAA-4AAA-8AAA-AAAAAAAAAAAA'`,
            `const B = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'`,
        ].join('\n')

        const found = [...repeated.matchAll(GuidPattern)].map(match => match[0].toLowerCase())
        assert.equal(found.length, 2, 'an upper-case and a lower-case literal are two occurrences')
        assert.equal(found[0], found[1], 'and they compare equal once normalised')
    })
})
