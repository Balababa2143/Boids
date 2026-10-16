/**
 * Characterization tests for the mitten layer factories.
 *
 * `Limb/Mitten/Layer.ts` builds fourteen near-identical bands from one data-driven factory. Three
 * things hold, and none is obvious from reading the code:
 *
 *  1. `MakeSwapLayerPose` takes a bitmask of the poses a layer swaps in. A
 *     forearm band already sorts in `ForeMitten<suffix>`, so it only swaps in
 *     the `Crossed` pose; a sleeve band sits in `Mitten<suffix>` and swaps in
 *     both `Crossed` and `Front`, moving into `ForeMitten<suffix>` for the
 *     latter. This mirrors the base game's cyber mitten model list.
 *  2. Every swap target has to be a layer group the game knows, which is why
 *     the set of targets is asserted wholesale rather than entry by entry.
 *  3. Each factory derives every layer name from its suffix.
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
        // This replaces a per-factory table of `SwapLayerPose` counts, which made adding a band a
        // number to update and made its own purpose ("a band lost its pose") rest on that number.
        // The rule is an equivalence instead, and it is content-independent: a band swaps **iff** it
        // is one of the common bands — which exist to take over the Front and Crossed poses — or it
        // sits in the forearm group, which cannot stay where it is when the arm crosses.
        //
        // It catches a dropped pose on either side, and it catches a pose appearing on a primary
        // band, which would move art that is supposed to stay put.
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
        // A typo in a swap target is invisible at runtime unless the game
        // complains, so the whole target set is pinned. `FrontMitten*` used to
        // appear here and is not a member of `LAYERS_BASE`.
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
