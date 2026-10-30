/**
 * The release identity, the mod root UUID every identifier is minted under, and the version table and
 * migration chain the load path walks. The root is the version carrier — a bump renames everything —
 * and `uuidv5` takes the value first and the namespace second.
 * @module KDExtension/Release
 */

import { v5 as uuidv5 } from 'uuid'

/** The `root_uuid` a character's save carries, as a key on `KDGameData`: its single definition, and not a UUID. */
export const RootUuidKey = 'BoidsRootUUID'

/**
 * One release of the mod: the semver string the build stamps into `Asset/mod.json`'s `modbuild`, and
 * the root UUID it minted its identifiers under. `Root` is nullable because the table's first row
 * predates versioned identifiers.
 */
export interface ReleaseRecord {
    /** `package.json`'s `version`, which the build stamps into `modbuild`. */
    readonly Version: string
    /** The root the release used. `null` for a release that predates versioned identifiers. */
    readonly Root: string | null
}

/** A release that has a root: {@link ReleaseRecord} with the one field narrowed. */
export interface RootedReleaseRecord extends ReleaseRecord {
    readonly Root: string
}

/**
 * The current release: the version this build ships as, and the root every identifier is derived under.
 *
 * `Version` must equal `package.json`'s `version`, or the build and the suite both fail.
 */
export const Release: RootedReleaseRecord = {
    Version: '0.5.0',
    Root: '63db7078-2520-56f8-88ce-fcf641af137b',
}

/**
 * Every release whose root a save might carry, oldest first: a save's position here is what the load
 * gate compares against the end.
 *
 * A release that keeps its root adds no row.
 */
export const ReleaseTable: readonly ReleaseRecord[] = [
    { Version: '0.4.0', Root: null },
    { Version: Release.Version, Root: Release.Root },
]

/**
 * Where in {@link ReleaseTable} the release this build is sits: the last row, derived so it cannot drift.
 */
export const GetCurrentReleaseIndex = (): number => ReleaseTable.length - 1

/** Fails at load rather than at the moment a save is refused for the wrong reason. */
if (ReleaseTable[GetCurrentReleaseIndex()]?.Root !== Release.Root) {
    throw new Error(
        'Boids release table: the newest row must be the release this build is. Add the release ' +
        'rather than reusing a previous root.'
    )
}

/**
 * Which release a saved `root_uuid` belongs to, or `undefined` when the root is not one this build
 * knows. An unknown root is not an absent one: absent means a character written before versioned
 * identifiers, unknown a release this build has never heard of.
 *
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
 * The stable name of every variant base the mod derives from, per registered family — the namespace a
 * variant key is hashed under, `uuidv5(JSON.stringify(variantKey), base)`.
 *
 * A name here is a persisted-format decision: renaming one remints its identifier and is a save
 * migration. The `Boids.` prefix is frozen for that reason and is never updated to match a rename
 * elsewhere.
 */
export const VariantBaseNames = {
    ArmLinkRestraint: 'Boids.Futuristic.Link.Arm.Restraint.Base',
    ArmLinkModel: 'Boids.Futuristic.Link.Arm.Model.Base',
    LegLinkRestraint: 'Boids.Futuristic.Link.Leg.Restraint.Base',
    LegLinkModel: 'Boids.Futuristic.Link.Leg.Model.Base',
    /** The glass visor set. `Item` is the restraint map, `Model` the model map. */
    GlassVisorItem: 'Boids.Futuristic.GlassVisor.Item.Base',
    GlassVisorModel: 'Boids.Futuristic.GlassVisor.Model.Base',
    /** The HUD glass the visor displays. */
    HudGlassVisorModel: 'Boids.Futuristic.HUD.Glass.Visor.Model.Base',
    /** The collar and cuff family. */
    CuffRestraint: 'Boids.Futuristic.Cuff.Restraint.Base',
    CuffModel: 'Boids.Futuristic.Cuff.Model.Base',
    /** The chastity set: four restraints, one per garment and cut. */
    ChastityRestraint: 'Boids.Futuristic.Aroused.Chastity.Restraint.Base',
    /** The toy set: a lockable vibe and two denial plugs. */
    ToysRestraint: 'Boids.Futuristic.Aroused.Toys.Restraint.Base',
} as const satisfies Record<string, string>

/**
 * The `DimensionId` namespace of the control model: a second object, so a dimension name cannot be handed
 * to {@link DeriveIdentifier} where a variant base belongs.
 */
