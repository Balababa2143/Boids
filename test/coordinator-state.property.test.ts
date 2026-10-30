/**
 * Property tests for the coordinator's persisted state: `fromJS(toJS(x))`
 * equals `x`, the dossier's two maps survive as maps, and a write reaches
 * the map it names. Nothing registered at load time is touched.
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
 * `fc.constantFrom` with an empty list throws, so the
 * guard is stated here rather than in every property.
 */
const DimensionArbitrary = fc.constantFrom(...Dimensions)

/**
 * A `[dimension, demand]` pair, sampled per dimension so a state with several demands is likely.
 *
 * The demand comes from {@link StrongestDemand}, which is derived from the
 * dimension's own facets, so every sample is one its dimension actually takes.
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
        // Guards against a broken import order producing an empty
        // registry, which would make every property vacuous.
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

    it('carries the two empty shells through a save, and restores them to one value', () => {
        // Immutable treats two structurally empty plain objects as
        // different values, which a naive `{}` default would break.
        const state = State({
            ActivePC: Entry({ ID: 'shells', Control: ControlState() }),
            ActiveNPC: IMMap(),
        })
        const restored = State.fromJS(JSON.parse(JSON.stringify(state.toJS())))

        assert.deepEqual(restored.ActivePC.Quests, {})
        assert.deepEqual(restored.ActivePC.Rules, {})
        assert.ok(
            restored.equals(state),
            'a shell did not restore to the same value, so the state no longer equals itself'
        )
    })

    it('keeps ID as a record key', () => {
        // `Record` picks up only enumerable own properties, so `ID` must stay one.
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
                    // Value equality: a restored demand is a different
                    // `Map` instance holding the same parameters.
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
        // The baseline is the absence of an entry; a stored parameter-at-rest
        // would have to be kept in step with the catalogue.
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
        // A save can carry an id this build does not know; reading
        // has to answer, because the state must survive being loaded.
        const control = State().ActivePC.Control
        assert.equal(HasDimension('not-a-dimension'), false)
        assert.deepEqual(GetIntent(control, 'not-a-dimension'), ToIntent({}))
        assert.deepEqual(GetConfig(control, 'not-a-dimension'), {})
    })
})

describe('state accessors', () => {
    it('writes one dimension and leaves every other one alone', () => {
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
        // `UpdateStateIn` is the read-modify-write helper: its
        // callback must see what is stored, not a default.
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

                    // The first callback saw what `SetStateIn` stored;
                    // every later one saw what the write before it left.
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
        const dossier = Dossier(new Map(Dimensions.map(dimension => [dimension, StrongestDemand(dimension)] as const)))
        for (const dimension of Dimensions) {
            assert.ok(
                GetIntent(dossier, dimension).equals(ToIntent(StrongestDemand(dimension))),
                `${dimension} did not read back the demand the harness built`
            )
        }
    })
})
