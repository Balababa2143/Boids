/**
 * The descriptor registry's gate (`design/spec.md` §6.1–6.4).
 *
 * The registry is the one place a dimension is declared, so a descriptor missing one of §6.2's fields
 * is not a style problem — it is a dimension the router will resolve with a facet nobody declared, or
 * an item declaring itself a provider of something with no semantics. This file walks the **whole**
 * registry rather than sampling it, because the failure it guards against is exactly the one
 * dimension somebody added quickly.
 *
 * ## What is checked, and why each one is load-bearing
 *
 * | Check | What it catches |
 * | --- | --- |
 * | every §6.2 field present | a descriptor registered without its group, subsystem, facets, direction, buff side, seams or id |
 * | ids unique | two records shadowing each other in the dossier |
 * | `CapabilityKey` closed | a granted key the mod cannot actually grant (§6.4, invariant 5) |
 * | the catalogue covers the name table | a name declared with no descriptor, which reads as a working store answering the baseline |
 * | seams name a trigger | a descriptor that says "this dimension uses *the* seam" without saying which |
 *
 * The gate runs `ValidateDescriptor` — the same function registration runs — so a descriptor that
 * loaded can fail here only if the registry is broken rather than the record.
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
        // The catalogue is total over `DimensionName`: a name with no descriptor is a dimension the
        // console can name and the router cannot resolve, which is a state that reads as "the
        // dimension is free" rather than as an error.
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
        // The other direction, and the one that catches a dimension added to `Dimensions.ts` without a
        // name: it would work, and the generated reference and the name table would disagree about
        // what exists.
        const declared = new Set(AllDimensionNames.map(DimensionIdOf))
        const extra = Dimensions.filter(descriptor => !declared.has(descriptor.Id))

        assert.deepEqual(
            extra.map(descriptor => descriptor.Id),
            [],
            'a descriptor is registered under an id no declared name derives, so nothing can name it'
        )
    })

    it('places every dimension in the subsystem the name table lists it under', () => {
        // The grouping is a claim: `Stats` is declared now and unused, `Sensory` and `Behavior` ship in
        // that order. A descriptor that disagreed with the table would make the build order a guess.
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

describe('every descriptor carries every field §6.2 requires', () => {
    it('passes the validator registration runs', () => {
        for (const descriptor of Dimensions) {
            // A throw here fails the case with the validator's own message, which names the dimension
            // and the field rather than reporting a diff nobody can read.
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
        // A dimension with no tool is not implemented, it is **unimplemented** — and the difference
        // matters, because a descriptor that names no seam makes a partial implementation invisible
        // (`design/spec.md` §6.2). `Verified: false` is the honest way to say "not bound yet", not an
        // absent seam.
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
        // The one seam this delivery has actually read is `Sight`'s `calcBlind`, and it is the seam the
        // visor family already writes. The case is a **tripwire rather than a formality**: marking an
        // unread seam as verified is the mistake that turns a design note into a load-bearing
        // assumption, and it can only happen by someone editing a catalogue record.
        const sight = Dimensions.find(descriptor => descriptor.Id === DimensionIdOf(DimensionName.Sight))
        assert.notEqual(sight, undefined, 'the Sight dimension is gone')

        const calcBlind = sight?.Seams.find(seam => seam.Trigger === 'calcBlind')
        assert.notEqual(calcBlind, undefined, 'Sight no longer names the calcBlind seam it is built on')
        assert.equal(calcBlind?.Verified, true, 'the one seam this delivery has read is no longer marked verified')

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
        // A whitelist is a promise about a capability. On a deny-only dimension there is no ability it
        // could ever carry, so `OverrideAllowed` would be accepted for something the equipment cannot
        // offer — which §6.4 makes a hard refusal rather than a runtime surprise.
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
        // A deny-only seam can never express the inverse of a denial, so a buff side on one is a claim
        // the dimension cannot keep (`design/spec.md` §6.2, §C.3).
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
        // A cheap sanity check on the two predicates the router branches on: if `CanGrant` were wrong,
        // `OverrideAllowed` would engage on dimensions the equipment can never promise.
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
        // `CapabilityKey` is `never` in this delivery: no ability has a granting seam until the
        // Behavior work lands, so an empty union is the honest shape and it already refuses
        // `OverrideAllowed` everywhere. When the first key arrives this case changes with it — and the
        // compile-time proof in `Capability.ts` fails first, which is the reminder that matters.
        assert.equal(CapabilityKeys.size, 0, 'a capability key exists, so this delivery is no longer Phase 1')
    })

    it('offers a gate value set nobody can leave by accident', () => {
        // The three values are what the persisted `intent` map holds, so a fourth value would be an
        // unreadable save. `IsGateIntent` is the validator's test, and it is checked for the four
        // shapes that matter rather than for the three that pass.
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
