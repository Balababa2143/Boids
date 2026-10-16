/**
 * The text surface: every key the mod registers, the shape it has, and the group it lives in.
 *
 * ## What this holds, and why the sink cannot
 *
 * The sink refuses a key it can see is wrong *at registration* — a duplicate, an empty key, a
 * value that is its own key. What it cannot see from a single call is the **shape of the whole
 * surface**, which is what this file is for:
 *
 * - an engine key is composed by the engine from an identity the mod registered, so a
 *   hand-written one is a key nothing will ever read;
 * - a mod key is a dotted path, because the mod's own group is addressed by path and nothing
 *   else writes to it;
 * - every restraint the mod writes text for has all three slots the engine draws;
 * - no registered value is a placeholder: not its own key, not the engine's `[NotFound]` marker,
 *   and not an unfilled `${…}`.
 *
 * The third of those is the reason this exists. `FlavorText` used to be written to a `Flavor`
 * suffix nothing in the engine reads, while `FunctionText` landed in `Desc` — the line the engine
 * draws as *flavour* — so no item had a function line at all and every flavour line was
 * invisible. A shape check over the surface makes that a red test rather than a bug report.
 */

import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

// Side-effect import, and it has to be static: the surface is read at this module's scope, and
// the graph is only guaranteed loaded by the time a *static* dependency has been evaluated. The
// manifest suite loads the same entry dynamically, which does not order this file after it.
import '../src/mod'

import { EngineGroup, ModGroup, PendingEngineTextCount, ResolveSlotValue, TextRegistry } from '../src/KDExtension'
import { BuildBaseText } from './fixtures/base-game'
import { GetRecorder } from './harness/recorder'

/** The surface as registered. The engine's text is available at load, so nothing is pending. */
const Registry = TextRegistry()
const EngineText = Registry.filter(entry => entry.Group === EngineGroup)
const ModText = Registry.filter(entry => entry.Group === ModGroup)

const Globals = GetRecorder().globals
const RestraintNames = new Set(Globals.KinkyDungeonRestraintsCache.keys())
const ModelNames = new Set(Object.keys(Globals.ModelDefs))
const PerkNames = new Set(Object.keys(Globals.KDPerkStart))
const CategoryNames = new Set(
    (Globals.KDCategoriesStart as readonly { name: string }[]).map(category => category.name)
)
const BaseGameText = new Set(Object.values(BuildBaseText()))

/** Every slot that belongs to the mod's own half; the rest are the engine's. */
const ModSlots = ['Dialog', 'StatusLine', 'Message']

/** The suffixes the engine appends to a restraint name, per slot. */
const RestraintSuffixes = { Name: '', Flavor: 'Desc', Function: 'Desc2' } as const

