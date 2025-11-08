import { FromJS } from 'immutable'
import { RestraintText, ModelText } from '../../../KDExtension'
import { AddModelVariantMapToGame, AddRestraintVariantMapToGame, ModelVariantMapBuilder, ModelWithLayerSet, RestraintVariantMapBuilder, VariantPart } from '../../../KDExtension/Variant'
import { FactionFilter } from '../../../KDInterface/TextKey'
import { ModelSetRootDir } from '../Common/Constant'

/* Layer Sprite Naming:
 *     `${BodyPart}/${LeftRight?}${LinkGlow}${Pose}`
 * 
 * Use folder to distinguish which item the links are attached to.
 */

export const LinkFolder = `${ModelSetRootDir}/Link`

//#region Model
export namespace InheritColor {
    export const Tether = '17954016-CB1A-4C61-A312-A1675EE128CB'
    export const Glow = 'E15BC39C-544C-49B2-9969-AF5E4E19B14C'
}

export type InheritColor = Record<string, string>

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
    weight: 0,
    minLevel: 0,
    allFloors: true,

    playerTags: {},
    enemyTags: {},

    events: [
        {
            trigger: 'postUnlock',
            type: 'RequireLocked',
            inheritLinked: true
        }
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
        const modelVariantMapBuilder = new ModelVariantMapBuilder<VariantKey>({ baseName: ModelBaseName })
        const restraintVariantMapBuilder = new RestraintVariantMapBuilder<VariantKey>({ baseName: RestraintBaseName })

        for (const variantKey in DescriptorMap) {
            modelVariantMapBuilder.AddVariantParts(variantKey, DescriptorMap[variantKey].Model.Parts)
            const modelText = DescriptorMap[variantKey].Model.Text
            if (null != modelText) {
                modelVariantMapBuilder.AddText(variantKey, modelText)
            }
        }
        const {
            ValidVariantMap: ValidModelVariantMap,
            GetVariant: GetModelVariant
        } = AddModelVariantMapToGame(modelVariantMapBuilder.BuildVariantMap(ModelTemplate))

        for (const variantKey in DescriptorMap) {
            restraintVariantMapBuilder.AddVariantParts(variantKey, DescriptorMap[variantKey].Restraint.Parts)
            restraintVariantMapBuilder.AddVariantPart(variantKey, {
                Model: ValidModelVariantMap.get(variantKey as FromJS<VariantKey>)
            })
            const restraintText = DescriptorMap[variantKey].Restraint.Text
            if (null != restraintText) {
                restraintVariantMapBuilder.AddText(variantKey, restraintText)
            }
        }

        const {
            ValidVariantMap: ValidRestraintVariantMap,
            GetVariant: GetRestraintVariant
        } = AddRestraintVariantMapToGame(restraintVariantMapBuilder.BuildVariantMap(RestraintTemplate))
        return {
            ValidModelVariantMap,
            GetModelVariant,
            ValidRestraintVariantMap,
            GetRestraintVariant
        }
    }
//#endregion