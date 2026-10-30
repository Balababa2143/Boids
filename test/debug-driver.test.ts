/**
 * The debug module: the explicit console entry points write a demand, and no tick handler writes a
 * demand.
 *
 * @module test/debug-driver
 */

import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import * as Coordinator from '../src/FactionMachine/MachinePrime/Coordinator'
import { DimensionIdOf, DimensionName } from '../src/FactionMachine/MachinePrime/Coordinator/Catalog'
import { State } from '../src/FactionMachine/MachinePrime/Coordinator/Internal/State'
import { SetState } from '../src/FactionMachine/MachinePrime/Coordinator/Internal/StateStorage'
import { SetBlindStrength, SetGagStrength } from '../src/FactionMachine/MachinePrime/Debug'
import { ResetWorld } from './harness/equipment'

const Sight = DimensionIdOf(DimensionName.Sight)
const Speech = DimensionIdOf(DimensionName.Speech)

/** A tick handler GUID the mod must never register. */
const ForbiddenTickDriver = '90F84036-7836-473E-BE57-14009ABE6158'

/** The game's generic event map, as the harness installed it. */
const GenericTickHandlers = (): Record<string, unknown> => {
    const maps = globalThis as unknown as {
        KDEventMapGeneric?: Record<string, Record<string, unknown> | undefined>
    }
    return maps.KDEventMapGeneric?.tick ?? {}
}

/** A clean body and a clean dossier. */
const Fresh = (): void => {
    ResetWorld()
    SetState(State())
}

describe('no demand advances on a tick', () => {
    it('registers no handler under that GUID', () => {
        assert.equal(
            GenericTickHandlers()[ForbiddenTickDriver],
            undefined,
            'a handler advances a demand from a tick'
        )
    })

    it('writes no demand when a tick is dispatched', () => {
        // `Math.random` pinned to 0: a random driver would certainly fire, so no change means no
        // handler.
        Fresh()
        const before = Coordinator.GetDossier()
        const original = Math.random
        Math.random = () => 0
        try {
            (globalThis as unknown as {
                KinkyDungeonSendEvent: (_: { Event: string, data: unknown }) => void
            }).KinkyDungeonSendEvent({ Event: 'tick', data: {} })
        }
        finally {
            Math.random = original
        }

        assert.ok(Coordinator.GetDossier().equals(before), 'a tick changed the dossier')
    })
})

describe('the console drivers still write a demand', () => {
    it('writes sight and speech through the explicit entry points', () => {
        Fresh()

        SetBlindStrength(0.5)
        SetGagStrength(0.7)

        assert.equal(Coordinator.Resolve(Sight).Demand, 0.5)
        assert.equal(Coordinator.Resolve(Speech).Demand, 0.7)
    })
})
