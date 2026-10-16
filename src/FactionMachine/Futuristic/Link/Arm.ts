/**
 * The arm links: a chain between the two wrist cuffs or the two elbow cuffs, a
 * chain from each wrist cuff to the collar, and the two ties that bind the arms
 * without drawing anything.
 *
 * Importing this module registers the whole family with the game, which is the
 * only way its items come to exist; what it exports is the lookup for the
 * restraint of a variant.
 * @module FactionMachine/Futuristic/Link/Arm
 */

// The family's text data, imported by the module that reads it. The registrations below
// resolve their text through this tree, so registering it here — rather than at some central
// point assumed to run first — is what makes the order a property of this module instead of a
// property of the bundler. See the ordering rule in `Data/index.ts`.
import './Data'
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
 * The arm links' path in the text trees: the family's shared name sits at it, and each variant
 * is addressed at it plus the variant's own key.
 */
const TextPath = ['FactionMachine', 'Futuristic', 'Link', 'Arm'] as const

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
    RestraintBaseName,
    // The name is authored once, in `Link/Data/en.json`, because five restraints share it;
    // each variant declares only the discriminator that tells it apart.
    RestraintFamilyText: { Path: TextPath },
    PathPrefix: TextPath,
})