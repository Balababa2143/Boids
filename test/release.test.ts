/**
 * The release record, and the guarantees `docs/spec.md` §4.1–4.3 place on it.
 *
 * Two kinds of claim are checked here, and they are different in nature:
 *
 *  - **Agreement** — the version in code, in `package.json` and in the mod manifest are
 *    one version. `webpack/verify.ts` fails the build on the same comparison; this is the
 *    half that runs without a build, so a checkout that cannot build still learns it drifted.
 *  - **Structure** — the release table is ordered, holds the current root exactly once, and
 *    the migration chain matches it row for row. A table that disagrees with the chain would
 *    localise a save to a release whose migration never runs.
 */

import assert from 'node:assert/strict'
import * as path from 'node:path'
import { describe, it } from 'node:test'

import { v5 as uuidv5 } from 'uuid'

import {
    MigrationChain,
    Release,
    ReleaseTable,
    GetCurrentReleaseIndex,
    DeriveIdentifier,
    GetMigrationsForRoot,
    GetReleaseIndexOf,
    RootUuidKey,
    VariantBaseNames,
} from '../src/KDExtension/Release'
import {
    ExtractReleaseVersion,
    ReadDeclaredReleaseVersion,
    ReadRootPackageVersion,
    releaseSourceFile,
} from './harness/release'
import { ReadJson as ReadJsonFile } from './harness/text'

const RepoRoot = process.cwd()

/** A repository file, parsed as JSON, read through the harness's one reader. */
const ReadJson = (relative: string): unknown => ReadJsonFile(path.resolve(RepoRoot, relative))

describe('release identity', () => {
    it('declares a version that can be read out of the source', () => {
        // Two assertions, so a pattern that stopped matching cannot pass as a clean tree:
        // the extraction is exercised against a literal first, then against the file.
        assert.equal(
            ExtractReleaseVersion(`export const Release: RootedReleaseRecord = {\n    Version: '9.9.9',\n    Root: 'x',\n}`),
            '9.9.9',
            'the version pattern no longer reads a declaration written in the documented shape'
        )
        assert.notEqual(
            ReadDeclaredReleaseVersion(),
            undefined,
            `${path.relative(RepoRoot, releaseSourceFile)} declares no readable \`export const Release\` with a \`Version\``
        )
    })

    it('agrees with package.json', () => {
        assert.equal(
            ReadDeclaredReleaseVersion(),
            ReadRootPackageVersion(),
            'Release.Version and package.json\'s version must move together: package.json stamps ' +
            'modbuild and the types package, and Release.Version is what the load gate compares a ' +
            'save\'s root against'
        )
    })

    it('agrees with the shipped mod manifest', () => {
        // `Asset/mod.json` is committed and copied into the bundle, and the build re-stamps
        // it from package.json on the way out. A committed file that lags is what a release
        // built from a dirty tree would ship, so it is checked rather than assumed.
        const manifest = ReadJson('Asset/mod.json') as { modbuild?: string }
        assert.equal(manifest.modbuild, Release.Version)
    })

    it('runs in the package it claims to', () => {
        // Not a version claim, whatever the old title said: this is the guard that the tests are
        // running against this repository and not a checkout that happens to be above it.
        const pkg = ReadJson('package.json') as { name?: string }
        assert.equal(pkg.name, 'boids')
    })
})

describe('the release table', () => {
    it('is ordered, and its first row is the release with no root', () => {
        // The table's order *is* the chain's order, so this is the assumption the migration
        // walk is built on rather than a cosmetic property.
        assert.ok(ReleaseTable.length >= 2, 'the table carries at least the pre-versioning release')
        assert.equal(ReleaseTable[0].Root, null, 'the first row is the release that had no root')
        for (const record of ReleaseTable.slice(1)) {
            assert.notEqual(record.Root, null, `${record.Version} carries no root`)
        }
    })

    it('names a version for every row, with no repeats', () => {
        const versions = ReleaseTable.map(record => record.Version)
        assert.deepEqual(versions, [...new Set(versions)], 'two rows claim one release')
        for (const version of versions) {
            assert.notEqual(version.trim(), '', 'a row has an empty version')
        }
    })

    it('locates the current release at the end of the table', () => {
        assert.equal(ReleaseTable[GetCurrentReleaseIndex()].Version, Release.Version)
        assert.equal(ReleaseTable[GetCurrentReleaseIndex()].Root, Release.Root)
        assert.equal(GetCurrentReleaseIndex(), ReleaseTable.length - 1,
            'the current release must be the newest row, or the chain has nothing after it')
    })

    it('tells an absent root, an unknown root and the current root apart', () => {
        assert.equal(GetReleaseIndexOf(undefined), undefined, 'an absent root is not a release')
        assert.equal(GetReleaseIndexOf(''), undefined, 'an empty root is not a release')
        assert.equal(GetReleaseIndexOf('not-a-uuid'), undefined, 'an unknown root is not a release')
        assert.equal(GetReleaseIndexOf(null), undefined, 'a null root is not a release')
        assert.equal(GetReleaseIndexOf(Release.Root), GetCurrentReleaseIndex())
    })
})

