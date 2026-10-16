/**
 * Building dossiers for tests.
 *
 * Four suites need a coordinator state worth telling apart from a default one, and the shape it has to
 * fill changed twice with the control model: it was three sensory slots keyed by an archetype enum,
 * then two keyed maps whose `intent` was a bare `GateIntent`, and it is now **two sparse keyed maps
 * whose `intent` values are records composed from each dimension's facets** (`design/spec.md` §6.5) —
 * `{ Target }` for a rate, `{ Intent }` for a gate, both for a dimension that composes both.
 *
 * The helper lives here rather than in each suite because the suites have to agree about what a
 * plausible dossier *is*. Four copies of "some demands on some dimensions" would drift, and the drift
 * would show up as one suite accepting a state another considers empty.
 *
 * **Nothing here registers anything.** The catalogue is registered by importing
 * `MachinePrime/Coordinator`, which every module below reaches and which says so in its own header, so
 * `AllDimensions()` is populated by the time a test file's body runs.
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
 * The **strongest legal demand** for one dimension, shaped by its own facets.
 *
 * Derived from the descriptor rather than written as a table, so this helper cannot fall out of step
 * with the catalogue: a dimension that composes `Rate` gets `Target: 1` (the strictest squeeze), one
 * that composes `Gate` gets `OverrideForbidden`, one that composes both gets both, and one that
 * composes `Posture` gets its **whole ladder** as the poses to subtract — which is the most a
 * permitted-set demand can ask for, because it empties the set and leaves the router's non-empty
 * sentinel to answer with one pose (invariant 23).
 *
 * It is the shape a test needs to say "this dimension is being demanded of" without hard-coding which
 * fields that means.
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
 * The records are converted through `ToIntent`, which is the **same conversion the write path uses** —
 * so a dossier a test builds and a dossier a console writes hold the same canonical value, and the
 * round-trip property compares like with like.
 *
 * The maps are sparse by design, so a dimension with no entry reads its baseline. A test that wants to
 * see a non-default state names the dimensions it cares about and leaves the rest absent.
 */
export const Dossier = (intents: ReadonlyMap<string, IntentRecord>): ControlState =>
    ControlState({
        intent: IMMap([...intents].map(([dimension, record]) => [dimension, ToIntent(record)] as const)),
    })

/**
 * A state worth telling apart from a default one: a named character with a non-default demand on every
 * dimension this build registers.
 *
 * "Every dimension" rather than a sample, because the suites that use this compare it against what a
 * load produced — and a state covering only some dimensions could survive a round-trip that dropped the
 * rest.
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

/**
 * One sampled demand: a registered dimension with its own strongest legal demand.
 *
 * Written as a `chain` over the dimension so the demand is derived from the descriptor that dimension
 * actually has, which is the only way a value is guaranteed to be legal for a rate, for a gate, and for
 * a dimension that composes both.
 */
const ArbitraryDemand = (): fc.Arbitrary<readonly [string, IntentRecord]> =>
    fc.constantFrom(...RegisteredDimensions())
        .map(dimension => [dimension, StrongestDemand(dimension)] as const)

/**
 * A state whose demands are arbitrary but valid, for a property test that has to carry one through a
 * real save.
 *
 * Only the dimensions this build registers, and only fields those dimensions take: a state carrying an
 * unknown id or an illegal parameter would be testing the loader's tolerance rather than its round-trip,
 * which is a different property with its own case.
 *
 * **The registry is read inside the `chain`, not at module scope.** A module-scope `constantFrom` over
 * an empty registry does not fail until `fast-check` is first sampled, and the failure it gives then
 * reads as a broken suite rather than as an import-order problem. Sampling lazily means the read happens
 * when the property runs, by which point every registration module has been evaluated.
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
