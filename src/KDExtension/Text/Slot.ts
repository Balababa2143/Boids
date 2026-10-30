/**
 * The keys the engine composes from an identity.
 *
 * A restraint's name is not a text key: the engine builds `Restraint<name>` and its two suffixes
 * itself, so a call site that spells one of these shapes is a bug in the call site.
 * @module KDExtension/Text/Slot
 */

import { RegisterEngineText } from './Sink'
import { SlotName } from './Tree'

/** The keys the engine reads for one restraint: its name, its flavour and its function. */
export const RestraintKeys = (name: string): Readonly<Record<SlotName, string>> => ({
    Name: `Restraint${name}`,
    Flavor: `Restraint${name}Desc`,
    Function: `Restraint${name}Desc2`,
})

/** The same three keys for a non-restraint inventory item, which uses its own prefix. */
export const InventoryItemKeys = (name: string): Readonly<Record<SlotName, string>> => ({
    Name: `KinkyDungeonInventoryItem${name}`,
    Flavor: `KinkyDungeonInventoryItem${name}Desc`,
    Function: `KinkyDungeonInventoryItem${name}Desc2`,
})

/** A model's own name, `m_<model>`. */
export const ModelNameKey = (modelName: string): string => `m_${modelName}`

/** A model's layer name, `m_<model>_l_<layer>`, which the wardrobe draws. */
export const ModelLayerKey = (modelName: string, layer: string): string => `m_${modelName}_l_${layer}`

/** A wardrobe category's name, `c_<category>`. */
export const ModelCategoryKey = (category: string): string => `c_${category}`

/** A start perk's name and description, which the perk screen draws from its id. */
export const StartPerkKeys = (id: string): Readonly<Record<'Name' | 'Description', string>> => ({
    Name: `KinkyDungeonStat${id}`,
    Description: `KinkyDungeonStatDesc${id}`,
})

/** A start category's label, `KDCategory<name>`, keyed by the category's own name. */
export const CategoryKey = (name: string): string => `KDCategory${name}`

/** A variant prefix, `KDVarPref<prefix>`, which the engine puts in front of an item's name. */
export const VariantPrefixKey = (prefix: string): string => `KDVarPref${prefix}`

/** A variant suffix, `KDVarSuff<suffix>`, which the engine puts after it. */
export const VariantSuffixKey = (suffix: string): string => `KDVarSuff${suffix}`

/**
 * Registers the display text a variant prefix resolves to.
 *
 * `baseKey` is the prefix itself, a field of the variant key and so part of every generated
 * restraint name.
 */
export const AddVariantPrefix = (baseKey: string, text: string): void =>
    RegisterEngineText({
        Key: VariantPrefixKey(baseKey),
        Value: text,
        Slot: 'VariantPrefix',
        Source: 'local',
    })
