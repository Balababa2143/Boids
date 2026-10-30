/**
 * The separability round-trip: equip, resolve, remove everything, and compare the
 * dossier and the resolution against the never-equipped state, over the whole registry.
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
 * Read through the accessors, so an accessor answering a default the maps do not
 * hold shows as a difference. The whole intent record is serialised, not one field.
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
 * Spans every facet's fields; `Projected` is separate from `Applied`
 * because it passes through the dimension's engine value map.
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
 * `Allowed` is optional so the samples cover both a provider that declares
 * a set and one that says nothing and is therefore not consulted.
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
 * Taken from the registry, and a function rather than a
 * constant because the registry is populated at import time.
 */
const MovedDimension = (): string => AllDimensions()[0].Id

describe('control state derives from the Coordinator, not from the item', () => {
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

                    bids.forEach((bid, index) => {
                        const name = `separability-${suffix}-${index}`
                        AddRestraint({ name, template: `${name}-template`, shrine: [ControlledTag] })
                        Wear({ name, bids: [bid] })
                    })

                    RemoveEverything()

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
        // A body that is actually read, so a failure here means
        // the dossier stored something about the equipment.
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
        // Every dimension's intent, named one at a time so a failure is readable.
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
