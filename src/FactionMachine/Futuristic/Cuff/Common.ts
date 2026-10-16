/**
 * The shape of the collar-and-cuff family: the eight things it makes, and which base-game model each
 * one is a copy of.
 *
 * The family is split across three modules — this one names it, `Model` registers the copied models,
 * `Item` registers the restraints — because the restraint has to name the model that registration
 * returned, so the two halves cannot be built in one pass.
 * @module FactionMachine/Futuristic/Cuff/Common
 */

/**
 * The eight collar and cuff items.
 *
 * **A key is part of a persisted identity.** A restraint's and a model's registered name is
 * `uuidv5(JSON.stringify(key), baseId)`, so renaming a member of this union renames a saved item —
 * a migration rather than a cleanup, exactly as a variant-key *field* is.
 *
 * An object rather than a bare type because the parts tables have to be **total over it and iterated**:
 * a `Record<CuffKind, …>` gives the totality at compile time, and `CuffKinds` gives the iteration to
 * whoever has to walk the family.
 */
export const CuffKind = {
    LightCollar: 'LightCollar',
    HeavyCollar: 'HeavyCollar',
    ArmCuff: 'ArmCuff',
    ElbowCuff: 'ElbowCuff',
    WristCuff: 'WristCuff',
    WaistCuff: 'WaistCuff',
    ThighCuff: 'ThighCuff',
    AnkleCuff: 'AnkleCuff',
} as const

/** One of the eight. */
export type CuffKind = typeof CuffKind[keyof typeof CuffKind]

/** Every kind, for a caller that has to walk the family rather than name a member of it. */
export const CuffKinds: readonly CuffKind[] = Object.values(CuffKind)

/**
 * Which base-game model each kind is a copy of.
 *
 * The cuff models differ from the collars in that they mark their own lock layers; the copying
 * transformation itself lives in `Model.ts` and is applied once per kind, which is the whole reason
 * this is a table rather than eight function calls.
 *
 * The waist cuff is deliberately sourced from a **belt** rather than a cuff model, because it sits in
 * `ItemTorso` rather than on a limb.
 */
export const CuffModelSource = {
    LightCollar: { Source: 'NeoCyberCollar' },
    HeavyCollar: { Source: 'FutureCollar' },
    ArmCuff: { Source: 'CyberCuffsArms' },
    ElbowCuff: { Source: 'CyberCuffsElbows' },
    WristCuff: { Source: 'CyberCuffsWrists' },
    WaistCuff: { Source: 'NeoCyberBelt' },
    ThighCuff: { Source: 'CyberCuffsThigh' },
    AnkleCuff: { Source: 'CyberCuffsAnkles' },
} as const satisfies Record<CuffKind, { readonly Source: string }>
