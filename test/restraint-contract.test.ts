/**
 * The restraint contract, as a gate (`design/spec.md` §6.12).
 *
 * The contract has five clauses, and this file tests the two that the mechanism can actually be held
 * to in an automated way:
 *
 * 1. **Membership is the `shrine` tag**, and nothing else — so an item the game owns is invisible to
 *    the control model however much it constrains, and an item of ours is visible by carrying one
 *    string.
 * 4. **The equipment group is never entered into the controller's state** — so the per-facet **Free
 *    state** falls out rather than being tracked, and there is no cached capability to invalidate.
 *
 * Clauses 2, 3 and 5 are covered elsewhere: 2 (registration) is gone with the registered-item set, 3
 * (instantiation) is the game's own behaviour, and 5 (the item never calls the controller) is a
 * property of the module graph that `layering.test.ts` and review hold.
 *
 * ## The harness, and the one thing it has to get right
 *
 * `FindProviders` asks the game what is **on the body** (`KinkyDungeonAllRestraintDynamic`) and
 * resolves each item's template through `KDRestraint`, which is **variant-aware**. The harness stubs
 * both and follows the variant indirection — `test/harness/equipment.ts` is where a case builds a body
 * — so a test's worn item is a variant pointing at a template, exactly as the mod's own items are. A
 * stub that read the item's own name would find no template and report every provider missing, which
 * would make membership look broken when it is not.
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
 * Floats in 0..1 because that is the range the applied severity is defined over — a value outside it
 * is clamped rather than leaked, which `control-router.test.ts` states as its own case.
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
        // The half that matters more: the base game's restraints are hundreds of items that constrain
        // the player in every way this mod cares about, and **none** of them is a participant. A
        // membership test that leaked would have the controller computing capability from a rope.
        ResetWorld()
        const template = AddRestraint({
            name: 'game-variant',
            template: 'game-template',
            shrine: ['Rope', 'Gags'],
        })

        assert.equal(IsControlledTemplate(template), false)
    })

    it('resolves a worn item through its variant to the template the tag is on', () => {
        // The variant indirection, stated as its own case: the item's own name is not a registered
        // restraint, so a lookup that read it would find nothing.
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
        // An item can be ours and have no opinion about the control model — a collar that is part of
        // the set but moves no dimension. It is controlled, and it is not a provider.
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
        // `item.data` is a namespace shared with the game and every other mod, so a declaration is
        // checked rather than cast. A `Power` of `'lots'` must make the item stop being a provider,
        // not make the dimension's ceiling `NaN` — which is a value nothing downstream survives.
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
        // The two optional axes are the two statements a family may reasonably leave out, so a value
        // this build cannot read costs the item that statement and **not** the bid: dropping the
        // whole declaration would take a working constraint away with it, which is the failure this
        // boundary exists to prevent rather than to cause.
        //
        // `Stack` falls back to `Max` — what a family that never thought about stacking means — and
        // `Allowed` falls back to *says nothing about body configurations* rather than *permits none
        // of them*, which is the reading that would empty the ladder.
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

        // The consequence, stated where it is visible: a dimension nothing speaks about rests on its
        // ladder rather than being emptied by a declaration nobody could read.
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
        // `Granted` is a statement only when the key is in the closed union. With the union empty in
        // Phase 1 every non-empty value is dropped, and the bid's power and stacking survive.
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
        // Clauses 1 and 4 together, and the per-facet **Free state** falling out (§6.10): the item
        // leaves, the dimension simply has no provider, and the resolution is the baseline — with no
        // bookkeeping to notice and no cached value to invalidate.
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
        // `SeedDossier` demands the strongest legal rate of every dimension, and the worn item's bid is
        // what bounds it. The demand is still 1; the applied severity is the capability.
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
        // The concrete difference between "computed at execution time" and "computed once". An
        // implementation that cached would answer the same thing twice here.
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
        // **The arrangement the base game cannot express**, stated against a real worn body rather than
        // against hand-made bids: one muffler that is as strict as it can be while the model it draws is
        // a small ball, and its opposite. The bid and the appearance are two declarations of the same
        // item, so a mechanism that derived either from the other would fail one of these two cases.
        //
        // The appearance is declared on the item and read back off the item, which is why this case is
        // about the **item's own data** rather than about the resolution: there is no cosmetic demand to
        // compare against, because the Host has no cosmetic lever at all (§6.1).
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
        // The posture dimension's bids are read off the same body through the same declaration, and they
        // combine by **intersection** rather than by power (§6.7) — so this is the case that says the
        // contract's clause 2 reaches a set as readily as it reaches a number.
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
        // **Invariant 12's separability, at the level the mechanism can be held to.** Removing a piece
        // must *release* an override, never *restore* a value the removal destroyed — so nothing that
        // belongs to the Host may live on the item. The dossier is the proof: it is identical before
        // and after the body is emptied, field for field, because the equipment never wrote to it.
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
        // The same case as a property, because "nothing about the equipment is in the dossier" is a
        // statement about **every** worn set rather than about the one a hand-written case happens to
        // build. Each sample is a body of up to four items bidding arbitrary powers on arbitrary
        // dimensions.
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

                    // Touch every dimension while the gear is on, so a cache would have something in it.
                    for (const descriptor of AllDimensions()) {
                        Resolve(descriptor.Id)
                    }

                    RemoveEverything()

                    for (const descriptor of AllDimensions()) {
                        const resolution = Resolve(descriptor.Id)
                        // `?? 0` because a dimension that composes no `Rate` reports no ceiling at all —
                        // the absence of a facet and a capability of zero mean the same thing to a caller
                        // asking what the worn set can impose.
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
