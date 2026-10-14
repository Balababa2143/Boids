/**
 * Characterization tests for the mitten layer factories.
 *
 * `Limb/Mitten/Layer.ts` contains fourteen near-identical layer literals, which
 * the refactor collapses into a data-driven factory. Two things must survive
 * that collapse, and neither is obvious from reading the code:
 *
 *  1. `MakeSwapLayerPose` uses a bitwise OR in a truthiness position, so *both*
 *     the `Crossed` and the `Front` swap entries are emitted for every caller,
 *     regardless of the `LayersToSwap` value passed. Every call site passes
 *     `Crossed` (or the redundant `Crossed | Crossed`), so the `Front` entry is
 *     spurious — but it is the behaviour the game currently gets.
 *  2. Each factory derives every layer name from its suffix.
 *
 * The swap-map behaviour is pinned deliberately: it is a latent defect whose
 * intended shape is unclear, so changing it must be a separate, explicit decision
 * rather than a side effect of tidying the literals up.
 */

import fc from 'fast-check'
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
    GetEmptyBodyLayers,
    GetLongMittenBodyLayers,
    GetLongMittenCaplayers,
    GetLongMittenCommonLayers,
    GetSleevesBodyLayers,
} from '../src/Boids/Futuristic/Limb/Mitten/Layer'

/**
 * Every layer literal that sets `SwapLayerPose`, per factory. The total is
 * asserted so that neither extracting a helper nor collapsing the literals may
 * add or drop one.
 */
const SwapLayerPoseCounts: Record<string, number> = {
    GetLongMittenCommonLayers: 14,
    GetSleevesBodyLayers: 1,
    GetEmptyBodyLayers: 1,
    GetLongMittenBodyLayers: 1,
    GetLongMittenCaplayers: 1,
}

const Factories: Record<string, (suffix: string) => ModelLayer[]> = {
    GetLongMittenCommonLayers,
    GetSleevesBodyLayers,
    GetEmptyBodyLayers,
    GetLongMittenBodyLayers,
    GetLongMittenCaplayers,
}

const ExpectedSwapLayerPose = (suffix: string) => ({
    Crossed: `CrossMitten${suffix}`,
    Front: `FrontMitten${suffix}`,
})

describe('mitten layer factories', () => {
    it('emits the expected number of layers with a SwapLayerPose', () => {
        for (const [name, factory] of Object.entries(Factories)) {
            const actual = factory('Left').filter(layer => layer.SwapLayerPose != null).length
            assert.equal(actual, SwapLayerPoseCounts[name], `${name} changed its SwapLayerPose count`)
        }
    })

    it('pins the current SwapLayerPose behaviour: Crossed and Front are always both set', () => {
        fc.assert(
            fc.property(fc.string({ minLength: 1, maxLength: 12 }), suffix => {
                for (const [name, factory] of Object.entries(Factories)) {
                    for (const layer of factory(suffix)) {
                        if (layer.SwapLayerPose == null) {
                            continue
                        }
                        assert.deepEqual(
                            layer.SwapLayerPose,
                            ExpectedSwapLayerPose(suffix),
                            `${name} / ${layer.Name} changed its SwapLayerPose`
                        )
                    }
                }
            })
        )
    })

    it('derives layer names from the suffix and is deterministic', () => {
        fc.assert(
            fc.property(fc.string({ minLength: 1, maxLength: 12 }), suffix => {
                for (const [name, factory] of Object.entries(Factories)) {
                    const first = factory(suffix)
                    const second = factory(suffix)

                    assert.deepEqual(first, second, `${name} is not deterministic`)
                    assert.deepEqual(
                        first.map(layer => layer.Name),
                        second.map(layer => layer.Name)
                    )

                    const foreign = factory(`${suffix}Other`)
                    // A different suffix must not reproduce the same layer names, which
                    // also guarantees `ToLayerMap` keys stay distinct across Left/Right.
                    assert.notDeepEqual(
                        first.map(layer => layer.Name),
                        foreign.map(layer => layer.Name),
                        `${name} ignores its suffix`
                    )
                }
            })
        )
    })

    it('produces names that survive ToLayerMap keying', () => {
        for (const [name, factory] of Object.entries(Factories)) {
            const layers = [...factory('Left'), ...factory('Right')]
            const names = layers.map(layer => layer.Name)
            assert.equal(
                new Set(names).size,
                names.length,
                `${name} produced duplicate layer names, which ToLayerMap would collapse`
            )
        }
    })
})
