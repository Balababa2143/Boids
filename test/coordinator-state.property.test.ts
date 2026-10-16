/**
 * Property tests for the coordinator's persisted state.
 *
 * `Coordinator/Internal/State.ts` hand-writes its `Record` + `fromJS` pairs, and these properties pin
 * the contract they have to keep:
 *
 *   - `fromJS(toJS(x))` is `is()`-equal to `x` for arbitrary valid states, and
 *   - the dossier's two maps survive that round trip **as maps**, including the dimensions they do
 *     not mention, and
 *   - a write through a path reaches the map it names rather than replacing it.
 *
 * ## What changed with the control model, and why the tests changed with it
 *
 * The state used to be three sensory slots keyed by an `ItemArchetype` GUID, each holding a
 * `TargetStrength` and a `RegisteredItems` set. It is now **two sparse keyed maps over derived
 * dimension ids**, and the set of participants left the dossier entirely: a restraint takes part by
 * carrying a tag in its template (`design/spec.md` §6.12), so there is nothing to register and
 * nothing to unregister.
 *
 * The properties below therefore test what the shape now claims:
 *
 *   - a dimension with no entry reads its baseline rather than a default the reader invented;
 *   - an intent written for one dimension does not disturb another, which a keyed map is the whole
 *     reason for;
 *   - the numeric side of the old suite is gone, because the applied strength is **derived** now and
 *     a derived value has no storage to test.
 *
 * Nothing registered at load time is touched here, so the registration summary is unaffected.
 */

import fc from 'fast-check'
import assert from 'node:assert/strict'
import { Map as IMMap } from 'immutable'
import { describe, it } from 'node:test'

import { Entry, State } from '../src/FactionMachine/MachinePrime/Coordinator/Internal/State'
import { GetState, SetState, SetStateIn, UpdateStateIn } from '../src/FactionMachine/MachinePrime/Coordinator/Internal/StateStorage'
import {
    AllDimensions,
    ControlState,
    GetConfig,
    GetIntent,
    HasDimension,
    Intent,
    ToIntent,
} from '../src/KDExtension/Control'
import { Dossier, RegisteredDimensions, StrongestDemand } from './harness/dossier'

/** Every dimension this build registers. */
const Dimensions = RegisteredDimensions()

/**
 * The dimensions the properties sample from, as a non-empty list.
 *
 * `fc.constantFrom` with an empty list throws, and an empty catalogue would be a broken build rather
 * than a case to cover — so the guard is stated here, once, instead of in every property.
 */
const DimensionArbitrary = fc.constantFrom(...Dimensions)

/**
 * A `[dimension, demand]` pair, sampled per dimension so a state with several demands is likely.
 *
 * The demand comes from {@link StrongestDemand}, which is derived from the dimension's own facets — so
 * every sample is a demand its dimension actually takes, which is what the write rule requires.
 */
const IntentEntryArbitrary = DimensionArbitrary.map(dimension =>
    [dimension, StrongestDemand(dimension)] as const
)

/** A dossier with arbitrary but valid contents, in the store's canonical form. */
const DossierArbitrary = fc
    .array(IntentEntryArbitrary, { maxLength: 8 })
    .map(entries => ControlState({
        intent: IMMap(entries.map(([dimension, record]) => [dimension, ToIntent(record)] as const)),
    }))

/** A whole coordinator state with arbitrary but valid contents. */
const StateArbitrary = fc
    .tuple(fc.string({ minLength: 1 }), DossierArbitrary)
    .map(([id, control]) => State({
        ActivePC: Entry({ ID: id, Control: control }),
        ActiveNPC: IMMap(),
    }))

describe('the catalogue the suite builds states over', () => {
    it('registers the dimensions the tests sample from', () => {
        // Guards against a broken import order producing an empty registry, which would make every
        // property below vacuously true: `fc.constantFrom()` with nothing to choose from throws, and
        // a state with no dimensions in it round-trips trivially.
        assert.ok(
            Dimensions.length > 0,
            'no dimensions are registered, so the state properties below would be sampling nothing'
        )
        assert.equal(
            AllDimensions().length,
            Dimensions.length,
            'the registry changed size while the suite was reading it'
        )
    })
})

