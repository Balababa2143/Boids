/**
 * The tags this mod puts in a restraint template's `shrine` list.
 *
 * ## Why a tag, and why it is derived
 *
 * The base game uses `shrine` as a **generic tag list**: it concatenates `"Cursed"` onto it
 * (`item/KDCurse.ts:998`), reads it for bondage conditions
 * (`restraint/KinkyDungeonRestraints.ts:379-387`), bulk-copies the whole list into the player's tag
 * map (`:4245-4248`), and filters the quick inventory by membership in it. So a mod tag in it is the
 * engine's own idiom rather than an abuse of one, and it is where membership in the control model is
 * declared (`design/spec.md` §6.12, clause 1).
 *
 * A tag is also **persisted**, in the sense that matters: it is written into every template that
 * carries it and compared by value. It therefore gets the same treatment as every other identifier —
 * the readable name is the stable half, and the value is derived from the release root so that
 * renaming one is a versioned decision instead of two spellings drifting apart.
 *
 * ## Why this is its own module
 *
 * The template builders that need the tag are in `Futuristic`, which is registered **before**
 * `MachinePrime` is. Reaching `Coordinator/Membership` for the tag would make the content layer
 * depend on the coordinator's module body and, worse, would make the order the two are listed in
 * decide whether the tag exists yet. This module has no dependencies beyond the release, so no
 * evaluation order can break it.
 * @module FactionMachine/MachinePrime/Coordinator/Tag
 */

import { v5 as uuidv5 } from 'uuid'
import { Release } from '../../../KDExtension/Release'

/**
 * Mints a tag from its readable name.
 *
 * The construction is `uuidv5(name, Release.Root)` — **the name is the value and the root is the
 * namespace** — and the argument order is the trap: `uuid`'s signature is `v5(value, namespace)` and
 * the namespace must parse as a UUID.
 *
 * @param name - The tag's readable name, e.g. `Controlled` or `GagInstalled`.
 */
export const DeriveTag = (name: string): string =>
    uuidv5(`Boids.MachinePrime.Tag.${name}`, Release.Root)

/**
 * The tag that marks a restraint as a participant in the control model.
 *
 * It sits beside the game's own tags in a template's `shrine` list, and
 * `Coordinator/Membership` is the one place it is compared.
 */
export const ControlledTag = DeriveTag('Controlled')

/**
 * The player tag that means a muffler is already installed in a ball socket.
 *
 * A player tag rather than an item-data key, because the socket check has to see it whether the
 * sub-item was linked by this session's apply or is already on the body from a save — and the
 * player's tag map is what the game rebuilds from the worn set on every stats update.
 */
export const GagInstalledTag = DeriveTag('GagInstalled')

/**
 * The item-data key a provider's declaration is written under.
 *
 * A GUID rather than a readable name, because `item.data` is a namespace shared with the game and
 * every other mod — the same reason the coordinator's state key is one. The value under it is a list
 * of `ProviderDeclaration`s.
 *
 * It lives here, in the dependency-free module, because it has **two readers on opposite sides**:
 * the writer is the facade an item calls (`Coordinator/Public/Control`), and the reader is the
 * membership walk (`Coordinator/Membership`), which the facade may not import. Putting the key in
 * either of those would have made the other reach through it.
 */
export const DimensionBidsKey = 'C4E1F2A7-9B3D-4E58-8A16-2F7C0D5B6E94' as const

/**
 * The item-data key an item's **own appearance** is declared under.
 *
 * **[决定] The look of a thing is a property of the thing** (§6.1, §6.12 clause 2): the base game's
 * `gag` property is one number that drives the mechanics *and* selects the model, so a larger ball
 * there is necessarily a stricter one. Our model separates them — the bid moves the dimension and
 * this declares what the item looks like — so *a small ball on a strict mechanism* is one item
 * variant declaring a small appearance beside a high bid, and its sibling is the opposite.
 *
 * It is a **separate key from {@link DimensionBidsKey}** rather than a field on a bid, because it is
 * not a bid: a look moves no dimension, and putting it in the list would make the membership walk
 * read it as one. The value under it is a single 0..1 number, which the item's own family bands into
 * as many models as it has.
 *
 * It lives beside the bids key for the same reason: it is stamped on apply by the item, read back
 * off the item by the item's own family, and it belongs to neither the facade nor the walk.
 */
export const AppearanceKey = 'A7D2E4B1-6C58-4F39-9E02-3B8D1A5C7F60' as const
