/**
 * Builds a body and a dossier for the suites that test the restraint contract: equipment comes
 * from `KinkyDungeonAllRestraintDynamic`, and a worn variant's membership tag is `ControlledTag`.
 *
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
     * Omitted says nothing about them; `[]` says it permits none of them.
     */
    readonly Allowed?: readonly PoseKey[]
    readonly LoserExpresses?: boolean
}

/**
 * A world with an empty body and clean registries.
 * Does not reset the dossier; use {@link SeedDossier}.
 */
export const ResetWorld = (): void => {
    FreshWorld()
}

/**
 * Puts one restraint template and one variant of it into the harness's registries.
 *
 * @param args.name - The variant name a worn item carries; unique per call.
 * @param args.template - The template name; unique per call.
 * @param args.shrine - The template's tags; carrying `ControlledTag` makes it a member.
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
 * Puts one item on the character's body with the given declaration.
 *
 * The item carries `inventoryVariant`: `KDRestraint` follows that indirection rather than
 * the item's own name, so a stub that read the name directly would find no template.
 *
 * @param args.rawBids - A verbatim declaration for a malformed-shape case; wins over `bids`.
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
 * Puts a non-default demand on every registered dimension
 * through the checked write path, plus one config.
 *
 * The demand is shaped by each dimension's own facets through {@link
 * StrongestDemand}: one shape for all of them would be refused by the validator.
 * Every dimension, because the invariants are stated over the whole registry.
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

/** The membership tag, re-exported for the suites. */
export { ControlledTag }
