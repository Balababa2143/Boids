/**
 * The keys the **engine** composes from an identity.
 *
 * A restraint's name is not a text key: the engine builds `Restraint<name>` and its two
 * description suffixes from the registered restraint name, so those shapes are fixed and no
 * one may choose them. Every one lives here, which is what makes "no hand-written key" a
 * rule that can be checked — a call site that spells one of these itself is a bug in the
 * call site.
 *
 * The suffixes are the engine's, read from the only place that resolves them:
 * `KinkyDungeonInventory.ts:1297-1302` draws `<prefix><name>Desc` then `<prefix><name>Desc2`,
 * and `base/KDModUtils.ts:487-493` is the engine's own writer, which maps its `flavorText`
 * to `Desc` and its `functionText` to `Desc2`.
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
 * `baseKey` is the prefix itself — a field of the variant key, so part of every generated
 * restraint name — and the engine renders it as `TextGet('KDVarPref' + variant.prefix)`
 * before the item's own name (`KinkyDungeonRestraints.ts:7443`).
 */
export const AddVariantPrefix = (baseKey: string, text: string): void =>
    RegisterEngineText({
        Key: VariantPrefixKey(baseKey),
        Value: text,
        Slot: 'VariantPrefix',
        Source: 'local',
    })
