import { IModelVariantBase } from "../Common"

export type OpaqueLevel = 1 | 2 | 3 | 4

export interface IGlassModelVariantBase extends IModelVariantBase {
    OpaqueLevel: OpaqueLevel,
    Dimmed: Boolean
}

export function* ValidGlassModelVariants() : Iterable<IGlassModelVariantBase> {
    for(const UseFactionColor of [false, true]){
        for(const OpaqueLevel of <OpaqueLevel[]>[1, 2, 3, 4]){
            for(const Dimmed of [true, false]){
                yield {
                    UseFactionColor,
                    OpaqueLevel,
                    Dimmed
                }
            }
        }
    }
}