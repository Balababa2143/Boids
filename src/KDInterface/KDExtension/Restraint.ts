import { IKDEquipInventoryVariantParameters, IKDMorphToInventoryVariantParameters, KinkyDungeonAddRestraintIfWeaker, KinkyDungeonRemoveRestraintSpecific } from 'kd-structured'
import { DeepFreezeClone, ThrowIfNull } from '../../Utilities'

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

export interface IPrepareRestraintVariantParameterPack {
    variant: KDRestraintVariant
    ID?: string,
    prefix?: string
    suffix?: string
    curse?: string
    powerBonus?: number
    events: KinkyDungeonEvent[]
}

const PrepareRestraintVariant = (args: IPrepareRestraintVariantParameterPack) => {
    const {
        variant,
        prefix,
        curse,
        ID,
        suffix,
        powerBonus,
        events
    } = args
    KDUpdateItemEventCache = true
    const preparedVariant = {
        ...variant,
        prefix: prefix ?? variant.prefix,
        suffix: suffix ?? variant.suffix,
        curse: curse ?? variant.curse,
        power:
            (powerBonus && variant.power) ?
                (variant.power + powerBonus) :
                (powerBonus ?? variant.power),
        events
    } satisfies typeof variant

    const prefix2 = preparedVariant.prefix ?? ''
    const newName = prefix2 + variant.template + (ID || (KinkyDungeonGetItemID() + '')) + (curse ? curse : '')

    if (!KinkyDungeonRestraintVariants[newName]) {
        KinkyDungeonRestraintVariants[newName] = preparedVariant
    }

    return {
        newName,
        preparedVariant
    }
}

/**
 * Merges inventory variant events and equips a restraint variant, returning the result of the equip operation.
 *
 * @param args - The parameters for equipping the inventory variant.
 * @returns The result of the equip operation (number).
 */
export const EquipInventoryVariantMergeEvents = (args: IKDEquipInventoryVariantParameters): number => {
    const {
        variant,
        Tightness,
        Bypass,
        Lock,
        Keep,
        Trapped,
        faction,
        Deep,
        securityEnemy,
        useAugmentedPower,
        powerBonus,
        NoActionPrune
    } = args

    const originalRestraint = KinkyDungeonGetRestraintByName(variant.template)

    const {
        newName,
        preparedVariant
    } = PrepareRestraintVariant({
        ...args,
        events: [...MergeEvents([originalRestraint.events ?? [], variant.events])]
    })

    return KinkyDungeonAddRestraintIfWeaker({
        restraint: originalRestraint,
        Tightness,
        Bypass,
        Lock,
        Keep,
        Trapped,
        events: preparedVariant.events,
        faction,
        Deep,
        Curse: preparedVariant.curse,
        securityEnemy,
        useAugmentedPower,
        inventoryAs: newName,
        powerBonus,
        NoActionPrune
    })
}

/**
 * Morphs an inventory item to a specified restraint variant, updating its properties and events as needed.
 *
 * If the item cannot be morphed in-place, removes the current item and adds a new restraint variant.
 *
 * @param args - The parameters for morphing the inventory item to a variant.
 * @returns The result of adding the new restraint if a new one is created, otherwise void.
 * @throws {Error} If required item properties are null or invalid (via ThrowIfNull).
 */
export const MorphToInventoryVariantMergeEvents = (args: IKDMorphToInventoryVariantParameters) => {
    const {
        item,
        variant,
        curse,
        forceMorph
    } = args

    const hasNoDynamicLink = !(KinkyDungeonGetRestraintItem(KDRestraint(item)?.Group)?.dynamicLink)

    const originalRestraint = KinkyDungeonGetRestraintByName(variant.template)
    const mergedEvents = [...MergeEvents([
        originalRestraint.events ?? [],
        item.events ?? [],
        variant.events
    ])]
    if (forceMorph || hasNoDynamicLink || item.type === LooseRestraint) {
        // modify restraint in-place
        const {
            newName
        } = PrepareRestraintVariant({
            ...args,
            ID: String(item.id),
            events: mergedEvents
        })
        KDChangeItemName(item, ThrowIfNull(item.type), variant.template)
        item.curse = curse
        item.events = mergedEvents
        if (LooseRestraint === ThrowIfNull(item.type)) {
            item.name = newName,
                item.showInQuickInv = true
        }
        else {
            item.name = variant.template
        }
    }
    else {
        // Remove current and add new one

        KinkyDungeonRemoveRestraintSpecific({
            item,
            Add: true,
            NoEvent: true,
            ForceRemove: true
        })

        const {
            newName,
            preparedVariant
        } = PrepareRestraintVariant({
            ...args,
            events: mergedEvents
        })
        return KinkyDungeonAddRestraintIfWeaker({
            restraint: originalRestraint,
            Tightness: item.tightness,
            Bypass: true,
            Lock: item.lock,
            Keep: true,
            Trapped: false,
            faction: item.faction,
            events: preparedVariant.events,
            Deep: true,
            Curse: preparedVariant.curse,
            inventoryAs: newName,
            NoActionPrune: true
        })
    }
}