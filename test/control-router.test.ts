/**
 * The router and the write validators (`design/spec.md` §6.4, §6.6, §6.7).
 *
 * Two things are under test and they are deliberately separate:
 *
 * - **Resolution**, which is pure: given a dossier and a list of bids it answers with the applied
 *   severity, the gate, the winning bid and the losers. Nothing here reads the game.
 * - **Validation**, which is a rule about a *write*: it rejects rather than storing, so the failure
 *   reaches the caller who can act on it instead of showing up later as gameplay that does not respond.
 *
 * ## Why the *shape* of a demand is the first thing tested
 *
 * A dimension's demand is **a record composed of its facets' parameters** (§6.5), and the correction
 * that produced this file's rewrite is that writing it as a bare `GateIntent` **collapsed a rate
 * dimension's demand onto a gate's vocabulary** — `Sight` could be `Free` or forbidden and nothing in
 * between, so *"the Host squeezes sight to 0.4"* had no representation at all. The cases below are
 * therefore written in terms of records, and the first rule they pin is §6.6's **(shape)**: a parameter
 * the dimension does not take is refused rather than stored and ignored.
 */

import assert from 'node:assert/strict'
import fc from 'fast-check'
import { Map as IMMap } from 'immutable'
import { describe, it } from 'node:test'

import {
    AllDimensions,
    ArmPoseLadder,
    BodyStateName,
    ControlState,
    DimensionResolution,
    FacetName,
    GateIntent,
    GetDimension,
    GetGateIntent,
    GetPostureDemand,
    GetTargetDemand,
    HasDimension,
    IntentParameterNames,
    IntentRecord,
    LegPoseLadder,
    ProviderBid,
    PoseKey,
    PoseKeys,
    SeamKind,
    StackMode,
    ToIntent,
    ReadIntent,
    Resolve,
    TakesIntentParameter,
    ValidateConfigWrite,
    ValidateDescriptor,
    ValidateIntentWrite,
    WithIntent,
    WriteOutcome,
} from '../src/KDExtension/Control'
import { DimensionIdOf, DimensionName } from '../src/FactionMachine/MachinePrime/Coordinator/Catalog'

const Sight = DimensionIdOf(DimensionName.Sight)
const Struggle = DimensionIdOf(DimensionName.Struggle)
const Speech = DimensionIdOf(DimensionName.Speech)
const Movement = DimensionIdOf(DimensionName.Movement)
const WeaponUse = DimensionIdOf(DimensionName.WeaponUse)
const Escape = DimensionIdOf(DimensionName.Escape)
const PoseArms = DimensionIdOf(DimensionName.PoseArms)
const PoseLegs = DimensionIdOf(DimensionName.PoseLegs)

/**
 * The dimensions that compose a `Gate`, as an arbitrary.
 *
 * A property about a permission is stated over the dimensions that **have** one, because for the rest a
 * permission is not a weaker demand — it is a write the shape rule refuses.
 *
 * The registry is read **when the arbitrary is sampled**, not when this module is evaluated: an import
 * order that reached this file before the catalogue would otherwise build an arbitrary over nothing,
 * and `fast-check` throws for an empty `constantFrom`.
 */
const GateDimensionArbitrary = fc
    .constant(null)
    .chain(() => fc.constantFrom(
        ...AllDimensions()
            .filter(descriptor => descriptor.Facets.has(FacetName.Gate))
            .map(descriptor => descriptor.Id)
    ))

/** A dossier recording one demand. */
const Dossier = (dimension: string, intent: IntentRecord): ControlState =>
    ControlState({ intent: IMMap([[dimension, ToIntent(intent)]]) })

/** A bid from a named item. */
const Bid = (
    dimension: string,
    power: number,
    loserExpresses = false,
    extra: { readonly Stack?: StackMode, readonly Allowed?: readonly PoseKey[] } = {}
): ProviderBid => ({
    Dimension: dimension,
    Power: power,
    Stack: extra.Stack ?? StackMode.Max,
    Allowed: extra.Allowed,
    LoserExpresses: loserExpresses,
    Source: `item-${power}`,
})

/** What a refusal says, for an assertion that names the rule. */
const RefusalOf = (outcome: WriteOutcome): string => {
    assert.equal(outcome.kind, 'refused', `expected a refusal and got ${JSON.stringify(outcome)}`)
    return outcome.kind === 'refused' ? outcome.Rule : 'accepted'
}

