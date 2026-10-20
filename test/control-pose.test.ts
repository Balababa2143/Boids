/**
 * The posture facet: its vocabulary, its ladders, and invariant 23.
 *
 * Invariant 23 is the reason this file is a **property** over every posture dimension rather than a
 * handful of cases:
 *
 * > **A `Posture` resolution is never empty.** The engine indexes the available set at `[0]`, so an
 * > empty one hands `undefined` to the renderer. *Enforced by the router's non-empty sentinel
 * > (§6.7), and a property test over every posture dimension.*
 *
 * An empty set is **easy to reach** rather than a corner: the capability is an intersection, so two
 * items that each deliver one pose need only disagree, and the Host's demand is a set to subtract
 * on top of that. A case that sampled one demand against one worn set would be evidence for a much
 * weaker statement than the one the invariant makes.
 *
 * The rest of the file is the vocabulary's own consistency: the two ladders have to partition the
 * pose union, because a `PoseKey` no ladder governs is a pose no dimension can permit, and the
 * first member of each ladder is load-bearing rather than decorative — it is the sentinel.
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

/** The ladder of a dimension, or a failure — a posture dimension without one is refused at registration. */
const LadderOf = (dimension: string): readonly PoseKey[] => {
    const ladder = AllDimensions().find(descriptor => descriptor.Id === dimension)?.Ladder
    assert.ok(ladder != null && ladder.length > 0, `${dimension} has no ladder`)
    return ladder
}

describe('the pose vocabulary is closed and the ladders cover it', () => {
    it('holds the game\'s own pose names, and nothing that is not one', () => {
        // The union is the engine's vocabulary rather than ours (§6.13): inventing a private name
        // would mean a translation table between the facet and the engine, and a translation table is
        // a second place for the two to disagree.
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
        // A `PoseKey` no ladder governs is a pose no dimension can permit — so it would be a value the
        // validator accepts as a pose and refuses as a demand, which is the confusing half of a bug.
        const governed = [...ArmPoseLadder, ...LegPoseLadder]
        assert.equal(new Set(governed).size, governed.length, 'a pose is on both ladders')
        assert.deepEqual(
            [...PoseKeys].sort(),
            [...governed].sort(),
            'the ladders and the union disagree about which poses exist'
        )
    })

    it('leads each ladder with the pose the game\'s own sentinel reaches for', () => {
        // The head of a ladder is load-bearing: it is what the router falls back to when its algebra
        // empties the set, and §6.13 rule 4 has the game's sentinel run after both operations. The two
        // agree only because the first member is the pose every rig can draw — `Free` for the arms and
        // the game's `DefaultStand` reading for the legs.
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
        // §6.2: the pose availability functions are pure functions with no dispatch, so wrapping the
        // global is the only way in — and a descriptor that named a trigger and no kind could not tell
        // a phase which of the four algebras it was being asked to write.
        for (const dimension of PostureDimensions()) {
            const descriptor = AllDimensions().find(candidate => candidate.Id === dimension)
            assert.ok(
                descriptor?.Seams.some(seam => seam.Kind === SeamKind.Replace) === true,
                `${dimension} composes a posture without a Replace seam`
            )
        }
    })

    it('routes both controlled dimensions through the declaration, and binds neither', () => {
        // The phase's constraint, stated as a test rather than trusted: the route is **declared** and
        // the wrap has not been made, so a caller can ask without reading the source.
        assert.deepEqual(
            [...ControlledPoseDimensions.values()].sort(),
            [...PostureDimensions()].sort()
        )
        assert.equal(PoseRouteBound, false, 'the availability functions are declared but not wrapped')
    })

    it('excludes every word that would drive the pose system outside the controller', () => {
        // §6.13 rule 6: `shrine` is the membership tag and the game bulk-copies it into the wearer's
        // tag map, so a pose-driver word there is a second, invisible route into the pose system.
        // `Hogties` is the one that reaches furthest: `KDForcedToGround` reads it, and its consumers
        // include the heel level, the slow level and the melee penalty.
        for (const word of ['Hogties', 'BallGags', 'PlugGags', 'Boxties', 'Wristties', 'Armbinders']) {
            assert.ok(PoseDrivingShrineWords.includes(word), `${word} is not excluded`)
        }
    })
})

describe('invariant 23: a posture resolution is never empty', () => {
    it('holds for every posture dimension, every demand and every worn set', () => {
        // The property the invariant names. The arbitrary is deliberately broad: a demand that is any
        // subset of the ladder, up to four worn items that each deliver any subset, and either gate —
        // because the empty set is reachable from the intersection *and* from the subtraction, and a
        // sampler that missed one of the two roads would call the invariant enforced on half its cases.
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
                // The sentinel is reachable two ways: an empty intersection, or a subtraction that
                // removed every member. A permit-gate demand never gets it, because it cannot add
                // outside the ceiling in the first place.
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
        // The one facet whose baseline is **full** rather than empty (§6.5): an unconstrained body may
        // take any of the dimension's poses, which is why removing the last covering item releases the
        // set instead of having to restore it (invariant 12).
        for (const dimension of PostureDimensions()) {
            const resolution = Resolve(dimension, ControlState(), [])
            assert.deepEqual([...(resolution.Posture ?? [])], [...LadderOf(dimension)])
            assert.equal(resolution.PostureDemand, undefined, 'nothing was asked')
        }
    })

    it('keeps the permitted set inside the ladder even for a demand off a longer one', () => {
        // A save can carry a pose this build's ladder does not have — the catalogue moved, or another
        // release governed a longer ladder. The load path keeps it so a migration can see it, and the
        // router must not let it into the answer: a pose the dimension does not govern is a pose no
        // item of ours can draw.
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
        // Invariant 6 is stated over the channel a dimension actually has (§6.4). A posture dimension
        // promises body configurations by pose, so a set of poses is the capability the rule reads —
        // and a capability-key test over it would refuse every legal write of this kind.
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
        // Through the registry rather than through a hand-made list, because the contributor set is
        // exactly the descriptors that declared the predicate and a second list would be a second place
        // for that to be wrong.
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
        // The half of "refusing" that is easy to lose: an `OverrideAllowed` dimension is *granting*,
        // which is the opposite of a refusal — so a contributor that is allowing must not make the
        // predicate hold, or a permitted arm would report as bound.
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
        // §6.2's registration rule: the predicate is a union of refusals and only a gate can be
        // refused, so a dimension without one cannot answer it.
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
