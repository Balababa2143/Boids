import { VariantTransformer } from '../../../KDInterface/VariantItem'
import { ArrayProperties, MergeProps, Seq, SetProps } from '../../../Utilities'

interface IRequireSocket {
    (sockets: Iterable<string>, renderWhenLinkedBySocket?: boolean): VariantTransformer<restraint>
    (_: { sockets: Iterable<string>, renderWhenLinkedBySocket?: boolean }): VariantTransformer<restraint>
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
        return (
            (template) => ({
                ...template,
                requireAllTagsToEquip: [
                    ...(Seq.Concat([
                        template.requireAllTagsToEquip ?? [],
                        sockets
                    ]))
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
            })
        ) satisfies VariantTransformer<restraint>
    }

export const SetModelLayerProps = SetProps<ModelLayer>() satisfies (_:any) => (_:any) => VariantTransformer<ModelLayer>

export const SetModelProps = SetProps<Model>() satisfies (_:any) => (_:any) => VariantTransformer<ModelLayer>

export const SetRestraintProps = SetProps<restraint>() satisfies (_:any) => (_:any) => VariantTransformer<restraint>

export const MergeModelLayerProps = MergeProps<ModelLayer>() satisfies (_:any) => (_:any) => VariantTransformer<ModelLayer>

export const MergeModelProps = MergeProps<Model>() satisfies (_:any) => (_:any) => VariantTransformer<ModelLayer>

export const MergeRestraintProps = MergeProps<restraint>() satisfies (_:any) => (_:any) => VariantTransformer<restraint>

export const MergeArray =
    <Key extends keyof ArrayProperties<Required<restraint>>>
    (arrayKey: Key) =>
        (newItems: Iterable<Required<restraint>[Key][0]>) => (
            template => ({
                ...template,
                [arrayKey]: [
                    ...new Set(Seq.Concat([
                        template[arrayKey] ?? [],
                        newItems
                    ]))
                ]
            })
        ) satisfies VariantTransformer<restraint>