/**
 * The one place a text key is written.
 *
 * Two groups: `default`, which the engine resolves for itself, and `Boids`, which only this mod reads and
 * writes. Engine-half keys are composed from an identity the mod derives, so they cannot collide with a
 * base-game key, and each is also pinned so the engine's by-source translation map cannot rewrite it.
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
 * A slot's resolved value, or the engine key it will be filled from once the engine's text has loaded.
 * `Path` makes a value addressable, so a slot without one cannot be reached from a language tree.
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
    /** The tree path this value can be overridden at, when it has one. */
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
 * Refuses a registration that could not render as text: an empty key, or a value that is its own key.
 * A line break is allowed, and the engine's tooltip draws the pieces as separate lines.
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
 * Pins an engine-half value for the active language, so the engine's by-source translation map cannot
 * rewrite a string the mod already translated. Nothing is pinned for the source language.
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
        // are different objects to a structural comparison.
        ...(args.Path != null ? { Path: args.Path } : {}),
    })
    WriteToStore(args.Group, args.Key, args.Value)
    if (args.Group === EngineGroup) {
        Pin(args.Key, args.Value)
    }
}

/** Registers a key the engine resolves: the composed half of the surface. */
export const RegisterEngineText = (args: {
    Key: string
    Value: string
    Slot: TextSlot
    Source: TextSource
    Path?: readonly string[]
}): void => Register({ ...args, Group: EngineGroup })

/** The key a path resolves to in the mod's own group: its segments joined by dots. */
export const PathKey = (path: readonly string[]): string => path.join('.')

/** Registers a key the mod resolves: the private half of the surface. */
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
 * Reads a mod-half value: the engine has no path to this group, so this is the only way it is read.
 */
export const GetModText = (path: readonly string[], params?: TextParams): string =>
    ApplyTemplate(TextProvider.instance.getTextFromGroup(ModGroup, PathKey(path)), params)

/**
 * Writes one resolved engine-half slot: the value straight away, or a blank placeholder the deferred
 * pass fills once the engine's own text has loaded.
 *
 * The blank is registered rather than skipped, or the engine would render the key itself.
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

/** A slot that can only be filled from the engine's own text, once the engine has loaded it. */
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
 * Never throws: it runs inside `KDExecuteMods`, which invokes `afterLoadMods` outside its own `try`. An
 * unresolved source keeps its blank placeholder and says so once.
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

/** The single deferral point for the whole mod: `afterLoadMods` fires after every mod file is read. */
AddEventHandler({
    eventMap: KDEventMapGeneric,
    trigger: 'afterLoadMods',
    type: 'AE5E02CB-268D-448A-956C-EE7A5442330F',
    handler: () => {
        FlushDeferredEngineText()
    },
})
