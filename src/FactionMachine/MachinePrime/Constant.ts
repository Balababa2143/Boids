/**
 * The machine-prime family's identity: the variant prefix every variant name derives from, and the
 * display text it is registered under.
 * @module FactionMachine/MachinePrime/Constant
 */

import { AddVariantPrefix } from '../../KDExtension'

/**
 * The identity of every machine-prime variant: a field of each variant key, and the key its display
 * prefix resolves through. A restraint name is `uuidv5(JSON.stringify(variantKey), baseId)`, so
 * changing this prefix renames every variant this mod registers and makes existing saves unable to
 * resolve their items.
 */
export const MachinePrimeItemPrefix = '8D4A3F0D-1270-46B3-A1E3-CD6A056AF7BB'

AddVariantPrefix(MachinePrimeItemPrefix, 'Machine Prime')

/**
 * The base every machine-prime variant is built on; `MakeMachinePrimeVariant` merges each item's
 * own parts on top. A variant built without it lacks the prefix field, and is therefore a different
 * variant with a different generated name rather than the same item without a label.
 */
export const MachinePrimeVariantBase = {
    prefix: MachinePrimeItemPrefix
} satisfies Partial<KDRestraintVariant>
