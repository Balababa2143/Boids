import { RequireSocket } from '../Common/VariantPart'
import { BuildLinkSet, ModelRestraintBundledVariantDesc } from './Common'
import * as Layer from './Layer'
import * as Socket from './Socket'

const DescriptorMap = {
    BetweenWristCuff: {
        Model: {
            Parts: [
                {
                    Layers: Layer.Arm.Wrist.BetweenWristCuff
                }
            ]
        },
        Restraint: {
            Parts: [
                {
                    Group: 'ItemArms'
                },
                RequireSocket([Socket.Wrist])
            ],
            Text: {
                DisplayName: 'Drone Arm Link',
                FlavorText: 'Variant: BetweenWristCuff'
            },
        },
    },
    BetweenElbowCuff: {
        Model: {
            Parts: [
                {
                    Layers: Layer.Arm.Elbow.BetweenElbowCuff
                }
            ]
        },
        Restraint: {
            Parts: [
                {
                    Group: 'ItemArms'
                },
                RequireSocket([Socket.Elbow])
            ],
            Text: {
                DisplayName: 'Drone Arm Link',
                FlavorText: 'Variant: BetweenElbowCuff'
            },
        },
    },
    WristToCollar: {
        Model: {
            Parts: [
                {
                    Layers: Layer.Arm.Wrist.WristToCollar
                }
            ]
        },
        Restraint: {
            Parts: [
                {
                    Group: 'ItemArms',
                    shrine: ['Yokes'],
                    bindarms: true
                },
                RequireSocket([Socket.Wrist])
            ],
            Text: {
                DisplayName: 'Drone Arm Link',
                FlavorText: 'Variant: WristToCollar'
            },
        },
    },
    BoxTie: {
        Model: {
            Parts: [
                {
                    Layers: []
                }
            ]
        },
        Restraint: {
            Parts: [
                {
                    Group: 'ItemArms',
                    bindarms: true
                },
                RequireSocket([Socket.Wrist])
            ],
            Text: {
                DisplayName: 'Drone Arm Link',
                FlavorText: 'Variant: BoxTie'
            },
        },
    },
    ElbowTie: {
        Model: {
            Parts: [
                {
                    Layers: []
                }
            ]
        },
        Restraint: {
            Parts: [
                {
                    Group: 'ItemArms',
                    addTag: ['ElbowTied'],
                    bindarms: true
                },
                RequireSocket([Socket.Elbow])
            ],
            Text: {
                DisplayName: 'Drone Arm Link',
                FlavorText: 'Variant: Elbow Tie'
            },
        },
    },
} satisfies Record<string, ModelRestraintBundledVariantDesc>

export type Variant = keyof typeof DescriptorMap


const RestraintBaseName = '8716C924-78B7-4F73-9DF9-AF9CB9F6C713'
const ModelBaseName = 'A2FF1EAF-DF9A-4A34-8C07-0F5A42397D80'

const {
    ValidModelVariantMap,
    GetModelVariant,
    ValidRestraintVariantMap,
    GetRestraintVariant
} = BuildLinkSet({
    DescriptorMap,
    ModelBaseName,
    RestraintBaseName
})

export {
    ValidModelVariantMap,
    GetModelVariant,
    ValidRestraintVariantMap,
    GetRestraintVariant
}