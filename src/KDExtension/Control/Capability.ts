/**
 * The abilities equipment may substitute for: the closed union the substitution group draws
 * its promises from.
 *
 * ## Why it is closed, and why it is empty in Phase 1
 *
 * A key exists **only if the ability has a usable seam**. Speech, `immobile`-based movement and
 * noise have none — the first two are read inline by the game with no interception point, and
 * noise's seam fires after the decision has already been made — so attempting to grant one has
 * to be a compile error rather than a design review (`design/spec.md` §3.2, §6.4).
 *
 * Phase 1 declares this union and proves it empty. Every dimension that *could* grant a key —
 * `WeaponUse` and the action-chokepoint dimensions — gets its seam in Phase 2, and its key
 * joins the list with it. An empty closed union is the honest shape rather than a placeholder:
 * it already refuses `OverrideAllowed` for the whole of Phase 1, and it starts enforcing the
 * moment 2.1 lands.
 *
 * ## What to do when the first key arrives
 *
 * Add the key here, add its dimension to `GrantCapableDimensions`, and update the assertion
 * below — which **fails to compile** the moment a key exists, so the guard cannot be left
 * behind by accident. That failure is the point: a union that quietly stopped being empty is a
 * union nobody re-read.
 * @module KDExtension/Control/Capability
 */

/**
 * The closed union of substituable abilities.
 *
 * Keeping `CapabilityKey` and `DimensionId` as two unions rather than one is deliberate: they
 * are different kinds of identifier, and a single union would silently accept a dimension where
 * a capability belongs. A dimension is not an identity (§11, invariant 4) and a capability is
 * not a dimension.
 */
export type CapabilityKey = never

/**
 * The dimensions that can actually promise a substitute, by readable name.
 *
 * This is the **check** half of the closure rule, not a second copy of the union: each entry is
 * constrained to be a `CapabilityKey`, so a name added here without a corresponding member in
 * {@link CapabilityKey} is a compile error rather than a key that quietly grants nothing.
 */
export const GrantCapableDimensions: readonly CapabilityKey[] = []

/**
 * Every capability key the mod can actually grant, as a set, for a validator that has to test
 * membership at runtime.
 *
 * Derived from {@link GrantCapableDimensions} rather than written twice, so the set and the
 * type cannot disagree.
 */
export const CapabilityKeys: ReadonlySet<CapabilityKey> = new Set(GrantCapableDimensions)

/**
 * The compile-time proof that Phase 1 ships no capability keys.
 *
 * `CapabilityKey` is `never`, so `never[]` is the only array that satisfies the line below. The
 * instant a key is added to the union without adding it to the list, the list is no longer
 * assignable and this file stops compiling — which is exactly the reminder the change needs, and
 * which no test can give because the union is erased at run time.
 */
export const Phase1HasNoCapabilityKeys: readonly never[] = GrantCapableDimensions