describe('the text surface', () => {
    it('registers both halves', () => {
        assert.ok(EngineText.length > 200, `engine half: ${EngineText.length}`)
        assert.ok(ModText.length > 10, `mod half: ${ModText.length}`)
    })

    it('writes no key into both groups', () => {
        const engineKeys = new Set(EngineText.map(entry => entry.Key))
        for (const entry of ModText) {
            assert.ok(!engineKeys.has(entry.Key), `${entry.Key} is in both groups`)
        }
    })

    it('composes every engine key from an identity the mod registered', () => {
        const unexplained: string[] = []
        for (const entry of EngineText) {
            const restraint = (Object.entries(RestraintSuffixes) as [string, string][])
                .find(([slot]) => slot === entry.Slot)
            if (restraint != null) {
                const [, suffix] = restraint
                const name = entry.Key.startsWith('Restraint') && entry.Key.endsWith(suffix)
                    ? entry.Key.slice('Restraint'.length, entry.Key.length - suffix.length)
                    : undefined
                if (name != null && RestraintNames.has(name)) {
                    continue
                }
            }
            if (entry.Slot === 'ModelName' && ModelNames.has(entry.Key.slice('m_'.length))) continue
            if (entry.Slot === 'ModelExtra' && entry.Key.startsWith('m_')) continue
            if (entry.Slot === 'VariantPrefix' && entry.Key.startsWith('KDVarPref')) continue
            if (entry.Slot === 'Category' && CategoryNames.has(entry.Key.slice('KDCategory'.length))) continue
            if (entry.Slot === 'StartPerkName' && PerkNames.has(entry.Key.slice('KinkyDungeonStat'.length))) continue
            if (entry.Slot === 'StartPerkDescription' && PerkNames.has(entry.Key.slice('KinkyDungeonStatDesc'.length))) continue
            unexplained.push(`${entry.Key} (${entry.Slot})`)
        }
        assert.deepEqual(
            unexplained,
            [],
            'these engine keys are not one the engine composes from something the mod registered'
        )
    })

    it('addresses every mod key by a dotted path, under a mod-half slot', () => {
        for (const entry of ModText) {
            assert.match(entry.Key, /^[A-Za-z][A-Za-z0-9]*(\.[A-Za-z][A-Za-z0-9]*)+$/, entry.Key)
            assert.ok(ModSlots.includes(entry.Slot), `${entry.Key} carries the engine-half slot ${entry.Slot}`)
        }
    })

    it('gives every restraint it names all three slots', () => {
        const named = [...new Set(
            EngineText.filter(entry => entry.Slot === 'Name').map(entry => entry.Key.slice('Restraint'.length))
        )]
        assert.ok(named.length > 100, `restraints the mod names: ${named.length}`)

        const keys = new Set(EngineText.map(entry => entry.Key))
        const missing: string[] = []
        for (const name of named) {
            for (const suffix of ['', 'Desc', 'Desc2']) {
                if (!keys.has(`Restraint${name}${suffix}`)) {
                    missing.push(`Restraint${name}${suffix}`)
                }
            }
        }
        assert.deepEqual(missing, [], 'these restraints are missing a line the engine draws')
    })

    it('registers no value that is a placeholder rather than text', () => {
        const placeholders = Registry.filter(entry =>
            entry.Value === entry.Key
            || entry.Value.startsWith('[NotFound]')
            || entry.Value.includes('${')
        )
        assert.deepEqual(
            placeholders.map(entry => `${entry.Key} => ${entry.Value}`),
            [],
            'these values would reach a player as placeholders'
        )
    })

    it('takes a declared source from the engine rather than baking a copy', () => {
        // The four derived items declare the base-game restraint they come from, and their lines
        // are the *engine's* text read at load — so an engine fix or a translation carries them
        // without this mod re-authoring anything.
        const fromEngine = Registry.filter(entry => entry.Source === 'engine')
        assert.ok(fromEngine.length >= 8, `engine-sourced slots: ${fromEngine.length}`)
        for (const entry of fromEngine) {
            assert.ok(
                BaseGameText.has(entry.Value),
                `${entry.Key} does not hold the engine's text, so the source was not read`
            )
        }
    })

    it('has nothing left waiting on the engine', () => {
        // Every source the mod declares is in the harness's base-game text, so the deferred
        // fallback is unused. A non-empty queue here would mean a slot is blank until the engine
        // settles — which is a state the suite should not be recording as normal.
        assert.equal(PendingEngineTextCount(), 0)
    })

    it('answers a source the engine has not loaded with the key to fill, not with blank text', () => {
        // The fallback asserted as a decision rather than by draining the queue: naming the key
        // is what keeps a blank from being mistaken for authored text.
        assert.deepEqual(
            ResolveSlotValue({ Source: 'NoSuchBaseItem' }, 'Flavor'),
            { kind: 'deferred', Key: 'RestraintNoSuchBaseItemDesc' }
        )
        assert.deepEqual(
            ResolveSlotValue({ Name: 'Drone Test' }, 'Name'),
            { kind: 'value', Value: 'Drone Test', Source: 'local' }
        )
    })
})
