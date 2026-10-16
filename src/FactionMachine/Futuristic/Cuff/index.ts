/**
 * The collar-and-cuff family of the drone set: the collar and the cuffs for arm, elbow, wrist, waist,
 * thigh and ankle, plus the models they render with. Items and models are registered by importing
 * this barrel.
 *
 * `Common` is exported flat rather than as a namespace because a caller has to *name* a kind to ask
 * for a restraint — `Futuristic.Cuff.GetCuff(Futuristic.Cuff.CuffKind.WaistCuff)` — and a namespace
 * two levels deep would make the one thing callers do the longest thing to type.
 * @module FactionMachine/Futuristic/Cuff
 */

/** The generated model names the items here render with, and their colour banks. */
export * as Model from './Model'
/** What the eight kinds are, and which base-game model each copies. */
export * from './Common'
/** The registered restraints, and the lookup that names one by kind. */
export * from './Item'
