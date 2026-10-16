/**
 * Invariant 12's separability round-trip (`design/spec.md` §11, §6.5, §6.12).
 *
 * > **Restraint and control state is derived from the character's single baseline.** Baseline values
 * > live in the Coordinator, **never on an item** — so the baseline is never lost when equipment is
 * > removed, replaced, or destroyed. *Enforced by a separability round-trip test: equip, run, remove
 * > everything, and compare **every dimension in the descriptor registry** field for field with the
 * > never-equipped state.*
 *
 * That is the case this file exists for, and it is why the check is a **property** over the whole
 * registry rather than three hand-written comparisons: the claim is about every dimension and every
 * worn set, and a case that sampled one dimension would be evidence for a much weaker statement.
 *
 * ## Two comparisons, because they fail for different reasons
 *
 * "Field for field" is about the **dossier** — `intent` and `config`, dimension by dimension — because
 * a value stored on an item is what would corrupt it. The **resolution** is compared separately: it is
 * *derived*, so it is the thing that has to go back to the baseline rather than the thing that has to
 * stay equal.
 *
 * So a failure here says which of the two happened: a dossier that moved when a worn item left means
 * something about the equipment was stored in it, and a resolution that did not return to the baseline
 * means a value survived the item that imposed it.
 *
 * ## Where the state under test actually lives
 *
 * The harness stubs the two seams the contract reads — `KinkyDungeonAllRestraintDynamic` for what is on
 * the body and `KDRestraint` for a variant's template — so a "body" here is a list that
 * `RemoveEverything` empties. There is no `item.data` in either comparison, and that is the point: the
 * subject is the dossier, and the claim is that nothing about the equipment is in it.
 */

import assert from 'node:assert/strict'
import fc from 'fast-check'
import { describe, it } from 'node:test'

import { AllDimensions, GetConfig, GetIntent, PoseKeys } from '../src/KDExtension/Control'
import { ControlledTag } from '../src/FactionMachine/MachinePrime/Coordinator/Tag'
import { GetState } from '../src/FactionMachine/MachinePrime/Coordinator/Internal/StateStorage'
import { Resolve } from '../src/FactionMachine/MachinePrime/Coordinator/Public/Control'
import { AddRestraint, RemoveEverything, ResetWorld, SeedDossier, Wear } from './harness/equipment'

/**
 * Every dimension's dossier entry, as one comparable value.
 *
 * Built through the accessors rather than off the maps, so an accessor that started answering a default
 * the maps do not hold would show up as a difference rather than being normalised away. The whole
 * **intent record** goes in, serialised: after the correction that made a demand a composition of its
 * facets' parameters, a comparison over one field per dimension would miss a parameter entirely.
 */
const DossierFields = (): readonly (readonly [string, string, string])[] =>
    AllDimensions().map(descriptor => [
        descriptor.Id,
        JSON.stringify(GetIntent(GetState().ActivePC.Control, descriptor.Id)),
        JSON.stringify(GetConfig(GetState().ActivePC.Control, descriptor.Id)),
    ] as const)

/**
 * Every dimension's resolution, as one comparable value.
 *
 * Per facet, because that is what a resolution is: a rate dimension reports `Applied`, `Projected` and
 * `Ceiling`, a posture dimension reports its permitted set and its ceiling, and a gate dimension reports
 * `Gate` and `Engaged` — so the comparison spans all of them and a dimension reporting a field it has no
 * facet for shows up as a difference. `Projected` is in here because it is `Applied` through the
 * dimension's own engine value map, which is a separate claim: a change that moved the map under the
 * rate's answer would not be visible in `Applied` alone.
 */
const ResolutionFields = (): readonly (readonly [
    string,
    number | undefined,
    number | undefined,
    number | undefined,
    string | undefined,
    string | undefined,
    string | null,
])[] =>
    AllDimensions().map(descriptor => {
        const resolution = Resolve(descriptor.Id)
        return [
            descriptor.Id,
            resolution.Applied,
            resolution.Ceiling,
            resolution.Projected,
            resolution.Posture == null ? undefined : [...resolution.Posture].sort().join(','),
            resolution.Gate,
            resolution.Winner?.Source ?? null,
        ] as const
    })

