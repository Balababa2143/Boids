/**
 * The text data a scope ships: the trees it registers, merged per language, and the language the
 * resolver reads first. A source must be registered before the first registration that reads its tree.
 * @module KDExtension/Text/Data
 */

import { DeepMerge, TextTree } from './Tree'

/**
 * One scope's trees: which languages it carries, and where it sits in the merge. `Rank` is declared
 * rather than inferred, because module evaluation order is a bundler detail.
 */
export interface TextTreeSource {
    /** The scope's id, as the reference and a failure message spell it. */
    readonly Scope: string
    /** Merge order across scopes: lower is wider, and therefore merged first. */
    readonly Rank: number
    /** One tree per engine language identifier (`CN`, `JP`, …); `en` must be present, because it is the fallback. */
    readonly Languages: Readonly<Record<string, TextTree>>
}

/** The language the mod authors in, and the fallback for every other. */
export const SourceLanguage = 'en'

/**
 * The merge order's scale: lower is wider, and merged first, so a narrower scope's leaf wins at the
 * same path. The gaps of ten leave room to insert a scope without renumbering.
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
 * Registers one scope's trees, once, at module evaluation.
 *
 * @throws If a scope registers twice, or ships no `en` tree.
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
 * The language the resolver reads before English: the engine's `TranslationLanguage`, set before any
 * mod runs. A missing global reads as the source language, because the suite stubs the engine.
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
