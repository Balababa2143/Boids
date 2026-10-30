/**
 * The posture facet: its vocabulary, its ladders, and that a posture
 * resolution is never empty. The property spans every posture dimension,
 * because emptiness is easy to reach from intersection and subtraction.
 *
 * @module test/control-pose
 */

import assert from 'node:assert/strict'
import fc from 'fast-check'
import { Map as IMMap } from 'immutable'
import { describe, it } from 'node:test'

import {
    AllDimensions,
    ArmPoseLadder,
    BodyStateName,
    BodyStateNames,
    CanGrant,
    CanDeny,
    ControlState,
    FacetName,
    GateIntent,
    GateIntents,
    IsPoseKey,
    IntentRecord,
    LegPoseLadder,
    PoseKey,
    PoseKeys,
    ProviderBid,
    Resolve,
    ResolveBodyStateFrom,
    SeamKind,
    ToIntent,
    ValidateIntentWrite,
} from '../src/KDExtension/Control'
import { DimensionIdOf, DimensionName } from '../src/FactionMachine/MachinePrime/Coordinator/Catalog'
import { ControlledPoseDimensions, PoseDrivingShrineWords, PoseFallback, PoseRouteBound } from '../src/FactionMachine/MachinePrime/Coordinator/PoseRoute'

const PoseLegs = DimensionIdOf(DimensionName.PoseLegs)

/** Every posture dimension in the registry, read lazily so an import order cannot empty it. */
const PostureDimensions = (): readonly string[] =>
    AllDimensions()
        .filter(descriptor => descriptor.Facets.has(FacetName.Posture))
        .map(descriptor => descriptor.Id)

/** A dossier recording one demand. */
const Dossier = (dimension: string, intent: IntentRecord): ControlState =>
    ControlState({ intent: IMMap([[dimension, ToIntent(intent)]]) })

/** A bid from a named item, on the posture axis. */
const PostureBid = (dimension: string, allowed: readonly PoseKey[]): ProviderBid => ({
    Dimension: dimension,
    Power: 1,
    Stack: 'Max',
    Allowed: allowed,
    LoserExpresses: true,
    Source: 'item',
})

/**
 * The ladder of a dimension, or a failure — a posture
 * dimension without one is refused at registration.
 */
const LadderOf = (dimension: string): readonly PoseKey[] => {
    const ladder = AllDimensions().find(descriptor => descriptor.Id === dimension)?.Ladder
    assert.ok(ladder != null && ladder.length > 0, `${dimension} has no ladder`)
    return ladder
}

