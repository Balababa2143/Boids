import { AddVariantPrefix } from "../../KDInterface/KDExtension/Text"
import { IntersectionTo, WithDefault } from "../../Utilities"

export const MachinePrimeItemPrefix = '8D4A3F0D-1270-46B3-A1E3-CD6A056AF7BB'

AddVariantPrefix(MachinePrimeItemPrefix, 'Machine Prime')

export const MachinePrimeVariantBase = {
    prefix: MachinePrimeItemPrefix
} satisfies Partial<KDRestraintVariant>

export const MakeMachinePrimeVariant =
    <VariantParts extends unknown[] & IntersectionTo<WithDefault<KDRestraintVariant, typeof MachinePrimeVariantBase>, VariantParts>>
        (...variantParts: VariantParts): KDRestraintVariant =>
        Object.assign({}, MachinePrimeVariantBase, ...variantParts)

export const enum ItemArchetype {
    /**
     * Devices controlling vision.
     */
    Visor = '7F7A268D-D8AE-4142-8B88-069D3BB65361',

    /**
     * Devices controlling hearing
     * @description
     *  Until the game splits head items,
     *  this shares slots with visors
     */
    HeadPhone = '31E7AC3B-6FF2-4F1F-A52F-ECE6101AC70C',

    /**
     * Devices providing gag strength
     */
    Gag = '62EE228F-07C6-4818-A8B4-59A471093F5C'
}