/**
 * The restraint contract: what makes an item a participant in the control model, and how the
 * equipment's contribution is computed from it. A controlled item is one whose restraint template
 * carries this mod's tag in its `shrine` list, and nothing else; `shrine` is the engine's generic
 * tag list, so membership travels with the template and needs no bookkeeping of its own.
 * @module FactionMachine/MachinePrime/Coordinator/Membership
 */

import { ProviderBid } from '../../../KDExtension/Control'
import { ReadProviderDeclaration } from './Provider'
import { ControlledTag, DimensionBidsKey } from './Tag'

export { AppearanceKey, ControlledTag, DeriveTag, DimensionBidsKey, GagInstalledTag } from './Tag'

/**
 * Whether a restraint's template declares the controlled tag, which is the whole membership test.
 */
export const IsControlledTemplate = (template: restraint | null | undefined): boolean =>
    template?.shrine?.includes(ControlledTag) === true

/**
 * Whether a worn item is controlled, resolved through its own template. `KDRestraint` is
 * variant-aware, which is why this holds for a variant whose own name is not a registered
 * restraint, and why membership survives morphing.
 */
export const IsControlled = (item: Named | null | undefined): boolean =>
    item == null ? false : IsControlledTemplate(KDRestraint(item))

/**
 * Every provider bid the worn set is declaring right now. Enumerates
 * `KinkyDungeonAllRestraintDynamic()`, linked sub-items included: a muffler linked under a face
 * cover is as worn as the face cover.
 * @returns The bids, in wear order. Order is the tie-break for equal power, so it is the order the
 *   game enumerates rather than an order this function imposes.
 */
export const FindProviders = (): readonly ProviderBid[] => {
    const bids: ProviderBid[] = []
    for (const worn of KinkyDungeonAllRestraintDynamic()) {
        const item = worn?.item
        if (item == null || !IsControlled(item)) {
            continue
        }
        const declared = item.data?.[DimensionBidsKey]
        if (!Array.isArray(declared)) {
            continue
        }
        for (const entry of declared as readonly unknown[]) {
            const bid = ReadProviderDeclaration(entry)
            if (bid == null) {
                // A malformed declaration drops the statement rather than making the dimension
                // answer with a NaN; `item.data` is a boundary shared with the game and other mods.
                continue
            }
            bids.push({
                Dimension: bid.Dimension,
                Power: bid.Power,
                Stack: bid.Stack,
                // Absent says nothing about body configurations, which differs from permitting
                // none.
                Allowed: bid.Allowed,
                Granted: bid.Granted,
                LoserExpresses: bid.LoserExpresses,
                // Read off the item rather than copied into the save, so a morph cannot split them.
                Source: item.inventoryVariant ?? item.name,
            })
        }
    }
    return bids
}