describe('the pose vocabulary is closed and the ladders cover it', () => {
    it('holds the game\'s own pose names, and nothing that is not one', () => {
        for (const pose of [PoseKey.Free, PoseKey.Boxtie, PoseKey.Wristtie, PoseKey.Yoked,
            PoseKey.Front, PoseKey.Up, PoseKey.Crossed, PoseKey.Spread, PoseKey.Closed,
            PoseKey.Kneel, PoseKey.KneelClosed, PoseKey.Hogtie, PoseKey.FeetLinked,
            PoseKey.LegBind, PoseKey.ForceKneel, PoseKey.HandsBound]) {
            assert.ok(PoseKeys.has(pose), `${pose} is missing from the union`)
        }

        assert.equal(IsPoseKey('Sulking'), false)
        assert.equal(IsPoseKey(7), false)
        assert.equal(IsPoseKey(null), false)
        assert.equal(IsPoseKey(PoseKey.Free), true)
    })

    it('partitions the union between the two ladders, with no pose left ungoverned', () => {
        const governed = [...ArmPoseLadder, ...LegPoseLadder]
        assert.equal(new Set(governed).size, governed.length, 'a pose is on both ladders')
        assert.deepEqual(
            [...PoseKeys].sort(),
            [...governed].sort(),
            'the ladders and the union disagree about which poses exist'
        )
    })

    it('leads each ladder with the pose the game\'s own sentinel reaches for', () => {
        // The head is what the router falls back to when its algebra empties the set.
        assert.equal(ArmPoseLadder[0], PoseKey.Free)
        assert.equal(LegPoseLadder[0], PoseKey.Closed)
        assert.equal(PoseFallback.Arms, ArmPoseLadder[0])
        assert.equal(PoseFallback.Legs, LegPoseLadder[0])

        for (const descriptor of AllDimensions()) {
            if (!descriptor.Facets.has(FacetName.Posture)) {
                continue
            }
            assert.ok(
                descriptor.Ladder?.[0] === PoseFallback.Arms || descriptor.Ladder?.[0] === PoseFallback.Legs,
                `${descriptor.Id} leads with a pose no sentinel reaches for`
            )
        }
    })

    it('declares the fourth seam kind, because a posture dimension has no event to name', () => {
        // The availability functions are pure with no
        // dispatch, so replacing the global is the only seam.
        for (const dimension of PostureDimensions()) {
            const descriptor = AllDimensions().find(candidate => candidate.Id === dimension)
            assert.ok(
                descriptor?.Seams.some(seam => seam.Kind === SeamKind.Replace) === true,
                `${dimension} composes a posture without a Replace seam`
            )
        }
    })

    it('routes both controlled dimensions through the declaration, and binds neither', () => {
        // The declaration is readable without the wrap being in place.
        assert.deepEqual(
            [...ControlledPoseDimensions.values()].sort(),
            [...PostureDimensions()].sort()
        )
        assert.equal(PoseRouteBound, false, 'the availability functions are wrapped, and this case expects the declaration only')
    })

    it('excludes every word that would drive the pose system outside the controller', () => {
        // `shrine` is bulk-copied into the wearer's tag map, so a
        // pose word there is a second route into the pose system.
        for (const word of ['Hogties', 'BallGags', 'PlugGags', 'Boxties', 'Wristties', 'Armbinders']) {
            assert.ok(PoseDrivingShrineWords.includes(word), `${word} is not excluded`)
        }
    })
})

describe('a posture resolution is never empty', () => {
    it('holds for every posture dimension, every demand and every worn set', () => {
        // The empty set is reachable from the intersection and
        // from the subtraction, so both roads are sampled.
        const line = fc
            .constant(null)
            .chain(() => fc.constantFrom(...PostureDimensions()))
            .chain(dimension => {
                const ladder = LadderOf(dimension)
                const subset = fc.subarray([...ladder])
                return fc.record({
                    dimension: fc.constant(dimension),
                    ladder: fc.constant(ladder),
                    demand: fc.option(subset, { nil: undefined }),
                    gate: fc.constantFrom(...GateIntents),
                    bids: fc.array(subset, { maxLength: 4 }),
                })
            })

        fc.assert(
            fc.property(line, ({ dimension, ladder, demand, gate, bids }) => {
                const intent: IntentRecord = demand === undefined
                    ? { Intent: gate }
                    : { Allowed: [...demand], Intent: gate }
                const resolution = Resolve(
                    dimension,
                    Dossier(dimension, intent),
                    bids.map(allowed => PostureBid(dimension, allowed))
                )

                assert.ok(resolution.Posture != null, `${dimension} reported no posture at all`)
                assert.ok(
                    resolution.Posture.size > 0,
                    `${dimension} resolved to the empty set with ${JSON.stringify({ demand, gate, bids })}`
                )
                const ceiling = resolution.PostureCeiling ?? new Set()
                // The sentinel is reachable two ways: an empty intersection, or a
                // subtraction that removed every member. A permit-gate demand never gets
                // it, because it cannot add outside the ceiling in the first place.
                const sentinelExpected = ceiling.size === 0
                    || (gate === GateIntent.OverrideForbidden
                        && demand != null
                        && [...ceiling].every(pose => demand.includes(pose)))
                for (const pose of resolution.Posture) {
                    assert.ok(ladder.includes(pose), `${dimension} permitted '${pose}', which it does not govern`)
                    assert.ok(
                        ceiling.has(pose) || (sentinelExpected && pose === ladder[0]),
                        `${dimension} permitted '${pose}' outside its capability, and it is not the sentinel`
                    )
                }
            })
        )
    })

    it('permits the whole ladder when nothing is asked and nothing is worn', () => {
        // Posture's baseline is the whole ladder; an unconstrained
        // body may take any of the dimension's poses.
        for (const dimension of PostureDimensions()) {
            const resolution = Resolve(dimension, ControlState(), [])
            assert.deepEqual([...(resolution.Posture ?? [])], [...LadderOf(dimension)])
            assert.equal(resolution.PostureDemand, undefined, 'nothing was asked')
        }
    })

    it('keeps the permitted set inside the ladder even for a demand off a longer one', () => {
        // A save can carry a pose this build's ladder does not have; the router must not permit it.
        const notGoverned = [...PoseKeys].find(pose => !LegPoseLadder.includes(pose))
        assert.ok(notGoverned !== undefined)

        const resolution = Resolve(
            PoseLegs,
            Dossier(PoseLegs, { Allowed: [notGoverned], Intent: GateIntent.OverrideAllowed }),
            []
        )
        assert.ok(resolution.Posture?.has(notGoverned) === false)
        assert.ok((resolution.Posture?.size ?? 0) > 0)
    })
})

