import { RestraintText, ModelText } from '../../../KDExtension'
import { AddModelVariantMapToGame, AddRestraintVariantMapToGame, ModelVariantMapBuilder, ModelWithLayerSet, RestraintVariantMapBuilder, VariantPart } from '../../../KDExtension'
import { FactionFilter } from '../../../KDInterface/TextKey'
import { ControlledTag } from '../../MachinePrime/Coordinator/Membership'
import { ModelSetRootDir } from '../Common/Constant'
import { RequireLockedEvent, CommonItemAvailability } from '../Common'
import { ThrowIfNull } from '../../../Utilities'

/**
 * The template layer every link family is built on: the fragments all links
 * share, the descriptor shape a family fills in, and `BuildLinkSet`, which
 * registers a family's whole model and restraint variant map and hands back the
 * restraint lookup.
 *
 * Layer sprite naming: `${BodyPart}/${LeftRight?}${LinkGlow}${Pose}`. One folder
 * per attached item, so a link's artwork does not collide with the cuff it
 * fastens to.
 * @module FactionMachine/Futuristic/Link/Common
 */

/**
 * The folder every link model draws from, one subfolder per variant, e.g.
 * `Boids/Futuristic/Link/BetweenWristCuff`. The layer sets append their own
 * variant folder to it.
 */
export const LinkFolder = `${ModelSetRootDir}/Link`

//#region Model
/**
 * The two colour channels a link layer takes its colour from: `Tether` for the
 * cable and `Glow` for the light that runs along it. The values are what a layer
 * names in its `InheritColor`, and {@link RestraintTemplate} binds both to the
 * highlight filter, which is what gives them a colour at all.
 */
export const InheritColor = {
    Tether: '17954016-CB1A-4C61-A312-A1675EE128CB',
    Glow: 'E15BC39C-544C-49B2-9969-AF5E4E19B14C',
} as const

/**
 * The parts of a model that every link shares: a top-level restraint, filed under
 * the `Restraints`, `Cuffs` and `Links` wardrobe categories, with its artwork
 * rooted at the futuristic model set. Each layer set carries the `Folder` of its
 * own variant, so no link model names one here.
 */
export const ModelTemplate = {
    TopLevel: true,
    Categories: ['Restraints', 'Cuffs', 'Links'],
    Folder: ModelSetRootDir
    // Restraint: true,
} satisfies Partial<Model>

//#endregion

//#region Item

/**
 * The parts of a restraint that every link shares, before a variant narrows it: a
 * binding item that may be linked onto anything the game calls bindable apart from
 * cuffs, that stays accessible and rendered while something is over it, that
 * carries the `Link` tag, and that no shrine interaction can unlock. The
 * availability trio and the require-locked event are spread in from
 * {@link CommonItemAvailability} and {@link RequireLockedEvent}.
 *
 * Struggle and cut are both set below the game's limit chance, so neither frees the
 * wearer — but `struggleBreak` means a finished struggle breaks the link anyway.
 * `Model` is empty because the family fills in the name of the model it has just
 * registered, and `LinkableBy` is a starting list only: each variant's
 * `RequireSocket` adds its socket to it.
 */
export const RestraintTemplate = {
    // special: true,
    binding: true,
    // inventory: false,
    accessible: true,
    shrine: [
        'Link',
        ControlledTag,
    ],
    noShrine: true,
    LinkableBy: [
        ...KDBindableMinusCuffs
    ],
    alwaysRender: true,
    UnderlinkedAlwaysRender: true,

    sfx: 'BeepEngage',
    sfxRemove: 'Crackling',
    Model: '',
    factionFilters: {
        [InheritColor.Tether]: {
            color: FactionFilter.Highlight,
            override: true
        },
        [InheritColor.Glow]: {
            color: FactionFilter.Highlight,
            override: true
        },
    },
    preview: 'CyberLink',

    escapeChance: {
        Remove: 0.2,
        Struggle: -1,
        Pick: 0.13,
        Unlock: 0.5,
        Cut: -0.8
    },
    struggleBreak: true,

    unlimited: true,
    power: 15,
    ...CommonItemAvailability,

    playerTags: {},
    enemyTags: {},

    events: [
        RequireLockedEvent
    ]
} satisfies Partial<restraint>
//#endregion

//#region Set

/**
 * One variant of a link family: the parts its model is built from, the parts its
 * restraint is built from, and the text to register alongside each.
 *
 * The two halves are kept apart because the model has to be registered first —
 * the restraint names the model that registration returned.
 */
export interface ModelRestraintBundledVariantDesc {
    Model: {
        Parts: Iterable<VariantPart<ModelWithLayerSet>>,
        Text?: ModelText
    },
    Restraint: {
        Parts: Iterable<VariantPart<restraint>>
        Text?: RestraintText
    }
}

