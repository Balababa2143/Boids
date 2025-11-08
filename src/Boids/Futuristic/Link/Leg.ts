import { VariantKeyOrImmutable, VariantKeyToImmutable } from '../../../KDExtension'
import { ThrowIfNull } from '../../../Utilities'
import { RequireSocket } from '../Common/VariantPart'
import { BuildLinkSet, ModelRestraintBundledVariantDesc } from './Common'
import * as Layer from './Layer'
import * as Socket from './Socket'

const DescriptorMap = {
    BetweenAnkleCuff: {
        Model: {
            Parts: [
                {
                    Layers: Layer.Leg.Ankle.BetweenAnkleCuff
                }
            ]
        },
        Restraint: {
            Parts: [
                {
                    Group: 'ItemFeet',
                    heelpower: 0.2,
                    hobble: 0.3
                },
                RequireSocket([Socket.Ankle])
            ],
            Text: {
                DisplayName: 'Drone Leg Link',
                FlavorText: 'Variant: BetweenAnkleCuff'
            },
        },
    },
    TiedAnkle: {
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
                    Group: 'ItemFeet',
                    heelpower: 0.7,
                    hobble: 2,
                    blockfeet: true,
                    addTag: ['FeetLinked']
                },
                RequireSocket([Socket.Ankle])
            ],
            Text: {
                DisplayName: 'Drone Leg Link',
                FlavorText: 'Variant: Tied Ankle'
            },
        },
    },
    BetweenThighCuff: {
        Model: {
            Parts: [
                {
                    Layers: Layer.Leg.Thigh.BetweenThighCuff
                }
            ]
        },
        Restraint: {
            Parts: [
                {
                    Group: 'ItemLegs',
                    // shrine: ['ThighLink'],
                    heelpower: 0.15,
                    hobble: 0.25
                },
                RequireSocket([Socket.Thigh])
            ],
            Text: {
                DisplayName: 'Drone Leg Link',
                FlavorText: 'Variant: BetweenThighCuff'
            },
        }
    },
    TiedThigh: {
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
                    Group: 'ItemFeet',
                    heelpower: 0.5,
                    hobble: 1,
                    blockfeet: true,
                    addTag: ['FeetLinked']
                },
                RequireSocket([Socket.Thigh])
            ],
            Text: {
                DisplayName: 'Drone Leg Link',
                FlavorText: 'Variant: TiedThigh'
            },
        }
    },
} satisfies Record<string, ModelRestraintBundledVariantDesc>

export type Variant = keyof typeof DescriptorMap


const RestraintBaseName = '88DCCED2-2EF9-496E-8B6E-BFFC7912E1DE'
const ModelBaseName = 'D1A1512A-F95F-4E87-9E34-0AF0B180549C'

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