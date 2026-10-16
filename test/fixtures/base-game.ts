/**
 * Minimal stand-in for the parts of the base game that the mod reads at load time.
 *
 * IMPORTANT: this is a mock of the game's *interface*, not a copy of its data or
 * implementation. The values below are deliberately synthetic. What matters is
 * that they are
 *
 *   1. deterministic, and
 *   2. faithful in *shape* to what the mod inspects,
 *
 * so that a registration recorded against this fixture is a function of the mod alone, and a
 * mismatch means the mod changed rather than the game.
 *
 * The fixture is deliberately built to exercise both branches of every load-time
 * conditional the mod runs against base-game data:
 *
 *   - layer names containing `Lock`   (Cuff/Model.ts marks them `LockLayer`)
 *   - layer names containing `Display`(LatexSuit marks them `LockLayer`)
 *   - a model that already has `AddPose` and models that do not
 *     (Headphone.ts takes a different branch for each)
 */

/** Number of entries in the fake layer ordering; must exceed the 219/220 indices swapped by the entry. */
export const BASE_LAYER_COUNT = 240

export const BASE_LAYER_ORDER: string[] = Array.from(
    { length: BASE_LAYER_COUNT },
    (_, i) => `BaseLayer${String(i).padStart(3, '0')}`
)

const MakeLayer = (Name: string, Layer: string): ModelLayer => ({
    Name,
    Layer,
    Pri: 0,
})

/**
 * Builds a base-game layer table. Every layer gets a distinct name so that
 * `ToLayerMap`'s key-by-`Name` indexing round-trips losslessly.
 */
export const MakeLayers = (LayerNames: readonly string[]): Record<string, ModelLayer> =>
    Object.fromEntries(LayerNames.map(name => [name, MakeLayer(name, name)]))

/**
 * Base models the mod clones. `Cuff/Model.ts` rewrites `LockLayer` from the layer
 * name, so each model carries one `...Lock` and three non-locking layers.
 */
export const BaseClonedModelNames = [
    'NeoCyberCollar',
    'FutureCollar',
    'CyberCuffsWrists',
    'CyberCuffsElbows',
    'CyberCuffsArms',
    'NeoCyberBelt',
    'CyberCuffsThigh',
    'CyberCuffsAnkles',
] as const

const MakeClonedModelLayers = (modelName: string): Record<string, ModelLayer> =>
    MakeLayers([`${modelName}Base`, `${modelName}Display`, `${modelName}Lock`, `${modelName}Rim`])

/** Layer names of the collar model that `LatexSuit` folds into the catsuit. */
export const CyberLinkCollarLayerNames = ['CyberLinkCollarBase', 'CyberLinkCollarDisplay', 'CyberLinkCollarRim'] as const

/** Layer names of the catsuit base model that `LatexSuit` clones wholesale. */
export const CatsuitRestraintLayerNames = ['CatsuitRestraintBody', 'CatsuitRestraintCollar', 'CatsuitRestraintRim'] as const

/** `Headphone.ts` pushes onto these; only `ElfEars` starts with a populated `AddPose`. */
export const ElfEarModelNames = ['ElfEars', 'ElfEarsLong', 'ElfEarsFloppy'] as const

const MakeBaseModel = (args: {
    Name: string,
    Folder: string,
    Layers: Record<string, ModelLayer>,
    AddPose?: string[],
}): Model => ({
    Name: args.Name,
    Folder: args.Folder,
    Categories: ['Restraints'],
    TopLevel: true,
    ...(args.AddPose != null ? { AddPose: [...args.AddPose] } : {}),
    Layers: args.Layers,
})

/** Models present in `ModelDefs` before the mod under test is imported. */
export const BuildBaseModels = (): Record<string, Model> => ({
    ...Object.fromEntries(
        BaseClonedModelNames.map(
            name => [name, MakeBaseModel({ Name: name, Folder: `Base/${name}`, Layers: MakeClonedModelLayers(name) })]
        )
    ),
    CyberLinkCollar: MakeBaseModel({
        Name: 'CyberLinkCollar',
        Folder: 'Base/CyberLinkCollar',
        Layers: MakeLayers(CyberLinkCollarLayerNames),
    }),
    CatsuitRestraint: MakeBaseModel({
        Name: 'CatsuitRestraint',
        Folder: 'Base/CatsuitRestraint',
        Layers: MakeLayers(CatsuitRestraintLayerNames),
    }),
    ElfEars: MakeBaseModel({
        Name: 'ElfEars',
        Folder: 'Base/ElfEars',
        Layers: MakeLayers(['ElfEarsBase']),
        AddPose: ['ExistingElfEarPose'],
    }),
    ElfEarsLong: MakeBaseModel({
        Name: 'ElfEarsLong',
        Folder: 'Base/ElfEarsLong',
        Layers: MakeLayers(['ElfEarsLongBase']),
    }),
    ElfEarsFloppy: MakeBaseModel({
        Name: 'ElfEarsFloppy',
        Folder: 'Base/ElfEarsFloppy',
        Layers: MakeLayers(['ElfEarsFloppyBase']),
    }),
})

