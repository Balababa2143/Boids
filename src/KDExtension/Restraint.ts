import { DeepFreezeClone } from '../Utilities'

/**
 * Represents the text information associated with a restraint, including display name, flavor text, and function text.
 */
export interface IRestraintText {
    DisplayName?: string
    FlavorText?: string
    FunctionText?: string
}

/**
 * Adds localized text entries for a restraint using the provided name and restraint text object.
 *
 * @param name - The unique identifier for the restraint, used as a key prefix.
 * @param restraintText - An object containing the display name, flavor text, and function description for the restraint.
 *
 * The function will add the following text keys if present in `restraintText`:
 * - `Restraint{name}`: The display name.
 * - `Restraint{name}Flavor`: The flavor text.
 * - `Restraint{name}Desc`: The function description.
 */
export function AddRestraintText(name: string, restraintText: IRestraintText): void {
    const baseKey = `Restraint${name}`;

    if (restraintText.DisplayName) {
        addTextKey(baseKey, restraintText.DisplayName)
    }
    if (restraintText.FlavorText) {
        addTextKey(`${baseKey}Flavor`, restraintText.FlavorText)
    }
    if (restraintText.FunctionText) {
        addTextKey(`${baseKey}Desc`, restraintText.FunctionText)
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
export const AddRestraintWithText = (restraint: restraint, restraintText: IRestraintText = {}) => {
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
export const AddRestraintWithTextThenGetName = (restraint: restraint, restraintText?: IRestraintText) =>
    AddRestraintWithText(restraint, restraintText).name

/**
 * Merges multiple list of `KinkyDungeonEvent` objects into a single generator function,
 * ensuring that for each unique combination of `trigger` and `type`, only the last encountered event is kept.
 *
 * @param eventLists - An iterable of iterables, where each inner iterable contains `KinkyDungeonEvent` objects.
 * @returns A generator function that yields the merged `KinkyDungeonEvent` objects, one for each unique `trigger` and `type` combination.
 */
export const MergeEvents = (eventLists: Iterable<Iterable<KinkyDungeonEvent>>) => {
    const ret: Record<string, Record<string, KinkyDungeonEvent>> = {}
    for (const eventList of eventLists) {
        for (const event of eventList) {
            const triggerList = ret[event.trigger] ?? {}
            triggerList[event.type] = event
            ret[event.trigger] = triggerList
        }
    }
    return (function* () {
        for (const trigger in ret) {
            const triggerList = ret[trigger]
            for (const type in triggerList) {
                yield triggerList[type]
            }
        }
    })()
}