describe('the router resolves one dimension', () => {
    it('injects nothing when the Host has asked for nothing', () => {
        // The restraint template's own defaults are the floor and the controller adds on top of them
        // rather than replacing them. For a rate dimension "nothing asked" is the **absence of a
        // demand**, which is not the same statement as a demand of 0 — so `Demand` is reported only when
        // the Host actually asked.
        const resolution = Resolve(Sight, ControlState(), [Bid(Sight, 0.5)])

        assert.equal(resolution.Demand, undefined)
        // The equipment's contribution is still *reported*, and it does apply: an item that constrains is
        // constraining, whether or not the Host is interested.
        assert.equal(resolution.Ceiling, 0.5)
        assert.equal(resolution.Applied, 0.5, 'the gear imposes its own capability with nothing demanded')
        assert.equal(resolution.Winner?.Source, 'item-0.5')
        // And a rate dimension has no gate at all, because it composes no `Gate`.
        assert.equal(resolution.Gate, undefined)
        assert.equal(resolution.Engaged, undefined)
    })

    it('takes the stronger of the Host\'s demand and the equipment', () => {
        // Two independent reasons to impose something, so the answer is the stronger of them rather
        // than one overriding the other. That is what lets a demand recorded before the gear that can
        // honour it exists *wait*.
        const weakGear = Resolve(Sight, Dossier(Sight, { Target: 0.4 }), [Bid(Sight, 0.3)])
        assert.equal(weakGear.Demand, 0.4)
        assert.equal(weakGear.Ceiling, 0.3)
        assert.equal(weakGear.Applied, 0.4, 'the demand won, because it is the stronger of the two')

        const strongGear = Resolve(Sight, Dossier(Sight, { Target: 0.4 }), [Bid(Sight, 0.9)])
        assert.equal(strongGear.Applied, 0.9, 'the gear won, because it is the stronger of the two')
    })

    it('keeps a demand that no worn item can reach', () => {
        // The case the "stronger" rule exists for: a demand recorded before the gear exists. It is not
        // discarded, and the moment a stricter item is worn the answer rises without it being rewritten.
        const bare = Resolve(Sight, Dossier(Sight, { Target: 0.8 }), [])
        assert.equal(bare.Demand, 0.8)
        assert.equal(bare.Ceiling, 0)
        assert.equal(bare.Applied, 0.8, 'a demand with nothing worn is still a demand')

        const withGear = Resolve(Sight, Dossier(Sight, { Target: 0.8 }), [Bid(Sight, 0.2)])
        assert.equal(withGear.Applied, 0.8)
    })

    it('gives the dimension to the highest bid', () => {
        const resolution = Resolve(Sight, Dossier(Sight, { Target: 1 }), [
            Bid(Sight, 0.2),
            Bid(Sight, 0.8),
            Bid(Sight, 0.5),
        ])

        assert.equal(resolution.Ceiling, 0.8)
        assert.equal(resolution.Winner?.Power, 0.8)
    })

    it('keeps every loser, so a partial provider still has somewhere to land', () => {
        // §6.7's third rule: a losing or partial provider still changes the model, appearance or pose.
        // The router **reports** the losers rather than instructing them, because how a family expresses
        // a loss is the family's business.
        const resolution = Resolve(Sight, Dossier(Sight, { Target: 1 }), [
            Bid(Sight, 0.9, true),
            Bid(Sight, 0.4, false),
        ])

        assert.deepEqual(resolution.Losers.map(loser => loser.Power), [0.4])
        assert.equal(resolution.Losers[0].LoserExpresses, false)
        assert.equal(resolution.Winner?.LoserExpresses, true)
    })

    it('breaks a tie by the order the bids arrived in', () => {
        // Ties have to be broken by something, and enumeration order is the only thing that is stable
        // for a given worn set — so the answer is deterministic rather than arbitrary.
        const resolution = Resolve(Sight, Dossier(Sight, { Target: 1 }), [
            Bid(Sight, 0.5),
            Bid(Sight, 0.5),
        ])

        assert.equal(resolution.Winner?.Source, 'item-0.5')
        assert.equal(resolution.Losers.length, 1)
    })

    it('ignores bids aimed at another dimension', () => {
        // A caller with one worn set passes the whole list; the router reads the dimension it was asked
        // about. Refusing a foreign bid would make every call site filter, which is the sort of ceremony
        // that gets forgotten at the one call site that matters.
        const resolution = Resolve(Sight, Dossier(Sight, { Target: 1 }), [
            Bid(Struggle, 1),
            Bid(Sight, 0.4),
        ])

        assert.equal(resolution.Winner?.Dimension, Sight)
        assert.equal(resolution.Ceiling, 0.4)
    })

    it('clamps a bid outside 0..1 rather than propagating it', () => {
        // A family's power is only ever compared with another bid, so nothing stops one supplying 3 or
        // -1. The applied severity is what reaches the game, and the game's scales are 0..1.
        assert.equal(Resolve(Sight, Dossier(Sight, { Target: 0 }), [Bid(Sight, 3)]).Applied, 1)
        assert.equal(Resolve(Sight, Dossier(Sight, { Target: 0 }), [Bid(Sight, -1)]).Applied, 0)
    })

    it('reports the gate and the engagement for a gate dimension, and no rate', () => {
        // The per-facet half of the resolution: `Escape` composes `Gate` alone, so it has a `Gate` and
        // an `Engaged` and **no** `Demand`, `Applied`, `Ceiling`, `Projected` or posture fields. A
        // resolution that reported every facet for every dimension would be telling a caller about
        // facets the dimension does not have.
        const resolution = Resolve(Escape, Dossier(Escape, { Intent: GateIntent.OverrideForbidden }), [])

        assert.equal(resolution.Gate, GateIntent.OverrideForbidden)
        assert.equal(resolution.Engaged, true)
        assert.equal(resolution.Demand, undefined)
        assert.equal(resolution.Applied, undefined)
        assert.equal(resolution.Ceiling, undefined)
        assert.equal(resolution.Projected, undefined)
        assert.equal(resolution.Posture, undefined)
        assert.equal(resolution.PostureCeiling, undefined)
        assert.equal(resolution.PostureDemand, undefined)
    })

    it('reads an absent gate demand as Free', () => {
        const resolution = Resolve(Escape, ControlState(), [])
        assert.equal(resolution.Gate, GateIntent.Free)
        assert.equal(resolution.Engaged, false)
    })

    it('puts a resolved rate onto the engine\'s own scale', () => {
        // `Applied` is the model's answer and `Projected` is the game's: `Rate` is uniformly 0..1,
        // while no base-game quantity is on that scale (§6.2). `Sight` is the one dimension in the
        // catalogue whose ladder has been read — blindness is an integer capped at 7 — so it is the one
        // whose two fields differ.
        const resolution = Resolve(Sight, Dossier(Sight, { Target: 0.5 }), [])
        assert.equal(resolution.Applied, 0.5)
        assert.equal(resolution.Projected, 4, 'half of a seven-rung ladder, rounded')

        const full = Resolve(Sight, Dossier(Sight, { Target: 1 }), [])
        assert.equal(full.Projected, 7, 'and the top of the model reaches the game\'s own ceiling')

        // A dimension whose scale has not been read declares the identity, so the two agree — which is
        // a claim rather than a conversion, and the catalogue says so.
        const unconverted = Resolve(Movement, Dossier(Movement, { Target: 0.4 }), [])
        assert.equal(unconverted.Applied, 0.4)
        assert.equal(unconverted.Projected, 0.4)
    })

    it('stacks every bid on a dimension whose winning bid says to add them', () => {
        // §6.7's mode table: the base game's `gag` total is a **sum** with a saturating floor, which is
        // why two gags are worse than either alone rather than the worse of the two. The mode is the
        // winner's, so the highest bid carries the rule for the whole aggregate.
        const summed = Resolve(Speech, ControlState(), [
            Bid(Speech, 0.3, false, { Stack: StackMode.Sum }),
            Bid(Speech, 0.2, false, { Stack: StackMode.Sum }),
        ])
        assert.equal(summed.Winner?.Power, 0.3, 'the highest bid still wins')
        assert.equal(summed.Ceiling, 0.5, 'and its mode says the capability is the sum')

        assert.equal(
            Resolve(Speech, ControlState(), [
                Bid(Speech, 0.7, false, { Stack: StackMode.Sum }),
                Bid(Speech, 0.7, false, { Stack: StackMode.Sum }),
            ]).Ceiling,
            1,
            'and the aggregate is clamped to 0..1 like any other rate'
        )

        // `Sum` is also where a base-game **count** half lands, and a count is a sum in which every
        // contributor bids the same step — which is why there is no third mode. A mode that
        // aggregated the *number* of items rather than what they say would only mean anything for a
        // fixed-value restraint, and this mod builds pieces that declare a power.
        const steps = Resolve(Speech, ControlState(), [
            Bid(Speech, 0.25, false, { Stack: StackMode.Sum }),
            Bid(Speech, 0.25, false, { Stack: StackMode.Sum }),
            Bid(Speech, 0.25, false, { Stack: StackMode.Sum }),
        ])
        assert.equal(steps.Ceiling, 0.75, 'three equal steps add, and nothing about there being three matters')

        const higher = Resolve(Speech, ControlState(), [
            Bid(Speech, 0.3, false, { Stack: StackMode.Max }),
            Bid(Speech, 0.2, false, { Stack: StackMode.Max }),
        ])
        assert.equal(higher.Ceiling, 0.3, 'and the default mode is still the highest bid')
    })

    it('intersects a posture dimension\'s providers, and rests on the ladder with none', () => {
        // §6.7's posture algebra. The worn set's capability is what **all** of its providers can
        // deliver, because a pose is a sprite variable and an item that cannot deliver one may not
        // carry it at all.
        const ladder = [...ArmPoseLadder]
        const [first, second] = ladder

        const bare = Resolve(PoseArms, ControlState(), [])
        assert.deepEqual([...(bare.Posture ?? [])], ladder, 'with nothing worn the whole ladder is permitted')
        assert.deepEqual([...(bare.PostureCeiling ?? [])], ladder)

        const both = Resolve(PoseArms, ControlState(), [
            Bid(PoseArms, 1, false, { Allowed: [first, second] }),
            Bid(PoseArms, 1, false, { Allowed: [first] }),
        ])
        assert.deepEqual([...(both.PostureCeiling ?? [])], [first], 'the intersection of what all can draw')

        // A provider that says nothing about body configurations is **not** consulted, which is a
        // different statement from permitting none of them.
        const silent = Resolve(PoseArms, ControlState(), [
            Bid(PoseArms, 1, false, { Allowed: [first] }),
            Bid(PoseArms, 1),
        ])
        assert.deepEqual([...(silent.PostureCeiling ?? [])], [first], 'silence does not empty the ladder')
    })

    it('subtracts the demand where the gate forbids, adds it where the gate allows, and allows wins', () => {
        const ladder = [...ArmPoseLadder]
        const [first, second] = ladder

        const forbidden = Resolve(
            PoseArms,
            Dossier(PoseArms, { Allowed: [second], Intent: GateIntent.OverrideForbidden }),
            []
        )
        assert.deepEqual([...(forbidden.Posture ?? [])], ladder.filter(pose => pose !== second))
        assert.deepEqual([...(forbidden.PostureDemand ?? [])], [second])

        const restored = Resolve(
            PoseArms,
            Dossier(PoseArms, { Allowed: [second], Intent: GateIntent.OverrideAllowed }),
            [Bid(PoseArms, 1, false, { Allowed: [first] })]
        )
        assert.ok(restored.Posture?.has(second) === true, 'a grant is a capability and is not overridden downward')
        assert.ok(restored.Posture?.has(first) === true)

        // **Allow wins**, and the order is fixed: subtract first, then add.
        const contested = Resolve(
            PoseArms,
            Dossier(PoseArms, { Allowed: [second], Intent: GateIntent.OverrideAllowed }),
            [Bid(PoseArms, 1, false, { Allowed: [first] })]
        )
        assert.ok(contested.Posture?.has(second) === true)
    })

    it('never resolves a posture to the empty set', () => {
        // Invariant 23, as a case: the game indexes the available set at `[0]`, so an empty one hands
        // `undefined` to the renderer — and under intersection an empty set is easy to reach, since two
        // items that each deliver one pose need only disagree.
        const ladder = [...LegPoseLadder]
        const [first, second] = ladder

        const disagreed = Resolve(PoseLegs, ControlState(), [
            Bid(PoseLegs, 1, false, { Allowed: [first] }),
            Bid(PoseLegs, 1, false, { Allowed: [second] }),
        ])
        assert.equal(disagreed.PostureCeiling?.size, 0, 'the intersection really is empty')
        assert.deepEqual(
            [...(disagreed.Posture ?? [])],
            [first],
            'and the sentinel is the ladder\'s own head, which is the pose the game reaches for first'
        )

        // The demand route reaches it too: forbid every pose and the sentinel still answers.
        const emptied = Resolve(
            PoseLegs,
            Dossier(PoseLegs, { Allowed: ladder, Intent: GateIntent.OverrideForbidden }),
            []
        )
        assert.equal(emptied.Posture?.size, 1)
    })

    it('reports no posture at all for a dimension that composes none', () => {
        const resolution = Resolve(Sight, Dossier(Sight, { Target: 1 }), [Bid(Sight, 1)])
        assert.equal(resolution.Posture, undefined)
        assert.equal(resolution.PostureDemand, undefined)
        assert.equal(resolution.PostureCeiling, undefined)
    })

    it('has no gate to engage on a rate dimension', () => {
        // The router is the last line and does not depend on the validator having run: a state a write
        // could not produce still resolves per the dimension's facets rather than per the state's shape.
        const resolution: DimensionResolution = Resolve(Sight, Dossier(Sight, { Target: 1 }), [])
        assert.equal(resolution.Engaged, undefined, 'a rate dimension has no gate to engage')
        assert.equal(resolution.Gate, undefined)
    })

    it('carries every parameter for a dimension that composes several facets', () => {
        // `Struggle` composes a rate and a gate, and `PoseArms` a posture and a gate: the two shapes a
        // record has to be able to be, and the reason an intent cannot be one value.
        const resolution = Resolve(Struggle, Dossier(Struggle, {
            Target: 0.6,
            Intent: GateIntent.OverrideForbidden,
        }), [Bid(Struggle, 0.3)])

        assert.equal(resolution.Demand, 0.6)
        assert.equal(resolution.Applied, 0.6)
        assert.equal(resolution.Gate, GateIntent.OverrideForbidden)
        assert.equal(resolution.Engaged, true)

        const ladder = [...ArmPoseLadder]
        const posture = Resolve(PoseArms, Dossier(PoseArms, {
            Allowed: [ladder[0]],
            Intent: GateIntent.OverrideForbidden,
        }), [])
        assert.deepEqual([...(posture.PostureDemand ?? [])], [ladder[0]])
        assert.deepEqual(
            [...GetPostureDemand(Dossier(PoseArms, { Allowed: [ladder[0]] }), PoseArms) ?? []],
            [ladder[0]],
            'and the store reads the set back off the canonical demand'
        )
        assert.equal(posture.Gate, GateIntent.OverrideForbidden)
        assert.equal(posture.Engaged, true)
        assert.equal(posture.Applied, undefined, 'a posture has no rate to apply')
    })

    it('refuses to resolve a dimension nobody registered', () => {
        // Guessing at facets for an unknown id would invent semantics. A dossier can carry one — the
        // catalogue moved, or another release wrote it — so the refusal is a value with the id in it
        // rather than a `null` to pipe onward.
        assert.equal(HasDimension('not-a-dimension'), false)
        assert.throws(() => Resolve('not-a-dimension', ControlState(), []), /no dimension is registered/)
    })

    it('carries the dimension\'s config through to the resolution', () => {
        const config = { Types: ['Struggle'] } as const
        const state = ControlState({
            intent: IMMap([[Struggle, ToIntent({ Target: 1 })]]),
            config: IMMap([[Struggle, config]]),
        })

        const resolution: DimensionResolution = Resolve(Struggle, state, [])
        assert.deepEqual(resolution.Config, config)
    })
})

