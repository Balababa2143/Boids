/**
 * The one place a text key is written.
 *
 * Every registration the mod makes goes through here, which is what makes three properties
 * checkable in one place: the two groups are never confused, no value reaches a player
 * unregistered, and the surface can be audited by reading one list.
 *
 * ## The two groups
 *
 * - **`default`** — everything the engine resolves for itself. The engine's lookups are
 *   hard-wired to this group (`Scripts/Text.ts:439,449,678`), and a mod group is invisible
 *   to them, so this half is not a preference.
 * - **`Boids`** — everything the mod resolves and the engine only displays: dialog wording,
 *   status lines, the messages a morph sends. A private group is safe for these because
 *   only this mod writes to it, which is the isolation the split is for.
 *
 * Sharing `default` is safe for the other half because its keys are **composed from an
 * identity** the mod already derives (`Restraint<uuid>`, `m_<uuid>`, …), so they cannot
 * collide with a base-game key: the additive merge in `appendTextMap` has no race to lose.
 *
 * ## The pin
 *
 * Because the mod resolves the active language itself, a value written to `default` is
 * already translated — and the engine's shared `LocalizationService` would then translate it
 * *again* by matching the value against the base game's by-source map
 * (`Scripts/Text.ts:284-296`). That is not hypothetical: the debug discriminator `Light`
 * would become 光 (`KDBuffName_Light`, *illumination*) from `- Light` at
 * `Text_KinkyDungeon_CN.txt:2124`. So every engine-half key is also **pinned** — a
 * tag-keyed entry saying "this tag is exactly this string" — and a tag match beats the
 * by-source fallback. Nothing else may reach our wording.
 * @module KDExtension/Text/Sink
 */

import { AddEventHandler } from '../Event'
import { ActiveLanguage, SourceLanguage } from './Data'
import { ApplyTemplate, SlotName, TextParams } from './Tree'

/** The engine's group: everything the engine looks up for itself. */
export const EngineGroup = TextProvider.instance.defaultGroupId

/** The mod's own group: everything the mod resolves and the engine only displays. */
export const ModGroup = 'Boids'

/** Which key shape a registration is: the three item slots, a composed extra, or mod prose. */
export type TextSlot =
    | SlotName
    | 'ModelName'
    | 'ModelExtra'
    | 'StartPerkName'
    | 'StartPerkDescription'
    | 'Category'
    | 'VariantPrefix'
    | 'Dialog'
    | 'StatusLine'
    | 'Message'

/** Where a registered value came from, as the generated reference reports it. */
export type TextSource = 'tree' | 'local' | 'engine' | 'blank'

/**
 * A slot's resolved value, or the engine key it will be filled from once the engine's own
 * text has loaded.
 *
 * Declared here rather than beside the resolver that produces it, because the sink is what
 * *consumes* it: keeping the vocabulary dependency-free of the resolver is what lets
 * `Spec` import `Sink` without the two importing each other.
 *
 * `Path` rides along on both forms because it is what makes a value **addressable**: a translator
 * overrides a path, so a slot without one cannot be reached from a language tree at all.
 */
export type SlotResolution =
    | {
        readonly kind: 'value'
        readonly Value: string
        readonly Source: TextSource
        readonly Path?: readonly string[]
    }
    | {
        readonly kind: 'deferred'
        readonly Key: string
        readonly Path?: readonly string[]
    }

/** One registration, as the reference and the gates read it. */
export interface RegisteredText {
    readonly Group: string
    readonly Key: string
    readonly Slot: TextSlot
    readonly Value: string
    readonly Source: TextSource
    /**
     * The tree path this value can be overridden at, when it has one.
     *
     * Recorded because it is what makes a value addressable: everything with a path can be
     * translated without touching code, and everything without one cannot be reached from a
     * language tree at all. The generated reference reports which is which.
     */
    readonly Path?: readonly string[]
}

/** Registration order, so a key keeps the position it was first written at. */
const Order: string[] = []
const ByKey = new Map<string, RegisteredText>()

/** A group and key pair, as a single map key. The separator cannot occur in either. */
const Identity = (group: string, key: string): string => `${group}\u0000${key}`

