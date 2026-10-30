/**
 * The abilities equipment may substitute for: the closed union the substitution group draws its
 * promises from.
 * @module KDExtension/Control/Capability
 */

/**
 * The closed union of substitutable abilities.
 *
 * A `CapabilityKey` and a `DimensionId` are different kinds of identifier, so they stay separate
 * unions rather than one.
 */
export type CapabilityKey = never

/**
 * The dimensions that can actually promise a substitute, by readable name.
 *
 * Each entry is constrained to a `CapabilityKey`, so a name added here without its member in
 * {@link CapabilityKey} is a compile error.
 */
export const GrantCapableDimensions: readonly CapabilityKey[] = []

/** Every capability key the mod can grant, as a set, derived from {@link GrantCapableDimensions}. */
export const CapabilityKeys: ReadonlySet<CapabilityKey> = new Set(GrantCapableDimensions)

/**
 * The compile-time proof that no capability key exists.
 *
 * `CapabilityKey` is `never`, so an empty list is the only one assignable; adding a key to the
 * union without adding it there stops the build.
 */
export const NoCapabilityKeys: readonly never[] = GrantCapableDimensions
