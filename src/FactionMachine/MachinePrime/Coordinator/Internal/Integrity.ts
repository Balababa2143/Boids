/**
 * The integrity check the derivation scheme buys: a Boids item's generated name is
 * **recomputed at load and compared against the name the game has it under**.
 *
 * `docs/spec.md` §4.2 states the property this exists for: because the save stores the
 * *path* and the id is *derived*, recomputation is a free integrity check, and a
 * mismatch means corruption or tampering. This module is the part of that which the
 * mod can actually do today, and it is deliberately narrow.
 *
 * **What makes the check meaningful, and what does not.** A derived name is
 * `uuidv5(variantKey, baseId)`, so recomputation needs three things: the variant key,
 * the base, and the name to compare against. Comparing the derivation against its own
 * inputs would be a tautology, which is why the check is written over a **persisted
 * key** rather than over the constants it is derived from. The Boids visors already
 * persist one — `MorphableVisorCommonEvents` writes `VariantInfo` onto `item.data` at
 * apply time (`MachinePrime/Item/Visor/Common.ts`) — so for that family there is a
 * stored path and a stored name, and a genuine comparison between them.
 *
 * **What it does not cover.** The link families derive names with no persisted variant
 * key to recompute from, so there is nothing to compare and nothing is claimed. That is
 * a gap, not a passed test: giving them the same record is a persisted-format change
 * and belongs with the variant work rather than in Phase 0.
 *
 * **It never repairs and never removes.** A mismatch is reported, and reported loudly
 * enough to reach whoever is debugging a save: the alternatives are discarding a
 * player's item over a hypothesis, or silently carrying a name the mod cannot explain.
 * @module FactionMachine/MachinePrime/Coordinator/Internal/Integrity
 */

import { GetVariantIdFromBase } from '../../../../KDExtension'
import { DerivedVariantBase } from '../../../../KDExtension/Release'
import { ItemArchetype } from '../../Constant'
import { GetState } from './StateStorage'
import { HardLightVisor, VariantInfo } from '../../Item/Visor/Constant'

/**
 * One family this module can check: the archetype whose registered names it owns, the
 * base those names were derived under, and the data key that marks an item as one of
 * its own.
 */
interface CheckableFamily {
    readonly Archetype: ItemArchetype
    readonly BaseId: string
    readonly MarkerKey: string
}

/**
 * The families whose names can be recomputed from a persisted variant key.
 *
 * One entry, and it is an honest one: the visor families share a single restraint base
 * (`DerivedVariantBase.GlassVisorItem`) and a single marker, because the Boids and
 * Dollmaker visors are built by the same factory.
 */
const CheckableFamilies: readonly CheckableFamily[] = [
    {
        Archetype: ItemArchetype.Blinder,
        BaseId: DerivedVariantBase.GlassVisorItem,
        MarkerKey: HardLightVisor,
    },
]

/** What one loaded item's name turned out to be, as the check found it. */
interface RecomputationResult {
    readonly itemName: string
    readonly expectedName: string
}

/**
 * The name a registered item should have, recomputed from the variant key it stored for
 * itself, or `undefined` when the item carries nothing this release can recompute from.
 *
 * @param item - A worn item, as the registry's name resolves to it.
 * @param family - The family whose base the name must be derived under.
 */
const RecomputeExpectedName = (item: item, family: CheckableFamily): string | undefined => {
    const variantKey = item.data?.[VariantInfo]
    if (variantKey == null) {
        return undefined
    }
    try {
        return GetVariantIdFromBase(family.BaseId)(variantKey as object)
    }
    catch (error) {
        console.warn('Boids: an item carried a variant key the mod could not hash.', item.name, error)
        return undefined
    }
}

/**
 * Recomputes the name of every Boids item the coordinator knows is worn and reports each
 * one whose stored name does not match its derivation.
 *
 * **The check reads real items, not definitions.** `KinkyDungeonGetRestraintByName`
 * resolves a *name to a template*, and a template has no `data` and no generated name —
 * the per-instance record lives on the worn object, which `KinkyDungeonFullInventory`
 * returns. Using the registry's names for membership and the inventory's objects for
 * evidence is what keeps the two roles from being confused; comparing the template
 * against the derivation would have checked a different object and always passed.
 *
 * The **registry** decides what to check rather than the inventory, so the check sees
 * exactly what the mod believes it controls. An item the registry does not know about is
 * a different defect, and this check must not hide it by quietly passing over it.
 *
 * @returns The mismatches it found, so a caller — and a test — can see the result rather
 *   than only the log line.
 */
export const CheckPersistedVariantNames = (): readonly RecomputationResult[] => {
    const registry = GetState().ActivePC.Items
    const registeredNames = new Set<string>(
        CheckableFamilies.flatMap(family => [...(registry[family.Archetype]?.RegisteredItems ?? [])])
    )
    if (registeredNames.size === 0) {
        return []
    }

    const mismatches: RecomputationResult[] = []
    for (const worn of KinkyDungeonFullInventory()) {
        const item = worn as item
        const itemName = item?.inventoryVariant ?? item?.name
        if (itemName == null || !registeredNames.has(itemName)) {
            continue
        }

        const family = CheckableFamilies.find(candidate => item.data?.[candidate.MarkerKey] != null)
        if (family == null) {
            continue
        }

        const expectedName = RecomputeExpectedName(item, family)
        if (expectedName == null || itemName === expectedName) {
            continue
        }

        mismatches.push({ itemName, expectedName })
        console.warn(
            `Boids: \`${itemName}\` is stored under a name that does not match the name its own ` +
            `variant key derives (\`${expectedName}\`). The item and the derivation disagree; ` +
            'nothing has been changed, and the item is kept as it is.'
        )
    }

    return mismatches
}
