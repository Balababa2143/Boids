/**
 * The restraint contract, as a gate: membership is the `shrine` tag
 * and nothing else, and the equipment group is never entered into the
 * controller's state. The harness follows the variant indirection.
 */

import assert from 'node:assert/strict'
import fc from 'fast-check'
import { describe, it } from 'node:test'

import { AllDimensions, ArmPoseLadder } from '../src/KDExtension/Control'
import { AppearanceKey, FindProviders, IsControlled, IsControlledTemplate, ControlledTag } from '../src/FactionMachine/MachinePrime/Coordinator/Membership'
import { DimensionIdOf, DimensionName } from '../src/FactionMachine/MachinePrime/Coordinator/Catalog'
import { GetState } from '../src/FactionMachine/MachinePrime/Coordinator/Internal/StateStorage'
import { Resolve } from '../src/FactionMachine/MachinePrime/Coordinator/Public/Control'
import { AddRestraint, RemoveEverything, ResetWorld, SeedDossier, Wear } from './harness/equipment'
import { GetRecorder } from './harness/recorder'

const Sight = DimensionIdOf(DimensionName.Sight)
const Speech = DimensionIdOf(DimensionName.Speech)
const PoseArms = DimensionIdOf(DimensionName.PoseArms)
const PoseLegs = DimensionIdOf(DimensionName.PoseLegs)
const WeaponUse = DimensionIdOf(DimensionName.WeaponUse)

/** The whole dossier, as one comparable value, so a change anywhere in it is one assertion. */
const DossierSnapshot = (): string => JSON.stringify(GetState().ActivePC.Control.toJS())

/**
 * One sampled bid: a registered dimension at an arbitrary power.
 *
 * Floats in 0..1 because that is the range the applied severity is defined over.
 */
const BidArbitrary = fc
    .constantFrom(...AllDimensions().map(descriptor => descriptor.Id))
    .chain(dimension => fc.float({ min: 0, max: 1, noNaN: true }).map(power => ({
        Dimension: dimension,
        Power: power,
        LoserExpresses: true,
    })))

describe('membership is the shrine tag and nothing else', () => {
    it('reads a template that carries the tag as controlled', () => {
        ResetWorld()
        const template = AddRestraint({
            name: 'controlled-variant',
            template: 'controlled-template',
            shrine: ['Metal', ControlledTag],
        })

        assert.equal(IsControlledTemplate(template), true)
    })

    it('reads a template that does not carry the tag as the game\'s own', () => {
        // A membership test that leaked would have the controller computing capability from a rope.
        ResetWorld()
        const template = AddRestraint({
            name: 'game-variant',
            template: 'game-template',
            shrine: ['Rope', 'Gags'],
        })

        assert.equal(IsControlledTemplate(template), false)
    })

    it('resolves a worn item through its variant to the template the tag is on', () => {
        // The item's own name is not a registered restraint,
        // so a lookup that read it would find nothing.
        ResetWorld()
        AddRestraint({
            name: 'visor-variant',
            template: 'glass-template',
            shrine: [ControlledTag],
        })
        const worn = Wear({ name: 'visor-variant' })

        assert.equal(IsControlled(worn), true)
        assert.equal(
            GetRecorder().globals.KinkyDungeonRestraints.find(r => r.name === 'visor-variant'),
            undefined,
            'the item name is a registered restraint, so this case does not exercise the indirection'
        )
    })

    it('finds no provider on an item that is not controlled', () => {
        ResetWorld()
        AddRestraint({
            name: 'not-ours-variant',
            template: 'not-ours-template',
            shrine: ['Rope'],
        })
        Wear({
            name: 'not-ours-variant',
            bids: [{ Dimension: Sight, Power: 1, LoserExpresses: true }],
        })

        assert.deepEqual(
            [...FindProviders()],
            [],
            'an item the mod does not own was read as a provider, which would have the controller ' +
            'computing capability from the base game\'s equipment'
        )
    })

    it('finds no provider on a controlled item that declares nothing', () => {
        // An item can be ours with no opinion about the
        // control model: controlled, and not a provider.
        ResetWorld()
        AddRestraint({
            name: 'quiet-variant',
            template: 'quiet-template',
            shrine: [ControlledTag],
        })
        Wear({ name: 'quiet-variant' })

        assert.deepEqual([...FindProviders()], [])
    })

    it('ignores a malformed declaration rather than answering with a NaN', () => {
        // `item.data` is shared with the game and every other
        // mod, so a declaration is checked rather than cast.
        ResetWorld()
        AddRestraint({
            name: 'bad-variant',
            template: 'bad-template',
            shrine: [ControlledTag],
        })
        Wear({
            name: 'bad-variant',
            rawBids: [
                { Dimension: Sight, Power: 'lots', LoserExpresses: true },
                { Dimension: Sight },
                null,
            ],
        })

        assert.deepEqual([...FindProviders()], [], 'a malformed declaration became a provider')
    })

    it('degrades a malformed optional statement without taking the bid with it', () => {
        // Dropping the whole declaration would take a working constraint away with it. `Stack`
        // falls back to `Max`; `Allowed` falls back to saying nothing rather than permitting none.
        ResetWorld()
        AddRestraint({ name: 'odd-variant', template: 'odd-template', shrine: [ControlledTag] })
        Wear({
            name: 'odd-variant',
            rawBids: [
                { Dimension: Sight, Power: 0.5, Stack: 'Count', LoserExpresses: true },
                { Dimension: PoseArms, Power: 1, Allowed: 'Free', LoserExpresses: true },
                { Dimension: PoseLegs, Power: 1, Allowed: ['Sulking'], LoserExpresses: true },
            ],
        })

        const providers = FindProviders()
        assert.equal(providers.length, 3, 'a malformed optional field took the bid away with it')
        assert.equal(providers[0].Stack, 'Max', 'an unreadable mode falls back to the default')
        assert.equal(providers[0].Power, 0.5, 'and the power survives')
        assert.equal(providers[1].Allowed, undefined, 'an unreadable set reads as saying nothing')
        assert.equal(providers[1].Power, 1)
        assert.equal(providers[2].Allowed, undefined, 'and a set of values this build does not know reads the same way')

        // A dimension nothing speaks about rests on its ladder
        // rather than being emptied by an unreadable declaration.
        assert.deepEqual([...(Resolve(PoseArms).PostureCeiling ?? [])], [...ArmPoseLadder])
    })

    it('reports the item a bid came from, so a console reader can name it', () => {
        ResetWorld()
        AddRestraint({
            name: 'named-variant',
            template: 'named-template',
            shrine: [ControlledTag],
        })
        Wear({
            name: 'named-variant',
            bids: [{ Dimension: Sight, Power: 0.75, LoserExpresses: false }],
        })

        const providers = FindProviders()
        assert.equal(providers.length, 1)
        assert.equal(providers[0].Dimension, Sight)
        assert.equal(providers[0].Power, 0.75)
        assert.equal(providers[0].Source, 'named-variant')
    })

    it('drops a granted key this build cannot keep, and keeps the bid', () => {
        // With the closed union empty, every non-empty value
        // is dropped and the bid's power and stacking survive.
        ResetWorld()
        AddRestraint({ name: 'grant-variant', template: 'grant-template', shrine: [ControlledTag] })
        Wear({
            name: 'grant-variant',
            rawBids: [{
                Dimension: WeaponUse,
                Power: 1,
                Stack: 'Max',
                Granted: ['WeaponHold'],
                LoserExpresses: true,
            }],
        })

        const providers = FindProviders()
        assert.equal(providers.length, 1, 'a grant this build cannot keep took the bid away with it')
        assert.equal(providers[0].Granted, undefined, 'an unkeepable grant is not a statement the bid can make')
        assert.deepEqual(
            [...(Resolve(WeaponUse).Granted ?? [])],
            [],
            'a key outside the closed union reached the resolution'
        )
    })
})