/**
 * One item's declaration: a registered dimension at an arbitrary power, with an optional `Allowed`.
 *
 * Floats in 0..1 because that is the range the applied severity is defined over — a value outside it
 * is clamped rather than leaked, which `control-router.test.ts` states as its own case. `Allowed` is
 * optional on purpose, so the samples cover both halves of the posture rule: a provider that declares
 * a set and a provider that says nothing about body configurations and is therefore not consulted.
 */
const BidArbitrary = fc
    .constantFrom(...AllDimensions().map(descriptor => descriptor.Id))
    .chain(dimension => fc.record({
        Dimension: fc.constant(dimension),
        Power: fc.float({ min: 0, max: 1, noNaN: true }),
        Allowed: fc.option(
            fc.constantFrom(...PoseKeys),
            { nil: undefined }
        ).map(pose => (pose === undefined ? undefined : [pose])),
    }))

/**
 * The dimension the two hand-written cases move.
 *
 * Taken from the registry rather than written as a name, so the cases cannot disagree with the
 * catalogue — and a function rather than a constant because the registry is populated at import time
 * and a module-scope read would depend on the order the harness happened to install things in.
 */
const MovedDimension = (): string => AllDimensions()[0].Id

describe('invariant 12: control state derives from the Coordinator, not from the item', () => {
    it('returns the character to the never-equipped state, field for field, when everything comes off', () => {
        fc.assert(
            fc.property(
                fc.array(BidArbitrary, { minLength: 1, maxLength: 5 }),
                fc.string({ minLength: 1, maxLength: 6 }),
                (bids, suffix) => {
                    ResetWorld()
                    SeedDossier()
                    const dossierWhenBare = DossierFields()
                    const resolutionWhenBare = ResolutionFields()

                    // Equip, and touch every dimension so a cached answer would have had a chance to be
                    // written. One item per bid, each declaring its own dimension.
                    bids.forEach((bid, index) => {
                        const name = `separability-${suffix}-${index}`
                        AddRestraint({ name, template: `${name}-template`, shrine: [ControlledTag] })
                        Wear({ name, bids: [bid] })
                    })

                    RemoveEverything()

                    // **Field for field, over every dimension in the descriptor registry.**
                    assert.deepEqual(
                        DossierFields(),
                        dossierWhenBare,
                        'the dossier is not the same as it was before anything was worn'
                    )
                    assert.deepEqual(
                        ResolutionFields(),
                        resolutionWhenBare,
                        'a dimension did not return to its never-equipped resolution'
                    )
                }
            )
        )
    })

    it('keeps the dossier identical across an equip-and-remove cycle', () => {
        // The dossier half on its own, with a body that is actually read — so a failure here is
        // unambiguously "something about the equipment was stored", not "the resolution was wrong".
        ResetWorld()
        SeedDossier()
        const before = DossierFields()
        const dimension = MovedDimension()

        AddRestraint({ name: 'moved', template: 'moved-template', shrine: [ControlledTag] })
        Wear({ name: 'moved', bids: [{ Dimension: dimension, Power: 1 }] })
        assert.equal(
            Resolve(dimension).Ceiling,
            1,
            'the equipment was not read, so the comparison below would be vacuous'
        )

        RemoveEverything()

        assert.deepEqual(DossierFields(), before)
    })

    it('clears the whole body without touching a single intent', () => {
        // The narrow form, which is what makes a failure readable: every dimension's intent read back
        // after the body is emptied, named one at a time rather than reported as a diff.
        ResetWorld()
        SeedDossier()
        const before = new Map(
            AllDimensions().map(descriptor => [descriptor.Id, GetIntent(GetState().ActivePC.Control, descriptor.Id)])
        )
        const dimension = MovedDimension()

        AddRestraint({ name: 'only', template: 'only-template', shrine: [ControlledTag] })
        Wear({ name: 'only', bids: [{ Dimension: dimension, Power: 1 }] })

        RemoveEverything()

        for (const descriptor of AllDimensions()) {
            assert.equal(
                GetIntent(GetState().ActivePC.Control, descriptor.Id),
                before.get(descriptor.Id),
                `${descriptor.Id} lost its intent when the body was emptied`
            )
        }
    })
})