/**
 * Restraints present in `KinkyDungeonRestraints` before the mod is imported.
 * `Aroused/Toys.ts` reads these at module scope and spreads their `escapeChance`.
 */
export const BuildBaseRestraints = (): restraint[] => [
    {
        name: 'NippleClamps',
        Group: 'ItemNipples',
        escapeChance: { Struggle: 0.1, Remove: 0.2, Pick: 0.3, Unlock: 0.4, Cut: 0.5 },
    } as unknown as restraint,
    {
        name: 'TrapVibeProto',
        Group: 'ItemVulva',
        escapeChance: { Struggle: 0.6, Remove: 0.7, Pick: 0.8, Unlock: 0.9, Cut: 1 },
    } as unknown as restraint,
]

/**
 * Tag collections the mod spreads into `LinkableBy` / `renderWhenLinked` / `shrine`.
 * All are plain string arrays so that iteration order is the array order.
 */
export const BuildBaseTagCollections = (): Record<string, string[]> => ({
    KDDevices: ['KDDevicesA', 'KDDevicesB'],
    KDBindable: ['KDBindableA', 'KDBindableB'],
    KDBindableMinusCuffs: ['KDBindableMinusCuffsA'],
    KDCollarLink: ['KDCollarLinkA'],
    KDCollarRender: ['KDCollarRenderA'],
    KDVisorLink: ['KDVisorLinkA'],
    KDMaskLink: ['KDMaskLinkA'],
    KDBlindfoldLink: ['KDBlindfoldLinkA'],
    KDPlugGagLink: ['KDPlugGagLinkA'],
    KDStuffingLink: ['KDStuffingLinkA'],
    KDBallGagLink: ['KDBallGagLinkA'],
    KDFlatGagLink: ['KDFlatGagLinkA'],
    KDMuzzleGagLink: ['KDMuzzleGagLinkA'],
    KDHarnessLink: ['KDHarnessLinkA'],
    KDDialogueRemoteLinkTether: ['KDDialogueRemoteLinkTetherA'],
    KDMsgRemoteLinkCHTether: ['KDMsgRemoteLinkCHTetherA'],
    ARMPOSES: ['ArmPoseA', 'ArmPoseB'],
    FOREARMPOSES: ['ForeArmPoseA', 'ForeArmPoseB'],
})

/**
 * The engine's own text, as its `Text_KinkyDungeon.csv` would provide it.
 *
 * Only the keys the mod **sources** — an item whose flavour or function line comes from the
 * restraint it is derived from — are here, because that is the only way the mod reads the
 * engine's text: `Restraint<name>Desc` and `Desc2`, resolved once the engine has loaded.
 *
 * These are **stand-ins, not the game's strings.** The harness's contract is that every stub is
 * a deterministic and injective function of its inputs, so that a change in what the mod asks
 * for shows up as a manifest diff; fidelity to the base game's prose is not part of it, and a
 * test asserting on a specific sentence here would be asserting on this file.
 */
export const BuildBaseText = (): Record<string, string> => ({
    RestraintTrapVibeProtoDesc: 'Base game: the prototype egg.',
    RestraintTrapVibeProtoDesc2: 'Base game: lockable.',
    RestraintTrapPlug3Desc: 'Base game: a smooth plug.',
    RestraintRearVibe1Desc: 'Base game: a rear plug.',
    RestraintCyberBeltDesc2: 'Base game: a cyber belt.',
    RestraintCyberBraDesc2: 'Base game: a cyber bra.',
    RestraintControlHarnessDesc: 'Base game: a control harness.',
    RestraintControlHarnessDesc2: 'Base game: controlled.',
})
