import { DeepFreezeClone } from '../Utilities'
import { RegisterEngineSlot, ResolveText, RestraintKeys, SlotNames } from './Text'
import type { TextParams } from './Text'

/**
 * The text one restraint declares: the three lines the engine reads, where the ones it does
 * not set may be inherited from, and the path the trees may override it at.
 *
 * The field names are the engine's own words for the same three things, because a call site
 * is choosing among the engine's slots rather than inventing a vocabulary: the engine's
 * writer is `KinkyDungeonAddRestraintText(name, displayName, flavorText, functionText)`
 * (`base/KDModUtils.ts:487-493`).
 */
export interface RestraintText {
    /** The name a player reads, registered as `Restraint<name>`. */
    DisplayName?: string
    /** The engine's `flavorText`, registered as `Restraint<name>Desc`. */
    FlavorText?: string
    /** The engine's `functionText`, registered as `Restraint<name>Desc2`. */
    FunctionText?: string
    /**
     * The item whose **composed** text fills the slots this one does not set, by name — the
     * restraint a derived item is built on.
     */
    Source?: string
    /** This item's path in the text trees; absent means the trees cannot serve it. */
    Path?: readonly string[]
    /** Values for a tree entry's `${Param}` placeholders. */
    Params?: TextParams
}

/**
 * Adds localised text entries for a restraint using the provided name and restraint text object.
 *
 * **Every slot is registered, including the ones nothing supplies.** An absent slot is
 * written as an empty string rather than skipped, because a key that was never registered
 * makes the engine draw the key itself — and the engine reads three suffixes here, not two:
 *
 * - `Restraint<name>` — the display name, from `DisplayName`.
 * - `Restraint<name>Desc` — the engine's *flavor* line, from `FlavorText`.
 * - `Restraint<name>Desc2` — the engine's *function* line, from `FunctionText`
 *   (`KinkyDungeonInventory.ts:1297-1302`).
 *
 * The suffixes are not symmetric with this interface's names, and that is the trap this
 * mapping exists to close: the previous one wrote `FlavorText` to a `Flavor` suffix nothing
 * in the engine reads, and `FunctionText` to `Desc`, which the engine draws as the flavor
 * line — so no item registered a function line at all and every flavor line was invisible.
 *
 * @param name - The unique identifier for the restraint, used as a key prefix.
 * @param restraintText - What the item's three lines say, and where they may come from.
 */
export function AddRestraintText(name: string, restraintText: RestraintText): void {
    const keys = RestraintKeys(name)
    const resolved = ResolveText({
        Path: restraintText.Path,
        Name: restraintText.DisplayName,
        Flavor: restraintText.FlavorText,
        Function: restraintText.FunctionText,
        Source: restraintText.Source,
        Params: restraintText.Params,
    })

    for (const slot of SlotNames) {
        RegisterEngineSlot({ Key: keys[slot], Slot: slot, Resolution: resolved[slot] })
    }
}

/**
 * Adds a new restraint to the KinkyDungeonRestraints collection and its cache.
 * Optionally associates display, flavor, and function text with the restraint.
 *
 * @param restraint - The restraint object to add.
 * @param restraintText - Optional text information for the restraint, including display name, flavor text, and function text.
 * @returns The newly added, deeply frozen restraint object.
 * @throws {Error} If a restraint with the same name already exists in the cache.
 */
export const AddRestraintWithText = (restraint: restraint, restraintText: RestraintText = {}) => {
    if (KinkyDungeonRestraintsCache.has(restraint.name)) {
        throw new Error('Adding duplicated restraint.')
    }
    const reserialized = DeepFreezeClone(restraint)
    KinkyDungeonRestraints.push(reserialized)
    KinkyDungeonRestraintsCache.set(reserialized.name, reserialized)
    if (restraintText != null) {
        AddRestraintText(reserialized.name, restraintText)
    }
    return reserialized
}

/**
 * Adds a restraint with optional text and returns its name.
 *
 * @param restraint - The restraint object to add.
 * @param restraintText - Optional text information for the restraint.
 * @returns The name of the added restraint.
 */
export const AddRestraintWithTextThenGetName = (restraint: restraint, restraintText?: RestraintText) =>
    AddRestraintWithText(restraint, restraintText).name
