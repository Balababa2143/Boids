import { Seq } from 'immutable'
import { VariantPart } from '../../../KDExtension'

interface IRequireSocket {
    (sockets: Iterable<string>, renderWhenLinkedBySocket?: boolean): VariantPart<restraint>
    (_: { sockets: Iterable<string>, renderWhenLinkedBySocket?: boolean }): VariantPart<restraint>
}

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