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
                    Group: 'ItemFeet'
                },
                RequireSocket([Socket.Ankle])
            ],
            Text: {
                DisplayName: 'Drone Leg Link',
                FlavorText: 'Variant: BetweenAnkleCuff'
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
                    Group: 'ItemLegs'
                },
                RequireSocket([Socket.Thigh])
            ],
            Text: {
                DisplayName: 'Drone Leg Link',
                FlavorText: 'Variant: BetweenThighCuff'
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