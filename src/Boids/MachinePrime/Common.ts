import { AddVariantPrefix } from "../../KDInterface/KDExtension/Text"
import { IntersectionTo, WithDefault } from "../../Utilities"

export const MachinePrimeItemPrefix = '{8D4A3F0D-1270-46B3-A1E3-CD6A056AF7BB}'

AddVariantPrefix(MachinePrimeItemPrefix, 'Machine Prime')

export const MachinePrimeVariantBase = {
    prefix: MachinePrimeItemPrefix
} satisfies Partial<KDRestraintVariant>

export const MakeMachinePrimeVariant =
    <VariantParts extends unknown[] & IntersectionTo<WithDefault<KDRestraintVariant, typeof MachinePrimeVariantBase>, VariantParts>>
        (...variantParts: VariantParts): KDRestraintVariant =>
        Object.assign({}, MachinePrimeVariantBase, ...variantParts)