describe('the capability is computed from what is worn, never cached', () => {
    it('answers the baseline once the last covering item leaves the body', () => {
        // The item leaves, the dimension has no provider, and the
        // resolution is the baseline with nothing to invalidate.
        ResetWorld()
        AddRestraint({
            name: 'only-provider',
            template: 'only-provider-template',
            shrine: [ControlledTag],
        })
        Wear({
            name: 'only-provider',
            bids: [{ Dimension: Sight, Power: 0.9, LoserExpresses: true }],
        })
        SeedDossier()

        const wearing = Resolve(Sight)
        assert.equal(wearing.Engaged, undefined, 'a rate dimension has no gate to engage')
        // `SeedDossier` demands the strongest legal rate;
        // the worn item's bid bounds the applied severity.
        assert.equal(wearing.Demand, 1)
        assert.equal(wearing.Ceiling, 0.9)
        assert.equal(wearing.Applied, 0.9, 'the bid bounds the demand')
        assert.equal(wearing.Winner?.Source, 'only-provider')

        RemoveEverything()

        const bare = Resolve(Sight)
        assert.equal(bare.Demand, 1, 'the Host is still demanding it')
        assert.equal(bare.Applied, 0, 'a demand outlives the item, and applies nothing until gear can honour it')
        assert.equal(bare.Ceiling, 0, 'the equipment ceiling survived the item that provided it')
        assert.equal(bare.Winner, null, 'a provider that is not on the body won a bid')
        assert.deepEqual([...FindProviders()], [])
    })

    it('reads the body again on every call rather than remembering the last answer', () => {
        // The difference between computed at execution time and
        // computed once: a cache would answer the same twice.
        ResetWorld()
        AddRestraint({ name: 'late', template: 'late-template', shrine: [ControlledTag] })
        SeedDossier()

        assert.equal(Resolve(Sight).Ceiling, 0, 'a dimension answered with a bid nothing had made')

        Wear({ name: 'late', bids: [{ Dimension: Sight, Power: 0.4, LoserExpresses: true }] })
        assert.equal(Resolve(Sight).Ceiling, 0.4, 'a newly worn item did not change the answer')

        Wear({ name: 'late-again', bids: [{ Dimension: Sight, Power: 0.8, LoserExpresses: true }] })
        AddRestraint({ name: 'late-again', template: 'late-again-template', shrine: [ControlledTag] })
        assert.equal(Resolve(Sight).Ceiling, 0.8, 'a second provider did not change the answer')
    })

    it('separates what an item moves from what it looks like', () => {
        // The bid and the appearance are two declarations of the same item,
        // so deriving one from the other fails a case. There is no cosmetic
        // demand to compare against: the Host has no cosmetic lever.
        ResetWorld()
        AddRestraint({ name: 'strict-and-small', template: 'strict-and-small-template', shrine: [ControlledTag] })
        const small = Wear({
            name: 'strict-and-small',
            bids: [{ Dimension: Speech, Power: 1, LoserExpresses: true }],
        })
        small.data![AppearanceKey] = 0.1

        const strict = Resolve(Speech)
        assert.equal(strict.Ceiling, 1, 'the muffler is as strict as the dimension admits')
        assert.equal(small.data![AppearanceKey], 0.1, 'and what it looks like is its own declaration')

        RemoveEverything()
        ResetWorld()
        AddRestraint({ name: 'lax-and-large', template: 'lax-and-large-template', shrine: [ControlledTag] })
        const large = Wear({
            name: 'lax-and-large',
            bids: [{ Dimension: Speech, Power: 0.1, LoserExpresses: true }],
        })
        large.data![AppearanceKey] = 1

        const lax = Resolve(Speech)
        assert.equal(lax.Ceiling, 0.1, 'the muffler barely restricts')
        assert.equal(large.data![AppearanceKey], 1, 'and it is drawn as large as the family can draw it')
    })

    it('takes a posture provider\'s set through the whole worn-set walk', () => {
        // Intersection rather than power, so the contract reaches a set as readily as a number.
        ResetWorld()
        const ladder = [...ArmPoseLadder]
        AddRestraint({ name: 'arm-a', template: 'arm-a-template', shrine: [ControlledTag] })
        Wear({
            name: 'arm-a',
            bids: [{ Dimension: PoseArms, Power: 1, Allowed: [ladder[0], ladder[1]], LoserExpresses: true }],
        })
        AddRestraint({ name: 'arm-b', template: 'arm-b-template', shrine: [ControlledTag] })
        Wear({
            name: 'arm-b',
            bids: [{ Dimension: PoseArms, Power: 1, Allowed: [ladder[1]], LoserExpresses: true }],
        })

        const resolved = Resolve(PoseArms)
        assert.deepEqual(
            [...(resolved.PostureCeiling ?? [])],
            [ladder[1]],
            'two items that disagree about a pose leave only what both can deliver'
        )
        RemoveEverything()
        assert.deepEqual(
            [...(Resolve(PoseArms).PostureCeiling ?? [])],
            ladder,
            'and taking them off releases the whole ladder rather than restoring it'
        )
    })

    it('leaves the dossier untouched when equipment comes off', () => {
        // Removing a piece must release an override, never restore a value the removal destroyed.
        ResetWorld()
        AddRestraint({ name: 'belt', template: 'belt-template', shrine: [ControlledTag] })
        Wear({ name: 'belt', bids: [{ Dimension: Sight, Power: 0.6, LoserExpresses: true }] })
        SeedDossier()

        const before = DossierSnapshot()
        const whileWorn = Resolve(Sight)
        assert.equal(
            whileWorn.Ceiling,
            0.6,
            'the case is vacuous unless the equipment was doing something'
        )
        assert.equal(whileWorn.Applied, 0.6, 'the demand is clamped to the bid')

        RemoveEverything()

        assert.equal(
            DossierSnapshot(),
            before,
            'removing equipment changed the dossier, so something about the equipment was stored in it'
        )
    })

    it('holds that property over arbitrary equipment', () => {
        // A statement about every worn set, not about the one a hand-written case happens to build.
        fc.assert(
            fc.property(
                fc.array(BidArbitrary, { maxLength: 4 }),
                fc.string({ minLength: 1, maxLength: 6 }),
                (bids, suffix) => {
                    ResetWorld()
                    const name = `arbitrary-${suffix}`
                    AddRestraint({ name, template: `${name}-template`, shrine: [ControlledTag] })
                    Wear({ name, bids })
                    SeedDossier()

                    const before = DossierSnapshot()

                    // Touch every dimension while the gear is
                    // on, so a cache would have something in it.
                    for (const descriptor of AllDimensions()) {
                        Resolve(descriptor.Id)
                    }

                    RemoveEverything()

                    for (const descriptor of AllDimensions()) {
                        const resolution = Resolve(descriptor.Id)
                        // `?? 0` because a dimension with no `Rate`
                        // reports no ceiling, and absence means zero here.
                        assert.equal(
                            resolution.Ceiling ?? 0,
                            0,
                            'a ceiling survived the items that offered it'
                        )
                        assert.equal(resolution.Winner, null, 'a provider that is not worn won a bid')
                    }
                    assert.equal(
                        DossierSnapshot(),
                        before,
                        'the dossier moved when equipment came off'
                    )
                }
            )
        )
    })
})
