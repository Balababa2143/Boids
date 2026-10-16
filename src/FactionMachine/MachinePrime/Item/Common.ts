/**
 * The variant base every machine-prime item is built from.
 * @module FactionMachine/MachinePrime/Item/Common
 */

import { IntersectionTo, WithDefault } from '../../../Utilities'
import { MachinePrimeVariantBase } from '../Constant'

/**
 * Builds a restraint variant on top of {@link MachinePrimeVariantBase}, merging the
 * given parts left to right, so a later part wins a field two of them set.
 *
 * The parts are checked collectively: between them they have to supply every field
 * of a restraint variant except `prefix`, which comes from the base. That is what
 * keeps the machine-prime prefix on every variant name derived from the result —
 * and why a partial variant literal belongs in a *part*, not in the call.
 *
 * @param variantParts - The parts to merge, in increasing order of precedence.
 * @returns A new object; neither the base nor any part is modified.
 */
export const MakeMachinePrimeVariant =
    <VariantParts extends unknown[] & IntersectionTo<WithDefault<KDRestraintVariant, typeof MachinePrimeVariantBase>, VariantParts>>
        (...variantParts: VariantParts): KDRestraintVariant =>
        Object.assign({}, MachinePrimeVariantBase, ...variantParts)