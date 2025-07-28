import { AddModelWithTextThenGetName, AddRestraintWithTextThenGetName, RestraintText } from '../../../../KDInterface/KDExtension'
import { FactionFilter } from '../../../../KDInterface/TextKey'
import { ModelSetRootDir, RequireSocket } from '../../Futuristic'
import * as Layer from './Layer'
import * as Socket from './Socket'

interface ItemDataInjector {
    Layers: ModelLayer[]
    TransformRestraint: (restraintBase: restraint) => restraint
}

const InvaritantInjector = {
    Layers: [],
    TransformRestraint: r => r,
} satisfies ItemDataInjector

const ElbowVariant = {
    None: InvaritantInjector,
} satisfies Record<string, ItemDataInjector>

const WristVariant = {
    None: InvaritantInjector,
    WristToWrist: {
        Layers: Layer.Arm.Wrist.WristToWrist,
        TransformRestraint: RequireSocket([Socket.Wrist]),
    },
} satisfies Record<string, ItemDataInjector>

export interface Variant {
    Elbow: keyof typeof ElbowVariant,
    Wrist: keyof typeof WristVariant
}

const ModelBase = {
    TopLevel: true,
    Categories: ['Restraints', 'Cuffs', 'Links'],
    Folder: ModelSetRootDir
    // Restraint: true,
} satisfies Partial<Model>

export const GetModel = (variant: Variant) => {
    const modelName = `{A2FF1EAF-DF9A-4A34-8C07-0F5A42397D80}-${variant.Elbow}-${variant.Wrist}`
    if (null != ModelDefs[modelName]) {
        return modelName
    }
    else {
        return AddModelWithTextThenGetName({
            ...ModelBase,
            Name: modelName,
            Layers: ToLayerMap([
                ...ElbowVariant[variant.Elbow].Layers,
                ...WristVariant[variant.Wrist].Layers
            ])
        })
    }
}



const ItemBase = {
    special: true,
    // inventory: false,
    accessible: true,
    shrine: [
        'Tethers',
        'Link',
        'LinkArms'
    ],
    noShrine: true,
    LinkableBy: KDBindableMinusCuffs,
    alwaysRender: true,
    UnderlinkedAlwaysRender: true,

    sfx: 'BeepEngage',
    sfxRemove: 'Crackling',
    Model: '',
    factionFilters: {
        [Layer.InheritColor.Tether]: {
            color: FactionFilter.Highlight,
            override: true
        },
        [Layer.InheritColor.Glow]: {
            color: FactionFilter.Highlight,
            override: true
        },
    },

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

export const GetItem = (variant: Variant) => {
    const restraintName = `{8716C924-78B7-4F73-9DF9-AF9CB9F6C713}-${variant.Elbow}-${variant.Wrist}`
    if (KinkyDungeonRestraintsCache.has(restraintName)) {
        return restraintName
    }
    else {
        const modelName = GetModel(variant)
        return AddRestraintWithTextThenGetName(
            ElbowVariant[variant.Elbow].TransformRestraint(
                WristVariant[variant.Wrist].TransformRestraint({
                    ...ItemBase,
                    name: restraintName,
                    Group: 'ItemArms',
                    Model: modelName
                })
            ),
            {
                ...RestraintText.Default,
                DisplayName: 'Drone Arm Link',
                FlavorText: 
                    `Elbow variant: ${variant.Elbow}\n` +
                    `Wrist variant: ${variant.Wrist}`
            }
        )
    }
}

