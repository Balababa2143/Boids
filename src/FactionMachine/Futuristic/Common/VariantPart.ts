/**
 * Variant parts that condition an item on what the player is already wearing.
 *
 * `RequireSocket` ties the link families to the cuffs they run between: it asks the game to check a
 * tag before the item may go on, and to take the item off again once the tag is gone.
 * @module FactionMachine/Futuristic/Common/VariantPart
 */

import { Seq } from 'immutable'
import { VariantPart } from '../../../KDExtension'

interface IRequireSocket {
    (sockets: Iterable<string>, renderWhenLinkedBySocket?: boolean): VariantPart<restraint>
    (_: { sockets: Iterable<string>, renderWhenLinkedBySocket?: boolean }): VariantPart<restraint>
}

/**
 * A restraint part requiring every one of a set of shrine tags before the item may be worn, and
 * tying the item's linking and rendering to the same set.
 *
 * The returned part sets `requireAllTagsToEquip` and `LinkableBy` to the set, adds a `postRemoval`
 * `RequireTag` event per tag so the item removes itself when the last carrier goes, and sets
 * `renderWhenLinked` when asked, which keeps the item invisible until it is linked.
 *
 * Both call shapes are in use: `(sockets, renderWhenLinkedBySocket?)` and
 * `({ sockets, renderWhenLinkedBySocket })`.
 */
export const RequireSocket: IRequireSocket =
    (...args) => {
        let sockets: Iterable<string>
        let renderWhenLinkedBySocket: boolean | undefined
        switch (args.length) {
            case 1:
                if (Array.isArray(args[0])) {
                    sockets = args[0],
                        renderWhenLinkedBySocket = undefined
                }
                else {
                    sockets = args[0].sockets
                    renderWhenLinkedBySocket = args[0].renderWhenLinkedBySocket
                }
                break
            case 2:
                sockets = args[0]
                renderWhenLinkedBySocket = args[1]
                break
            default:
                throw new Error('Invalid parameter number')
        }
        return ({
                requireAllTagsToEquip: sockets,
                events: Seq(sockets).map(tag => ({
                        trigger: 'postRemoval',
                        type: 'RequireTag',
                        requiredTag: tag,
                        inheritLinked: true
                    } satisfies KinkyDungeonEvent)),
                LinkableBy: sockets,
                ...renderWhenLinkedBySocket && {
                    renderWhenLinked: sockets
                },
            } satisfies VariantPart<Partial<restraint>>)
        }