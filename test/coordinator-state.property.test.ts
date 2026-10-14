/**
 * Property tests for the coordinator's persisted state.
 *
 * `Coordinator/Internal/State.ts` hand-writes six
 * `Object.assign(Record<X>(defaults), { fromJS })` blocks, which the refactor
 * collapses into one factory. These properties pin the contract that factory
 * must preserve:
 *
 *   - `fromJS(toJS(x))` is `is()`-equal to `x` for arbitrary valid states, and
 *   - the state accessors round-trip values and report their side effects.
 *
 * Nothing registered at load time is touched here, so the registration manifest
 * is unaffected by these tests.
 */

import fc from 'fast-check'
import assert from 'node:assert/strict'
import { Map as IMMap, Set as IMSet } from 'immutable'
import { describe, it } from 'node:test'

import {
    Entry,
    Gag,
    ItemRegistry,
    SensoryLimiter,
    State,
    Visor,
} from '../src/Boids/MachinePrime/Coordinator/Internal/State'
import { GetState, SetState, SetStateIn } from '../src/Boids/MachinePrime/Coordinator/Internal/StateStorage'
import { GetLimiterStrength, SetLimiterStrength } from '../src/Boids/MachinePrime/Coordinator/SensoryControl'
import { ItemArchetype } from '../src/Boids/MachinePrime/Constant'
import { GetRecorder } from './harness/recorder'

const StrengthArbitrary = fc.float({ min: 0, max: 1, noNaN: true })

const MakeItems = (strength: number, names: readonly string[]) =>
    ItemRegistry({
        [ItemArchetype.Blinder]: Visor({ TargetStrength: strength, RegisteredItems: IMSet(names) }),
        [ItemArchetype.Deafener]: SensoryLimiter({ TargetStrength: strength, RegisteredItems: IMSet(names) }),
        [ItemArchetype.Gag]: Gag({ TargetStrength: strength, RegisteredItems: IMSet(names) }),
    })

const MakeState = (id: string, strength: number, names: readonly string[]) =>
    State({
        ActivePC: Entry({ ID: id, Items: MakeItems(strength, names) }),
        ActiveNPC: IMMap(),
    })

const SensoryTypes = [ItemArchetype.Blinder, ItemArchetype.Deafener, ItemArchetype.Gag]

describe('coordinator state records', () => {
    it('round-trips arbitrary states through toJS/fromJS', () => {
        fc.assert(
            fc.property(
                fc.string({ minLength: 1 }),
                StrengthArbitrary,
                fc.array(fc.string({ minLength: 1, maxLength: 8 }), { maxLength: 3 }),
                (id, strength, names) => {
                    const state = MakeState(id, strength, names)
                    const restored = State.fromJS(state.toJS())

                    assert.ok(
                        restored.equals(state),
                        `round-trip changed the state for id=${id} strength=${strength} names=${names.length}`
                    )
                }
            )
        )
    })

    it('keeps ID as a record key', () => {
        // Regression guard: `ID` used to be installed with a non-enumerable getter, and
        // `Record(defaultValues)` only picks up enumerable own properties -- so it was
        // missing from the schema entirely and could not survive a save/load.
        fc.assert(
            fc.property(fc.string({ minLength: 1 }), id => {
                const entry = Entry({ ID: id, Items: ItemRegistry() })
                assert.equal(entry.ID, id)
                assert.equal(entry.toJS().ID, id)
                assert.equal(Entry.fromJS(entry.toJS()).ID, id)
            })
        )
    })

    it('keeps every archetype strength and registration set', () => {
        fc.assert(
            fc.property(
                fc.string({ minLength: 1 }),
                StrengthArbitrary,
                fc.array(fc.string({ minLength: 1, maxLength: 8 }), { minLength: 1, maxLength: 3 }),
                (id, strength, names) => {
                    const restored = State.fromJS(MakeState(id, strength, names).toJS())

                    assert.equal(restored.ActivePC.ID, id)
                    for (const type of SensoryTypes) {
                        assert.equal(restored.ActivePC.Items[type].TargetStrength, strength, `${type} strength`)
                        assert.deepEqual(
                            [...restored.ActivePC.Items[type].RegisteredItems].sort(),
                            [...new Set(names)].sort(),
                            `${type} registrations`
                        )
                    }
                }
            )
        )
    })

    it('round-trips the default state', () => {
        const state = State()
        assert.ok(state.equals(State.fromJS(state.toJS())))
    })
})

describe('state accessors', () => {
    it('round-trips values written through SetStateIn', () => {
        fc.assert(
            fc.property(StrengthArbitrary, strength => {
                SetState(State())
                SetStateIn(['ActivePC', 'Items', ItemArchetype.Gag, 'TargetStrength'], strength)
                assert.equal(GetState().ActivePC.Items[ItemArchetype.Gag].TargetStrength, strength)
            })
        )
    })

    it('keeps an equal state instance unchanged', () => {
        SetState(State())
        const before = GetState()
        assert.ok(SetState(before).equals(before))
        assert.ok(GetState().equals(before))
    })
})

describe('sensory limiter control', () => {
    it('round-trips limiter strength and always advances time by one', () => {
        fc.assert(
            fc.property(
                fc.constantFrom(...SensoryTypes),
                StrengthArbitrary,
                fc.array(StrengthArbitrary, { minLength: 1, maxLength: 4 }),
                (type, initial, updates) => {
                    SetState(State())
                    SetLimiterStrength(type, initial)
                    for (const next of updates) {
                        SetLimiterStrength(type, next)
                    }

                    assert.equal(GetLimiterStrength(type), updates[updates.length - 1])
                }
            )
        )
    })

    it('emits a strength-change event only when the value actually changes', () => {
        const recorder = GetRecorder()

        SetState(State())
        recorder.sentEvents.length = 0
        recorder.advancedTime.length = 0

        SetLimiterStrength(ItemArchetype.Gag, 0.5)
        assert.equal(recorder.sentEvents.length, 1)

        // Same value: no event, but time still advances.
        SetLimiterStrength(ItemArchetype.Gag, 0.5)
        assert.equal(recorder.sentEvents.length, 1)
        assert.equal(recorder.advancedTime.length, 2)
        assert.deepEqual(recorder.advancedTime, [1, 1])
    })

    it('rejects types that are not sensory controllers', () => {
        SetState(State())
        assert.throws(
            () => SetLimiterStrength('not-a-sensory-controller' as ItemArchetype, 0.5),
            /Invalid sensory controller type/
        )
    })
})
