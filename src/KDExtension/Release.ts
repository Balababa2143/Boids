/**
 * The release identity, the mod root UUID every derived identifier is minted under,
 * and the two version records the load path needs: the table that localises a saved
 * `root_uuid`, and the chain of migrations to walk a save forward.
 *
 * This module is not a namespace of content and registers nothing; it is code the
 * rest of the mod derives values from. It has no imports, so it cannot take part in
 * a cycle no matter who needs it.
 *
 * Reachable as `Boids.Futuristic` and `Boids.MachinePrime` are *not*: it is not
 * re-exported from `src/Boids/index.ts`, because the root UUID and the release
 * table are the mod's own business rather than a surface for other mods
 * (`README.md`, `test/public-api.test.ts`).
 *
 * ## The construction
 *
 * ```ts
 * uuidv5(identifierName, Release.Root)
 * //      └─ the namespaced name is the VALUE ─┘  └─ the root is the NAMESPACE ─┘
 * ```
 *
 * The **name is the value** and the **root is the namespace**, and the argument
 * order is the trap: `uuid`'s signature is `v5(value, namespace)`, the namespace has
 * to parse as a UUID, and `node_modules/uuid/dist/v35.js` calls `parse()`, which
 * throws `TypeError('Invalid UUID')` for anything else. Swapping the two arguments
 * is the single easiest way to break every identifier in the mod, and the
 * repository's working call already has this order
 * (`src/KDExtension/Variant/Common.ts`).
 *
 * ## What changing the root costs
 *
 * **The root is the version carrier**, so a bump renames *every* model and restraint
 * the mod generates — the runtime names are `uuidv5(variantKey, baseId)` and the
 * `baseId`s are derived from the root. That is why the table below exists: the
 * version table turns a rename from an accident into a decision, and **a release
 * that does not intend to break saves keeps its root.**
 *
 * ## Why the table holds roots rather than releases
 *
 * A root is not minted per release; it is minted per *save-breaking* release. A
 * release that keeps its root adds no row, because the load gate only needs to
 * answer two questions about a save: *is this root one I know?* and *is it mine, or
 * older?* Recording the same root once per non-breaking release would grow a table
 * that answers neither better.
 * @module KDExtension/Release
 */

import { v5 as uuidv5 } from 'uuid'

/**
 * The `root_uuid` a character's save carries, as a key on `KDGameData`.
 *
 * The key is a plain enumerable string, and the exported constant is its single
 * definition: the save wrapper writes it and the load gate reads it, and neither
 * spells it a second time.
 *
 * It is **not** a UUID. It is a key that happens to be next to UUID-shaped data, and
 * giving it a UUID would put a value in the identifier namespace that is not an
 * identifier — which is exactly what the GUID-uniqueness test would then have to
 * allow.
 */
export const RootUuidKey = 'BoidsRootUUID'

/**
 * One release of the mod, as the version table records it: the semver string the
 * build stamps into `Asset/mod.json`'s `modbuild`, and the root UUID that release
 * minted its identifiers under.
 *
 * `Root` is nullable **because the table's first row is a release that predates
 * versioned identifiers**, not because a root is ever optional in practice. The
 * distinction is carried by {@link CurrentRelease}, whose root is a plain `string`
 * — so "the root is absent" is expressible exactly once, at the one place it is
 * true, and never reachable from the current release.
 */
export interface ReleaseRecord {
    /** `package.json`'s `version`, which the build stamps into `modbuild`. */
    readonly Version: string
    /**
     * The root the release used. `null` for a release that predates versioned
     * identifiers and therefore has no root to resolve — see {@link ReleaseTable}.
     */
    readonly Root: string | null
}

/**
 * A release that has a root: everything a {@link ReleaseRecord} has, with the one
 * field the current release cannot leave absent narrowed.
 */
export interface RootedReleaseRecord extends ReleaseRecord {
    readonly Root: string
}

/**
 * The current release: the version this build ships as, and the root every
 * identifier it mints is derived under.
 *
 * `Version` must equal `package.json`'s `version`. `webpack/verify.ts` fails the
 * build when it does not, and `test/release.test.ts` fails the suite when it does
 * not, so the two cannot drift apart without something saying so.
 *
 * **Where the root came from, so it is a decision rather than a number.** It is not
 * a random value: it is `uuidv5('Boids.ModRoot.0.5.0', <the DNS namespace>)`, using
 * the DNS namespace `6ba7b810-9dad-11d1-80b4-00c04fd430c8`. Anybody can recompute it
 * with the recipe instead of trusting this literal, which is the property a root has
 * to have — a value nobody can regenerate is a value nobody can audit. The release
 * is in the name, so two releases cannot be given the same root by copy-paste.
 */