describe('the migration chain', () => {
    it('has one slot per release, in the table\'s order', () => {
        assert.deepEqual(
            MigrationChain.map(slot => slot.Release),
            ReleaseTable.map(record => record.Version),
            'a release without a slot would be skipped silently rather than failed'
        )
    })

    it('runs nothing for a save at the current release', () => {
        assert.deepEqual(GetMigrationsForRoot(Release.Root), [])
    })

    it('runs the slots after the save\'s release, and none before it', () => {
        // The old release's slot is the one that would carry a save *out of* it, so a save
        // written by a release runs every slot after its own index — and never its own.
        // The first row is skipped because it has no root to look up.
        for (let row = 1; row < ReleaseTable.length; row++) {
            const migrations = GetMigrationsForRoot(ReleaseTable[row].Root)
            assert.notEqual(migrations, undefined, `${ReleaseTable[row].Version} localises to nothing`)
            assert.deepEqual(
                migrations?.map(slot => slot.Release),
                ReleaseTable.slice(row + 1).map(record => record.Version),
                `the chain from ${ReleaseTable[row].Version} is not the releases after it`
            )
        }
    })

    it('reports an unknown root rather than an empty chain', () => {
        // An empty chain and an unknown root are different answers: one means "nothing to
        // do", the other "this build cannot read the save at all". Collapsing them would
        // make a newer release's save load as if it were current.
        assert.equal(GetMigrationsForRoot('11111111-1111-4111-8111-111111111111'), undefined)
    })

    it('contains no refusal in any shipped slot yet', () => {
        // A refusal is the mechanism for a breaking release, and this release is not one.
        // If this ever fails, the release is deliberately breaking saves and that is a
        // decision to make on purpose rather than discover.
        for (const slot of MigrationChain) {
            assert.equal(slot.Migrate().kind, 'accept', `${slot.Release} refuses a save`)
        }
    })
})

describe('derived identifiers', () => {
    it('mints the root from its documented recipe', () => {
        // Not a round-trip through the code that produced it: recomputed here from the
        // recipe `Release.ts` documents, so the literal in the source is auditable rather
        // than merely self-consistent.
        const DnsNamespace = '6ba7b810-9dad-11d1-80b4-00c04fd430c8'
        assert.equal(uuidv5(`Boids.ModRoot.${Release.Version}`, DnsNamespace), Release.Root)
    })

    it('is deterministic', () => {
        for (const name of Object.values(VariantBaseNames)) {
            assert.equal(DeriveIdentifier(name), DeriveIdentifier(name))
        }
        assert.equal(DeriveIdentifier(VariantBaseNames.ArmLinkModel), DeriveIdentifier(VariantBaseNames.ArmLinkModel))
    })

    it('keeps every name, and therefore every base, distinct', () => {
        // Two names that collided would produce one base for two families, and the second
        // family's variants would collide in the game's registries rather than in a diff.
        const names = Object.values(VariantBaseNames)
        assert.deepEqual(names, [...new Set(names)], 'two variant bases share a name')

        const derived = names.map(name => DeriveIdentifier(name))
        assert.deepEqual(derived, [...new Set(derived)], 'two variant bases derived to one value')
    })

    it('uses names that cannot be mistaken for a minted identifier', () => {
        // The name is the *value* hashed under the root, so it is what a reader sees. A name
        // that looked like a UUID would make the stored path indistinguishable from the id
        // it derives.
        for (const name of Object.values(VariantBaseNames)) {
            assert.match(name, /^Boids\.[A-Za-z0-9.]+$/, `${name} is not a readable namespaced name`)
        }
    })

    it('keeps the root key out of the identifier namespace', () => {
        // `RootUuidKey` is a key beside UUID-shaped data, not a derived identifier. If it
        // were UUID-shaped it would join the identifier namespace and the GUID-uniqueness
        // test would have to carry an exception for a value that is not an identifier.
        assert.doesNotMatch(RootUuidKey, /^[0-9a-f-]{36}$/i)
        assert.notEqual(RootUuidKey.trim(), '')
    })
})
