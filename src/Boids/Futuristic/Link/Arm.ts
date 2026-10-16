/**
 * The arm links: a chain between the two wrist cuffs or the two elbow cuffs, a
 * chain from each wrist cuff to the collar, and the two ties that bind the arms
 * without drawing anything.
 *
 * Importing this module registers the whole family with the game, which is the
 * only way its items come to exist; what it exports is the lookup for the
 * restraint of a variant.
 * @module Boids/Futuristic/Link/Arm
 */

import { RequireSocket } from '../Common/VariantPart'
import { DerivedVariantBase } from '../../../KDExtension/Release'
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

/**
 * The arm link variants: `BetweenWristCuff` and `BetweenElbowCuff` run a chain
 * between the two cuffs of a joint, `WristToCollar` runs one from each wrist to
 * the collar, and `BoxTie` and `ElbowTie` bind the arms without a chain at all.
 *
 * A key is both the lookup argument for {@link GetRestraintVariant} and the seed
 * of the name every registered variant gets, so renaming one renames saved items.
 */
export type Variant = keyof typeof DescriptorMap


/**
 * The two namespaces this family's variant keys are hashed under, derived from the
 * mod root rather than written as literals: a hand-written base is unversioned
 * forever, because nothing can recognise or retire it programmatically
 * (`KDExtension/Release.ts`).
 */
const RestraintBaseName = DerivedVariantBase.ArmLinkRestraint
const ModelBaseName = DerivedVariantBase.ArmLinkModel

/**
 * The restraint the game registered for an arm link variant.
 *
 * @param variant - Which arm link to look up.
 * @returns The name of the registered restraint, ready to be handed back to the
 *   game.
 */
export const { GetRestraintVariant } = BuildLinkSet({
    DescriptorMap,
    ModelBaseName,
    RestraintBaseName
})