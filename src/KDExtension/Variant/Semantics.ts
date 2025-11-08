import { ArrayPropertyKeys } from '../../Utilities'


export type ArraySemanticsSet = true
export type ArraySemanticsTuple = false

export type ArraySemantics =
    ArraySemanticsSet | ArraySemanticsTuple

export const ArraySemantics = {
    Set: true,
    Tuple: false
} as const

export const RestraintArraySemantics = {
    'requireAllTagsToEquip': ArraySemantics.Set,
    'specStruggleTypes': ArraySemantics.Set,
    'alwaysDressModel': ArraySemantics.Set,
    'shrine': ArraySemantics.Set,
    'Color': ArraySemantics.Tuple,
    'factionColor': ArraySemantics.Tuple,
    'Modules': ArraySemantics.Tuple,
    'remove': ArraySemantics.Set,
    'strictnessZones': ArraySemantics.Set,
    'removeShrine': ArraySemantics.Set,
    'linkedVibeTags': ArraySemantics.Set,
    'requireSingleTagToEquip': ArraySemantics.Set,
    'noRenderPose': ArraySemantics.Set,
    'renderWhenLinked': ArraySemantics.Set,
    'LinkableBy': ArraySemantics.Set,
    'renderExcept': ArraySemantics.Set,
    'alwaysEscapable': ArraySemantics.Set,
    'addPose': ArraySemantics.Set,
    'linkCategories': ArraySemantics.Tuple,
    'linkSizes': ArraySemantics.Tuple,
    'events': ArraySemantics.Set,
    'addTag': ArraySemantics.Set,
    'hideTags': ArraySemantics.Set,
    'ignoreMinLevelTags': ArraySemantics.Set,
    'ignoreFloorTags': ArraySemantics.Set,
    'addPoseIfTopLevel': ArraySemantics.Set,
    'ignoreMaxLevelTags': ArraySemantics.Set,
    'forbidPose': ArraySemantics.Set,
    'removePose': ArraySemantics.Set
} satisfies Record<ArrayPropertyKeys<restraint>, ArraySemantics>
