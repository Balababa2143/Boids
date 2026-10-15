/**
 * The machine-prime family's identity: the variant prefix every variant name
 * derives from, and the archetypes the coordinator tells its sensory slots apart
 * by.
 *
 * Importing this module also registers the prefix's display text at module scope,
 * so the prefix is not just a literal here but a name the game can render.
 * @module Boids/MachinePrime/Constant
 */

import { AddVariantPrefix } from '../../KDExtension'

/**
 * The identity of every machine-prime variant: a field of each variant key, and the
 * key its display prefix resolves through.
 *
 * A restraint name is `uuidv5(JSON.stringify(variantKey), baseId)`, so a prefix that
 * occupies a field of the key is part of every generated name. Changing it renames
 * every variant this mod registers and leaves existing saves unable to resolve
 * their items — a save migration, not a cleanup.
 */
export const MachinePrimeItemPrefix = '8D4A3F0D-1270-46B3-A1E3-CD6A056AF7BB'

AddVariantPrefix(MachinePrimeItemPrefix, 'Machine Prime')

/**
 * The base every machine-prime variant is built on; it carries the shared prefix and
 * nothing else, and `MakeMachinePrimeVariant` merges each item's own parts on top.
 *
 * A machine-prime variant built without this base is missing the prefix field, and
 * is therefore a different variant with a different generated name, not the same
 * item without a label.
 */
export const MachinePrimeVariantBase = {
    prefix: MachinePrimeItemPrefix
} satisfies Partial<KDRestraintVariant>

/**
 * The kinds of machine-prime item the coordinator tracks. Each value is the GUID
 * the coordinator's state uses as the slot name, so an item that tags itself with
 * one of these is addressing the same slot when it registers, unregisters and
 * updates its limiter.
 *
 * A `const enum`, so TypeScript inlines the GUIDs and there is no `ItemArchetype`
 * object at runtime — and no barrel re-exports it either, so this is one a JavaScript
 * consumer cannot reach at all.
 */
export const enum ItemArchetype {
    /**
     * Devices controlling vision.
     */
    Blinder = '7F7A268D-D8AE-4142-8B88-069D3BB65361',

    /**
     * Devices controlling hearing.
     * @description
     *  Until the game splits head items,
     *  this shares slots with visors
     * @todo
     *  Nothing registers as a Deafener yet. The coordinator's schema, the sensory
     *  controller guard in `SensoryControl` and the state round-trip all handle it,
     *  but no item emits the archetype tag, so `ActivePC.Items[Deafener]` stays at
     *  its defaults. Wiring it up belongs with #19 / #33 -- the `Headphone`
     *  restraint is the obvious candidate, but currently sets a static `deaf` value
     *  instead of routing through the coordinator.
     */
    Deafener = '31E7AC3B-6FF2-4F1F-A52F-ECE6101AC70C',

    /**
     * Devices providing gag strength.
     */
    Gag = '62EE228F-07C6-4818-A8B4-59A471093F5C'
}