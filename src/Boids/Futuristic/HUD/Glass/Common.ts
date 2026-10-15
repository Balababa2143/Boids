/**
 * The HUD glass variant key: which of the 16 combinations of faction colouring,
 * opacity and dimming a HUD visor model is built for, and the generator that
 * yields them all.
 *
 * The layer is deliberately not part of this vocabulary. `Visor.ts` pairs each
 * combination with a layer of its own, which is what turns 16 keys into 32
 * models.
 * @module Boids/Futuristic/HUD/Glass/Common
 */

import { IModelVariantBase } from "../Common"

/**
 * How opaque the HUD glass is drawn, 1 (clearest) to 4. `Visor.ts` suffixes the
 * glass sprite with it and hides the brows above a threshold of its own: from 2
 * up when the glass is bright, from 3 up when it is dimmed.
 */
export type OpaqueLevel = 1 | 2 | 3 | 4

/**
 * A HUD glass variant key: the faction-colour switch plus the two choices that
 * are the HUD set's own.
 *
 * `Dimmed` is declared as the boxed `Boolean` rather than `boolean`, as found.
 * The generator below yields primitives and the models compare it for truth, so
 * the difference only shows up for a caller that annotates a key by hand.
 */
export interface IGlassModelVariantBase extends IModelVariantBase {
    OpaqueLevel: OpaqueLevel,
    Dimmed: Boolean
}

/**
 * Yields every HUD glass variant key: faction colour off and on, each at opaque
 * level 1 to 4, each of those dimmed and not, for 16 in all.
 *
 * This is the one list `Visor.ts` builds its models from, and it is exported so
 * another model set can key on exactly the same variants.
 *
 * @returns A fresh generator; iterating it yields plain objects in
 * `UseFactionColor, OpaqueLevel, Dimmed` order, which is not the field order the
 * variant Record uses.
 */
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