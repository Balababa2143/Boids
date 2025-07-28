import { AddModelWithTextThenGetName } from '../../../../../KDInterface/KDExtension'
import { ModelSetRootDir } from '../../../Futuristic'
import * as Layer from '../Layer'

const ElbowVariant = {
    None: <ModelLayer[]>[],
} satisfies Record<string, ModelLayer[]>

const WristVariant = {
    None: [],
    WristToWrist: Layer.Arm.Wrist.WristToWrist,
} satisfies Record<string, ModelLayer[]>

interface Variant {
    Elbow: keyof typeof ElbowVariant,
    Wrist: keyof typeof WristVariant
}

const ModelBase = {
    TopLevel: true,
    Categories: ['Restraints', 'Cuffs', 'Links'],
    // Restraint: true,
} satisfies Partial<Model>

const LinkFolder = `${ModelSetRootDir}/Link`

const AddModel = (variant: Variant) =>
    AddModelWithTextThenGetName({
        ...ModelBase,
        Name: `{A2FF1EAF-DF9A-4A34-8C07-0F5A42397D80}-${variant.Elbow}-${variant.Wrist}`,
        Folder: `${LinkFolder}/ArmCuffLink`,
        Layers: ToLayerMap([
            ...ElbowVariant[variant.Elbow],
            ...WristVariant[variant.Wrist]
        ])
    })

export const Wrist = AddModel({
    Elbow: 'None',
    Wrist: 'WristToWrist'
})