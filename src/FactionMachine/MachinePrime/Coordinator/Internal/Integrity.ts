/**
 * The integrity check the derivation scheme buys: a Boids item's generated name is recomputed at
 * load and compared against the name the game has it under. It walks the controlled items on the
 * body rather than the item definitions, because the per-instance variant key lives on the worn
 * object. A mismatch is reported and the item is left as it is — never repaired, never removed.
 * @module FactionMachine/MachinePrime/Coordinator/Internal/Integrity
 */

import { GetVariantIdFromBase } from '../../../../KDExtension'
import { DerivedVariantBase } from '../../../../KDExtension/Release'
import { IsControlled } from '../Membership'
import { HardLightVisor, VariantInfo } from '../../Item/Visor/Constant'

/**
 * One family this module can check: the base its registered names were derived under, and the data
 * key that marks an item as one of its own.
 */
interface CheckableFamily {
    readonly BaseId: string
    readonly MarkerKey: string
}

/** The families whose names can be recomputed from a persisted variant key. */
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
 * name does not match its derivation. The check reads worn items rather than definitions:
 * `KinkyDungeonGetRestraintByName` resolves a name to a template, and a template has no `data` and
 * no generated name.
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
