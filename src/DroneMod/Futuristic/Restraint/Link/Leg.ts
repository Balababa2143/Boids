import { RestraintText } from '../../../../KDInterface/KDExtension'
import { RequireSocket, SetGroup } from '../../Futuristic'
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
            ...RestraintText.Default,
            DisplayName: 'Drone Leg Link',
            FlavorText: 'Variant: BetweenAnkleCuff'
        },
    }
} satisfies Record<string, Descriptor>

export type Variant = keyof typeof DescriptorMap


const RestraintBaseName = '{88DCCED2-2EF9-496E-8B6E-BFFC7912E1DE}'
const ModelBaseName = '{D1A1512A-F95F-4E87-9E34-0AF0B180549C}'

export const GetRestraint =
    BuildLinkSet({
        DescriptorMap,
        ModelBaseName,
        RestraintBaseName
    })