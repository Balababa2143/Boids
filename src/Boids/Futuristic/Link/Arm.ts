import { ModelRestraintBundledDescriptor } from '../../../KDInterface/VariantItem'
import { RequireSocket, SetGroup } from '../Common'
import { BuildLinkSet } from './Common'
import * as Layer from './Layer'
import * as Socket from './Socket'

const DescriptorMap = {
    BetweenWristCuff: {
        Model: {
            Transformers: [
                (modelTemplate) => ({
                    ...modelTemplate,
                    Layers: {
                        ...modelTemplate.Layers ?? {},
                        ...ToLayerMap(Layer.Arm.Wrist.BetweenWristCuff)
                    }
                })
            ]
        },
        Restraint: {
            Transformers: [
                SetGroup('ItemArms'),
                RequireSocket([Socket.Wrist]),
            ],
            Text: {
                DisplayName: 'Drone Arm Link',
                FlavorText: 'Variant: BetweenWristCuff'
            },
        },
    }
} satisfies Record<string, ModelRestraintBundledDescriptor>

export type Variant = keyof typeof DescriptorMap


const RestraintBaseName = '8716C924-78B7-4F73-9DF9-AF9CB9F6C713'
const ModelBaseName = 'A2FF1EAF-DF9A-4A34-8C07-0F5A42397D80'

export const GetRestraint =
    BuildLinkSet({
        DescriptorMap,
        ModelBaseName,
        RestraintBaseName
    })