import { ModelText, AddModelWithTextThenGetName, RestraintText, AddRestraintWithTextThenGetName } from "../KDInterface/KDExtension"

export type TransformInstance<Archetype> =
    (template: Partial<Archetype>) => Partial<Archetype>

export interface VariantDescriptor<Archetype, TextInfo> {
    Transformers: TransformInstance<Archetype>[],
    Text?: TextInfo
}

export type VariantMap<Archetype, Variant, TextInfo> = (variant: Variant) => VariantDescriptor<Archetype, TextInfo>

export type ModelVariantDescriptor = VariantDescriptor<Model, ModelText>

export type ModelVariantMap<Variant> = VariantMap<Model, Variant, ModelText>

export type RestraintVariantDescriptor = VariantDescriptor<restraint, RestraintText>

export type RestraintVariantMap<Variant> = VariantMap<restraint, Variant, RestraintText>

interface AddVariantParams<Archetype, Variant, TextInfo> {
    VariantMap: VariantMap<Archetype, Variant, TextInfo>,
    template: Partial<Archetype>,
}

const AddVariant =
    <Archetype, TextInfo>
    (addInstance: (instance: Archetype, textInfo?: TextInfo) => string) =>
    <Variant>
    (args: AddVariantParams<Archetype, Variant, TextInfo>) =>
    (variant: Variant, extraProperty: Partial<Archetype> = {} as Partial<Archetype>)  => {
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
        console.log('AddVariant', {
            addInstance, variant, args, extraProperty, instance,
        })
        return addInstance(instance as Archetype, desc.Text)
    }

export const AddModelVariant = AddVariant(AddModelWithTextThenGetName)

export const AddRestraintVariant = AddVariant(AddRestraintWithTextThenGetName)