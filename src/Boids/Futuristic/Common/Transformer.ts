import { VariantTransformer } from '../../../KDInterface/VariantItem'
import { Seq } from '../../../Utilities'

export const RequireSocket =
    (sockets: Iterable<string>, renderWhenLinkedBySocket?: boolean) =>
        ((template) => ({
            ...template,
            requireAllTagsToEquip: [
                ...Seq.Concat([
                    template.requireAllTagsToEquip ?? [],
                    sockets
                ])
            ],
            events: [
                ...Seq.Concat([
                    template.events ?? [],
                    Seq.Map(sockets, tag => ({
                        trigger: 'postRemoval',
                        type: 'RequireTag',
                        requiredTag: tag,
                        inheritLinked: true
                    } satisfies KinkyDungeonEvent))
                ])
            ],
            LinkableBy: [
                ...Seq.Concat([
                    template.LinkableBy ?? [],
                    sockets
                ])
            ],
            ...renderWhenLinkedBySocket && {
                renderWhenLinked: [
                    ...Seq.Concat([
                        template.renderWhenLinked ?? [],
                        sockets
                    ])
                ]
            },
        })) satisfies VariantTransformer<restraint>

export const SetGroup =
    (group: string) =>
        ((template) => ({
            ...template,
            Group: group
        })) satisfies VariantTransformer<restraint>