export const DimensionName = {} as const satisfies Record<string, string>

/**
 * Every variant-base name the mod derives from, as a union, so {@link DeriveIdentifier} takes a name
 * rather than `string`.
 */
export type VariantBaseName = typeof VariantBaseNames[keyof typeof VariantBaseNames]

/**
 * Mints an identifier from its namespaced name, under the current root: deterministic and pure, which is
 * what lets a save store the path and recompute the id at load.
 *
 * @param name - A name from {@link VariantBaseName}. Never a `uuid`, which would be derived a second time.
 */
export const DeriveIdentifier = (name: VariantBaseName): string => uuidv5(name, Release.Root)

/**
 * The variant bases the shipped content registers under, derived once so a family's base is written
 * beside the family.
 */
export const DerivedVariantBase = {
    ArmLinkRestraint: DeriveIdentifier(VariantBaseNames.ArmLinkRestraint),
    ArmLinkModel: DeriveIdentifier(VariantBaseNames.ArmLinkModel),
    LegLinkRestraint: DeriveIdentifier(VariantBaseNames.LegLinkRestraint),
    LegLinkModel: DeriveIdentifier(VariantBaseNames.LegLinkModel),
    GlassVisorItem: DeriveIdentifier(VariantBaseNames.GlassVisorItem),
    GlassVisorModel: DeriveIdentifier(VariantBaseNames.GlassVisorModel),
    HudGlassVisorModel: DeriveIdentifier(VariantBaseNames.HudGlassVisorModel),
    CuffRestraint: DeriveIdentifier(VariantBaseNames.CuffRestraint),
    CuffModel: DeriveIdentifier(VariantBaseNames.CuffModel),
    ChastityRestraint: DeriveIdentifier(VariantBaseNames.ChastityRestraint),
    ToysRestraint: DeriveIdentifier(VariantBaseNames.ToysRestraint),
} as const satisfies Record<keyof typeof VariantBaseNames, string>

/**
 * A migration slot's refusal: enough for the gate to tell the player which release is unhappy and why,
 * and to offer the one safe way out of the load menu.
 */
export interface RefusedOutcome {
    readonly kind: 'refuse'
    /** Why the slot could not carry the save forward, in the slot's own words; it reaches the player verbatim. */
    readonly reason: string
    /**
     * Whether to offer leaving the load menu for the game's own main menu. True only when staying would
     * not help; setting it true writes nothing, so the save on disk stays loadable by a release that
     * understands it.
     */
    readonly ReturnToMenu: boolean
}

/**
 * How a migration slot leaves the save: accept it as it stands, accept it and be given the live
 * `KDGameData` to amend once the game has adopted it, or refuse it.
 *
 * A refusal is a returned value and never a throw, because the gate runs inside
 * `KinkyDungeonLoadGame`. `accept-and-apply` carries the work because a semantic migration edits
 * `KDGameData`, which the gate does not own until the load.
 */
export type MigrationOutcome =
    | { readonly kind: 'accept' }
    | { readonly kind: 'accept-and-apply', readonly apply: (_: unknown) => void }
    | RefusedOutcome

/**
 * One slot of the migration chain: the release it migrates from, in the order the releases shipped.
 *
 * One slot per release, so the chain's indices are fixed even when a slot does nothing; an empty body
 * is the normal case.
 */
export interface MigrationSlot {
    /** The release this slot carries a save out of. It must match {@link ReleaseTable} at the same index. */
    readonly Release: string
    /** Migrates a save written by this release: the slot owns its semantics, and the gate only walks the chain. */
    readonly Migrate: () => MigrationOutcome
}

/**
 * The migration chain, in release order, one slot per release.
 *
 * Its length must equal {@link ReleaseTable}'s, because a missing slot would silently skip a version.
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
 * The migrations to run for a save written under a known root: every slot after the save's release, in
 * order.
 *
 * Expressed as everything after, which is what makes it forward-only.
 *
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
 * Temporarily puts past versioned releases into the table and the chain, for the duration of `body`.
 *
 * A save from a release runs the slots after it, so pass the release the save comes from before the
 * release whose slot decides it. The rows are removed afterwards in a `finally`.
 *
 * @param releases - The past releases to insert, oldest first, each with a root of its own.
 * @param Migrate - The deciding slot for each: `Migrate[i]` is the slot for `releases[i]`.
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
