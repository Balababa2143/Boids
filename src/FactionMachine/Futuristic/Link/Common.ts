import { RestraintText, ModelText } from '../../../KDExtension'
import { AddModelVariantMapToGame, AddRestraintVariantMapToGame, ModelVariantMapBuilder, ModelWithLayerSet, RestraintVariantMapBuilder, VariantPart } from '../../../KDExtension'
import { FactionFilter } from '../../../KDInterface/TextKey'
import { ControlledTag } from '../../MachinePrime/Coordinator/Membership'
import { ModelSetRootDir } from '../Common/Constant'
import { RequireLockedEvent, CommonItemAvailability } from '../Common'
import { ThrowIfNull } from '../../../Utilities'

/**
 * The template layer every link family is built on: the fragments all links share, the descriptor
 * shape a family fills in, and `BuildLinkSet`, which registers a family's whole model and restraint
 * variant map and hands back the restraint lookup.
 *
 * Layer sprite naming: `${BodyPart}/${LeftRight?}${LinkGlow}${Pose}`, one folder per attached item.
 * @module FactionMachine/Futuristic/Link/Common
 */

/** The folder every link model draws from; the layer sets append their own variant folder to it. */
export const LinkFolder = `${ModelSetRootDir}/Link`

//#region Model
/**
 * The two colour channels a link layer takes its colour from: `Tether` for the cable and `Glow` for
 * the light that runs along it, both bound to the highlight filter by {@link RestraintTemplate}.
 */
export const InheritColor = {
    Tether: '17954016-CB1A-4C61-A312-A1675EE128CB',
    Glow: 'E15BC39C-544C-49B2-9969-AF5E4E19B14C',
} as const

/**
 * The parts of a model that every link shares: a top-level restraint in the `Restraints`, `Cuffs`
 * and `Links` categories, with its artwork rooted at the futuristic model set. Each layer set
 * carries the `Folder` of its own variant.
 */
export const ModelTemplate = {
    TopLevel: true,
    Categories: ['Restraints', 'Cuffs', 'Links'],
    Folder: ModelSetRootDir
} satisfies Partial<Model>

//#endregion

//#region Item

/**
 * The parts of a restraint that every link shares, before a variant narrows it: a binding item
 * linked onto anything bindable apart from cuffs, that stays accessible and rendered while
 * something is over it, and that no shrine interaction can unlock.
 *
 * `Model` is empty because the family fills in the model it has just registered, and `LinkableBy`
 * is a starting list: each variant's `RequireSocket` adds its socket. Struggle and cut sit below
 * the game's limit chance, but `struggleBreak` means a finished struggle breaks the link anyway.
 */
export const RestraintTemplate = {
    binding: true,
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
 * One variant of a link family: the parts its model is built from, the parts its restraint is built
 * from, and the text to register alongside each. The halves are apart because the model has to be
 * registered first — the restraint names the model that registration returned.
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
 * What one link family hands to `BuildLinkSet`: the base uuid its restraint names are derived from,
 * the base uuid its model names are derived from, and the variants themselves.
 *
 * The keys of `DescriptorMap` become the variant keys, and a variant's name is `uuidv5` of its key
 * against the matching base uuid, so renaming a key renames saved items too.
 */
export interface LinkSetDescriptor<DescriptorMap extends Record<string, ModelRestraintBundledVariantDesc>> {
    RestraintBaseName: string,
    ModelBaseName: string,
    /**
     * Text every restraint in the family starts from, with a variant's own text merged over it: the
     * shared display name goes here and each variant declares only what tells it apart.
     */
    RestraintFamilyText?: Partial<RestraintText>,
    /** The same, for the family's models. */
    ModelFamilyText?: Partial<ModelText>,
    /** The family's path in the text trees; each variant is addressed at it plus its own key. */
    PathPrefix?: readonly string[],
    DescriptorMap: DescriptorMap,
}

/**
 * Registers a whole link family and returns the lookup for its restraints.
 *
 * The model map is built first and its names are fed into the restraint parts, so every restraint
 * carries the `Model` name it just created. Each variant's parts merge over the template in the
 * order given, so a later part wins a field two of them set.
 *
 * Registration is a one-shot side effect: calling this twice, or making the module reachable under
 * a second specifier, throws on the duplicate names.
 *
 * @returns Only `GetRestraintVariant`; the model lookup is not returned because nothing needs it.
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
            // The variant's key is the last path segment, already the identity the name comes from.
            const addressed: RestraintText | undefined = PathPrefix == null
                ? restraintText
                : { ...restraintText, Path: [...PathPrefix, variantKey] }
            if (null != addressed) {
                restraintVariantMapBuilder.AddText(variantKey, addressed)
            }
        }

        const ValidRestraintVariantMap = AddRestraintVariantMapToGame(restraintVariantMapBuilder.BuildVariantMap(RestraintTemplate))
        const GetRestraintVariant = (variant: keyof DescriptorMap) => ThrowIfNull(ValidRestraintVariantMap.get(variant), 'Invalid variant')
        return {
            GetRestraintVariant
        }
    }
//#endregion
