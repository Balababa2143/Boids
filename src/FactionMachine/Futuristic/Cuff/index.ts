/**
 * The collar-and-cuff family: the collar and the cuffs for arm, elbow, wrist, waist, thigh and
 * ankle, plus the models they render with.
 *
 * `Common` is exported flat rather than as a namespace so a caller names a kind directly —
 * `Futuristic.Cuff.GetCuff(Futuristic.Cuff.CuffKind.WaistCuff)`.
 * @module FactionMachine/Futuristic/Cuff
 */

/** The generated model names the items here render with, and their colour banks. */
export * as Model from './Model'
/** What the eight kinds are, and which base-game model each copies. */
export * from './Common'
/** The registered restraints, and the lookup that names one by kind. */
export * from './Item'