export const Release: RootedReleaseRecord = {
    Version: '0.5.0',
    Root: '63db7078-2520-56f8-88ce-fcf641af137b',
}

/**
 * Every release whose root a save might carry, oldest first.
 *
 * The order is the chain's order, and a save's position in it is what the load gate compares
 * against the end.
 *
 * The `0.4.0` row is the historical start point, and it is the one row with no root: 0.4.0 is
 * the release *before* versioned identifiers, so its characters have no `root_uuid` at all.
 * That state is not a missing row — it is the state the confirmation path exists for, and the
 * gate recognises it by the key being absent rather than by matching a value here. The row
 * stays in the table so the chain's indices are fixed from the beginning, which is the same
 * reason a migration slot with an empty body is normal.
 *
 * **A release that keeps its root adds no row.** Only a save-breaking release mints a new
 * root, and therefore a new row.
 */
export const ReleaseTable: readonly ReleaseRecord[] = [
    { Version: '0.4.0', Root: null },
    { Version: Release.Version, Root: Release.Root },
]

/**
 * Where in {@link ReleaseTable} the release this build *is* sits: the last row.
 *
 * **A function, not a constant.** A cached index and the table it describes are two things that
 * have to agree, and the whole reason the table is ordered is to answer exactly this question —
 * deriving it on every read removes the class of bug where they stop. It is one array read.
 */
export const GetCurrentReleaseIndex = (): number => ReleaseTable.length - 1

/**
 * An assertion at module evaluation, so a broken table fails at load rather than at the moment
 * a save is refused for the wrong reason.
 */
if (ReleaseTable[GetCurrentReleaseIndex()]?.Root !== Release.Root) {
    throw new Error(
        'Boids release table: the newest row must be the release this build is. Add the release ' +
        'rather than reusing a previous root.'
    )
}

/**
 * Which release a saved `root_uuid` belongs to, or `undefined` when the root is not one this
 * build knows.
 *
 * An unknown root is **not** the same finding as an absent one: an absent key means a character
 * written before versioned identifiers, while an unknown value means a release this build has
 * never heard of — which can only be a *newer* save, since the table carries the whole history.
 * The two lead to different handling and must not share a test.
 *
 * @param root - The value a save carried under {@link RootUuidKey}.
 * @returns Its index in {@link ReleaseTable}, or `undefined` if unknown.
 */
export const GetReleaseIndexOf = (root: unknown): number | undefined => {
    if (typeof root !== 'string' || root.length === 0) {
        return undefined
    }
    const index = ReleaseTable.findIndex(record => record.Root === root)
    return index < 0 ? undefined : index
}

/**
 * The stable name of every variant base the mod derives from, per registered family.
 *
 * A variant base is the namespace the variant infrastructure hashes a variant key
 * under — `uuidv5(JSON.stringify(variantKey), base)` — and there is one per family
 * per half, because a family's model map and restraint map are two independent
 * namespaces and sharing a base would collide them.
 *
 * **A name here is a persisted-format decision, exactly as a variant-key field is.**
 * Renaming one mints a different identifier, so it is a save migration rather than a
 * cleanup, and the same discipline applies.
 */
export const VariantBaseNames = {
    /** The arm links' restraints and models. */
    ArmLinkRestraint: 'Boids.Futuristic.Link.Arm.Restraint.Base',
    ArmLinkModel: 'Boids.Futuristic.Link.Arm.Model.Base',
    /** The leg links' restraints and models. */
    LegLinkRestraint: 'Boids.Futuristic.Link.Leg.Restraint.Base',
    LegLinkModel: 'Boids.Futuristic.Link.Leg.Model.Base',
    /** The glass visor set. `Item` is the restraint map, `Model` the model map. */
    GlassVisorItem: 'Boids.Futuristic.GlassVisor.Item.Base',
    GlassVisorModel: 'Boids.Futuristic.GlassVisor.Model.Base',
    /** The HUD glass the visor displays. */
    HudGlassVisorModel: 'Boids.Futuristic.HUD.Glass.Visor.Model.Base',
} as const satisfies Record<string, string>

