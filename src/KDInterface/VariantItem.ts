import { ModelText, AddModelWithTextThenGetName, IRestraintText, AddRestraintWithTextThenGetName } from '../KDExtension'

/**
 * A function that transforms a partial archetype instance.
 *
 * @template Archetype The type of the archetype being transformed.
 * @param {Partial<Archetype>} template The partial archetype instance to transform.
 * @returns {Partial<Archetype>} The transformed partial archetype instance.
 */
export type TransformInstance<Archetype> =
    (template: Partial<Archetype>) => Partial<Archetype>

/**
 * Describes a variant, including its transformers and optional text info.
 *
 * @template Archetype The type of the archetype.
 * @template TextInfo The type of the text info.
 * @property {TransformInstance<Archetype>[]} Transformers - Array of transformation functions for the archetype.
 * @property {TextInfo} [Text] - Optional text information for the variant.
 */
export interface VariantDescriptor<Archetype, TextInfo> {
    Transformers: TransformInstance<Archetype>[],
    Text?: TextInfo
}

/**
 * Maps a variant to its descriptor.
 *
 * @template Archetype The type of the archetype.
 * @template Variant The type of the variant key.
 * @template TextInfo The type of the text info.
 * @param {Variant} variant The variant key.
 * @returns {VariantDescriptor<Archetype, TextInfo>} The descriptor for the given variant.
 */
export type VariantMap<Archetype, Variant, TextInfo> = (variant: Variant) => VariantDescriptor<Archetype, TextInfo>

/**
 * Variant descriptor for models.
 * @see VariantDescriptor
 */
export type ModelVariantDescriptor = VariantDescriptor<Model, ModelText>

/**
 * Variant map for models.
 * @see VariantMap
 */
export type ModelVariantMap<Variant> = VariantMap<Model, Variant, ModelText>

/**
 * Variant descriptor for restraints.
 * @see VariantDescriptor
 */
export type RestraintVariantDescriptor = VariantDescriptor<restraint, IRestraintText>

/**
 * Variant map for restraints.
 * @see VariantMap
 */
export type RestraintVariantMap<Variant> = VariantMap<restraint, Variant, IRestraintText>

/**
 * Parameters for making or adding a variant.
 *
 * @template Archetype The type of the archetype.
 * @template Variant The type of the variant key.
 * @template TextInfo The type of the text info.
 * @property {VariantMap<Archetype, Variant, TextInfo>} VariantMap - The variant map function.
 * @property {Partial<Archetype>} template - The base template for the archetype.
 */
export interface MakeOrAddVariantParams<Archetype, Variant, TextInfo> {
    VariantMap: VariantMap<Archetype, Variant, TextInfo>,
    template: Partial<Archetype>,
}

/**
 * Creates a function to generate a variant instance and its descriptor.
 *
 * @template Archetype The type of the archetype.
 * @template Variant The type of the variant key.
 * @template TextInfo The type of the text info.
 * @param {MakeOrAddVariantParams<Archetype, Variant, TextInfo>} args The parameters for making the variant.
 * @returns {(variant: Variant, extraProperty?: Partial<Archetype>) => { instance: Archetype, desc: VariantDescriptor<Archetype, TextInfo> }}
 *   A function that takes a variant and extra properties, and returns the instance and descriptor.
 */
export const MakeVariant =
    <Archetype, Variant, TextInfo = typeof undefined>
    (args: MakeOrAddVariantParams<Archetype, Variant, TextInfo>) =>
    (variant: Variant, extraProperty: Partial<Archetype> = {} as Partial<Archetype>) => {
        const { VariantMap, template } = args
        const desc = VariantMap(variant)
        const instance =
            desc.Transformers
                .reduce(
                    (acc, transform) => transform(acc),
                    {
                        ...template,
                        ...extraProperty
                    }
                )
        return ({
            instance: instance as Archetype,
            desc
        })
    }

/**
 * Creates a function to add a variant instance using a provided addInstance function.
 *
 * @template Archetype The type of the archetype.
 * @template TextInfo The type of the text info.
 * @param {(instance: Archetype, textInfo?: TextInfo) => string} addInstance The function to add the instance, returning a string (e.g., name or ID).
 * @returns {<Variant>(args: MakeOrAddVariantParams<Archetype, Variant, TextInfo>) => (variant: Variant, extraProperty?: Partial<Archetype>) => string}
 *   A function that takes variant parameters and adds the instance.
 */
export const AddVariant =
    <Archetype, TextInfo>
    (addInstance: (instance: Archetype, textInfo?: TextInfo) => string) =>
    <Variant>
    (args: MakeOrAddVariantParams<Archetype, Variant, TextInfo>) =>
    (variant: Variant, extraProperty: Partial<Archetype> = {} as Partial<Archetype>) => {
        const {instance, desc} = MakeVariant(args)(variant, extraProperty)
        console.info('Boids: AddVariant', {
            addInstance, variant, args, extraProperty, instance,
        })
        return addInstance(instance as Archetype, desc.Text)
    }

/**
 * Adds a model variant using AddModelWithTextThenGetName.
 *
 * @see AddVariant
 */
export const AddModelVariant = AddVariant(AddModelWithTextThenGetName)

/**
 * Adds a restraint variant using AddRestraintWithTextThenGetName.
 *
 * @see AddVariant
 */
export const AddRestraintVariant = AddVariant(AddRestraintWithTextThenGetName)


export interface ModelRestraintBundledDescriptorMap {
    Model: VariantDescriptor<Model, ModelText>
    Restraint: VariantDescriptor<restraint, IRestraintText>
}

export const UnpackDescriptorMap =
    <DescriptorMap extends Record<string, ModelRestraintBundledDescriptorMap>>
    (descMap: DescriptorMap) => ({
            ModelMap: (variant: keyof DescriptorMap) => ({
                Transformers: descMap[variant].Model.Transformers,
                Text: descMap[variant].Model.Text!
            } satisfies ModelVariantDescriptor),
            RestraintMap: (variant: keyof DescriptorMap) => ({
                Transformers: descMap[variant].Restraint.Transformers,
                Text: descMap[variant].Restraint.Text!
            } satisfies RestraintVariantDescriptor)
        })