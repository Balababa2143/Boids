/**
 * Capability's grant half: what the worn set can give back, on the dimension's own channel.
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
 * A union: two pieces offering different keys offer both. Only keys in {@link CapabilityKeys}
 * survive, which is what keeps the closed union closed.
 *
 * @param dimension - The dimension to collect for. Bids for another dimension are ignored.
 * @param bids - What the caller observed the worn set declaring. May be the whole list.
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
 * What the worn set promises for one dimension, on the channel that dimension's facets give it.
 *
 * A `Whitelist` dimension promises keys and a `Posture` dimension promises poses, so the result is
 * a set of strings; a dimension with no provider declaring `Allowed` promises nothing, because the
 * ladder is the baseline rather than equipment capability.
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
            // No provider declares body configurations: the ladder is the baseline, not a promise.
            return new Set<string>()
        }
        const ladder = new Set(descriptor.Ladder ?? [])
        return new Set<string>([...ceiling].filter(pose => ladder.has(pose)))
    }
    return new Set<string>()
}
