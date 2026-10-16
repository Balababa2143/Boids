/**
 * Building a body and a dossier, for the suites that test the restraint contract.
 *
 * Three suites need the same three things and they are all easy to get subtly wrong:
 *
 * 1. **A body.** The control model computes the equipment's capability from
 *    `KinkyDungeonAllRestraintDynamic`, so a test that seeded `recorder.inventory` would be seeding a
 *    character's luggage and then asking what she is wearing.
 * 2. **A restraint template carrying the membership tag.** Membership *is* the tag
 *    (`design/spec.md` §6.12), so setting one up by hand means pushing a template into
 *    `KinkyDungeonRestraints` and a variant into `recorder.restraintVariants` — and the variant is not
 *    decoration: `KDRestraint` is variant-aware, and the mod's own items are variants.
 * 3. **A dossier.** Seeded through the **checked** write path, because a dossier reached into directly
 *    would prove nothing about whether a write could produce it, and `SetIntent` is what a console and
 *    every later caller use.
 *
 * The helpers live here rather than in each suite because four copies of "a template with our tag on
 * it" would drift, and the drift would show up as one suite's case passing for a reason it does not
 * state.
 * @module test/harness/equipment
 */

import assert from 'node:assert/strict'
import { AllDimensions, PoseKey, StackMode } from '../../src/KDExtension/Control'
import { DimensionIdOf, DimensionName } from '../../src/FactionMachine/MachinePrime/Coordinator/Catalog'
import { ControlledTag, DimensionBidsKey } from '../../src/FactionMachine/MachinePrime/Coordinator/Tag'
import { SetConfig, SetIntent } from '../../src/FactionMachine/MachinePrime/Coordinator/Public/Control'
import { StrongestDemand } from './dossier'
import { GetRecorder } from './recorder'
import { FreshWorld } from './world'

/** One declaration an item makes about itself, as a test writes it. */
export interface TestBid {
    readonly Dimension: string
    readonly Power: number
    /** How this bid stacks, or omitted for `Max`, which is what the router defaults to. */
    readonly Stack?: StackMode
    /**
     * The body configurations the item can deliver, when it speaks to a posture dimension.
     *
     * Omitted means it says nothing about body configurations, which is a different statement from
     * permitting none of them — so a case that wants *"permits nothing"* passes `[]`.
     */
    readonly Allowed?: readonly PoseKey[]
    readonly LoserExpresses?: boolean
}

/**
 * A world with an empty body and clean registries.
 *
 * The helpers in `test/harness/world.ts` explain why this is not `InstallKDGlobals`: reinstalling
 * everything would replace the mod's own load gate and save stamp, which are installed once at module
 * evaluation and which every later suite needs intact.
 *
 * It deliberately does **not** reset the dossier: `StateStorage`'s own state is what the invariant
 * cases are about, and a helper that quietly cleared it would hide the very thing under test. Use
 * {@link SeedDossier} to put something in it.
 */
export const ResetWorld = (): void => {
    FreshWorld()
}

/**
 * Puts one restraint template and one variant of it into the harness's registries.
 *
 * @param args.name - The variant name a worn item will carry. Unique per call, so two items can differ.
 * @param args.template - The template name. Unique per call for the same reason.
 * @param args.shrine - The template's tag list. Whether it carries `ControlledTag` is the whole
 *   membership test, so this parameter is how a case says "ours" or "the game's".
 * @returns The template, so a case can assert on it directly.
 */
export const AddRestraint = (args: {
    readonly name: string
    readonly template: string
    readonly shrine: readonly string[]
}): restraint => {
    const recorder = GetRecorder()
    const template = { name: args.template, shrine: [...args.shrine] } as unknown as restraint
    recorder.globals.KinkyDungeonRestraints.push(template)
    recorder.restraintVariants[args.name] = { template: args.template } as unknown as KDRestraintVariant
    return template
}

/**
 * Puts one item on the character's body, with whatever provider declaration the caller wants.
 *
 * The item carries `inventoryVariant`, so `KDRestraint` has to follow the same indirection the game's
 * does — which is the point: a stub that read the item's own name would find no template and report
 * every provider missing.
 *
 * @param args.name - The variant name, which must already have a template from {@link AddRestraint}.
 * @param args.bids - What the item declares, or `undefined` for an item with no opinion.
 * @param args.rawBids - A declaration written **verbatim**, for a case that has to hand the reader
 *   something malformed. It wins over `bids`.
 * @returns The item, so a case can reach its `data` directly.
 */
export const Wear = (args: {
    readonly name: string
    readonly bids?: readonly TestBid[]
    readonly rawBids?: unknown
}): item => {
    const declared = args.rawBids !== undefined
        ? args.rawBids
        : args.bids?.map(bid => ({ LoserExpresses: true, ...bid }))
    const item = {
        id: `worn-${args.name}`,
        name: args.name,
        inventoryVariant: args.name,
        data: args.bids == null && args.rawBids === undefined
            ? {}
            : { [DimensionBidsKey]: declared },
    } as unknown as item
    GetRecorder().worn.push({ item, host: null })
    return item
}

/** Takes everything off the character's body, without touching the dossier. */
export const RemoveEverything = (): void => {
    GetRecorder().worn.length = 0
}

/**
 * Puts a non-default demand on every dimension, through the checked write path, plus one config.
 *
 * "Every dimension" rather than a sample because the invariants these suites test are stated over
 * **every dimension in the descriptor registry**, so a dossier that covered only some of them could
 * survive a change to the rest.
 *
 * **The demand is shaped by each dimension's own facets**, through
 * {@link StrongestDemand} — a rate gets `Target: 1`, a gate gets `OverrideForbidden`, a dimension that
 * composes both gets both. Writing one shape for all of them would be the mistake this whole rewrite
 * exists to fix, and it would be refused by the validator rather than stored, so the suite would fail
 * loudly here rather than passing vacuously.
 *
 * `Struggle` gets a config as well, because a value that survived an equipment change would be exactly
 * as bad as a demand that did — and `Struggle` is the one dimension that declares a config field.
 */
export const SeedDossier = (): void => {
    for (const descriptor of AllDimensions()) {
        const wrote = SetIntent({ dimension: descriptor.Id, intent: StrongestDemand(descriptor.Id) })
        assert.equal(
            wrote.kind,
            'accepted',
            `${descriptor.Id} refused its strongest demand: ${JSON.stringify(wrote)}`
        )
    }
    const configured = SetConfig({
        dimension: DimensionIdOf(DimensionName.Struggle),
        config: { Types: ['Struggle'] },
    })
    assert.equal(configured.kind, 'accepted', `Struggle refused its declared config: ${JSON.stringify(configured)}`)
}

/** The membership tag, re-exported so a suite does not have to reach past this module for it. */
export { ControlledTag }