/**
 * The `DimensionId` namespace of the control model (`docs/spec.md` §4.1, §6.2).
 *
 * Empty in Phase 0 **on purpose**: the scheme is stood up before the first
 * identifier is minted, so Phase 1's dimensions derive from their first day rather
 * than being retrofitted. Declaring the kind here is what keeps that a commitment
 * rather than an intention.
 *
 * It is a second object rather than a second section of one, so the two kinds of
 * identifier cannot be handed to each other's API: a dimension name is not a
 * variant base, and `DeriveIdentifier` refuses it at compile time.
 */
export const DimensionName = {} as const satisfies Record<string, string>

/**
 * Every variant-base name the mod derives from, as a union rather than the object,
 * so {@link DeriveIdentifier} can be typed to "a name from the registry" instead of
 * to `string`.
 */
export type VariantBaseName = typeof VariantBaseNames[keyof typeof VariantBaseNames]

/**
 * Mints an identifier from its namespaced name, under the current root.
 *
 * Deterministic and pure: the same name always yields the same value, which is what
 * lets a save store the *path* and recompute the id at load instead of trusting a
 * remembered one.
 *
 * @param name - A name from {@link VariantBaseName}. Never a `uuid`: an
 *   already-derived value would be derived a second time, so the parameter is typed
 *   to a named constant rather than to `string`.
 * @returns The derived UUID.
 */
export const DeriveIdentifier = (name: VariantBaseName): string => uuidv5(name, Release.Root)

/**
 * The variant bases the shipped content registers under, derived once so that a
 * reader sees a family's base beside the family rather than a literal in its file.
 *
 * These were hand-written UUID v4 literals until Phase 0, which meant they were
 * unversioned forever: nothing could recognise or retire them programmatically.
 * Their values **change** in this release, which renames every model and restraint
 * the mod generates — the rename D1 accepts, and the reason {@link ReleaseTable}
 * exists.
 */
export const DerivedVariantBase = {
    ArmLinkRestraint: DeriveIdentifier(VariantBaseNames.ArmLinkRestraint),
    ArmLinkModel: DeriveIdentifier(VariantBaseNames.ArmLinkModel),
    LegLinkRestraint: DeriveIdentifier(VariantBaseNames.LegLinkRestraint),
    LegLinkModel: DeriveIdentifier(VariantBaseNames.LegLinkModel),
    GlassVisorItem: DeriveIdentifier(VariantBaseNames.GlassVisorItem),
    GlassVisorModel: DeriveIdentifier(VariantBaseNames.GlassVisorModel),
    HudGlassVisorModel: DeriveIdentifier(VariantBaseNames.HudGlassVisorModel),
} as const satisfies Record<keyof typeof VariantBaseNames, string>

/**
 * A migration slot's refusal.
 *
 * Carries enough for the gate to tell the player *which* release is unhappy and why, and to
 * offer the one safe way out of the load menu. Both are the slot's to decide, because only
 * the slot knows what it could not carry across.
 *
 * **Every refusal is shown**, even a quiet one: `ReturnToMenu` chooses between the two
 * answers a player may be given, not whether they are told at all. A refusal nobody is told
 * about is indistinguishable from a bug, and this is the one place the mod knows for certain
 * that a save could not be read.
 */
export interface RefusedOutcome {
    readonly kind: 'refuse'
    /**
     * Why the slot could not carry the save forward, in the slot's own words. It reaches the
     * player verbatim, so it should name the change rather than the symptom.
     */
    readonly reason: string
    /**
     * Whether to offer leaving the load menu for the game's own main menu.
     *
     * **True only when staying would not help**: a save refused because its shape cannot be
     * carried forward will not become loadable by trying again, and leaving is the graceful
     * end. False for a refusal that concerns *this* save among others — a corrupt slot, say —
     * where staying lets the player choose a different one.
     *
     * Setting it true is a promise the gate keeps mechanically: it sets the game's own state
     * and **writes nothing**, so the save on disk is untouched and remains loadable by a
     * release that understands it.
     */
    readonly ReturnToMenu: boolean
}

/**
 * How a migration slot leaves the save: accept it as it stands, accept it and be
 * given the live `KDGameData` to amend once the game has adopted it, or refuse it.
 *
 * A refusal is a **returned value and never a throw**: the gate runs inside
 * `KinkyDungeonLoadGame`, and a throw from there walks into the game's own
 * crash-report path (`base/KinkyDungeonErrors.ts`), which `docs/spec.md` §4.4
 * forbids.
 *
 * `accept-and-apply` carries the work rather than mutating the parsed save string,
 * because a semantic migration mostly edits `KDGameData` — which does not exist as
 * a value the gate owns until the game has adopted the save. The gate therefore runs
 * these after the load, and only the *decision* stays in the gate.
 */
