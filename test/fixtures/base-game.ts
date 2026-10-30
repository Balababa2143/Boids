/**
 * Stand-in for the parts of the base game that the mod reads at load
 * time: synthetic but deterministic and faithful in shape, so a
 * registration recorded against it is a function of the mod alone.
 */

/** Number of entries in the fake layer ordering; must exceed 220. */
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

/** Builds a layer table keyed by each layer's name, so `ToLayerMap` round-trips losslessly. */
export const MakeLayers = (LayerNames: readonly string[]): Record<string, ModelLayer> =>
    Object.fromEntries(LayerNames.map(name => [name, MakeLayer(name, name)]))

/** Base models the mod clones; each carries one `...Lock` layer and three non-locking layers. */
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
 * Restraints present in `KinkyDungeonRestraints` before the mod
 * is imported; `Aroused/Toys.ts` spreads their `escapeChance`.
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
 * Tag collections the mod spreads into `LinkableBy` / `renderWhenLinked`
 * / `shrine`; plain string arrays, so iteration order is the array order.
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
 * The engine's own text, as its `Text_KinkyDungeon.csv`
 * would provide it: only the keys the mod sources.
 *
 * The values are stand-ins, not the game's strings;
 * a test asserting on one would assert on this file.
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
