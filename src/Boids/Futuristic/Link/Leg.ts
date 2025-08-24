import { ModelRestraintBundledDescriptorMap } from '../../../KDInterface/VariantItem'
import { RequireSocket, SetGroup } from '../Common'
import { BuildLinkSet } from './Common'
import * as Layer from './Layer'
import * as Socket from './Socket'

const DescriptorMap = {
    BetweenAnkleCuff: {
        Model: {
            Transformers: [
                (modelTemplate) => ({
                    ...modelTemplate,
                    Layers: {
                        ...modelTemplate.Layers ?? {},
                        ...ToLayerMap(Layer.Leg.Ankle.BetweenAnkleCuff)
                    }
                })
            ],
        },
        Restraint: {
            Transformers: [
                SetGroup('ItemFeet'),
                RequireSocket([Socket.Ankle]),
            ],
            Text: {
                DisplayName: 'Drone Leg Link',
                FlavorText: 'Variant: BetweenAnkleCuff'
            },
        },



    },
    BetweenThighCuff: {
        Model: {
            Transformers: [
                (modelTemplate) => ({
                    ...modelTemplate,
                    Layers: {
                        ...modelTemplate.Layers ?? {},
                        ...ToLayerMap(Layer.Leg.Thigh.BetweenThighCuff)
                    }
                })
            ],
        },
        Restraint: {
            Transformers: [
                SetGroup('ItemLegs'),
                RequireSocket([Socket.Thigh]),
            ],
            Text: {
                DisplayName: 'Drone Leg Link',
                FlavorText: 'Variant: BetweenThighCuff'
            },
        }
    },
} satisfies Record<string, ModelRestraintBundledDescriptorMap>

export type Variant = keyof typeof DescriptorMap


const RestraintBaseName = '88DCCED2-2EF9-496E-8B6E-BFFC7912E1DE'
const ModelBaseName = 'D1A1512A-F95F-4E87-9E34-0AF0B180549C'

export const GetRestraint =
    BuildLinkSet({
        DescriptorMap,
        ModelBaseName,
        RestraintBaseName
    })