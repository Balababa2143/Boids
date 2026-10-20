/**
 * The write facade and the enumeration it is driven with.
 *
 * Three things are under test here, and each is a path the Phase 1 review found thin:
 *
 * - **the grant is read, not supplied.** `SetIntent({ Intent: OverrideAllowed })` must know what
 *   the worn set promises on the dimension's own channel; a caller cannot hand the validator a
 *   capability the equipment does not have. The accept and the refusal are both cases because a
 *   facade that always passed an empty set would pass only the refusal.
 * - **a refusal leaves the dossier untouched.** The validator is the boundary, and a rejected write
 *   that still moved the state would be worse than one that threw.
 * - **the enumeration is published.** `FindProviders` is what a caller uses to walk the body once
 *   and resolve several dimensions against the same bids; without it the `Resolve` docblock
 *   described a caller who could not exist.
 * @module test/control-facade
 */

import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { ArmPoseLadder, GateIntent, PoseKey } from '../src/KDExtension/Control'
import * as Coordinator from '../src/FactionMachine/MachinePrime/Coordinator'
import { DimensionIdOf, DimensionName } from '../src/FactionMachine/MachinePrime/Coordinator/Catalog'
import { State } from '../src/FactionMachine/MachinePrime/Coordinator/Internal/State'
import { SetState } from '../src/FactionMachine/MachinePrime/Coordinator/Internal/StateStorage'
import { SetPostureArms } from '../src/FactionMachine/MachinePrime/Debug'
import { AddRestraint, ControlledTag, ResetWorld, Wear } from './harness/equipment'

const PoseArms = DimensionIdOf(DimensionName.PoseArms)
const Sight = DimensionIdOf(DimensionName.Sight)
const Speech = DimensionIdOf(DimensionName.Speech)
const WeaponUse = DimensionIdOf(DimensionName.WeaponUse)

/** A clean body and a clean dossier. The state is module-owned, so it has to be replaced. */
const Fresh = (): void => {
    ResetWorld()
    SetState(State())
}

/** The refusal rule for an outcome, or `accepted` when it was not refused. */
const RuleOf = (outcome: ReturnType<typeof Coordinator.SetIntent>): string =>
    outcome.kind === 'refused' ? outcome.Rule : 'accepted'

/** One worn posture item that can draw a single pose. */
const WearArmsThatDraw = (pose: PoseKey): void => {
    AddRestraint({ name: 'grant-arms', template: 'grant-arms-template', shrine: [ControlledTag] })
    Wear({
        name: 'grant-arms',
        bids: [{ Dimension: PoseArms, Power: 1, Allowed: [pose], LoserExpresses: true }],
    })
}

describe('SetIntent supplies the grant from the worn set', () => {
    it('accepts OverrideAllowed when the worn posture item can draw the pose', () => {
        Fresh()
        const [first] = ArmPoseLadder
        WearArmsThatDraw(first)

        const outcome = Coordinator.SetIntent({
            dimension: PoseArms,
            intent: { Intent: GateIntent.OverrideAllowed },
        })

        assert.equal(outcome.kind, 'accepted', JSON.stringify(outcome))
        assert.equal(Coordinator.Resolve(PoseArms).Gate, GateIntent.OverrideAllowed)
        assert.ok(
            Coordinator.Resolve(PoseArms).Posture?.has(first) === true,
            'the resolution dropped the pose the equipment promised'
        )
    })

    it('refuses OverrideAllowed with nothing worn, and leaves the dossier untouched', () => {
        Fresh()
        const before = Coordinator.GetDossier()

        const outcome = Coordinator.SetIntent({
            dimension: PoseArms,
            intent: { Intent: GateIntent.OverrideAllowed },
        })

        assert.equal(RuleOf(outcome), 'not-grantable')
        assert.ok(Coordinator.GetDossier().equals(before), 'a refused write moved the dossier')
    })

    it('refuses OverrideAllowed when a worn item says nothing about body configurations', () => {
        // The item is ours and it bids; it simply does not promise a pose. **Says nothing** is not
        // **can draw the ladder**, so the grant is empty and the write is refused.
        Fresh()
        AddRestraint({ name: 'silent-arms', template: 'silent-arms-template', shrine: [ControlledTag] })
        Wear({
            name: 'silent-arms',
            bids: [{ Dimension: PoseArms, Power: 1, LoserExpresses: true }],
        })

        const outcome = Coordinator.SetIntent({
            dimension: PoseArms,
            intent: { Intent: GateIntent.OverrideAllowed },
        })

        assert.equal(RuleOf(outcome), 'not-grantable')
    })

    it('drives the posture restore through the console entry point', () => {
        // `SetPostureArms(..., OverrideAllowed)` is the documented console path; the facade fix is
        // what makes it work rather than warn.
        Fresh()
        const [first] = ArmPoseLadder
        WearArmsThatDraw(first)

        SetPostureArms([first], GateIntent.OverrideAllowed)

        assert.equal(Coordinator.Resolve(PoseArms).Gate, GateIntent.OverrideAllowed)
        assert.ok(Coordinator.Resolve(PoseArms).Posture?.has(first) === true)
    })

    it('still refuses a whitelist dimension with no keys, and reports its empty grant', () => {
        Fresh()
        assert.deepEqual([...(Coordinator.Resolve(WeaponUse).Granted ?? [])], [])

        const outcome = Coordinator.SetIntent({
            dimension: WeaponUse,
            intent: { Intent: GateIntent.OverrideAllowed },
        })

        assert.equal(RuleOf(outcome), 'not-grantable')
    })
})

describe('the provider enumeration is published', () => {
    it('walks the body once and resolves several dimensions against the same bids', () => {
        Fresh()
        AddRestraint({ name: 'two-bids', template: 'two-bids-template', shrine: [ControlledTag] })
        Wear({
            name: 'two-bids',
            bids: [
                { Dimension: Sight, Power: 0.6, LoserExpresses: true },
                { Dimension: Speech, Power: 0.4, LoserExpresses: true },
            ],
        })

        const bids = Coordinator.FindProviders()
        assert.equal(bids.length, 2, 'the published enumeration did not read the worn set')

        const sight = Coordinator.Resolve(Sight, bids)
        const speech = Coordinator.Resolve(Speech, bids)

        assert.equal(sight.Winner?.Source, 'two-bids')
        assert.equal(speech.Winner?.Source, 'two-bids')
        assert.equal(sight.Ceiling, 0.6)
        assert.equal(speech.Ceiling, 0.4)
    })
})