describe('the write validators refuse rather than storing', () => {
    it('accepts a rate demand for a rate dimension', () => {
        assert.equal(ValidateIntentWrite(GetDimension(Sight), { Target: 0.4 }, new Set()).kind, 'accepted')
    })

    it('accepts an empty demand, which is how a demand is removed', () => {
        // There is no separate "unset": an absent entry and an empty record are the same statement, so an
        // empty write is the way back to the baseline.
        assert.equal(ValidateIntentWrite(GetDimension(Sight), {}, new Set()).kind, 'accepted')
    })

    it('refuses a permission on a dimension that has no gate', () => {
        // §6.6's (shape) rule, and the rule an enum-typed demand could not express at all. `Sight` is a
        // rate, so a permission for it is not a weaker form of the demand — it is a different kind of
        // thing, and it is refused rather than stored and ignored.
        const outcome = ValidateIntentWrite(
            GetDimension(Sight),
            { Intent: GateIntent.OverrideForbidden },
            new Set()
        )
        assert.equal(RefusalOf(outcome), 'undeclared-parameter')
    })

    it('refuses a rate on a dimension that has no rate', () => {
        // `Escape` composes `Gate` alone, so a squeeze is not a weaker demand for it — it is a
        // parameter its facets do not take.
        const outcome = ValidateIntentWrite(GetDimension(Escape), { Target: 0.4 }, new Set())
        assert.equal(RefusalOf(outcome), 'undeclared-parameter')
    })

    it('accepts every parameter on a dimension that composes several facets', () => {
        const outcome = ValidateIntentWrite(
            GetDimension(Speech),
            { Target: 0.5, Intent: GateIntent.OverrideForbidden },
            new Set()
        )
        assert.equal(outcome.kind, 'accepted')
    })

    it('refuses a posture on a dimension that has no posture', () => {
        // A set is a facet's parameter like any other, so a dimension that composes no `Posture` is no
        // more able to carry one than a gate-only dimension is able to carry a rate.
        assert.equal(
            RefusalOf(ValidateIntentWrite(GetDimension(Speech), { Allowed: [PoseKey.Free] }, new Set())),
            'undeclared-parameter'
        )
    })

    it('accepts a posture the dimension governs and refuses one it does not', () => {
        const arms = GetDimension(PoseArms)
        assert.equal(
            ValidateIntentWrite(arms, { Allowed: [...ArmPoseLadder] }, new Set()).kind,
            'accepted'
        )
        // Duplicates collapse rather than being refused: a set is a set.
        assert.equal(
            ValidateIntentWrite(arms, { Allowed: [PoseKey.Free, PoseKey.Free] }, new Set()).kind,
            'accepted'
        )
        // A real pose that this dimension does not govern is the interesting refusal: the value is
        // meaningful and the dimension is simply not the one that owns it.
        assert.ok(
            PoseKeys.has(PoseKey.Hogtie) && !ArmPoseLadder.includes(PoseKey.Hogtie),
            'Hogtie is a pose this build knows and the arms do not govern'
        )
        assert.equal(
            RefusalOf(ValidateIntentWrite(arms, { Allowed: [PoseKey.Hogtie] }, new Set())),
            'bad-posture'
        )
        // And so is a value that is not a pose at all.
        assert.equal(
            RefusalOf(ValidateIntentWrite(arms, { Allowed: ['Sulking' as PoseKey] }, new Set())),
            'bad-posture'
        )
        assert.equal(
            RefusalOf(ValidateIntentWrite(arms, { Allowed: 'Free' as unknown as PoseKey[] }, new Set())),
            'bad-posture'
        )
    })

    it('refuses a rate outside 0..1, and a rate that is not a number', () => {
        // A rate's range is the only thing a rate forbids (§6.6).
        assert.equal(RefusalOf(ValidateIntentWrite(GetDimension(Sight), { Target: 1.5 }, new Set())), 'bad-rate')
        assert.equal(RefusalOf(ValidateIntentWrite(GetDimension(Sight), { Target: -0.1 }, new Set())), 'bad-rate')
        assert.equal(
            RefusalOf(ValidateIntentWrite(GetDimension(Sight), { Target: 'lots' as unknown as number }, new Set())),
            'bad-rate'
        )
        assert.equal(
            RefusalOf(ValidateIntentWrite(GetDimension(Sight), { Target: Number.NaN }, new Set())),
            'bad-rate'
        )
    })

    it('refuses OverrideAllowed where the equipment can promise nothing', () => {
        // The hard rule of §6.4: "Allow" is a promise about a specific capability, and with no capability
        // there is nothing to promise. It is refused at write time rather than failing silently later.
        const outcome = ValidateIntentWrite(
            GetDimension(WeaponUse),
            { Intent: GateIntent.OverrideAllowed },
            new Set()
        )
        assert.equal(RefusalOf(outcome), 'not-grantable')
    })

    it('refuses OverrideAllowed on a dimension that cannot grant at all', () => {
        // The same finding one step earlier, and the one this delivery can actually reach: `Speech` is
        // deny-only, so no equipment could ever offer a substitute for it.
        const outcome = ValidateIntentWrite(
            GetDimension(Speech),
            { Intent: GateIntent.OverrideAllowed },
            new Set()
        )
        assert.equal(RefusalOf(outcome), 'not-grantable')
    })

    it('never engages on a gate of Free, whatever is worn', () => {
        // §6.6 lists *"`Free` may not carry a non-zero squeezed `Target`"*, and this is where that rule
        // lives now. It is a **property of every resolution** rather than a check at one write site: the
        // gate and the rate are different facets of an intent, so no single write can establish what a
        // gate will resolve to — but no resolution may contradict it either.
        //
        // The property is stated over the dimensions that **have a gate**, because that is the only place
        // `Free` is a legal value at all: a rate-only dimension takes no permission, and
        // `refuses a permission on a dimension that has no gate` above is the case for that.
        fc.assert(
            fc.property(
                GateDimensionArbitrary,
                fc.array(fc.float({ min: -10, max: 10, noNaN: true }), { maxLength: 6 }),
                (dimension, powers) => {
                    const bids = powers.map(power => Bid(dimension, power))
                    const resolution = Resolve(dimension, Dossier(dimension, { Intent: GateIntent.Free }), bids)

                    assert.equal(resolution.Engaged, false, `${dimension} engaged on a gate of Free`)
                    assert.equal(
                        ValidateIntentWrite(GetDimension(dimension), { Intent: GateIntent.Free }, new Set()).kind,
                        'accepted',
                        `${dimension} refused a Free write it cannot contradict`
                    )
                }
            )
        )
    })

    it('refuses a gate value that is not one of the three', () => {
        const outcome = ValidateIntentWrite(
            GetDimension(Speech),
            { Intent: 'NotAGate' as GateIntent },
            new Set()
        )
        assert.equal(RefusalOf(outcome), 'unknown-intent')
    })

    it('refuses a demand that is not a record at all', () => {
        // A console typo must not become a crash, and the validator is the boundary a console reaches.
        assert.equal(
            RefusalOf(ValidateIntentWrite(GetDimension(Sight), GateIntent.Free as unknown as IntentRecord, new Set())),
            'bad-intent'
        )
    })

    it('accepts a config field the dimension declares', () => {
        // `Struggle` declares `Types`, which is the worked example §6.1 gives for a config field: which
        // struggle types a gate governs.
        assert.equal(ValidateConfigWrite(GetDimension(Struggle), { Types: ['Struggle'] }).kind, 'accepted')
        assert.equal(ValidateConfigWrite(GetDimension(Struggle), {}).kind, 'accepted')
    })

    it('refuses a config field the dimension does not declare', () => {
        // Storing it would put a value in the dossier that nothing will ever read — the kind of state
        // that looks load-bearing for years after it stopped being.
        assert.equal(RefusalOf(ValidateConfigWrite(GetDimension(Sight), { Types: ['Struggle'] })), 'undeclared-config')
        assert.equal(RefusalOf(ValidateConfigWrite(GetDimension(Sight), { Anything: 1 })), 'undeclared-config')
    })
})

