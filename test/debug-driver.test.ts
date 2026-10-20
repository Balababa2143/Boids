/**
 * The debug module's two halves: what was retired, and what remains.
 *
 * The random `tick` driver was the Phase 1 review's F2: every tick it wrote a demand nobody asked
 * for, and its `AnnounceRate` call advanced game time from inside the game's own tick dispatch. The
 * correction retires the handler rather than gating it, so a playable build registers no tick
 * handler at all. The console entry points are still the only writer until 3.1, and this file holds
 * both statements: the handler is gone, and the explicit path still writes.
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

/**
 * The retired handler's GUID.
 *
 * It lives in the test rather than in `src/`: the source-level uniqueness gate reads `src/` only, and
 * keeping the value here is what lets the case name the handler it is refusing without putting the
 * literal back into the tree it is meant to be absent from.
 */
const RetiredTickDriver = '90F84036-7836-473E-BE57-14009ABE6158'

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

describe('the random tick driver is retired', () => {
    it('registers no handler under the retired GUID', () => {
        assert.equal(
            GenericTickHandlers()[RetiredTickDriver],
            undefined,
            'the random tick driver is registered again'
        )
    })

    it('writes no demand when a tick is dispatched', () => {
        // The behavioural half: even if some future module registered a tick handler, a tick must not
        // start moving the control dimensions. `Math.random` is pinned to 0 so a random driver would
        // certainly fire; no handler means no change.
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
