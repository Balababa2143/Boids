/**
 * The poses a body configuration is chosen from: the `Posture` facet's own vocabulary.
 *
 * ## Why a facet has a vocabulary at all
 *
 * `GateIntent` is the `Gate` facet's three values; `PoseKey` is the same kind of thing for
 * `Posture` (`design/spec.md` §6.5, §6.13). It is **a facet's vocabulary, not the type of an
 * intent** — an intent for a posture dimension is `{ Allowed, Intent }`, and `Allowed` is a set
 * of these. A dimension that cannot take a body configuration cannot carry one at all.
 *
 * ## Why these names and not ones of our own
 *
 * **[Decided] The union holds the game's own pose names** (§6.13): the seven arm poses from
 * `Data/Poses.ts:1` and the five leg poses from `:16`, plus the four postures the availability
 * functions test for by name — `FeetLinked`, `LegBind`, `ForceKneel`, `HandsBound`. Inventing a
 * private name would mean a translation table between the facet's vocabulary and the engine's,
 * and a translation table is a second place for the two to disagree.
 *
 * `Free` is the game's arm pose and shares its spelling with `GateIntent.Free`. That collision is
 * the engine's, not ours, and the two live in different facets: one is a permission and one is a
 * body configuration. Keeping the game's name is worth the shared spelling.
 *
 * ## Enumerable at run time, like every other closed vocabulary here
 *
 * A `const enum` would be inlined and absent at run time, and a console has to be able to list
 * these (§6.4's reason, applied to this facet). The values are their own names so a save and a
 * console line stay readable.
 * @module KDExtension/Control/Pose
 */

/**
 * The closed union of body configurations.
 *
 * Grouped the way the game groups them rather than alphabetically, because the grouping is the
 * thing a reader needs: the first seven are what the arms can be doing, the next five what the
 * legs can be doing, and the last four are the postures the availability functions ask about
 * directly.
 */
export const PoseKey = {
    //#region The arm poses — `Data/Poses.ts:1`
    /** Nothing is holding the arms. The only pose every rig can draw. */
    Free: 'Free',
    /** Arms behind the back, forearms parallel to each other. */
    Boxtie: 'Boxtie',
    /** Wrists bound together, arms otherwise free. */
    Wristtie: 'Wristtie',
    /** A yoke across the shoulders, holding the arms out. */
    Yoked: 'Yoked',
    /** Arms brought to the front. */
    Front: 'Front',
    /** Arms raised above the head. */
    Up: 'Up',
    /** Arms crossed in front of the chest. */
    Crossed: 'Crossed',
    //#endregion

    //#region The leg poses — `Data/Poses.ts:16`
    /** Legs apart. */
    Spread: 'Spread',
    /** Legs together. */
    Closed: 'Closed',
    /** Kneeling upright. */
    Kneel: 'Kneel',
    /** Kneeling with the knees together. */
    KneelClosed: 'KneelClosed',
    /** On the front, wrists and ankles joined. */
    Hogtie: 'Hogtie',
    //#endregion

    //#region The postures the availability functions test for
    /** The ankles are joined to each other. */
    FeetLinked: 'FeetLinked',
    /** The legs are bound together. */
    LegBind: 'LegBind',
    /** The knees are forced to the ground. */
    ForceKneel: 'ForceKneel',
    /** The hands are bound together. */
    HandsBound: 'HandsBound',
    //#endregion
} as const

/** One body configuration. */
export type PoseKey = typeof PoseKey[keyof typeof PoseKey]

/** Every pose, in declaration order, for a walk that has to cover the vocabulary. */
export const PoseKeys: ReadonlySet<PoseKey> = new Set(
    Object.values(PoseKey) as readonly PoseKey[]
)

/**
 * Whether a value is a pose this build knows.
 *
 * A membership test rather than a cast, because this runs on a value that came from a save
 * (§6.5) and on a value a console caller typed.
 */
export const IsPoseKey = (value: unknown): value is PoseKey =>
    typeof value === 'string' && PoseKeys.has(value as PoseKey)

/**
 * The arm ladder: **every pose the `PoseArms` dimension governs, in order.**
 *
 * **[Decided] The ladder is ordered so its first member is the pose every rig can draw**, because
 * that member is what the router falls back to when its own algebra empties the set
 * (invariant 23) and what the game's own cascade reaches for first (`Data/Poses.ts:459-467`).
 * `Free` is that pose for the arms: an arm pose no model is required to draw is the one arm pose
 * that needs no art.
 *
 * `HandsBound` is on the ladder rather than outside it because the availability function asks
 * about it by name: it is a configuration the arms can be in, so a dimension that governs arm
 * configurations has to be able to permit and refuse it.
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
 * The leg ladder, ordered by the same rule as the arm one.
 *
 * `Closed` leads because it is the game's own first sentinel: its cascade falls back to
 * `DefaultStand`, then `DefaultKneel`, then `Hogtie` (`Data/Poses.ts:459-467`), and a stand with
 * the legs together is the least demanding of the three to draw.
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