describe('coordinator state records', () => {
    it('round-trips arbitrary states through toJS/fromJS', () => {
        fc.assert(
            fc.property(StateArbitrary, state => {
                const restored = State.fromJS(state.toJS())

                assert.ok(
                    restored.equals(state),
                    `round-trip changed the state for id=${state.ActivePC.ID}: ` +
                    `${JSON.stringify(restored.ActivePC.Control.toJS())} against ` +
                    `${JSON.stringify(state.ActivePC.Control.toJS())}`
                )
            })
        )
    })

    it('keeps ID as a record key', () => {
        // Regression guard: `ID` used to be installed with a non-enumerable getter, and
        // `Record(defaultValues)` only picks up enumerable own properties -- so it was
        // missing from the schema entirely and could not survive a save/load.
        fc.assert(
            fc.property(fc.string({ minLength: 1 }), id => {
                const entry = Entry({ ID: id, Control: ControlState() })
                assert.equal(entry.ID, id)
                assert.equal(entry.toJS().ID, id)
                assert.equal(Entry.fromJS(entry.toJS()).ID, id)
            })
        )
    })

    it('keeps every intent and drops nothing the save carried', () => {
        fc.assert(
            fc.property(StateArbitrary, state => {
                const restored = State.fromJS(state.toJS())

                for (const descriptor of AllDimensions()) {
                    // Value equality, not identity: a restored demand is a **different `Map` instance**
                    // holding the same parameters, and the whole reason the store holds a `Map` rather
                    // than a plain record is that `Map` equality is decided by content.
                    assert.ok(
                        GetIntent(restored.ActivePC.Control, descriptor.Id).equals(
                            GetIntent(state.ActivePC.Control, descriptor.Id)
                        ),
                        `${descriptor.Id} lost its intent in the round trip`
                    )
                }
            })
        )
    })

    it('round-trips the default state', () => {
        const state = State()
        assert.ok(state.equals(State.fromJS(state.toJS())))
    })

    it('starts every dimension at its baseline', () => {
        // The baseline is the **absence of an entry**, not a stored reading — which is what makes
        // removing equipment release a demand instead of restoring a value. A default state that stored
        // a parameter-at-rest for every dimension would be a state that has to be kept in step with the
        // catalogue.
        const control = State().ActivePC.Control
        assert.equal(control.intent.size, 0, 'the default dossier carries a demand it was not told about')
        assert.equal(control.config.size, 0, 'the default dossier carries a config it was not told about')

        for (const descriptor of AllDimensions()) {
            assert.deepEqual(
                GetIntent(control, descriptor.Id),
                ToIntent({}),
                `${descriptor.Id} does not start at its baseline`
            )
            assert.deepEqual(GetConfig(control, descriptor.Id), {}, `${descriptor.Id} does not start with no config`)
        }
    })

    it('reads a baseline for a dimension nobody registered rather than throwing', () => {
        // A dossier can carry an id this build does not know — the catalogue moved, or another
        // release wrote it. The reader has to answer, and `HasDimension` is the question to ask;
        // reading is not the place to refuse, because the state has to survive being loaded.
        const control = State().ActivePC.Control
        assert.equal(HasDimension('not-a-dimension'), false)
        assert.deepEqual(GetIntent(control, 'not-a-dimension'), ToIntent({}))
        assert.deepEqual(GetConfig(control, 'not-a-dimension'), {})
    })
})

describe('state accessors', () => {
    it('writes one dimension and leaves every other one alone', () => {
        // The keyed map's whole reason: a demand for `Sight` must not disturb `Struggle`, and a write
        // that reached a sibling would look like a dimension that changes itself.
        fc.assert(
            fc.property(
                DimensionArbitrary,
                fc.constantFrom(0, 0.25, 0.5, 1),
                (dimension, target) => {
                    const shape = StrongestDemand(dimension)
                    // Keep the rate where the dimension takes one, so the sample is always legal.
                    const written = ToIntent(shape.Target === undefined ? shape : { ...shape, Target: target })

                    SetState(State())
                    SetStateIn(['ActivePC', 'Control', 'intent'], IMMap([[dimension, written]]))

                    const control = GetState().ActivePC.Control
                    assert.deepEqual(GetIntent(control, dimension), written)
                    assert.equal(control.intent.size, 1, 'a one-dimension write touched another dimension')
                }
            )
        )
    })

    it('derives an UpdateStateIn write from the stored value, not from a default', () => {
        // `UpdateStateIn` is the read-modify-write helper, and the property it has to keep is that its
        // callback sees what is **stored** rather than what the record would default to.
        fc.assert(
            fc.property(
                DimensionArbitrary,
                fc.array(fc.constantFrom(0, 0.25, 0.5, 1), { minLength: 1, maxLength: 4 }),
                (dimension, targets) => {
                    const shape = StrongestDemand(dimension)
                    const Demand = (target: number) =>
                        ToIntent(shape.Target === undefined ? shape : { ...shape, Target: target })
                    const steps = targets.map(Demand)

                    SetState(State())
                    SetStateIn(['ActivePC', 'Control', 'intent'], IMMap([[dimension, steps[0]]]))

                    const seen: Intent[] = []
                    let expected = steps[0]
                    for (const step of steps) {
                        UpdateStateIn(['ActivePC', 'Control', 'intent'], current => {
                            seen.push(current.get(dimension, IMMap()))
                            return current.set(dimension, step)
                        })
                        expected = step
                    }

                    // The first callback saw what `SetStateIn` stored; every later one saw what the write
                    // before it left. A helper that read a default instead would show `{}` for a
                    // dimension the state already had a demand for.
                    assert.deepEqual(
                        seen,
                        [steps[0], ...steps.slice(0, -1)],
                        'a write did not see the value the one before it left'
                    )
                    assert.deepEqual(GetIntent(GetState().ActivePC.Control, dimension), expected)
                }
            )
        )
    })

    it('keeps an equal state instance unchanged', () => {
        SetState(State())
        const before = GetState()
        assert.ok(SetState(before).equals(before))
        assert.ok(GetState().equals(before))
    })

    it('reads the dossier a harness built, dimension for dimension', () => {
        // The harness is what the save suites use to tell a loaded state from a default one, so the two
        // have to agree about what it contains — and the demand it builds is shaped by each dimension's
        // own facets, which is the whole reason the helper derives it rather than hard-coding a value.
        const dossier = Dossier(new Map(Dimensions.map(dimension => [dimension, StrongestDemand(dimension)] as const)))
        for (const dimension of Dimensions) {
            assert.ok(
                GetIntent(dossier, dimension).equals(ToIntent(StrongestDemand(dimension))),
                `${dimension} did not read back the demand the harness built`
            )
        }
    })
})