/** Every registration, in the order the keys were first written. */
export const TextRegistry = (): readonly RegisteredText[] =>
    Order.map(identity => ByKey.get(identity)!)

/**
 * Refuses a registration that could not render as text.
 *
 * These are authoring mistakes rather than player-facing states, so they throw at load —
 * the same call `AddModelWithText` and `AddRestraintWithText` already make for a duplicate —
 * and the suite asserts the same properties so a violation is a red test rather than only a
 * load failure.
 *
 * A **line break is allowed here**, deliberately: the engine's own tooltip splits the value it
 * is handed on `\n` and draws the pieces as separate lines
 * (`KinkyDungeonInventory.ts:1297-1302`), which is what the visor family's four-line function
 * block relies on. Where a break is *not* useful is DOM text, because a browser collapses it —
 * so a dialog's paragraphs are separate entries in `PromptSpec.Body` rather than embedded
 * breaks. That is a convention for the caller, not something this file enforces.
 */
const Validate = (args: { key: string, value: string }): void => {
    if (args.key.length === 0) {
        throw new Error('Boids text: a key must not be empty.')
    }
    if (args.value === args.key) {
        throw new Error(`Boids text: '${args.key}' was registered as its own value, so a player would see the key.`)
    }
}

const WriteToStore = (group: string, key: string, value: string): void => {
    if (group === EngineGroup) {
        addTextKey(key, value)
        return
    }
    TextProvider.instance.getGroupManager().appendText(group, key, value)
}

/**
 * Pins an engine-half value for the active language, so the engine's by-source translation
 * map cannot rewrite a string the mod already translated. See the module header.
 *
 * Nothing is pinned for the source language: English *is* the source, and the engine loads a
 * translation service entry only for a non-`EN` language, so there is nothing to guard
 * against.
 */
const Pin = (key: string, value: string): void => {
    const language = ActiveLanguage()
    if (language === SourceLanguage) {
        return
    }
    TextProvider.instance
        .getTranslationService(EngineGroup)
        .appendTranslation(language as LanguageIdentifier, {
            textTranslationMap: new Map(),
            tagTranslationMap: new Map([[key, value]]),
        })
}

const Register = (args: {
    Group: string
    Key: string
    Value: string
    Slot: TextSlot
    Source: TextSource
    Path?: readonly string[]
    /** True for the deferred engine pass, which fills a key that was registered blank. */
    Replace?: boolean
}): void => {
    const identity = Identity(args.Group, args.Key)
    if (ByKey.has(identity) && args.Replace !== true) {
        throw new Error(`Boids text: '${args.Key}' was registered twice in the '${args.Group}' group.`)
    }
    Validate({ key: args.Key, value: args.Value })

    if (!ByKey.has(identity)) {
        Order.push(identity)
    }
    ByKey.set(identity, {
        Group: args.Group,
        Key: args.Key,
        Slot: args.Slot,
        Value: args.Value,
        Source: args.Source,
        // Only when there is one: an absent address and an address that happens to be `undefined`
        // are different objects to a structural comparison, and the second is not a state.
        ...(args.Path != null ? { Path: args.Path } : {}),
    })
    WriteToStore(args.Group, args.Key, args.Value)
    if (args.Group === EngineGroup) {
        Pin(args.Key, args.Value)
    }
}

/** Registers a key the **engine** resolves: the composed half of the surface. */
export const RegisterEngineText = (args: {
    Key: string
    Value: string
    Slot: TextSlot
    Source: TextSource
    Path?: readonly string[]
}): void => Register({ ...args, Group: EngineGroup })

/** The key a path resolves to in the mod's own group: its segments joined by dots. */
export const PathKey = (path: readonly string[]): string => path.join('.')

/** Registers a key the **mod** resolves: the private half of the surface. */
export const RegisterModText = (args: {
    Path: readonly string[]
    Value: string
    Slot: TextSlot
    Source: TextSource
}): void => Register({
    Group: ModGroup,
    Key: PathKey(args.Path),
    Value: args.Value,
    Slot: args.Slot,
    Source: args.Source,
    Path: args.Path,
})

