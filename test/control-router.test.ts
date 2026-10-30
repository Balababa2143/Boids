/**
 * The router and the write validators: resolution is pure, and validation refuses rather
 * than storing so the caller hears why. A demand's shape is the first rule tested.
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
 * The registry is read when the arbitrary is sampled, not when this module is evaluated,
 * so an import order that reached this file first cannot build an arbitrary over nothing.
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
        // "Nothing asked" is the absence of a demand, not a demand of 0.
        const resolution = Resolve(Sight, ControlState(), [Bid(Sight, 0.5)])

        assert.equal(resolution.Demand, undefined)
        // Capability is reported, and it does apply: an item that constrains is constraining.
        assert.equal(resolution.Ceiling, 0.5)
        assert.equal(resolution.Applied, 0, 'capability is reported, not applied: the Host asked for nothing')
        assert.equal(resolution.Winner?.Source, 'item-0.5')
        assert.equal(resolution.Gate, undefined)
        assert.equal(resolution.Engaged, undefined)
    })

    it('clamps the Host\'s demand to the equipment', () => {
        // Capability bounds the intent; the demand itself is left in the dossier.
        const weakGear = Resolve(Sight, Dossier(Sight, { Target: 0.4 }), [Bid(Sight, 0.3)])
        assert.equal(weakGear.Demand, 0.4)
        assert.equal(weakGear.Ceiling, 0.3)
        assert.equal(weakGear.Applied, 0.3, 'the capability bounds the demand')

        const strongGear = Resolve(Sight, Dossier(Sight, { Target: 0.4 }), [Bid(Sight, 0.9)])
        assert.equal(strongGear.Applied, 0.4, 'and the demand bounds the capability')
    })

    it('keeps a demand that no worn item can reach, and applies it once gear can', () => {
        // A demand recorded before the gear exists applies
        // nothing, is not discarded, and rises when gear arrives.
        const bare = Resolve(Sight, Dossier(Sight, { Target: 0.8 }), [])
        assert.equal(bare.Demand, 0.8)
        assert.equal(bare.Ceiling, 0)
        assert.equal(bare.Applied, 0, 'nothing worn can honour the demand, so nothing is applied')

        const withGear = Resolve(Sight, Dossier(Sight, { Target: 0.8 }), [Bid(Sight, 0.2)])
        assert.equal(withGear.Applied, 0.2, 'the demand is clamped to the gear that arrived')

        const reachesIt = Resolve(Sight, Dossier(Sight, { Target: 0.8 }), [Bid(Sight, 0.9)])
        assert.equal(reachesIt.Applied, 0.8, 'and it reaches the demand when the gear can honour it')
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
        // The router reports the losers rather than instructing
        // them; how a family expresses a loss is its own business.
        const resolution = Resolve(Sight, Dossier(Sight, { Target: 1 }), [
            Bid(Sight, 0.9, true),
            Bid(Sight, 0.4, false),
        ])

        assert.deepEqual(resolution.Losers.map(loser => loser.Power), [0.4])
        assert.equal(resolution.Losers[0].LoserExpresses, false)
        assert.equal(resolution.Winner?.LoserExpresses, true)
    })

    it('breaks a tie by the order the bids arrived in', () => {
        // Enumeration order is the only stable tie-break for a given worn set.
        const resolution = Resolve(Sight, Dossier(Sight, { Target: 1 }), [
            Bid(Sight, 0.5),
            Bid(Sight, 0.5),
        ])

        assert.equal(resolution.Winner?.Source, 'item-0.5')
        assert.equal(resolution.Losers.length, 1)
    })

    it('ignores bids aimed at another dimension', () => {
        const resolution = Resolve(Sight, Dossier(Sight, { Target: 1 }), [
            Bid(Struggle, 1),
            Bid(Sight, 0.4),
        ])

        assert.equal(resolution.Winner?.Dimension, Sight)
        assert.equal(resolution.Ceiling, 0.4)
    })

    it('clamps a bid outside 0..1 rather than propagating it', () => {
        // A family's power is only compared with another bid,
        // so nothing stops 3 or -1; the game's scales are 0..1.
        const high = Resolve(Sight, Dossier(Sight, { Target: 1 }), [Bid(Sight, 3)])
        assert.equal(high.Ceiling, 1)
        assert.equal(high.Applied, 1)

        const low = Resolve(Sight, Dossier(Sight, { Target: 1 }), [Bid(Sight, -1)])
        assert.equal(low.Ceiling, 0)
        assert.equal(low.Applied, 0)
    })

    it('bounds every rate by its ceiling, over arbitrary demands and bids', () => {
        // Fails if `Math.min` is put back to `Math.max`.
        const RateDimension = fc.constant(null).chain(() => fc.constantFrom(
            ...AllDimensions()
                .filter(descriptor => descriptor.Facets.has(FacetName.Rate))
                .map(descriptor => descriptor.Id)
        ))
        fc.assert(
            fc.property(
                RateDimension,
                fc.float({ min: 0, max: 1, noNaN: true }),
                fc.array(fc.float({ min: -10, max: 10, noNaN: true }), { maxLength: 6 }),
                (dimension, demand, powers) => {
                    const resolution = Resolve(
                        dimension,
                        Dossier(dimension, { Target: demand }),
                        powers.map(power => Bid(dimension, power))
                    )
                    assert.equal(
                        resolution.Applied,
                        Math.min(demand, resolution.Ceiling ?? 0),
                        `${dimension} did not clamp its demand to its capability`
                    )
                }
            )
        )
    })

    it('reports the gate and the engagement for a gate dimension, and no rate', () => {
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
        assert.equal(resolution.Granted, undefined, 'a gate-only dimension composes no whitelist')
    })

    it('reads an absent gate demand as Free', () => {
        const resolution = Resolve(Escape, ControlState(), [])
        assert.equal(resolution.Gate, GateIntent.Free)
        assert.equal(resolution.Engaged, false)
    })

    it('puts a resolved rate onto the engine\'s own scale', () => {
        // `Applied` is the model's 0..1 answer; `Projected`
        // is the game's own scale, read only for `Sight`.
        const resolution = Resolve(Sight, Dossier(Sight, { Target: 0.5 }), [Bid(Sight, 1)])
        assert.equal(resolution.Applied, 0.5)
        assert.equal(resolution.Projected, 4, 'half of a seven-rung ladder, rounded')

        const full = Resolve(Sight, Dossier(Sight, { Target: 1 }), [Bid(Sight, 1)])
        assert.equal(full.Projected, 7, 'and the top of the model reaches the game\'s own ceiling')

        const unconverted = Resolve(Movement, Dossier(Movement, { Target: 0.4 }), [Bid(Movement, 1)])
        assert.equal(unconverted.Applied, 0.4)
        assert.equal(unconverted.Projected, 0.4)
    })

    it('stacks every bid on a dimension whose winning bid says to add them', () => {
        // The winner's mode governs the aggregate; the base game's gag total is a sum.
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
        // The worn set's capability is what every declaring provider
        // can deliver, because a pose is a sprite variable.
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

        // A provider that says nothing is not consulted, which differs from permitting none.
        const silent = Resolve(PoseArms, ControlState(), [
            Bid(PoseArms, 1, false, { Allowed: [first] }),
            Bid(PoseArms, 1),
        ])
        assert.deepEqual([...(silent.PostureCeiling ?? [])], [first], 'silence does not empty the ladder')
    })

    it('subtracts where the gate forbids, and a permit neither adds nor removes', () => {
        // There is no add-half: a demand is clamped to the
        // capability, and a permit resolves to exactly the ceiling.
        const ladder = [...ArmPoseLadder]
        const [first, second] = ladder
        assert.ok(second !== undefined, 'the case needs two arm poses to tell add from subtract')

        const forbidden = Resolve(
            PoseArms,
            Dossier(PoseArms, { Allowed: [second], Intent: GateIntent.OverrideForbidden }),
            [Bid(PoseArms, 1, false, { Allowed: [first, second] })]
        )
        assert.deepEqual([...(forbidden.Posture ?? [])], [first], 'the demand removed the pose it named')
        assert.deepEqual([...(forbidden.PostureDemand ?? [])], [second])

        const inside = Resolve(
            PoseArms,
            Dossier(PoseArms, { Allowed: [first], Intent: GateIntent.OverrideAllowed }),
            [Bid(PoseArms, 1, false, { Allowed: [first, second] })]
        )
        assert.deepEqual([...(inside.Posture ?? [])], [first, second], 'a permit is the capability, exactly')
        assert.deepEqual([...(inside.PostureDemand ?? [])], [first], 'and the demand is still reported')
        assert.equal(inside.Gate, GateIntent.OverrideAllowed)
        assert.equal(inside.Engaged, true, 'the gear promises a pose, so the permit engages')

        const outside = Resolve(
            PoseArms,
            Dossier(PoseArms, { Allowed: [second], Intent: GateIntent.OverrideAllowed }),
            [Bid(PoseArms, 1, false, { Allowed: [first] })]
        )
        assert.deepEqual([...(outside.Posture ?? [])], [first], 'a permit cannot add past the capability')
        assert.equal(outside.Posture?.has(second), false)
    })

    it('never resolves a posture to the empty set', () => {
        // The game indexes the available set at `[0]`, and
        // under intersection an empty set is easy to reach.
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
        // The router is the last line: it resolves per
        // facets even for a state a write could not produce.
        const resolution: DimensionResolution = Resolve(Sight, Dossier(Sight, { Target: 1 }), [])
        assert.equal(resolution.Engaged, undefined, 'a rate dimension has no gate to engage')
        assert.equal(resolution.Gate, undefined)
    })

    it('carries every parameter for a dimension that composes several facets', () => {
        const resolution = Resolve(Struggle, Dossier(Struggle, {
            Target: 0.6,
            Intent: GateIntent.OverrideForbidden,
        }), [Bid(Struggle, 0.3)])

        assert.equal(resolution.Demand, 0.6)
        assert.equal(resolution.Applied, 0.3, 'the demand is clamped to the bid')
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
        // Guessing at facets for an unknown id would invent semantics; the refusal names the id.
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
        // There is no separate unset: an absent entry and an empty record are the same statement.
        assert.equal(ValidateIntentWrite(GetDimension(Sight), {}, new Set()).kind, 'accepted')
    })

    it('refuses a permission on a dimension that has no gate', () => {
        const outcome = ValidateIntentWrite(
            GetDimension(Sight),
            { Intent: GateIntent.OverrideForbidden },
            new Set()
        )
        assert.equal(RefusalOf(outcome), 'undeclared-parameter')
    })

    it('refuses a rate on a dimension that has no rate', () => {
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
        // A real pose this dimension does not govern is the
        // interesting refusal: the value is meaningful.
        assert.ok(
            PoseKeys.has(PoseKey.Hogtie) && !ArmPoseLadder.includes(PoseKey.Hogtie),
            'Hogtie is a pose this build knows and the arms do not govern'
        )
        assert.equal(
            RefusalOf(ValidateIntentWrite(arms, { Allowed: [PoseKey.Hogtie] }, new Set())),
            'bad-posture'
        )
        // And so is a value that is not a pose at all, or not a list.
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
        // "Allow" is a promise about a capability; with no capability there is nothing to promise.
        const outcome = ValidateIntentWrite(
            GetDimension(WeaponUse),
            { Intent: GateIntent.OverrideAllowed },
            new Set()
        )
        assert.equal(RefusalOf(outcome), 'not-grantable')
    })

    it('refuses OverrideAllowed on a dimension that cannot grant at all', () => {
        const outcome = ValidateIntentWrite(
            GetDimension(Speech),
            { Intent: GateIntent.OverrideAllowed },
            new Set()
        )
        assert.equal(RefusalOf(outcome), 'not-grantable')
    })

    it('never engages on a gate of Free, whatever is worn', () => {
        // A `Free` gate may not carry a non-zero squeezed `Target`, and no
        // resolution may contradict that. Stated over the dimensions that
        // have a gate, the only place `Free` is a legal value at all.
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
        assert.equal(
            RefusalOf(ValidateIntentWrite(GetDimension(Sight), GateIntent.Free as unknown as IntentRecord, new Set())),
            'bad-intent'
        )
    })

    it('accepts a config field the dimension declares', () => {
        assert.equal(ValidateConfigWrite(GetDimension(Struggle), { Types: ['Struggle'] }).kind, 'accepted')
        assert.equal(ValidateConfigWrite(GetDimension(Struggle), {}).kind, 'accepted')
    })

    it('refuses a config field the dimension does not declare', () => {
        // Storing it would leave a value in the dossier that nothing will ever read.
        assert.equal(RefusalOf(ValidateConfigWrite(GetDimension(Sight), { Types: ['Struggle'] })), 'undeclared-config')
        assert.equal(RefusalOf(ValidateConfigWrite(GetDimension(Sight), { Anything: 1 })), 'undeclared-config')
    })
})

describe('a demand is shaped by the dimension\'s own facets', () => {
    it('answers which parameters each dimension takes, and nothing more', () => {
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
        // Every dimension can be resolved, and one with no demand and nothing worn imposes nothing.
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
        // A descriptor that is valid in isolation is a dimension; nothing else has to be edited.
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

        // The two fields are guarded at registration rather than by review.
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

        // A posture dimension has three rules of its own:
        // a ladder, poses on it, and a `Replace` seam.
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
        // A migration has to be able to put a value back without re-litigating it.
        const next = WithIntent(ControlState(), Sight, ToIntent({ Target: 0.4 }))
        assert.deepEqual(next.intent.get(Sight), ToIntent({ Target: 0.4 }))
        assert.equal(ControlState().intent.size, 0, 'the unchecked write mutated its input')
    })

    it('reads a demand record off a save, keeping only what the shape can carry', () => {
        // The load path checks the save's value but does not
        // narrow it by the descriptor, and it canonicalises.
        assert.deepEqual(ReadIntent({ Target: 0.4, Intent: 'Free' }), ToIntent({ Target: 0.4, Intent: 'Free' }))
        assert.deepEqual(ReadIntent({ Target: 0.4 }), ToIntent({ Target: 0.4 }))
        assert.deepEqual(ReadIntent({ Intent: 'OverrideForbidden' }), ToIntent({ Intent: 'OverrideForbidden' }))
        assert.deepEqual(ReadIntent({}), ToIntent({}))
    })

    it('drops an unusable value rather than clamping or throwing', () => {
        // Clamping would turn a corrupt save into a valid but
        // unintended demand; a string is not a weaker number.
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
