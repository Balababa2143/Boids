/**
 * The leg links: a chain between the two ankle cuffs or the two thigh cuffs, and
 * the two ties that bind the legs together and block the feet.
 *
 * Importing this module registers the whole family with the game, which is the
 * only way its items come to exist; what it exports is the lookup for the
 * restraint of a variant.
 * @module FactionMachine/Futuristic/Link/Leg
 */

// The family's text data, imported by the module that reads it; see the note in `Arm.ts`.
import './Data'
import { RequireSocket } from '../Common/VariantPart'
import { DerivedVariantBase } from '../../../KDExtension/Release'
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
                FlavorText: 'Variant: TiedThigh'
            },
        }
    },
} satisfies Record<string, ModelRestraintBundledVariantDesc>

/**
 * The leg link variants: `BetweenAnkleCuff` and `BetweenThighCuff` run a chain
 * between the two cuffs of a joint, while `TiedAnkle` and `TiedThigh` bind the
 * legs together instead, blocking the feet and hobbling the wearer further.
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
const RestraintBaseName = DerivedVariantBase.LegLinkRestraint
const ModelBaseName = DerivedVariantBase.LegLinkModel

/**
 * The leg links' path in the text trees: the family's shared name sits at it, and each variant
 * is addressed at it plus the variant's own key.
 */
const TextPath = ['FactionMachine', 'Futuristic', 'Link', 'Leg'] as const

/**
 * The restraint the game registered for a leg link variant.
 *
 * @param variant - Which leg link to look up.
 * @returns The name of the registered restraint, ready to be handed back to the
 *   game.
 */
export const { GetRestraintVariant } = BuildLinkSet({
    DescriptorMap,
    ModelBaseName,
    RestraintBaseName,
    // The name is authored once, in `Link/Data/en.json`, because four restraints share it;
    // each variant declares only the discriminator that tells it apart.
    RestraintFamilyText: { Path: TextPath },
    PathPrefix: TextPath,
})