describe('a demand is shaped by the dimension\'s own facets', () => {
    it('answers which parameters each dimension takes, and nothing more', () => {
        // The table §6.5 states, checked against the descriptors rather than restated by hand: this is
        // what makes "(shape)" a rule about the catalogue rather than a list somebody maintains.
        const expected: Readonly<Record<string, readonly string[]>> = {
            [Sight]: ['Target'],
            [Escape]: ['Intent'],
            [Speech]: ['Target', 'Intent'],
            [Struggle]: ['Target', 'Intent'],
            [WeaponUse]: ['Intent'],
            [PoseArms]: ['Allowed', 'Intent'],
            [PoseLegs]: ['Allowed', 'Intent'],
        }

        for (const [dimension, parameters] of Object.entries(expected)) {
            assert.deepEqual(
                [...IntentParameterNames(GetDimension(dimension))],
                [...parameters],
                `${dimension} takes the wrong intent parameters`
            )
        }
    })

    it('takes a parameter only when one of its facets contributes it', () => {
        for (const descriptor of AllDimensions()) {
            assert.equal(
                TakesIntentParameter(descriptor, 'Target'),
                descriptor.Facets.has(FacetName.Rate),
                `${descriptor.Id} takes a rate parameter without a rate facet`
            )
            assert.equal(
                TakesIntentParameter(descriptor, 'Intent'),
                descriptor.Facets.has(FacetName.Gate),
                `${descriptor.Id} takes a gate parameter without a gate facet`
            )
            assert.equal(
                TakesIntentParameter(descriptor, 'Allowed'),
                descriptor.Facets.has(FacetName.Posture),
                `${descriptor.Id} takes a posture parameter without a posture facet`
            )
            // A whitelist contributes nothing, so no dimension takes a parameter for it.
            assert.equal(TakesIntentParameter(descriptor, 'Granted'), false)
        }
    })

    it('resolves every registered dimension without throwing', () => {
        // The exit condition, stated as a case: every dimension can be resolved, and a dimension nothing
        // has been asked of and nothing is worn for imposes nothing.
        for (const descriptor of AllDimensions()) {
            const resolution = Resolve(descriptor.Id, ControlState(), [])
            assert.equal(
                resolution.Engaged ?? false,
                false,
                `${descriptor.Id} engaged with an empty dossier`
            )
            assert.equal(
                resolution.Applied ?? 0,
                0,
                `${descriptor.Id} applied something with no demand and nothing worn`
            )
        }
    })

    it('proves a dimension can be added by adding one record', () => {
        // Step 1.2's done-when. A descriptor that is valid in isolation is a dimension — nothing else has
        // to be edited — and the shape it has to satisfy is exactly the fields §6.2 requires.
        const novel = {
            Id: 'test-only-dimension',
            Group: 'Constraint' as const,
            Subsystem: 'Sensory' as const,
            Facets: new Set([FacetName.Rate]),
            Direction: 'deny' as const,
            BuffSide: false,
            Seams: [{ Kind: SeamKind.Value, Handler: 'aHandler', Trigger: 'aTrigger', Order: 0, Verified: false }],
            EngineValue: (value: number) => value,
        }

        ValidateDescriptor(novel)

        assert.throws(() => ValidateDescriptor({ ...novel, Seams: [] }), /names no seam/)
        assert.throws(() => ValidateDescriptor({ ...novel, Facets: new Set() }), /composes no facet/)

        // The two fields §6.2 added are guarded at registration rather than by review.
        assert.throws(
            () => ValidateDescriptor({ ...novel, EngineValue: undefined }),
            /declares no engine value map/,
            'a rate dimension that omits its engine value map is a dimension nobody finished describing'
        )
        assert.throws(
            () => ValidateDescriptor({ ...novel, Facets: new Set([FacetName.Gate]) }),
            /composes no rate/,
            'and a map on a dimension with no rate is a conversion with nothing to convert'
        )
        assert.throws(
            () => ValidateDescriptor({ ...novel, Seams: [{ ...novel.Seams[0], Kind: 'Nonsense' as SeamKind }] }),
            /unknown kind/,
            'a seam of no kind cannot tell a phase which of the four algebras to write'
        )
        assert.throws(
            () => ValidateDescriptor({ ...novel, Feeds: [BodyStateName.ArmsBound] }),
            /composes no gate/,
            'a body-state predicate is a union of refusals, and only a gate can be refused'
        )

        // A posture dimension has three rules of its own: a ladder, poses on it, and a `Replace` seam.
        const posture = {
            Id: 'test-only-posture',
            Group: 'Substitution' as const,
            Subsystem: 'Behavior' as const,
            Facets: new Set([FacetName.Posture, FacetName.Gate]),
            Direction: 'both' as const,
            BuffSide: true,
            Seams: [{ Kind: SeamKind.Replace, Handler: 'PoseRoute', Trigger: 'aGlobal', Order: 0, Verified: false }],
            Ladder: [PoseKey.Free, PoseKey.Boxtie],
        }
        ValidateDescriptor(posture)

        assert.throws(() => ValidateDescriptor({ ...posture, Ladder: [] }), /declares no ladder/)
        assert.throws(() => ValidateDescriptor({ ...posture, Ladder: undefined }), /declares no ladder/)
        assert.throws(
            () => ValidateDescriptor({ ...posture, Ladder: ['Sulking' as PoseKey] }),
            /not a pose this build knows/
        )
        assert.throws(
            () => ValidateDescriptor({ ...posture, Ladder: [PoseKey.Free, PoseKey.Free] }),
            /names a pose on its ladder twice/
        )
        assert.throws(
            () => ValidateDescriptor({ ...posture, Seams: [novel.Seams[0]] }),
            /names no Replace seam/,
            'the pose availability functions are pure functions with no event, so wrapping one is the only way in'
        )
    })
})

