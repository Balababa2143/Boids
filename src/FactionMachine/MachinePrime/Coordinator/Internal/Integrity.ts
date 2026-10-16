/**
 * The integrity check the derivation scheme buys: a Boids item's generated name is **recomputed at
 * load and compared against the name the game has it under**.
 *
 * `design/spec.md` §4.2 states the property this exists for: because the save stores the *path* and
 * the id is *derived*, recomputation is a free integrity check, and a mismatch means corruption or
 * tampering. This module is the part of that which the mod can actually do today, and it is
 * deliberately narrow.
 *
 * **What makes the check meaningful, and what does not.** A derived name is
 * `uuidv5(variantKey, baseId)`, so recomputation needs three things: the variant key, the base, and
 * the name to compare against. Comparing the derivation against its own inputs would be a tautology,
 * which is why the check is written over a **persisted key** rather than over the constants it is
 * derived from. The Boids visors already persist one — `MorphableVisorCommonEvents` writes
 * `VariantInfo` onto `item.data` at apply time (`MachinePrime/Item/Visor/Common.ts`) — so for that
 * family there is a stored path and a stored name, and a genuine comparison between them.
 *
 * **What it does not cover.** The link families derive names with no persisted variant key to
 * recompute from, so there is nothing to compare and nothing is claimed. That is a gap, not a passed
 * test: giving them the same record is a persisted-format change and belongs with the variant work
 * rather than here.
 *
 * **The set it walks changed with the control model.** It used to be the coordinator's registry of
 * registered names; that registry is gone, and the participants are now whatever the worn set
 * declares. So the check walks **the controlled items that are on the body**, which is a wider set
 * than the registry was and a strictly better one: the old registry only knew about items whose
 * apply event had fired in this session.
 *
 * **It never repairs and never removes.** A mismatch is reported, and reported loudly enough to reach
 * whoever is debugging a save: the alternatives are discarding a player's item over a hypothesis, or
 * silently carrying a name the mod cannot explain.
 * @module FactionMachine/MachinePrime/Coordinator/Internal/Integrity
 */

import { GetVariantIdFromBase } from '../../../../KDExtension'
import { DerivedVariantBase } from '../../../../KDExtension/Release'
import { IsControlled } from '../Membership'
import { HardLightVisor, VariantInfo } from '../../Item/Visor/Constant'

/**
 * One family this module can check: the base its registered names were derived under, and the data
 * key that marks an item as one of its own.
 *
 * There is no archetype field any more — the archetype enum is gone with the sensory slots it named,
 * and membership is a tag rather than a slot (`design/spec.md` §6.12).
 */
interface CheckableFamily {
    readonly BaseId: string
    readonly MarkerKey: string
}

/**
 * The families whose names can be recomputed from a persisted variant key.
 *
 * One entry, and it is an honest one: the visor families share a single restraint base
 * (`DerivedVariantBase.GlassVisorItem`) and a single marker, because the Boids and Dollmaker visors
 * are built by the same factory.
 */
const CheckableFamilies: readonly CheckableFamily[] = [
    {
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
 * The name a registered item should have, recomputed from the variant key it stored for itself, or
 * `undefined` when the item carries nothing this release can recompute from.
 *
 * @param item - A worn item.
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
 * Recomputes the name of every controlled Boids item on the body and reports each one whose stored
 * name does not match its derivation.
 *
 * **The check reads real items, not definitions.** `KinkyDungeonGetRestraintByName` resolves a *name
 * to a template*, and a template has no `data` and no generated name — the per-instance record lives
 * on the worn object, which `KinkyDungeonAllRestraintDynamic` returns. Membership is the same tag
 * test the rest of the control model uses, so an item the mod believes it controls and this check
 * believes it controls cannot diverge.
 *
 * @returns The mismatches it found, so a caller — and a test — can see the result rather than only
 *   the log line.
 */
export const CheckPersistedVariantNames = (): readonly RecomputationResult[] => {
    const mismatches: RecomputationResult[] = []
    for (const worn of KinkyDungeonAllRestraintDynamic()) {
        const item = worn?.item
        if (item == null || !IsControlled(item)) {
            continue
        }

        const family = CheckableFamilies.find(candidate => item.data?.[candidate.MarkerKey] != null)
        if (family == null) {
            continue
        }

        const itemName = item.inventoryVariant ?? item.name
        if (itemName == null) {
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
