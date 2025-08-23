import { RequireSocket, SetGroup } from '../Common'
import { BuildLinkSet, Descriptor } from './Common'
import * as Layer from './Layer'
import * as Socket from './Socket'

const DescriptorMap = {
    BetweenAnkleCuff: {
        TransformModel: [
            (modelTemplate) => ({
                ...modelTemplate,
                Layers: {
                    ...modelTemplate.Layers ?? {},
                    ...ToLayerMap(Layer.Leg.Ankle.BetweenAnkleCuff)
                }
            })
        ],
        TransformRestraint: [
            SetGroup('ItemFeet'),
            RequireSocket([Socket.Ankle]),
        ],
        RestraintText: {
            DisplayName: 'Drone Leg Link',
            FlavorText: 'Variant: BetweenAnkleCuff'
        },
    },
    BetweenThighCuff: {
        TransformModel: [
            (modelTemplate) => ({
                ...modelTemplate,
                Layers: {
                    ...modelTemplate.Layers ?? {},
                    ...ToLayerMap(Layer.Leg.Thigh.BetweenThighCuff)
                }
            })
        ],
        TransformRestraint: [
            SetGroup('ItemLegs'),
            RequireSocket([Socket.Thigh]),
        ],
        RestraintText: {
            DisplayName: 'Drone Leg Link',
            FlavorText: 'Variant: BetweenThighCuff'
        },
    },
} satisfies Record<string, Descriptor>

export type Variant = keyof typeof DescriptorMap


const RestraintBaseName = '88DCCED2-2EF9-496E-8B6E-BFFC7912E1DE'
const ModelBaseName = 'D1A1512A-F95F-4E87-9E34-0AF0B180549C'

export const GetRestraint =
    BuildLinkSet({
        DescriptorMap,
        ModelBaseName,
        RestraintBaseName
    })