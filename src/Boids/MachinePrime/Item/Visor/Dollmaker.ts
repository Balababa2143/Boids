/**
 * The Dollmaker glass family: one goggle glass and one mask glass whose colour filter
 * is recalculated as the blinder limiter moves, rather than morphing between blind
 * levels.
 *
 * This family's glass has no levels and no tint choice, so a caller supplies only the
 * glass and the layering; the brows are still derived, and the dimming is a filter on
 * the shared glass layer rather than a different sprite.
 * @module Boids/MachinePrime/Item/Visor/Dollmaker
 */

import * as KDEx from '../../../../KDExtension'
import { Scale } from '../../../../Utilities'
import * as Futuristic from '../../../Futuristic'
import { DollmakerGoggle, DollmakerMask, Layer } from '../../../Futuristic/GlassVisor'
import { ItemArchetype } from '../../Constant'
import * as Coordinator from '../../Coordinator'
import { MakeMorphableVisor, ShouldHideBrows, VisorVariantSet } from './Common'
import { HardLightVisor } from './Constant'

type Variants = VisorVariantSet<DollmakerGoggle, DollmakerMask>

/** A Dollmaker goggle, worn either over the eyes or as a blindfold. */
export type Goggle = Variants['Goggle']
/** A Dollmaker mask, worn as a mask. */
export type Mask = Variants['Mask']
/** The same mask glass again, worn as a hood over the mask. */
export type OverMask = Variants['OverMask']
/**
 * Any of the three, which is what the family's factory accepts: the glass type and the
 * layering, with the socket and the brows derived from the limiter.
 */
export type Variant =
    Goggle |
    Mask |
    OverMask

const LN_SHIFT = 1/(Math.E-1)
const LN_CORRECTION = Math.log(LN_SHIFT)

/**
 * The layer filter that dims the Dollmaker glass as the blinder limiter rises.
 *
 * It runs on the game's `apply` trigger for items carrying the `HardLightVisor` data
 * key, and it reaches linked items, so the filter is recalculated whenever the glass is
 * put on. The limiter's 0..1 range goes through a logarithm that is exactly 0 at no
 * dimming and exactly 1 at full strength — without it the low end would be almost all
 * of the movement — and the result drives the glass layer's alpha up from 1 towards 3.4
 * and its brightness down from 1, with saturation pinned so the glass keeps its colour
 * as it thickens.
 */
export const CalcVisorFilter = KDEx.AddEventHandler({
    eventMap: KDEventMapInventory,
    trigger: 'apply',
    type: '211FBBC1-0E8D-4CFF-82E3-ADA9713142ED',
    eventData: {
        inheritLinked: true,
    },
    handler: KDEx.HandleItemEventWhenItemIsEventSource(
        (_e, item, data) => {
            if (item.data?.[HardLightVisor]) {
                // console.log('Boids: CalcVisorFilter exec', _e, item, data)
                const targetBlindLevel = Coordinator.SensoryControl.GetLimiterStrength(ItemArchetype.Blinder)
                const opaqueFactor = Math.log(targetBlindLevel + LN_SHIFT) - LN_CORRECTION
                const dimFactor = Scale(0, 0.8, opaqueFactor)
                const filter: LayerFilter = data['Filters'][Layer.GlassLayerName] ?? {}
                filter.saturation = 1
                filter.alpha = Scale(1, 3.4, opaqueFactor)
                filter.brightness = Scale(1, 0.2, dimFactor)
                data['Filters'][Layer.GlassLayerName] = filter
            }
        }
    ),
})

const GetTemplateForVariant =
    (partialVariant: Variant, strength: number) =>
        Futuristic.GlassVisor.GetVariant({
            ...partialVariant,
            Socketed: true,
            HideBrows: ShouldHideBrows(strength)
        })

/**
 * The registered morph handler and the variant factory for the Dollmaker glass.
 *
 * `Variant` turns a partial variant into the machine-prime restraint variant the game
 * equips: it sockets the glass and derives `HideBrows` from the limiter through
 * `ShouldHideBrows` in `./Common`, leaving the caller the glass and the layering. With
 * no levels to move between, the sprite is the same at every strength, so
 * `MorphOnBlindLimiterStrengthUpdate` is here mostly for that brow flip; the dimming
 * belongs to `CalcVisorFilter` above, inserted ahead of the morph handler. Unlike the
 * Boids visor, this family's morph does not reach linked items.
 *
 * The factory caches by value, so the brows it reads are the limiter's at the first
 * call for a given partial variant.
 */
export const {
    MorphOnBlindLimiterStrengthUpdate,
    Variant,
} = MakeMorphableVisor({
    Type: '11D8DFAE-F831-4D7C-BB21-8987B8234A63',
    GetTemplateForStrength: GetTemplateForVariant,
    Events: [CalcVisorFilter],
})
