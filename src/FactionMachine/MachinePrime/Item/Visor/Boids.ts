/**
 * The Boids glass family: drone goggles and a drone mask in four blind levels, tinted
 * or dark, built on the shared visor framework.
 *
 * The level, the socket and the brows are all derived from the limiter strength, so a
 * caller chooses only the glass, the tint and the layering; here a change of blindness
 * is a different sprite rather than a layer filter.
 * @module FactionMachine/MachinePrime/Item/Visor/Boids
 */

import * as Futuristic from '../../../Futuristic'
import {
    BoidsGoggle,
    BoidsMask,
    Variant as ModelVariant,
} from '../../../Futuristic/GlassVisor'
import { MakeMorphableVisor, VisorVariantSet } from './Common'

type Variants = VisorVariantSet<BoidsGoggle, BoidsMask, 'Level'>

/** A Boids goggle, worn either over the eyes or as a blindfold. */
export type Goggle = Variants['Goggle']
/** A Boids mask, worn as a mask. */
export type Mask = Variants['Mask']
/** The same mask glass again, worn as a hood over the mask. */
export type OverMask = Variants['OverMask']
/**
 * Any of the three, which is what the family's factory accepts: the glass, the tint and
 * the layering, with the level and the brows derived from the limiter.
 */
export type Variant =
    Goggle |
    Mask |
    OverMask

const MorphLevelThreshold = [0, 0.25, 0.5, 0.75] as const

const GetTemplateForVariant =
    (partialVariant: Variant, strength: number) => {
        const idx = MorphLevelThreshold.findLastIndex(threshold => strength >= threshold)
        if (idx < 0) {
            throw new Error('Invalid blind level')
        }
        // `Level` and `HideBrows` are correlated in the model variant types, which
        // a computed level cannot express; the original cast is kept as found.
        const Level = idx + 1 as any
        return Futuristic.GlassVisor.GetVariant({
            ...partialVariant,
            Socketed: true,
            Level,
            HideBrows: Level > ModelVariant.BoidsHideBrowsThreshold
        })
    }

/**
 * The registered morph handler and the variant factory for the Boids glass.
 *
 * `Variant` turns a partial variant into the machine-prime restraint variant the game equips: it
 * reads the blind level off the strength band the router resolved — the thresholds are 0, 0.25, 0.5
 * and 0.75 — sockets the glass, and computes `HideBrows` from the level, which is why the caller
 * supplies neither `Level` nor `HideBrows`. `MorphOnBlindRateUpdate` does the same mapping when the
 * strength moves; it is already part of every variant this factory returns, so it is only useful to
 * a consumer assembling a variant by hand.
 *
 * The factory caches by value, so the level it reads is the resolved strength's at the first call
 * for a given partial variant; later movement reaches a worn item through the morph handler
 * instead, not by calling the factory again.
 */
export const {
    MorphOnBlindRateUpdate,
    Variant,
} = MakeMorphableVisor({
    Type: '33790C6F-4629-4387-896E-A999E6641B40',
    GetTemplateForStrength: GetTemplateForVariant,
    InheritLinked: true,
})