/**
 * Reads a mod-half value.
 *
 * The engine has no path to this group, so this is the only way mod-half text is read — and
 * because the value was resolved when it was registered, reading it again with the engine's
 * own lookup cannot change it.
 */
export const GetModText = (path: readonly string[], params?: TextParams): string =>
    ApplyTemplate(TextProvider.instance.getTextFromGroup(ModGroup, PathKey(path)), params)

/**
 * Writes one resolved engine-half slot: the value straight away, or a blank placeholder that
 * the deferred pass fills once the engine's own text has loaded.
 *
 * The blank is registered rather than skipped so the key always exists: a slot that is
 * merely absent would let the engine render the key itself.
 */
export const RegisterEngineSlot = (args: {
    Key: string
    Slot: TextSlot
    Resolution: SlotResolution
}): void => {
    if (args.Resolution.kind === 'deferred') {
        Register({
            Group: EngineGroup,
            Key: args.Key,
            Value: '',
            Slot: args.Slot,
            Source: 'blank',
            Path: args.Resolution.Path,
        })
        DeferEngineText({
            Key: args.Key,
            SourceKey: args.Resolution.Key,
            Slot: args.Slot,
            Path: args.Resolution.Path,
        })
        return
    }
    Register({
        Group: EngineGroup,
        Key: args.Key,
        Value: args.Resolution.Value,
        Slot: args.Slot,
        Source: args.Resolution.Source,
        Path: args.Resolution.Path,
    })
}

/**
 * A slot that can only be filled from the engine's own text — an item whose flavour and
 * function lines come from the restraint it is derived from.
 *
 * Deferred rather than read at registration time: at module evaluation the engine's own text
 * file may not have been parsed yet, and the previous code read it anyway, which is how a mod
 * string could arrive as `[NotFound] …`. The deferred pass runs from the engine's
 * `afterLoadMods`, which is after every mod file has been processed.
 */
interface DeferredEngineText {
    readonly Key: string
    /** The engine key the value comes from, e.g. `RestraintCyberBeltDesc2`. */
    readonly SourceKey: string
    readonly Slot: TextSlot
    /** The path the key is addressable at, carried through so the fill keeps it. */
    readonly Path?: readonly string[]
}

const Deferred: DeferredEngineText[] = []

/** Asks for a key to be filled from the engine's text once the engine has loaded it. */
export const DeferEngineText = (args: DeferredEngineText): void => {
    Deferred.push(args)
}

/** How many keys are still waiting on the engine's text; the suite asserts this settles. */
export const PendingEngineTextCount = (): number => Deferred.length

/**
 * Fills every deferred key from the engine's text.
 *
 * **Never throws.** It runs inside `KDExecuteMods`, which invokes `afterLoadMods` outside its
 * own `try`, so an exception here would escape into the mod loader rather than being caught
 * and logged. A source that still has not resolved therefore keeps its blank placeholder and
 * says so once; `test/text-registry.test.ts` is what fails when that is a real mistake.
 */
export const FlushDeferredEngineText = (): void => {
    const pending = Deferred.splice(0, Deferred.length)
    for (const entry of pending) {
        if (!HasText(entry.SourceKey)) {
            console.warn(
                `Boids text: the engine text '${entry.SourceKey}' was not loaded, so '${entry.Key}' ` +
                'keeps its blank placeholder.'
            )
            continue
        }
        Register({
            Group: EngineGroup,
            Key: entry.Key,
            Value: TextGet(entry.SourceKey),
            Slot: entry.Slot,
            Source: 'engine',
            Path: entry.Path,
            Replace: true,
        })
    }
}

/**
 * The single deferral point for the whole mod.
 *
 * `afterLoadMods` is the engine's last act of mod loading (`Scripts/KDMods.ts:554`), so by
 * the time it fires every mod file has been read and the engine's own text has had the whole
 * loading screen to arrive.
 */
AddEventHandler({
    eventMap: KDEventMapGeneric,
    trigger: 'afterLoadMods',
    type: 'AE5E02CB-268D-448A-956C-EE7A5442330F',
    handler: () => {
        FlushDeferredEngineText()
    },
})
