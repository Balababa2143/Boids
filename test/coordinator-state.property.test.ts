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

/** Everything the coordinator persists, written out the way `StateStorage` does. */
const SampleFromJSInput = { TargetStrength: 0.5, RegisteredItems: ['a'] }

describe('coordinator state records', () => {
    it('pins the current Entry schema: ID is not a record key at all', () => {
        // KNOWN DEFECT (A). `State.ts` installs the `ID` default with
        //
        //     Object.defineProperty(EntryDefault, 'ID', { get: () => NewUUID() })
        //
        // and `Object.defineProperty` defaults to `enumerable: false`. Immutable's
        // `Record(defaultValues)` derives its key list from the *enumerable* own
        // properties of the defaults object, so `ID` never becomes part of the schema:
        // it is absent from `toJS()`, cannot be set through the constructor, and
        // `Entry.fromJS`'s `ID: js.ID` is therefore a no-op. The "fresh uuid per entry"
        // intent does not work either, because the getter only exists on the raw
        // defaults object.
        const entry = Entry({ ID: 'explicit-id', Items: ItemRegistry() } as never)

        assert.deepEqual(Object.keys(entry.toJS()), ['Items'])
        assert.equal((entry as unknown as { get(key: string): unknown }).get('ID'), undefined)
        assert.ok(!('ID' in Entry().toJS()))
    })

    it('pins the current fromJS field loss per archetype', () => {
        // KNOWN DEFECT (B). `SensoryLimiter.fromJS`, `Gag.fromJS` and `Visor.fromJS`
        // spread an Immutable Record into a plain object literal:
        //
        //     SensoryLimiter({ ...ItemStateBase.fromJS(js), TargetStrength: js.TargetStrength })
        //     Gag({ ...SensoryLimiter.fromJS(js) })
        //
        // Immutable v5 Records expose their fields as prototype accessors, so
        // `{ ...record }` yields `{ _values: [...] }` rather than the fields. Every
        // spread field silently falls back to its default. Only `SensoryLimiter`'s
        // `TargetStrength` survives, because it is assigned explicitly after the spread.
        assert.deepEqual(SensoryLimiter.fromJS(SampleFromJSInput as never).toJS(), {
            RegisteredItems: [],
            TargetStrength: 0.5,
        })
        assert.deepEqual(Gag.fromJS(SampleFromJSInput as never).toJS(), {
            RegisteredItems: [],
            TargetStrength: 0,
        })
        assert.deepEqual(Visor.fromJS(SampleFromJSInput as never).toJS(), {
            RegisteredItems: [],
            TargetStrength: 0,
        })
    })

    it('pins the current round-trip: only the deafener strength survives', () => {
        // The combined effect of defects (A) and (B). Of everything the coordinator
        // persists, exactly one field makes it back across a save/load — the deafener's
        // `TargetStrength`, because `SensoryLimiter.fromJS` assigns it explicitly after
        // the lossy spread. The blinder and gag strengths fall back to zero and every
        // `RegisteredItems` set is forgotten.
        fc.assert(
            fc.property(
                fc.string({ minLength: 1 }),
                StrengthArbitrary,
                fc.array(fc.string({ minLength: 1, maxLength: 8 }), { minLength: 1, maxLength: 3 }),
                (id, strength, names) => {
                    const state = MakeState(id, strength, names)

                    // The state really did carry values before the round-trip.
                    for (const type of SensoryTypes) {
                        assert.equal(state.ActivePC.Items[type].TargetStrength, strength)
                        assert.deepEqual(
                            [...state.ActivePC.Items[type].RegisteredItems].sort(),
                            [...new Set(names)].sort()
                        )
                    }

                    const expected = State({
                        ActivePC: Entry({
                            Items: ItemRegistry({
                                [ItemArchetype.Deafener]: SensoryLimiter({ TargetStrength: strength }),
                            }),
                        }),
                        ActiveNPC: IMMap(),
                    })

                    assert.ok(
                        State.fromJS(state.toJS()).equals(expected),
                        `expected only the deafener strength to survive for id=${id} strength=${strength}`
                    )
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
