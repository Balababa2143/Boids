/**
 * The link families, one per pair of limbs: the sockets a link may be fastened
 * to, and the arm and leg links themselves. Importing a family registers its model
 * and restraint variant maps, which is how its items come to exist in the game.
 * @module FactionMachine/Futuristic/Link
 */

/** The four attachment points a link can require an item to offer. */
export * as Socket from './Socket'
/** Links between the wrist cuffs or the elbow cuffs. */
export * as Arm from './Arm'
/** Links between the thigh cuffs or the ankle cuffs. */
export * as Leg from './Leg'