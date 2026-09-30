import { RestraintText, RestraintVariantMapBuilder, VariantBuilder, VariantMapBuilder } from "../../../../KDExtension"
import { ThrowIfNull } from "../../../../Utilities"
import { RequireSocket } from "../../../Futuristic/Common/VariantPart"
import { ItemTags, VisorSpriteLayer } from "../../../Futuristic/HUD/Common"
import { ValidGlassModelVaraints } from "../../../Futuristic/HUD/Glass/Common"
import { ModelVariant, ValidModelVariantMap } from "../../../Futuristic/HUD/Glass/Visor"


// const GetDebugText = (variant: ModelVariant, projected: boolean) => ({
//     FunctionText: [
//         ...function* () {
//             yield `Visor Type: ${projected ? 'Hard light' : 'Glass'}`
//             yield `Version: ${variant.Layer}`
//             yield `Dynamic color: ${variant.UseFactionColor}`
//             yield `Dimmed: ${variant.Dimmed}`
//             yield `Opaque Level: ${variant.OpaqueLevel}`
//         }()
//     ].join('\n')
// } satisfies RestraintText)

// function AddCommonVariantPart(
//     variantMapBuilder: RestraintVariantMapBuilder<ModelVariant>,
//     layer: VisorSpriteLayer,
//     projected: boolean
// ) {
//     return function (variantKey: ModelVariant) {
//         variantMapBuilder.WithVariant(variantKey, variantBuilder => {

//             const tagCollection = ItemTags[layer]

//             const [link, shrine] = ThrowIfNull(({
//                 [VisorSpriteLayer.Blindfold]: [
//                     KDBlindfoldLink,
//                     ['Blindfolds']
//                 ],
//                 [VisorSpriteLayer.Goggle]: [
//                     KDVisorLink,
//                     ['Visors']
//                 ],
//             } as const)[layer])

//             variantBuilder
//                 .AddPart({ 
//                     preview: 'GlassVisor',
//                     shrine: 
//                         projected ?
//                         [tagCollection.SocketedItem] :
//                         [tagCollection.NonSocketedItem],
                    
//                 })
//                 .AddPart({
//                     LinkableBy: link,
//                     shrine
//                 })

//             if (projected) {
//                 variantBuilder.AddPart(
//                     RequireSocket({
//                         sockets: [tagCollection.Socket],
//                         renderWhenLinkedBySocket: true
//                     })
//                 )
//             }

//             return variantBuilder
//         })

//         variantMapBuilder.AddText(variantKey, GetDebugText(variantKey, true))
//     }
// }

// const HardLightVisorVariantMap = (() => {
//     const variantMapBuilder = new RestraintVariantMapBuilder<ModelVariant>({
//         baseId: '019f8d0d-ec30-7e64-9d06-2614712bd9bc',
//         baseName: 'Drone HUD'
//     })

//     const AddVariant = (variantKey: ModelVariant) => {
//         variantMapBuilder.WithVariant(variantKey, variantBuilder => {
//             AddCommonVariantPart(variantBuilder, variantKey.Layer, true)
//             return variantBuilder
//         })
//         variantMapBuilder.AddText(variantKey, GetDebugText(variantKey, true))
//     }
// })()