/**
 * Variant parts that condition an item on what the player is already wearing.
 *
 * The part here, `RequireSocket`, is what ties the link families to the cuffs they
 * run between: it asks the game to check a tag before the item may go on, and to
 * take the item off again once the tag is gone.
 * @module Boids/Futuristic/Common/VariantPart
 */

import { Seq } from 'immutable'
import { VariantPart } from '../../../KDExtension'

interface IRequireSocket {
    (sockets: Iterable<string>, renderWhenLinkedBySocket?: boolean): VariantPart<restraint>
    (_: { sockets: Iterable<string>, renderWhenLinkedBySocket?: boolean }): VariantPart<restraint>
}

/**
 * A restraint part requiring the player to be carrying every one of a set of
 * shrine tags before the item may be worn, and tying the item's linking and
 * rendering to the same set.
 *
 * It is written for the sockets the link families use, where each tag is an
 * attachment point that a cuff or a boot offers, but nothing in it is specific to
 * them: any shrine tag works. The variant part it returns gives the item:
 *
 * - `requireAllTagsToEquip`, so it cannot be put on at all until every tag is
 *   worn;
 * - a `postRemoval` `RequireTag` event per tag, so it takes itself off as soon as
 *   the last thing carrying that tag is removed;
 * - `LinkableBy`, so it may only be linked onto an item offering one of the tags,
 *   and
 * - `renderWhenLinked`, when that is asked for, so it stays invisible until it is
 *   linked onto such an item.
 *
 * Both call shapes are in use: positional, as `RequireSocket(tags)` or
 * `RequireSocket(tags, renderWhenLinkedBySocket)`, and object, as
 * `RequireSocket({ sockets, renderWhenLinkedBySocket })`.
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