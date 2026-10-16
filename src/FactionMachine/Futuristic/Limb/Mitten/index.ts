/**
 * The long mitten set: the three arm restraints, the models they wear, and the layer
 * factories those models are assembled from.
 * @module FactionMachine/Futuristic/Limb/Mitten
 */

/**
 * The restraints themselves, re-exported flat so `Mitten.Sleeve` is the registered name
 * to hand to a model field or a link.
 */
export * from './Item'
/** The colour keys and the band factories the mitten models are built from. */
export * as Layer from './Layer'
/** The three registered models, named by the GUIDs `Item` puts in its `Model` field. */
export * as Model from './Model'