describe('the unchecked write and the load reader', () => {
    it('stores what it is given, leaving the rules to the validator', () => {
        // The pair exists because a migration has to be able to put a value back without re-litigating
        // it. The split is also what lets the checked path build the record it *would* store.
        const next = WithIntent(ControlState(), Sight, ToIntent({ Target: 0.4 }))
        assert.deepEqual(next.intent.get(Sight), ToIntent({ Target: 0.4 }))
        assert.equal(ControlState().intent.size, 0, 'the unchecked write mutated its input')
    })

    it('reads a demand record off a save, keeping only what the shape can carry', () => {
        // The load path is a boundary, not a caller: a value off a save is checked rather than trusted.
        // What it does **not** do is narrow by the descriptor — a dimension whose facets changed between
        // releases would otherwise have its stored parameters dropped before a migration could see them.
        //
        // It also **canonicalises**: a record a save carries and a map a live dossier holds read back to
        // the same value, which is what makes the round trip comparable at all.
        assert.deepEqual(ReadIntent({ Target: 0.4, Intent: 'Free' }), ToIntent({ Target: 0.4, Intent: 'Free' }))
        assert.deepEqual(ReadIntent({ Target: 0.4 }), ToIntent({ Target: 0.4 }))
        assert.deepEqual(ReadIntent({ Intent: 'OverrideForbidden' }), ToIntent({ Intent: 'OverrideForbidden' }))
        assert.deepEqual(ReadIntent({}), ToIntent({}))
    })

    it('drops an unusable value rather than clamping or throwing', () => {
        // Clamping would turn a corrupt save into a *valid but unintended* demand, which is the failure
        // mode that looks like working code. A string is not a weaker number, it is a different thing.
        assert.deepEqual(ReadIntent({ Target: 'lots' }), ToIntent({}))
        assert.deepEqual(ReadIntent({ Target: 1.5 }), ToIntent({}))
        assert.deepEqual(ReadIntent({ Target: Number.NaN }), ToIntent({}))
        assert.deepEqual(ReadIntent({ Intent: 'NotAGate' }), ToIntent({}))
        assert.deepEqual(ReadIntent({ Target: 0.4, Anything: true }), ToIntent({ Target: 0.4 }))
        assert.equal(ReadIntent(null), undefined)
        assert.equal(ReadIntent('Free'), undefined, 'a bare gate value is the old shape, not a record')
    })

    it('reads a demand back through the whole state, not just the map', () => {
        assert.deepEqual(GetTargetDemand(Dossier(Sight, { Target: 0.25 }), Sight), 0.25)
        assert.equal(GetGateIntent(Dossier(Sight, { Target: 0.25 }), Sight), undefined, 'a rate-only dimension has no gate demand')
        assert.equal(GetTargetDemand(Dossier(Speech, { Intent: 'Free' }), Speech), undefined)
        assert.equal(GetGateIntent(Dossier(Speech, { Intent: 'Free' }), Speech), 'Free')
    })
})
