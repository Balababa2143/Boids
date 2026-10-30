/**
 * The shape of the collar-and-cuff family: the eight things it makes, and which base-game model
 * each one is a copy of.
 *
 * The family is split across three modules — this one names it, `Model` registers the copied
 * models, `Item` registers the restraints — because a restraint has to name the model that
 * registration returned.
 * @module FactionMachine/Futuristic/Cuff/Common
 */

/**
 * The eight collar and cuff items.
 *
 * A key is part of a persisted identity: a restraint's and a model's registered name is
 * `uuidv5(JSON.stringify(key), baseId)`, so renaming a member renames a saved item.
 *
 * An object rather than a bare type: the parts tables are total over it, and `CuffKinds` iterates
 * it.
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

/** Every kind, for a caller that has to walk the family. */
export const CuffKinds: readonly CuffKind[] = Object.values(CuffKind)

/**
 * Which base-game model each kind is a copy of.
 *
 * The copying transformation itself lives in `Model.ts` and is applied once per kind. The waist
 * cuff is sourced from a belt rather than a cuff model, because it sits in `ItemTorso`.
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
