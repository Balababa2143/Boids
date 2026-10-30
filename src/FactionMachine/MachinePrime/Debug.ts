/**
 * Development-only drivers and console entry points. The console drivers record a demand and
 * announce what the router resolved, which is what makes a worn visor or gag re-model itself
 * without any UI. A numeric demand is a number in 0..1, and the resolved value is that demand
 * clamped to what the worn set can deliver, so a demand with no gear applies nothing. A gate-only
 * dimension has no number to give, so the driver gives it the permission that imposes something,
 * read off the descriptor.
 */

import {
    ArmPoseLadder,
    DimensionId,
    GateIntent,
    GetDimension,
    HasDimension,
    IntentParameterNames,
    IntentRecord,
    LegPoseLadder,
    PoseKey,
} from '../../KDExtension/Control'
import {
    Catalog,
    Resolve,
    SensoryControl,
    SetIntent,
} from './Coordinator'

/**
 * The dimensions the drivers move, resolved through the catalogue rather than written as literals.
 * A literal would keep the driver working after the catalogue renamed a dimension.
 */
const Sight = DimensionId(Catalog.DimensionName.Sight)
const Speech = DimensionId(Catalog.DimensionName.Speech)
const ArmDimension = DimensionId(Catalog.DimensionName.PoseArms)
const LegDimension = DimensionId(Catalog.DimensionName.PoseLegs)

/**
 * The strongest demand a dimension can be given, read off what its own intent takes. A rate
 * dimension is asked for `Target: 1`, a gate dimension for the permission that imposes something,
 * and which parameters exist comes from the descriptor through `IntentParameterNames`.
 */
const StrongestDemand = (dimension: string): IntentRecord => {
    const takes = IntentParameterNames(GetDimension(dimension)) as readonly string[]
    const demand: { Target?: number, Allowed?: readonly PoseKey[], Intent?: GateIntent } = {}
    if (takes.includes('Target')) {
        demand.Target = 1
    }
    if (takes.includes('Intent')) {
        demand.Intent = GateIntent.OverrideForbidden
    }
    // An absent `Allowed` means nothing was asked, which resolves to the ladder — the dimension
    // wide open. Filling it in would make this driver a way to permit everything.
    return demand
}

/**
 * Records a demand for one dimension and announces what it resolved to. The announcement is what
 * makes a worn item re-model itself, and the number announced is the resolved one rather than the
 * demand: a caller asking for 0.4 gets 0.4 only if the worn set can deliver it. A posture dimension
 * has no number to give, so it is driven through its gate and its set separately.
 * @param args.dimension - The dimension to move.
 * @param args.strength - The demanded severity, 0..1, for a dimension that takes a `Target`.
 */
const Drive = (args: {
    readonly dimension: string
    readonly strength: number
}) => {
    const { dimension, strength } = args
    if (!HasDimension(dimension)) {
        console.warn(`Boids: the debug driver cannot move '${dimension}', which is not a dimension.`)
        return
    }
    const takes = IntentParameterNames(GetDimension(dimension)) as readonly string[]
    const before = Resolve(dimension)

    const demand: { Target?: number, Allowed?: readonly PoseKey[], Intent?: GateIntent } = { ...StrongestDemand(dimension) }
    if (takes.includes('Target')) {
        demand.Target = strength
    }

    const wrote = SetIntent({ dimension, intent: demand })
    if (wrote.kind === 'refused') {
        console.warn(`Boids: the debug driver could not move '${dimension}'. ${wrote.Reason}`)
        return
    }

    const after = Resolve(dimension)
    // Announced from the two resolutions: the number the Host asks for and the one a seam receives
    // differ.
    SensoryControl.AnnounceRate({
        dimension,
        OldStrength: before.Applied ?? 0,
        NewStrength: after.Applied ?? 0,
    })
}

/**
 * Records a posture demand: the poses to subtract under `OverrideForbidden`, or to restore under
 * `OverrideAllowed`. A separate entry point from {@link Drive} because a posture dimension has
 * nothing continuous about it: a body configuration is chosen from a ladder rather than measured,
 * so there is no strength to ask for and no rate announcement to make.
 * @param dimension - The posture dimension to move.
 * @param allowed - The poses to name, for the gate to remove or restore.
 * @param gate - Which permission to record. Defaults to `OverrideForbidden`, the one that imposes.
 */
const DrivePosture = (
    dimension: string,
    allowed: readonly PoseKey[],
    gate: GateIntent = GateIntent.OverrideForbidden
) => {
    if (!HasDimension(dimension)) {
        console.warn(`Boids: the debug driver cannot move '${dimension}', which is not a dimension.`)
        return
    }
    const wrote = SetIntent({ dimension, intent: { Allowed: allowed, Intent: gate } })
    if (wrote.kind === 'refused') {
        console.warn(`Boids: the debug driver could not move '${dimension}'. ${wrote.Reason}`)
        return
    }
    const resolved = Resolve(dimension)
    console.log(
        `Boids: '${dimension}' now permits ` +
        `${resolved.Posture == null ? 'nothing' : [...resolved.Posture].join(', ')}.`
    )
}

/**
 * Names the poses the Host forbids the arms, or permits them again, and announces the resulting
 * set.
 * @param poses - The poses to name. Omitted means every pose on the dimension's ladder, so a bare
 *   `SetPostureArms()` is *"she may take none of them"*.
 * @param gate - `OverrideAllowed` restores the named poses instead of removing them.
 */
export const SetPostureArms = (poses?: readonly PoseKey[], gate?: GateIntent) =>
    DrivePosture(ArmDimension, poses ?? ArmPoseLadder, gate)

/** The same, for the legs. */
export const SetPostureLegs = (poses?: readonly PoseKey[], gate?: GateIntent) =>
    DrivePosture(LegDimension, poses ?? LegPoseLadder, gate)

/**
 * Demands a given severity of the sight dimension, or a random one when none is given. 0 is no
 * restriction and 1 the strictest the dimension admits; what the wearer gets is this demand clamped
 * to the worn set's capability.
 */
export const SetBlindStrength = (value?: number) => Drive({ dimension: Sight, strength: value ?? Math.random() })

/**
 * The same, for the speech dimension; it moves only the rate. A muffler's models are chosen by the
 * appearance its own declaration carries (`Item/Gag.ts`).
 */
export const SetGagStrength = (value?: number) => Drive({ dimension: Speech, strength: value ?? Math.random() })
