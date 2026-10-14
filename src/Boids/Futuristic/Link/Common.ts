import { RestraintText, ModelText } from '../../../KDExtension'
import { AddModelVariantMapToGame, AddRestraintVariantMapToGame, ModelVariantMapBuilder, ModelWithLayerSet, RestraintVariantMapBuilder, VariantPart } from '../../../KDExtension'
import { FactionFilter } from '../../../KDInterface/TextKey'
import { ModelSetRootDir } from '../Common/Constant'
import { RequireLockedEvent, CommonItemAvailability } from '../Common'
import { ThrowIfNull } from '../../../Utilities'

/* Layer Sprite Naming:
 *     `${BodyPart}/${LeftRight?}${LinkGlow}${Pose}`
 * 
 * Use folder to distinguish which item the links are attached to.
 */

export const LinkFolder = `${ModelSetRootDir}/Link`

//#region Model
export const InheritColor = {
    Tether: '17954016-CB1A-4C61-A312-A1675EE128CB',
    Glow: 'E15BC39C-544C-49B2-9969-AF5E4E19B14C',
} as const

export const ModelTemplate = {
    TopLevel: true,
    Categories: ['Restraints', 'Cuffs', 'Links'],
    Folder: ModelSetRootDir
    // Restraint: true,
} satisfies Partial<Model>

//#endregion

//#region Item

export const RestraintTemplate = {
    // special: true,
    binding: true,
    // inventory: false,
    accessible: true,
    shrine: [
        'Link',
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

export interface LinkSetDescriptor<DescriptorMap extends Record<string, ModelRestraintBundledVariantDesc>> {
    RestraintBaseName: string,
    ModelBaseName: string,
    DescriptorMap: DescriptorMap,
}

export const BuildLinkSet =
    <DescriptorMap extends Record<string, ModelRestraintBundledVariantDesc>>
        (args: LinkSetDescriptor<DescriptorMap>) => {
        const {
            RestraintBaseName,
            ModelBaseName,
            DescriptorMap,
        } = args
        type VariantKey = keyof typeof DescriptorMap
        const modelVariantMapBuilder = new ModelVariantMapBuilder<VariantKey>({ baseId: ModelBaseName })
        const restraintVariantMapBuilder = new RestraintVariantMapBuilder<VariantKey>({ baseId: RestraintBaseName })

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
            if (null != restraintText) {
                restraintVariantMapBuilder.AddText(variantKey, restraintText)
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