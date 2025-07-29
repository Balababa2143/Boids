import { ModelText, RestraintText } from '../../../KDInterface/KDExtension'
import { FactionFilter } from '../../../KDInterface/TextKey'
import { AddModelVariant, AddRestraintVariant, ModelVariantDescriptor, RestraintVariantDescriptor, TransformInstance } from '../../VariantItem'
import { ModelSetRootDir } from '../Common'

/* Layer Sprite Naming:
 *     `${BodyPart}/${LeftRight?}${LinkGlow}${Pose}`
 * 
 * Use folder to distinguish which item the links are attached to.
 */

export const LinkFolder = `${ModelSetRootDir}/Link`

//#region Model
export namespace InheritColor {
    export const Tether = '{17954016-CB1A-4C61-A312-A1675EE128CB}'
    export const Glow = '{E15BC39C-544C-49B2-9969-AF5E4E19B14C}'
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

export interface Descriptor {
    TransformModel: TransformInstance<Model>[]
    ModelText?: ModelText,
    TransformRestraint: TransformInstance<restraint>[],
    RestraintText?: RestraintText
}

export const BuildVariantMap =
    <DescriptorMap extends Record<string, Descriptor>>
    (descMap: DescriptorMap) => {
        return {
            ModelMap: (variant: keyof DescriptorMap) => ({
                Transformers: descMap[variant].TransformModel,
                Text: descMap[variant].ModelText
            } as ModelVariantDescriptor),
            RestraintMap: (variant: keyof DescriptorMap) => ({
                Transformers: descMap[variant].TransformRestraint,
                Text: descMap[variant].RestraintText
            } as RestraintVariantDescriptor)
        }
    }

export const RestraintTemplate = {
    special: true,
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

    noDupe: true,
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
export interface LinkSetDescriptor<DescriptorMap extends Record<string, Descriptor>> {
    RestraintBaseName: string,
    ModelBaseName: string,
    DescriptorMap: DescriptorMap,
}

export const BuildLinkSet =
    <DescriptorMap extends Record<string, Descriptor>>
    (args: LinkSetDescriptor<DescriptorMap>) => {
        const {
            RestraintBaseName,
            ModelBaseName,
            DescriptorMap,
        } = args
        const RestraintNameMap = {} as Record<keyof DescriptorMap, string>
        const {
            ModelMap,
            RestraintMap
        } = BuildVariantMap(DescriptorMap)

        const AddModel =
            AddModelVariant({
                VariantMap: ModelMap,
                template: ModelTemplate
            })

        const AddRestraint =
            AddRestraintVariant({
                VariantMap: RestraintMap,
                template: RestraintTemplate
            })

        for (const variant in DescriptorMap) {
            const modelName = `${ModelBaseName}.${variant}`
            AddModel(variant, {
                Name: modelName,
            })
            RestraintNameMap[variant] = AddRestraint(variant, {
                name: `${RestraintBaseName}.${variant}`,
                Model: modelName
            })
        }
        return (variant: keyof DescriptorMap) => RestraintNameMap[variant]
    }
//#endregion