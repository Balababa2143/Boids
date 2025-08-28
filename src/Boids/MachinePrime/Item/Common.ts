import { IntersectionTo, WithDefault } from '../../../Utilities'
import { ItemArchetype, MachinePrimeVariantBase } from '../Constant'


export const MakeMachinePrimeVariant =
    <VariantParts extends unknown[] & IntersectionTo<WithDefault<KDRestraintVariant, typeof MachinePrimeVariantBase>, VariantParts>>
        (...variantParts: VariantParts): KDRestraintVariant =>
        Object.assign({}, MachinePrimeVariantBase, ...variantParts)