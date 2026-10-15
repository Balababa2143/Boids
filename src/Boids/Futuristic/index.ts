/**
 * The Futuristic set, grouped by where an item is worn rather than by how it is
 * built. A third-party restraint that wants to sit alongside these reads the
 * fragments in `Common` and the variant factories in `GlassVisor`, `Gag` and
 * `Link`; the remaining namespaces are the items themselves, each exported as the
 * restraint name it registered.
 * @module Boids/Futuristic
 */

/** Chastity belts and bras, and the plug and vibe toys. */
export * as Aroused from './Aroused'
/** Lockable collars and cuffs for arm, elbow, wrist, waist, thigh and ankle. */
export * as Cuff from './Cuff'
/** The torso harness, `ControlHarness`. */
export * as Strap from './Strap'
/** The heavy lockable latex catsuit and its model. */
export * as Suit from './Suit'
/** Gags: the metal gag family, face covers, and the sockets a muffler plugs into. */
export * as Gag from './Gag'
/** HUD overlays, drawn as layers on the player's glass. */
export * as HUD from './HUD'
/** Glass visors: the item, its variant map, the glass layer template and the model. */
export * as GlassVisor from './GlassVisor'
/** The headphone item, `Earphone`. */
export * as Headphone from './Headphone'
/** Boots and mittens. */
export * as Limb from './Limb'
/** Tethers between cuffs, one family per limb, and the sockets they fasten to. */
export * as Link from './Link'
/** The fragments every item family above shares. */
export * as Common from './Common'