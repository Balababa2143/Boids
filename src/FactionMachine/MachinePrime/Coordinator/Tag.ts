/**
 * The tags this mod puts in a restraint template's `shrine` list. `shrine` is the engine's generic
 * tag list, so a mod tag in it needs no separate mechanism; a tag is persisted in every template
 * that carries it, so its value is derived from the release root and renaming one is a versioned
 * decision. Nothing here depends on anything but the release, because the templates that need the
 * tag register before `MachinePrime`'s module body runs — so no evaluation order can leave the tag
 * missing.
 * @module FactionMachine/MachinePrime/Coordinator/Tag
 */

import { v5 as uuidv5 } from 'uuid'
import { Release } from '../../../KDExtension/Release'

/**
 * Mints a tag from its readable name. The construction is `uuidv5(name, Release.Root)` — the name
 * is the value and the root is the namespace — and the argument order is the trap: `uuid`'s
 * signature is `v5(value, namespace)`.
 * @param name - The tag's readable name, e.g. `Controlled` or `GagInstalled`.
 */
export const DeriveTag = (name: string): string =>
    uuidv5(`Boids.MachinePrime.Tag.${name}`, Release.Root)

/**
 * The tag that marks a restraint as a participant in the control model; `Coordinator/Membership` is
 * the one place it is compared.
 */
export const ControlledTag = DeriveTag('Controlled')

/**
 * The player tag that means a muffler is already installed in a ball socket. A player tag rather
 * than an item-data key, because the socket check has to see it for a sub-item a save already put
 * on the body, and the player's tag map is rebuilt from the worn set.
 */
export const GagInstalledTag = DeriveTag('GagInstalled')

/**
 * The item-data key a provider's declaration is written under; a GUID because `item.data` is a
 * namespace shared with the game and every other mod. It lives in this dependency-free module
 * because its writer is the item-facing facade and its reader is the membership walk, which may not
 * import the facade.
 */
export const DimensionBidsKey = 'C4E1F2A7-9B3D-4E58-8A16-2F7C0D5B6E94' as const

/**
 * The item-data key an item's own appearance is declared under, as a single 0..1 number that the
 * item's own family bands into as many models as it has. A key of its own rather than a field on a
 * bid, because a look moves no dimension and the membership walk would read it as one.
 */
export const AppearanceKey = 'A7D2E4B1-6C58-4F39-9E02-3B8D1A5C7F60' as const
