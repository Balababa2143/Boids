/**
 * The text data a scope ships: the trees it registers, merged per language, and the
 * language the resolver reads first.
 *
 * A scope is a folder with its own `Data/` — `Common/Data`, `FactionMachine/Data`,
 * `FactionMachine/MachinePrime/Data`, and a family's own `Data/` when it has text to share.
 * Each registers what it carries and declares a {@link TextTreeSource.Rank}, so that a
 * narrower scope's leaf wins at the same path **without any scope having to know another
 * exists**.
 *
 * ## The one ordering rule
 *
 * Trees are merged lazily, but a merge can only see the sources registered by then, so **a
 * source must be registered before the first registration that reads its tree**. That is why
 * the module which *reads* a tree also imports it — `Link/Arm.ts` carries `import './Data'` —
 * rather than the data being gathered at one central point that is assumed to run first.
 *
 * The central point was tried, and it does not hold. An entry's `import` statements do
 * evaluate in source order, but **a bundler may reach the content tree by another path
 * first**: the suite imports `src/Api` statically from one test file while the entry is loaded
 * dynamically from another, and the static path wins, so the registrations resolved with no
 * trees at all. An import inside the consumer cannot be bypassed that way.
 * @module KDExtension/Text/Data
 */

import { DeepMerge, TextTree } from './Tree'

/**
 * One scope's trees: which languages it carries, and where it sits in the merge.
 *
 * `Rank` orders the scopes, **lowest first**, and is declared rather than inferred from
 * registration order — module evaluation order is a bundler detail, not a design decision,
 * and a merge that depended on it would be wrong the day an import moved.
 */
export interface TextTreeSource {
    /** The scope's id, as the reference and a failure message spell it. */
    readonly Scope: string
    /** Merge order across scopes: lower is wider, and therefore merged first. */
    readonly Rank: number
    /**
     * One tree per engine language identifier (`CN`, `JP`, …). `en` is the one every source
     * must carry, because it is the fallback for every other language.
     */
    readonly Languages: Readonly<Record<string, TextTree>>
}

/** The language the mod authors in, and the fallback for every other. */
export const SourceLanguage = 'en'

/**
 * The merge order's scale.
 *
 * A scope declares its own rank, so the ranks only mean anything read against one list:
 * **lower is wider, and merged first**, so a narrower scope's leaf wins at the same path. The
 * gaps of ten are there so a scope can be inserted between two of these without renumbering
 * everything below it — which would silently reverse a precedence.
 */
export const TextScopeRank = {
    /** What the mod shares across factions: `src/Common/Data`. */
    Common: 0,
    /** One major faction: `src/FactionMachine/Data`. */
    Faction: 10,
    /** One sub-faction: `src/FactionMachine/MachinePrime/Data`. */
    SubFaction: 20,
    /** One item family, which is where variant text is shared: `…/<Family>/Data`. */
    Family: 30,
} as const

const Sources: TextTreeSource[] = []
const Merged = new Map<string, TextTree>()

/**
 * Registers one scope's trees, once. Called at module evaluation by the scope's own `Data`
 * module.
 *
 * @throws If a scope registers twice, which would silently double every one of its leaves.
 */
export const RegisterTextTreeSource = (source: TextTreeSource): void => {
    if (Sources.some(registered => registered.Scope === source.Scope)) {
        throw new Error(`Boids text: the scope '${source.Scope}' registered its trees twice.`)
    }
    if (source.Languages[SourceLanguage] == null) {
        throw new Error(
            `Boids text: the scope '${source.Scope}' has no '${SourceLanguage}' tree. ` +
            'Every source carries the language the mod authors in, because it is the fallback.'
        )
    }
    Sources.push(source)
    // A merge computed before this point would be missing these leaves.
    Merged.clear()
}

/** Every registered scope, widest first; ties keep registration order. */
export const TextTreeSources = (): readonly TextTreeSource[] =>
    [...Sources].sort((left, right) => left.Rank - right.Rank)

/** One language's tree: every scope that carries it, merged widest first. */
export const MergedTreeFor = (language: string): TextTree => {
    const cached = Merged.get(language)
    if (cached != null) {
        return cached
    }
    const merged = TextTreeSources()
        .filter(source => source.Languages[language] != null)
        .reduce<TextTree>((result, source) => DeepMerge(result, source.Languages[language]), {})
    Merged.set(language, merged)
    return merged
}

/**
 * The language the resolver reads before English.
 *
 * `TranslationLanguage` is the engine's own value, set from the player's locale before any
 * mod runs (`Scripts/Translation.ts:19`, `Scripts/Common.ts:349`). It is read on every call
 * rather than captured: a language change sets `KDRestart` and reloads the page
 * (`base/KinkyDungeon.ts:6606`), so the value cannot change under a running mod, and caching
 * it would only add a second source of truth to keep in step.
 *
 * The `typeof` guard is deliberate: the suite loads the mod graph with the engine stubbed,
 * and a missing global must read as "the source language" rather than throw.
 */
export const ActiveLanguage = (): string =>
    typeof TranslationLanguage === 'string' && TranslationLanguage !== ''
        ? TranslationLanguage
        : SourceLanguage

/** The trees a resolution may read, most specific first: the active language, then English. */
export const TreesForResolution = (): readonly TextTree[] => {
    const active = ActiveLanguage()
    return active === SourceLanguage
        ? [MergedTreeFor(SourceLanguage)]
        : [MergedTreeFor(active), MergedTreeFor(SourceLanguage)]
}
