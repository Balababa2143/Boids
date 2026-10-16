/**
 * The layer sets the link models are built from, grouped by joint, plus the colour
 * channels those layers take their colour from.
 * @module FactionMachine/Futuristic/Link/Layer
 */

/** The two colour channels a link layer inherits its colour from. */
export { InheritColor } from '../Common'
/** The elbow and wrist layer sets. */
export * as Arm from './Arm'
/** The ankle and thigh layer sets. */
export * as Leg from './Leg'