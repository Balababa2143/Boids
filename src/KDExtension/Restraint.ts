import { DeepFreezeClone } from '../Utilities'
import { RegisterEngineSlot, ResolveText, RestraintKeys, SlotNames } from './Text'
import type { TextParams } from './Text'

/**
 * The text one restraint declares: the three lines the engine reads, the item they may be inherited
 * from, and the tree path the resolver may override it at.
 */
export interface RestraintText {
    /** The name a player reads, registered as `Restraint<name>`. */
    DisplayName?: string
    /** The engine's `flavorText`, registered as `Restraint<name>Desc`. */
    FlavorText?: string
    /** The engine's `functionText`, registered as `Restraint<name>Desc2`. */
    FunctionText?: string
    /** The item whose composed text fills the slots this one does not set, by name. */
    Source?: string
    /** This item's path in the text trees; absent means the trees cannot serve it. */
    Path?: readonly string[]
    /** Values for a tree entry's `${Param}` placeholders. */
    Params?: TextParams
}

/**
 * Registers a restraint's three text lines under `Restraint<name>`, `Restraint<name>Desc` and
 * `Restraint<name>Desc2`.
 *
 * Every slot is registered, an absent one as an empty string: a key that was never registered makes
 * the engine draw the key itself.
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
 * Adds a restraint to `KinkyDungeonRestraints` and its cache, and registers its text.
 *
 * @returns The added restraint, deeply frozen.
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

export const AddRestraintWithTextThenGetName = (restraint: restraint, restraintText?: RestraintText) =>
    AddRestraintWithText(restraint, restraintText).name
