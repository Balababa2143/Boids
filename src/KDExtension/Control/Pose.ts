/**
 * The poses a body configuration is chosen from: the `Posture` facet's own vocabulary.
 *
 * The names are the game's own, and `Free` here is a body configuration rather than
 * `GateIntent.Free`.
 * @module KDExtension/Control/Pose
 */

/** The closed union of body configurations, grouped the way the game groups them. */
export const PoseKey = {
    //#region The arm poses
    /** Nothing is holding the arms. The only pose every rig can draw. */
    Free: 'Free',
    /** Arms behind the back, forearms parallel to each other. */
    Boxtie: 'Boxtie',
    Wristtie: 'Wristtie',
    Yoked: 'Yoked',
    Front: 'Front',
    Up: 'Up',
    Crossed: 'Crossed',
    //#endregion

    //#region The leg poses
    Spread: 'Spread',
    Closed: 'Closed',
    Kneel: 'Kneel',
    KneelClosed: 'KneelClosed',
    /** Face down, wrists and ankles joined. */
    Hogtie: 'Hogtie',
    //#endregion

    //#region The postures the availability functions test for
    FeetLinked: 'FeetLinked',
    LegBind: 'LegBind',
    ForceKneel: 'ForceKneel',
    HandsBound: 'HandsBound',
    //#endregion
} as const

/** One body configuration. */
export type PoseKey = typeof PoseKey[keyof typeof PoseKey]

export const PoseKeys: ReadonlySet<PoseKey> = new Set(
    Object.values(PoseKey) as readonly PoseKey[]
)

export const IsPoseKey = (value: unknown): value is PoseKey =>
    typeof value === 'string' && PoseKeys.has(value as PoseKey)

/**
 * The arm poses, in ladder order.
 *
 * The first member is the pose every rig can draw, which is what the router falls back to when its
 * algebra empties the set. `HandsBound` is on the ladder because the availability function asks
 * about it by name.
 */
export const ArmPoseLadder: readonly PoseKey[] = [
    PoseKey.Free,
    PoseKey.Boxtie,
    PoseKey.Wristtie,
    PoseKey.Yoked,
    PoseKey.Front,
    PoseKey.Up,
    PoseKey.Crossed,
    PoseKey.HandsBound,
]

/**
 * The leg poses, in ladder order.
 *
 * `Closed` leads because the game's own cascade reaches for a stand with the legs together first,
 * and it is the least demanding of the three to draw.
 */
export const LegPoseLadder: readonly PoseKey[] = [
    PoseKey.Closed,
    PoseKey.Spread,
    PoseKey.Kneel,
    PoseKey.KneelClosed,
    PoseKey.Hogtie,
    PoseKey.FeetLinked,
    PoseKey.LegBind,
    PoseKey.ForceKneel,
]
