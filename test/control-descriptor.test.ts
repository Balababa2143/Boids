/**
 * The descriptor registry's gate: the whole registry is walked with the same
 * `ValidateDescriptor` registration runs, so a descriptor missing a field cannot hide.
 */

import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
    AllDimensions,
    CanDeny,
    CanGrant,
    CapabilityKeys,
    DimensionGroups,
    Direction,
    FacetName,
    FacetNames,
    GateIntents,
    Subsystems,
    ValidateDescriptor,
} from '../src/KDExtension/Control'
import {
    AllDimensionNames,
    DimensionIdOf,
    DimensionName,
    DimensionNamesBySubsystem,
} from '../src/FactionMachine/MachinePrime/Coordinator/Catalog'

/** The registry, read once: it is populated at import time and never changes afterwards. */
const Dimensions = AllDimensions()

describe('the dimension catalogue', () => {
    it('registers every declared name exactly once', () => {
        const registered = new Set(Dimensions.map(descriptor => descriptor.Id))
        const missing = AllDimensionNames
            .map(name => ({ name, id: DimensionIdOf(name) }))
            .filter(entry => !registered.has(entry.id))

        assert.deepEqual(
            missing.map(entry => entry.name),
            [],
            'a dimension is declared by name but has no descriptor, so the router would resolve it ' +
            'with no facets at all'
        )
        assert.equal(registered.size, Dimensions.length, 'two descriptors share an id')
    })

    it('registers no dimension the name table does not declare', () => {
        const declared = new Set(AllDimensionNames.map(DimensionIdOf))
        const extra = Dimensions.filter(descriptor => !declared.has(descriptor.Id))

        assert.deepEqual(
            extra.map(descriptor => descriptor.Id),
            [],
            'a descriptor is registered under an id no declared name derives, so nothing can name it'
        )
    })

    it('places every dimension in the subsystem the name table lists it under', () => {
        for (const subsystem of Subsystems) {
            for (const name of DimensionNamesBySubsystem[subsystem]) {
                const descriptor = Dimensions.find(candidate => candidate.Id === DimensionIdOf(name))
                assert.notEqual(descriptor, undefined, `${name} is listed under ${subsystem} but not registered`)
                assert.equal(
                    descriptor?.Subsystem,
                    subsystem,
                    `${name} is listed under ${subsystem} but its descriptor claims ${descriptor?.Subsystem}`
                )
            }
        }
    })
})

describe('every descriptor carries every field a dimension needs', () => {
    it('passes the validator registration runs', () => {
        for (const descriptor of Dimensions) {
            ValidateDescriptor(descriptor)
        }
    })

    it('composes at least one facet and only known ones', () => {
        for (const descriptor of Dimensions) {
            assert.ok(
                descriptor.Facets.size > 0,
                `${descriptor.Id} composes no facet, so it has no semantics to constrain`
            )
            for (const facet of descriptor.Facets) {
                assert.ok(FacetNames.includes(facet), `${descriptor.Id} composes the unknown facet '${facet}'`)
            }
        }
    })

    it('names a group and a subsystem from the closed sets', () => {
        for (const descriptor of Dimensions) {
            assert.ok(
                DimensionGroups.includes(descriptor.Group),
                `${descriptor.Id} has the unknown group '${descriptor.Group}'`
            )
            assert.ok(
                Subsystems.includes(descriptor.Subsystem),
                `${descriptor.Id} has the unknown subsystem '${descriptor.Subsystem}'`
            )
        }
    })

    it('names at least one seam, with a trigger and a handler', () => {
        for (const descriptor of Dimensions) {
            assert.ok(
                descriptor.Seams.length > 0,
                `${descriptor.Id} names no seam, so nothing can tell whether it is implemented`
            )
            for (const seam of descriptor.Seams) {
                assert.ok(seam.Trigger.length > 0, `${descriptor.Id} has a seam with no trigger`)
                assert.ok(seam.Handler.length > 0, `${descriptor.Id} has a seam on '${seam.Trigger}' with no handler`)
                assert.equal(typeof seam.Verified, 'boolean', `${descriptor.Id} does not say whether its seam is verified`)
                assert.equal(typeof seam.Order, 'number', `${descriptor.Id} does not give its seam an order`)
            }
        }
    })

    it('is truthful about which seams have been read out of the engine', () => {
        // Marking an unread seam as verified turns a note into a load-bearing assumption.
        const sight = Dimensions.find(descriptor => descriptor.Id === DimensionIdOf(DimensionName.Sight))
        assert.notEqual(sight, undefined, 'the Sight dimension is gone')

        const calcBlind = sight?.Seams.find(seam => seam.Trigger === 'calcBlind')
        assert.notEqual(calcBlind, undefined, 'Sight no longer names the calcBlind seam it is built on')
        assert.equal(calcBlind?.Verified, true, 'the seam that has been read is no longer marked verified')

        const unverified = Dimensions.flatMap(descriptor =>
            descriptor.Seams.filter(seam => !seam.Verified).map(seam => `${descriptor.Id}:${seam.Trigger}`)
        )
        assert.ok(
            unverified.length > 0,
            'every seam is marked verified, which would mean the whole catalogue was read out of the ' +
            'engine — the Stats dimensions and most of Behavior have not been'
        )
    })
})

describe('facets agree with the direction', () => {
    it('gives a whitelist only to a dimension that can grant', () => {
        for (const descriptor of Dimensions) {
            if (descriptor.Facets.has(FacetName.Whitelist)) {
                assert.ok(
                    CanGrant(descriptor.Direction),
                    `${descriptor.Id} composes a whitelist but is ${descriptor.Direction}-only`
                )
            }
        }
    })

    it('gives a buff side only to a dimension that can grant', () => {
        for (const descriptor of Dimensions) {
            if (descriptor.BuffSide) {
                assert.ok(
                    CanGrant(descriptor.Direction),
                    `${descriptor.Id} claims a buff side but is ${descriptor.Direction}-only`
                )
            }
        }
    })

    it('records a direction from the closed set', () => {
        const directions: readonly Direction[] = [Direction.Deny, Direction.Grant, Direction.Both]
        for (const descriptor of Dimensions) {
            assert.ok(
                directions.includes(descriptor.Direction),
                `${descriptor.Id} has the unknown direction '${descriptor.Direction}'`
            )
        }
    })

    it('reaches every combination of can-deny and can-grant the catalogue claims', () => {
        for (const descriptor of Dimensions) {
            const deny = CanDeny(descriptor.Direction)
            const grant = CanGrant(descriptor.Direction)
            assert.equal(
                deny || grant,
                true,
                `${descriptor.Id} can neither deny nor grant, so no intent could ever engage it`
            )
            assert.equal(
                descriptor.Direction,
                deny && grant ? Direction.Both : deny ? Direction.Deny : Direction.Grant,
                `${descriptor.Id}'s direction and its predicates disagree`
            )
        }
    })
})

describe('the capability union', () => {
    it('is exactly as large as the list of dimensions that could grant a key', () => {
        // `CapabilityKey` is `never`, so there is no key a caller could grant.
        assert.equal(CapabilityKeys.size, 0, 'a capability key is declared, and this build declares none')
    })

    it('offers a gate value set nobody can leave by accident', () => {
        // The three values key the persisted map, so a fourth would be an unreadable save.
        for (const intent of GateIntents) {
            assert.equal(typeof intent, 'string', 'a gate value is not a string, so it cannot key a save')
        }
        assert.deepEqual(
            [...new Set(GateIntents)].sort(),
            [...GateIntents].sort(),
            'the gate values carry a duplicate, so the persisted map would be ambiguous'
        )
    })
})