/**
 * What one link family hands to `BuildLinkSet`: the base uuid its restraint names
 * are derived from, the base uuid its model names are derived from, and the
 * variants themselves.
 *
 * The keys of `DescriptorMap` become the variant keys, and a variant's name is
 * `uuidv5` of its key against the matching base uuid, so a key is part of the
 * identity of everything the family registers: renaming one renames saved items
 * too.
 */
export interface LinkSetDescriptor<DescriptorMap extends Record<string, ModelRestraintBundledVariantDesc>> {
    RestraintBaseName: string,
    ModelBaseName: string,
    /**
     * Text every restraint in the family starts from, with a variant's own text merged over
     * it. A family is where one sentence belongs to several variants, so the shared display
     * name goes here and each variant declares only what tells it apart.
     */
    RestraintFamilyText?: Partial<RestraintText>,
    /** The same, for the family's models. */
    ModelFamilyText?: Partial<ModelText>,
    /**
     * The family's path in the text trees. Each variant is addressed at this path plus its own
     * key, so a translator can reach one variant without the family having to list them all.
     */
    PathPrefix?: readonly string[],
    DescriptorMap: DescriptorMap,
}

/**
 * Registers a whole link family and returns the lookup for its restraints.
 *
 * The model map is built first: each variant's model parts are merged over
 * {@link ModelTemplate} in the order given, so a later part wins a field two of
 * them set, and the variant's model text is attached. The names that registration
 * returned are then fed into the restraint parts — every variant's restraint
 * carries the `Model` name it just created — and the restraint map is built the
 * same way over {@link RestraintTemplate} and registered.
 *
 * Registration is the point of the call, and it is a one-shot side effect: calling
 * it twice, or making the module reachable under a second specifier, throws on the
 * duplicate names. The models and restraints stay reachable through `ModelDefs`
 * and `KinkyDungeonRestraintsCache`, which is where the game reads them.
 *
 * @param args - The family to register: its restraint and model base uuids, and
 *   its variants keyed by variant name.
 * @returns Only `GetRestraintVariant`, which turns a variant key into the name of
 *   the restraint registered for it and throws for a key the family does not have.
 *   The model lookup is not returned because nothing has needed it.
 */
export const BuildLinkSet =
    <DescriptorMap extends Record<string, ModelRestraintBundledVariantDesc>>
        (args: LinkSetDescriptor<DescriptorMap>) => {
        const {
            RestraintBaseName,
            ModelBaseName,
            RestraintFamilyText,
            ModelFamilyText,
            PathPrefix,
            DescriptorMap,
        } = args
        type VariantKey = keyof typeof DescriptorMap
        const modelVariantMapBuilder = new ModelVariantMapBuilder<VariantKey>({
            baseId: ModelBaseName,
            baseText: ModelFamilyText,
        })
        const restraintVariantMapBuilder = new RestraintVariantMapBuilder<VariantKey>({
            baseId: RestraintBaseName,
            baseText: RestraintFamilyText,
        })

        for (const variantKey in DescriptorMap) {
            modelVariantMapBuilder.AddVariantParts(variantKey, DescriptorMap[variantKey].Model.Parts)
            const modelText = DescriptorMap[variantKey].Model.Text
            if (null != modelText) {
                modelVariantMapBuilder.AddText(variantKey, modelText)
            }
        }
        const ValidModelVariantMap = AddModelVariantMapToGame(modelVariantMapBuilder.BuildVariantMap(ModelTemplate))

        for (const variantKey in DescriptorMap) {
            restraintVariantMapBuilder.AddVariantParts(variantKey, DescriptorMap[variantKey].Restraint.Parts)
            restraintVariantMapBuilder.AddVariantPart(variantKey, {
                Model: ValidModelVariantMap.get(variantKey)
            })
            const restraintText = DescriptorMap[variantKey].Restraint.Text
            // The variant's own key is the last path segment: it is already the identity the
            // restraint's name is derived from, so nothing new is invented to address it.
            const addressed: RestraintText | undefined = PathPrefix == null
                ? restraintText
                : { ...restraintText, Path: [...PathPrefix, variantKey] }
            if (null != addressed) {
                restraintVariantMapBuilder.AddText(variantKey, addressed)
            }
        }

        const ValidRestraintVariantMap = AddRestraintVariantMapToGame(restraintVariantMapBuilder.BuildVariantMap(RestraintTemplate))
        const GetRestraintVariant = (variant: keyof DescriptorMap) => ThrowIfNull(ValidRestraintVariantMap.get(variant), 'Invalid variant')
        // Registering the sets is this function's job; only the restraint lookup
        // is returned, because it is the only part callers have ever used. The
        // model and restraint maps stay reachable through `ModelDefs` and
        // `KinkyDungeonRestraintsCache`, which is where the game reads them.
        return {
            GetRestraintVariant
        }
    }
//#endregion