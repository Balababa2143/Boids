import { DeepFreezeClone } from "../../Utilities"

export interface RestraintText {
    DisplayName: string
    FlavorText: string
    FunctionText: string
}

export namespace RestraintText {
    export const Default: RestraintText = {
        DisplayName: "[Missing Name]",
        FlavorText: "",
        FunctionText: ""
    }
}

export const AddRestraintWithText = (restraint: restraint, restraintText?: RestraintText) => {
    if (KinkyDungeonRestraintsCache.has(restraint.name)) {
        throw new Error('Adding duplicated restraint.')
    }
    const reserialized = DeepFreezeClone(restraint)
    KinkyDungeonRestraints.push(reserialized)
    KinkyDungeonRestraintsCache.set(reserialized.name, reserialized)
    if (restraintText != null) {
        KinkyDungeonAddRestraintText(
            reserialized.name,
            restraintText.DisplayName,
            restraintText.FlavorText,
            restraintText.FunctionText
        )
    }
    return reserialized
}

export const AddRestraintWithTextThenGetName = (restraint: restraint, restraintText?: RestraintText) =>
    AddRestraintWithText(restraint, restraintText).name