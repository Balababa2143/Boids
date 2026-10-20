/**
 * The restraint contract: what makes an item a participant in the control model, and how the
 * equipment's contribution is computed from it.
 *
 * ## The membership test, and why it is a tag
 *
 * **[Decided] A controlled item is one whose restraint template carries this mod's tag in its
 * `shrine` list, and nothing else** (`design/spec.md` §6.12, clause 1). The base game uses `shrine`
 * as a **generic tag list** — it concatenates `"Cursed"` onto it (`item/KDCurse.ts:998`) and
 * bulk-copies the whole list into the player's tag map
 * (`restraint/KinkyDungeonRestraints.ts:4245-4248`) — so a mod tag in it is the engine's own idiom
 * rather than an abuse of one.
 *
 * Two properties fall out of stating membership this way:
 *
 * - **It is a fact about what is worn**, so the participant set leaves the dossier. There is no
 *   registered-item set to keep in step, and an item that is removed stops being a participant by
 *   ceasing to be on the body.
 * - **It needs no bookkeeping to be right after a load.** The tag travels with the template, so a
 *   character loaded from a save has the same participants she had when it was written.
 *
 * ## The capability is computed, never stored
 *
 * `FindProviders` enumerates the worn set **now** and reads what each item declares. Nothing is
 * cached, on the item or in the dossier, so:
 *
 * - adding or removing a worn item changes the resolved capability with no value to invalidate;
 * - the per-facet **Free state** falls out (§6.10) — when the last covering item leaves, the
 *   dimension simply has no provider, and its resolution is the baseline;
 * - a save cannot carry a stale answer, because there is no answer in it.
 *
 * This is the same rule as the invariant that a restraint's control state derives from **one**
 * baseline the Coordinator holds: a value on an item is a value that dies with the item.
 * @module FactionMachine/MachinePrime/Coordinator/Membership
 */

import { ProviderBid } from '../../../KDExtension/Control'
import { ReadProviderDeclaration } from './Provider'
import { ControlledTag, DimensionBidsKey } from './Tag'

export { AppearanceKey, ControlledTag, DeriveTag, DimensionBidsKey, GagInstalledTag } from './Tag'

/**
 * Whether a restraint's **template** declares the controlled tag.
 *
 * A template is where the tag lives, so this is the whole membership test; the item-shaped one
 * below is what the worn set is asked.
 */
export const IsControlledTemplate = (template: restraint | null | undefined): boolean =>
    template?.shrine?.includes(ControlledTag) === true

/**
 * Whether a worn item is controlled, resolved through its own template.
 *
 * `KDRestraint` is **variant-aware** — it resolves `inventoryVariant` to the template the variant
 * points at (`restraint/KinkyDungeonRestraints.ts:272-275`) — which is why this works for a
 * machine-prime variant whose own name is not a registered restraint. That indirection is the reason
 * membership survives morphing: a morph rewrites the item's name and adds a variant entry, and the
 * template the tag was declared on is still what the item resolves to.
 */
export const IsControlled = (item: Named | null | undefined): boolean =>
    item == null ? false : IsControlledTemplate(KDRestraint(item))

/**
 * Every provider bid the worn set is declaring right now.
 *
 * Enumerates `KinkyDungeonAllRestraintDynamic()`, which includes linked sub-items — a muffler
 * linked under a face cover is as worn as the face cover, and leaving it out would make a
 * dimension's answer depend on how the set happens to be assembled.
 *
 * An item that is not controlled is skipped, and so is one that declares nothing: an item with no
 * opinion about the control model is not a provider of anything, which is what lets the game's own
 * restraints be worn without joining in.
 *
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
                // A declaration whose bid fields are malformed makes the item stop being a provider
                // rather than making the dimension answer with a NaN. `item.data` is shared with the
                // game and every other mod, so this is a boundary rather than a defensive habit —
                // and the two optional axes are degraded inside the reader rather than here, so a
                // malformed `Stack` or `Allowed` costs the item that one statement and not the bid.
                continue
            }
            bids.push({
                Dimension: bid.Dimension,
                Power: bid.Power,
                Stack: bid.Stack,
                // Absent means "says nothing about body configurations", which is a different
                // statement from "permits none of them" — so it is passed through rather than
                // defaulted, and `IntersectPostures` skips it (Store.ts).
                Allowed: bid.Allowed,
                LoserExpresses: bid.LoserExpresses,
                // Read off the item rather than copied into the save: a stored copy would be a
                // second name for the same item, and the two could disagree after a morph.
                Source: item.inventoryVariant ?? item.name,
            })
        }
    }
    return bids
}
