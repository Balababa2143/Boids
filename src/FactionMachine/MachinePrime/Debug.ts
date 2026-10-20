/**
 * Development-only drivers and console entry points.
 *
 * This module exists so prototype scaffolding lives in one obviously-named place instead of being
 * mixed into the item modules. `MachinePrime/index.ts` exports it as
 * `Boids.FactionMachine.MachinePrime.Debug`, and it is evaluated for its side effects like every other
 * registration module.
 *
 * ## What the driver is for now, and what was retired
 *
 * It was the prototype's *only* input to the sensory limiters. In the control model the **console
 * drivers** record a demand and announce what the router resolved, which is enough to make a worn
 * visor or gag re-model itself without any UI. They are load-bearing placeholder code until 3.1,
 * not leftover debris.
 *
 * The random `tick` handler that used to sit beside them **is retired** (the Phase 1 re-delivery,
 * #82): it wrote a demand nobody asked for on roughly two ticks in five, and its `AnnounceRate` call
 * advanced game time from inside the game's own tick dispatch. A playable build registers no tick
 * handler now; what remains is the explicit console entry point.
 *
 * ## A demand, and the *continuous* half of one
 *
 * A dimension's demand is a record of its facets' parameters (`design/spec.md` §6.5), and a numeric one
 * is a **number in 0..1** — the Host's dial. This driver sets it, which is why `SetBlindStrength(0.15)`
 * and `SetBlindStrength(0.95)` are two different sessions: the resolved value is that demand clamped
 * to what the worn set can deliver, so a demand with no gear applies nothing and waits.
 *
 * A **gate-only** dimension has no number to give — its parameter is which permission — so the driver
 * gives it the one that imposes something, and which one that is is read off the descriptor rather than
 * assumed here.
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
 *
 * A literal here would keep the driver working after the catalogue renamed a dimension, which is
 * exactly the drift the derived-identifier scheme exists to make a migration.
 */
const Sight = DimensionId(Catalog.DimensionName.Sight)
const Speech = DimensionId(Catalog.DimensionName.Speech)
const ArmDimension = DimensionId(Catalog.DimensionName.PoseArms)
const LegDimension = DimensionId(Catalog.DimensionName.PoseLegs)

/**
 * The strongest demand a dimension can be given, read off what its own intent takes.
 *
 * A rate dimension is asked for a `Target` of 1 — the strictest squeeze there is. A form dimension is
 * asked for the largest model. A gate dimension has no number to give, so it is asked for the permission
 * that imposes something. **Which of these it is comes from the descriptor**, through
 * `IntentParameterNames`, rather than from this module assuming what the catalogue declared: a dimension
 * that took none of them would be given nothing, and one that took several would be given all of them.
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
    // A posture dimension's parameter is deliberately **not** filled in here. An absent `Allowed` is
    // *nothing was asked*, which resolves to the dimension's ladder — and the ladder is the dimension
    // wide open, so filling it in would make this driver a way to permit everything rather than a way
    // to impose something. `SetPostureArms` and `SetPostureLegs` are how a set is asked for.
    return demand
}

/**
 * Records a demand for one dimension and announces what it resolved to.
 *
 * The announcement is what makes a worn item re-model itself: the item families subscribe to the morph
 * channel, and this is the only writer it has until Phase 3.1.
 *
 * **The number is the Host's demand, not the outcome.** A caller asking for 0.4 gets 0.4 if the worn
 * set can deliver it and whatever the gear can do otherwise — the number announced is the resolved one,
 * because the point of the model is that the two are different questions.
 *
 * **A posture dimension has no number to give**, so it is driven through its gate and its set
 * separately; {@link Drive} itself is about the rate.
 *
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
    // Announced from the two resolutions rather than from the number the caller supplied, because the
    // number the Host asks for and the number a seam receives are different answers.
    SensoryControl.AnnounceRate({
        dimension,
        OldStrength: before.Applied ?? 0,
        NewStrength: after.Applied ?? 0,
    })
}

/**
 * Records a **posture** demand: the poses to subtract under `OverrideForbidden`, or to restore under
 * `OverrideAllowed`.
 *
 * It is a separate entry point from {@link Drive} because a posture dimension has nothing continuous
 * about it — a body configuration is chosen from a ladder rather than measured (§6.7) — so there is no
 * strength to ask for and no rate announcement to make. What comes back is the permitted set, which is
 * the thing the route (§6.13) will eventually write into the game's availability functions.
 *
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
 * Names the poses the Host forbids the arms, or permits them again, and announces the resulting set.
 *
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
 * Demands a given severity of the sight dimension, or a random one when none is given.
 *
 * It is the driver's console entry point and it is deliberately **continuous**: 0 is no restriction,
 * 1 is the strictest the dimension admits, and anything between is the Host asking for a partial
 * squeeze. What the wearer actually gets is this demand clamped to the worn set's capability.
 */
export const SetBlindStrength = (value?: number) => Drive({ dimension: Sight, strength: value ?? Math.random() })

/**
 * The same, for the speech dimension.
 *
 * It moves **only the rate** now. An earlier build drove a model size alongside it, through a `Form`
 * facet the Host could demand a size of; **that facet is retracted** (§6.1), because the look of a
 * thing is a property of the thing rather than a demand. A muffler's three models are chosen by the
 * appearance its own declaration carries (`Item/Gag.ts`), so there is nothing here to drive.
 */
export const SetGagStrength = (value?: number) => Drive({ dimension: Speech, strength: value ?? Math.random() })
