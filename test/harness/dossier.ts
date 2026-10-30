/**
 * Builds dossiers for tests: sparse keyed maps whose `intent` values are
 * composed from each dimension's facets. Nothing here registers anything.
 *
 * @module test/harness/dossier
 */

import fc from 'fast-check'
import { Map as IMMap } from 'immutable'
import {
    AllDimensions,
    ControlState,
    GetDimension,
    IntentParameterNames,
    IntentRecord,
    PoseKey,
    ToIntent,
} from '../../src/KDExtension/Control'
import { Entry, State } from '../../src/FactionMachine/MachinePrime/Coordinator/Internal/State'

/** Every dimension this build registers, as ids. */
export const RegisteredDimensions = (): readonly string[] =>
    AllDimensions().map(descriptor => descriptor.Id)

/**
 * The strongest legal demand for one dimension, shaped by its own facets.
 *
 * Derived from the descriptor so it cannot fall out of step with the catalogue: `Rate`
 * gets `Target: 1`, `Gate` gets `OverrideForbidden`, `Posture` gets its whole ladder.
 */
export const StrongestDemand = (dimension: string): IntentRecord => {
    const descriptor = GetDimension(dimension)
    const takes = IntentParameterNames(descriptor) as readonly string[]
    const demand: { Target?: number, Allowed?: readonly PoseKey[], Intent?: 'OverrideForbidden' } = {}
    if (takes.includes('Target')) {
        demand.Target = 1
    }
    if (takes.includes('Allowed')) {
        demand.Allowed = [...(descriptor.Ladder ?? [])]
    }
    if (takes.includes('Intent')) {
        demand.Intent = 'OverrideForbidden'
    }
    return demand
}

/**
 * A dossier with one demand per dimension given, and nothing else.
 *
 * Records go through `ToIntent`, the write path's own conversion, so a test-built dossier and
 * a console-written one hold the same canonical value. An absent dimension reads its baseline.
 */
export const Dossier = (intents: ReadonlyMap<string, IntentRecord>): ControlState =>
    ControlState({
        intent: IMMap([...intents].map(([dimension, record]) => [dimension, ToIntent(record)] as const)),
    })

/**
 * A state worth telling apart from a default one: a named
 * character with a strongest demand on every registered dimension.
 *
 * Every dimension, because the suites compare it against what a load
 * produced; a sample could survive a round-trip that dropped the rest.
 */
export const MarkerState = (id = 'existing-character'): State =>
    State({
        ActivePC: Entry({
            ID: id,
            Control: Dossier(
                new Map(RegisteredDimensions().map(dimension => [dimension, StrongestDemand(dimension)] as const))
            ),
        }),
        ActiveNPC: IMMap(),
    })

/** One sampled demand: a registered dimension with its own strongest legal demand. */
const ArbitraryDemand = (): fc.Arbitrary<readonly [string, IntentRecord]> =>
    fc.constantFrom(...RegisteredDimensions())
        .map(dimension => [dimension, StrongestDemand(dimension)] as const)

/**
 * A state whose demands are arbitrary but valid, for
 * a property test that carries one through a save.
 *
 * The registry is read inside the `chain`, not at module scope: a
 * module-scope `constantFrom` over an empty registry fails only at first
 * sample, and reads as a broken suite rather than as import order.
 */
export const ArbitraryIntentState: fc.Arbitrary<State> = fc
    .constant(null)
    .chain(() => fc.tuple(fc.string({ minLength: 1 }), fc.array(ArbitraryDemand(), { maxLength: 6 })))
    .map(([id, entries]) => State({
        ActivePC: Entry({
            ID: id,
            Control: Dossier(new Map(entries)),
        }),
        ActiveNPC: IMMap(),
    }))