describe('the two grant channels are told apart', () => {
    it('accepts OverrideAllowed for a posture the equipment can draw', () => {
        for (const dimension of PostureDimensions()) {
            const ladder = LadderOf(dimension)
            const outcome = ValidateIntentWrite(
                AllDimensions().find(descriptor => descriptor.Id === dimension)!,
                { Allowed: [ladder[0]], Intent: GateIntent.OverrideAllowed },
                new Set([ladder[0]])
            )
            assert.equal(outcome.kind, 'accepted', `${dimension} refused a posture it can draw`)
        }
    })

    it('refuses OverrideAllowed for a posture dimension with nothing behind it', () => {
        for (const dimension of PostureDimensions()) {
            const outcome = ValidateIntentWrite(
                AllDimensions().find(descriptor => descriptor.Id === dimension)!,
                { Intent: GateIntent.OverrideAllowed },
                new Set()
            )
            assert.equal(outcome.kind, 'refused')
            assert.equal(outcome.kind === 'refused' ? outcome.Rule : '', 'not-grantable')
        }
    })
})

describe('a body-state predicate is a union of refusals', () => {
    it('answers through the whole registry, per predicate', () => {
        const refusals = new Map(
            AllDimensions().map(descriptor => [descriptor.Id, {
                Winner: null,
                Losers: [],
                Config: {},
                Gate: GateIntent.OverrideForbidden,
                Engaged: CanDeny(descriptor.Direction),
            }] as const)
        )

        for (const name of BodyStateNames) {
            const feeds = AllDimensions().filter(descriptor => descriptor.Feeds?.includes(name) === true)
            assert.equal(feeds.length > 0, ResolveBodyStateFrom(name, refusals), `'${name}' was not answered`)
        }

        const none = new Map(
            AllDimensions().map(descriptor => [descriptor.Id, {
                Winner: null,
                Losers: [],
                Config: {},
                Gate: GateIntent.Free,
                Engaged: false,
            }] as const)
        )
        for (const name of BodyStateNames) {
            assert.equal(ResolveBodyStateFrom(name, none), false, `'${name}' held with nothing engaged`)
        }
    })

    it('says a granting dimension is not a refusal', () => {
        // Allowing is the opposite of refusing, so a grant must not make the predicate hold.
        const granting = new Map(
            AllDimensions().map(descriptor => [descriptor.Id, {
                Winner: null,
                Losers: [],
                Config: {},
                Gate: GateIntent.OverrideAllowed,
                Engaged: CanGrant(descriptor.Direction),
            }] as const)
        )
        for (const name of BodyStateNames) {
            assert.equal(ResolveBodyStateFrom(name, granting), false, `'${name}' held on a grant`)
        }
    })

    it('is declared only where a gate exists to be refused', () => {
        // Only a gate can be refused, so a dimension without one cannot answer.
        for (const descriptor of AllDimensions()) {
            if (descriptor.Feeds == null) {
                continue
            }
            assert.ok(
                descriptor.Facets.has(FacetName.Gate),
                `${descriptor.Id} feeds a predicate without a gate to refuse through`
            )
            for (const name of descriptor.Feeds) {
                assert.ok(BodyStateNames.has(name), `${descriptor.Id} feeds an unknown predicate '${name}'`)
            }
        }
        assert.ok(BodyStateNames.has(BodyStateName.ArmsBound))
        assert.ok(BodyStateNames.has(BodyStateName.HandsBound))
    })
})