export type MigrationOutcome =
    | { readonly kind: 'accept' }
    | { readonly kind: 'accept-and-apply', readonly apply: (_: unknown) => void }
    | RefusedOutcome

/**
 * One slot of the migration chain: the release it migrates *from*, in the order the
 * releases shipped.
 *
 * A slot per release, numbered by position, so the chain's indices are fixed even
 * when most slots do nothing — and an empty body is the normal case, because most
 * releases change nothing about the persisted shape.
 */
export interface MigrationSlot {
    /**
     * The release this slot carries a save out of. It must match
     * {@link ReleaseTable} at the same index, and `test/release.test.ts` checks that
     * it does, so a table row and a slot cannot disagree about which release they
     * describe.
     */
    readonly Release: string
    /**
     * Migrates a save written by this release. The slot owns its own semantics; the
     * gate only walks the chain.
     */
    readonly Migrate: () => MigrationOutcome
}

/**
 * The migration chain, in release order, one slot per release.
 *
 * At most one slot has work in a given release — the one for the release the build
 * is now *leaving* — and every other slot is intentionally empty. The array's
 * length must equal {@link ReleaseTable}'s, and `test/release.test.ts` holds that,
 * because a missing slot would silently skip a version rather than fail.
 *
 * `0.4.0`'s slot accepts: an unversioned save never reaches the chain, so a
 * migration here would be dead code. It exists as the chain's fixed first index,
 * and its emptiness is the honest statement that nothing has been released with a
 * versioned shape yet.
 */
export const MigrationChain: readonly MigrationSlot[] = [
    {
        Release: '0.4.0',
        Migrate: () => ({ kind: 'accept' }),
    },
    {
        Release: '0.5.0',
        Migrate: () => ({ kind: 'accept' }),
    },
]

/**
 * The migrations to run for a save written under a known root: every slot after the
 * save's release, in order, oldest first.
 *
 * The walk is expressed as *everything after* rather than *a lookup for the
 * current release*, because that is what makes it forward-only: a save is never
 * migrated backwards, and a save already at the current release gets an empty
 * chain.
 *
 * @param savedRoot - The value the save carried under {@link RootUuidKey}.
 * @returns The slots to run, or `undefined` when the root is not known.
 */
export const GetMigrationsForRoot = (savedRoot: unknown): readonly MigrationSlot[] | undefined => {
    const savedIndex = GetReleaseIndexOf(savedRoot)
    if (savedIndex == null || savedIndex > GetCurrentReleaseIndex()) {
        return undefined
    }
    return MigrationChain.slice(savedIndex + 1)
}

//#region Test support

/**
 * Temporarily puts one or more past versioned releases into the table and the chain, for the
 * duration of `body`.
 *
 * **Why this exists rather than a mock.** A migration only has work when a save comes from an
 * *older versioned* release, and this is the first release with a root — so the shipped chain has
 * nothing to walk and could not be exercised at all. The alternative is to invent a refusing slot
 * in production, which would put a lie in the code to make a test possible.
 *
 * **The shape has a rule, and it is the chain's own.** A save from a release runs the slots
 * *after* that release, so a slot can only decide a save it is downstream of. To exercise a slot,
 * pass the release the save comes from **before** the release whose slot decides it: the caller
 * installs them oldest first, and the later one's slot is the one that runs.
 *
 * This adds rows **in the shape a real release adds one**, and takes them away afterwards in a
 * `finally`. From the next release onward the real case exists, and this becomes a way to pin it
 * rather than the only way to reach it.
 *
 * @param releases - The past releases to insert, oldest first, each with a root of its own.
 * @param Migrate - The deciding slot for each: `Migrate[i]` is the slot for `releases[i]`.
 * @param body - Runs with the rows and slots installed.
 */
export const WithReleasesForTesting = <T>(
    releases: readonly RootedReleaseRecord[],
    Migrate: readonly (() => MigrationOutcome)[],
    body: () => T
): T => {
    const table = ReleaseTable as ReleaseRecord[]
    const chain = MigrationChain as MigrationSlot[]
    const tableLength = table.length
    const chainLength = chain.length

    releases.forEach((record, index) => {
        table.splice(tableLength - 1 + index, 0, record)
        chain.splice(chainLength - 1 + index, 0, { Release: record.Version, Migrate: Migrate[index] })
    })
    try {
        return body()
    }
    finally {
        table.length = tableLength
        chain.length = chainLength
    }
}

//#endregion
