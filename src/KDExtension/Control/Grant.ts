/**
 * Capability's **grant half**: what the worn set can give back, on the dimension's own channel.
 *
 * ## Two channels, and this module is where they are told apart
 *
 * A dimension that composes `Whitelist` promises abilities, by key; a dimension that composes
 * `Posture` promises body configurations, by pose (`design/spec.md` §6.4, §6.13). The router
 * already aggregates the **suppression** half — `Ceiling` for a rate, `PostureCeiling` for a set —
 * and this is the other half of the same capability: the promise a write of `OverrideAllowed`
 * needs, and the field a resolution reports as `Granted`.
 *
 * ## Empty is not the ladder
 *
 * A posture dimension with no provider that declares `Allowed` has **no equipment promise**, even
 * though its resolution's `PostureCeiling` is the whole ladder. The ladder is the baseline, not a
 * promise made by gear — so `ResolveGrant` answers the empty set and `OverrideAllowed` is refused
 * there. That is the difference between *nothing is imposed* and *the equipment can give this
 * back*, and collapsing the two would make a bare body look like a prosthetic.
 *
 * ## Why the grant is filtered
 *
 * A bid may only carry keys the mod can actually keep (`CapabilityKey`), and a pose is only a
 * promise on a dimension that governs it. The filter here is the last line of that rule: the
 * reader drops a malformed declaration, the validator refuses an unkeepable key at the write, and
 * the resolution reports only what survived both. A hand-built bid is a caller error, not a second
 * source of truth.
 * @module KDExtension/Control/Grant
 */

import { CapabilityKey, CapabilityKeys } from './Capability'
import { DimensionDescriptor } from './Descriptor'
import { FacetName } from './Facet'
import { DimensionId } from './Identity'
import type { ProviderBid } from './Router'
import { IntersectPostures } from './Store'

/**
 * The ability keys the worn set promises for one `Whitelist` dimension.
 *
 * A **union**, because an ability is a promise one piece of equipment can keep on its own: two
 * braces that offer different keys offer both. The filter through {@link CapabilityKeys} is what
 * keeps the closed union closed; with the union empty in Phase 1 the answer is empty, and the first
 * key (2.4) starts arriving without this function changing.
 *
 * @param dimension - The dimension to collect for. Bids for another dimension are ignored.
 * @param bids - What the caller observed the worn set declaring. May be the whole list.
 * @returns The keys the mod can keep, or an empty set when nothing promises one.
 */
export const GrantKeys = (
    dimension: DimensionId,
    bids: Iterable<ProviderBid>
): ReadonlySet<CapabilityKey> => {
    const keys = new Set<CapabilityKey>()
    for (const bid of bids) {
        if (bid.Dimension !== dimension) {
            continue
        }
        for (const key of bid.Granted ?? []) {
            if (CapabilityKeys.has(key)) {
                keys.add(key)
            }
        }
    }
    return keys
}

/**
 * What the worn set promises for one dimension, **on the channel that dimension actually has**.
 *
 * This is the shape the write validator takes (`ValidateIntentWrite`'s `grants`), and the reason
 * its parameter is a set of strings rather than a set of `CapabilityKey`s: a posture dimension's
 * promise is a set of poses, so a key-shaped parameter would refuse every legal posture write.
 *
 * The channels are mutually exclusive in this catalogue — no dimension composes both `Whitelist`
 * and `Posture` — and the whitelist branch is checked first so a future dimension that did would
 * be treated as an ability promise rather than silently as a pose one.
 *
 * @param descriptor - The dimension being written. Its facets decide the channel.
 * @param bids - What the caller observed the worn set declaring.
 * @returns The promise, or an empty set when the equipment offers nothing on that channel.
 */
export const ResolveGrant = (
    descriptor: DimensionDescriptor,
    bids: Iterable<ProviderBid>
): ReadonlySet<string> => {
    if (descriptor.Facets.has(FacetName.Whitelist)) {
        return new Set<string>(GrantKeys(descriptor.Id, bids))
    }
    if (descriptor.Facets.has(FacetName.Posture)) {
        const ceiling = IntersectPostures(bids, descriptor.Id)
        if (ceiling == null) {
            // No provider speaks of body configurations at all. That is *says nothing*, not *the
            // ladder is a promise*: the baseline is not equipment capability.
            return new Set<string>()
        }
        const ladder = new Set(descriptor.Ladder ?? [])
        return new Set<string>([...ceiling].filter(pose => ladder.has(pose)))
    }
    return new Set<string>()
}
