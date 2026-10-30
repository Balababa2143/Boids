/**
 * Characterization tests for the mitten layer factories: pose masks,
 * swap targets the game knows, and layer names derived from the suffix.
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
} from '../src/FactionMachine/Futuristic/Limb/Mitten/Layer'

const Factories: Record<string, (suffix: string) => ModelLayer[]> = {
    GetLongMittenCommonLayers,
    GetSleevesBodyLayers,
    GetEmptyBodyLayers,
    GetLongMittenBodyLayers,
    GetLongMittenCaplayers,
}

const AllLayers = (suffix: string) =>
    Object.values(Factories).flatMap(factory => factory(suffix))

const IsForearmBand = (layer: ModelLayer) => layer.Layer.startsWith('ForeMitten')

const ExpectedSwapLayerPose = (layer: ModelLayer, suffix: string) => ({
    Crossed: `CrossMitten${suffix}`,
    ... !IsForearmBand(layer) && {
        Front: `ForeMitten${suffix}`,
    }
})

describe('mitten layer factories', () => {
    it('swaps exactly the bands that have to change group for a pose', () => {
        // An equivalence rather than a per-factory count: a band swaps
        // iff it is a common band or sits in the forearm group. It
        // catches a dropped pose and a pose appearing on a primary band.
        fc.assert(
            fc.property(fc.string({ minLength: 1, maxLength: 12 }), suffix => {
                const commonBands = new Set(GetLongMittenCommonLayers(suffix).map(layer => layer.Name))

                for (const [name, factory] of Object.entries(Factories)) {
                    for (const layer of factory(suffix)) {
                        const swaps = layer.SwapLayerPose != null
                        const mustSwap = commonBands.has(layer.Name) || layer.Layer.startsWith('ForeMitten')

                        assert.equal(
                            swaps,
                            mustSwap,
                            `${name} / ${layer.Name} ${swaps ? 'swaps' : 'does not swap'} but ` +
                            `should ${mustSwap ? '' : 'not '}swap (layer group ${layer.Layer})`
                        )
                    }
                }
            })
        )
    })

    it('swaps forearm bands in Crossed and sleeve bands in Crossed and Front', () => {
        fc.assert(
            fc.property(fc.string({ minLength: 1, maxLength: 12 }), suffix => {
                for (const [name, factory] of Object.entries(Factories)) {
                    for (const layer of factory(suffix)) {
                        if (layer.SwapLayerPose == null) {
                            continue
                        }
                        assert.deepEqual(
                            layer.SwapLayerPose,
                            ExpectedSwapLayerPose(layer, suffix),
                            `${name} / ${layer.Name} changed its SwapLayerPose`
                        )
                    }
                }
            })
        )
    })

    it('only ever swaps into the crossed and forearm layer groups', () => {
        // A typo in a swap target is invisible at runtime unless
        // the game complains, so the whole target set is pinned.
        fc.assert(
            fc.property(fc.string({ minLength: 1, maxLength: 12 }), suffix => {
                const targets = new Set(
                    AllLayers(suffix).flatMap(layer => Object.values(layer.SwapLayerPose ?? {}))
                )
                assert.deepEqual(
                    [...targets].sort(),
                    [`CrossMitten${suffix}`, `ForeMitten${suffix}`].sort(),
                    'a SwapLayerPose target left the crossed/forearm layer groups'
                )
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
                    // A different suffix must not reproduce the same names,
                    // which keeps `ToLayerMap` keys distinct across Left/Right.
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
