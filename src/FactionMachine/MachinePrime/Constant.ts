/**
 * The machine-prime family's identity: the variant prefix every variant name derives from.
 *
 * Importing this module also registers the prefix's display text at module scope, so the prefix is
 * not just a literal here but a name the game can render.
 *
 * ## What left this module
 *
 * It used to carry `ItemArchetype`, a closed three-member enum of GUIDs that named the coordinator's
 * sensory slots. Those slots are **dimensions** now, keyed by derived ids and described by a
 * catalogue (`Coordinator/Catalog`), which is what makes adding one a code change with an
 * empty-save default rather than an edit to a state record. Nothing survives of the enum: not the
 * name, not the values, and not the closed-ness that made a fourth slot a rewrite.
 * @module FactionMachine/MachinePrime/Constant
 */

import { AddVariantPrefix } from '../../KDExtension'

/**
 * The identity of every machine-prime variant: a field of each variant key, and the key its display
 * prefix resolves through.
 *
 * A restraint name is `uuidv5(JSON.stringify(variantKey), baseId)`, so a prefix that occupies a
 * field of the key is part of every generated name. Changing it renames every variant this mod
 * registers and leaves existing saves unable to resolve their items — a save migration, not a
 * cleanup.
 */
export const MachinePrimeItemPrefix = '8D4A3F0D-1270-46B3-A1E3-CD6A056AF7BB'

AddVariantPrefix(MachinePrimeItemPrefix, 'Machine Prime')

/**
 * The base every machine-prime variant is built on; it carries the shared prefix and nothing else,
 * and `MakeMachinePrimeVariant` merges each item's own parts on top.
 *
 * A machine-prime variant built without this base is missing the prefix field, and is therefore a
 * different variant with a different generated name, not the same item without a label.
 */
export const MachinePrimeVariantBase = {
    prefix: MachinePrimeItemPrefix
} satisfies Partial<KDRestraintVariant>
