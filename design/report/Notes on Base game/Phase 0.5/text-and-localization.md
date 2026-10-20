# Phase 0.5 research notes — the text layer underneath

> **This folder is not corpus.** It decides nothing, it is not frozen, and nothing here may be cited
> as authority. Where these notes and `design/spec.md` disagree, the spec wins — always, and without
> appeal. What the folder is for is the other half of the work: the engine facts a phase had to trace
> to finish, written down once so nobody has to trace them twice.

Phase 0.5 was the **layout and the text surface**: one adapter through which every string the mod can
show is registered, with the engine's own group for what the engine resolves and the mod's own group
for what the mod resolves. Almost all of that work sat on one mechanism of the base game that is
documented nowhere and is, in places, two mechanisms wearing one name: how a string is looked up, and
how a translation reaches it.

This folder holds that mechanism. It is written to **stand alone** — the three conventions that
matter are restated here rather than cross-referenced — so that a later reorganisation of the sibling
folders cannot break it. It names no sibling folder.

---

## The markers

`design/README.md` defines the corpus's markers — `[Existing]`, `[Decided]`, `[Proposed]`, `[TBD]`,
`[Goal Post]`, `[To Be Verified]` — and those are claims about **design status**. Reusing them in a research
note would imply a standing it does not have, so this folder uses its own three, and nothing here is
ever `[Decided]`:

| Marker | Means |
| --- | --- |
| **[read]** | the source line was read, and the claim is what it says |
| **[counted]** | produced by a command given in *How to re-derive this* |
| **[inferred]** | reasoned from what was read, but not confirmed by a line of the engine |

A finding here can **motivate** a decision. The decision lives in `design/spec.md`, and this folder is
not where you find out what the mod does.

---

## How paths are written

The base game lives in a submodule and has **three** roots, not one. This folder uses the same
shorthand the sibling phases use, plus the third root, stated because it is written down nowhere
else:

| Written as | Means |
| --- | --- |
| `item/KinkyDungeonInventory.ts:1297` | `kd-structured/KinkyDungeon/Game/src/item/KinkyDungeonInventory.ts:1297` |
| `base/KDModUtils.ts:487` | `kd-structured/KinkyDungeon/Game/src/base/KDModUtils.ts:487` |
| `Scripts/Text.ts:384` | `kd-structured/KinkyDungeon/Scripts/Text.ts:384` |
| `Data/Models.ts:102` | `kd-structured/KinkyDungeon/Data/Models.ts:102` |
| `Screens/MiniGame/KinkyDungeon/Text_KinkyDungeon.csv` | `kd-structured/KinkyDungeon/Screens/MiniGame/KinkyDungeon/Text_KinkyDungeon.csv` |
| `src/…`, `test/…`, `design/…`, `docs/…` | repository paths, as usual |

So **a path with no leading repository folder is under the submodule's `Game/src/`**, and `Scripts/`,
`Data/` and `Screens/` name themselves.

A citation gives a line **plus the enclosing function's name** wherever one exists, so a shift of a
line or two does not invalidate it. Every site below was re-read while the sentence citing it was
written — which is the only defence available for a claim about somebody else's source tree, because
this repository's path gate only polices backticked tokens beginning `design/` or `docs/` and cannot
resolve a bare `item/X.ts`.

---

## The shape: two maps, and a read path that consults both

`Scripts/Text.ts` is the whole system. `TextProvider` (`Scripts/Text.ts:384`, singleton at `:385`,
`:427`) holds four things **[read]**:

| Field | Line | Is |
| --- | --- | --- |
| `defaultGroupId = "default"` | `:387` | the only group id the engine's readers use |
| `textGroupManager` | `:391` | **source** text, `groupId → (key → value)` |
| `translationServiceGroup` | `:392` | **translations**, `groupId → LocalizationService` |
| `originalTextLoader` / `translationTextLoader` | `:395`, `:396` | the `.csv` and `.txt` fetchers |

The read path is short, and its order is the whole story:

```
getText(tag, params, legacy)            Scripts/Text.ts:438
  → getTextFromGroup(defaultGroupId, …) Scripts/Text.ts:439
      → getTextFromGroupStrict(…)       Scripts/Text.ts:515
          sourceText = group.get(tag)
          text = translationService.translate(tag, sourceText) || sourceText
          text = applyTemplate(text, params)
```

**[read] A translation wins over the source text, per tag.** `getTextFromGroupStrict` (`:515-535`)
computes `translationService.translate(tag, sourceText) || sourceText`, so the source map is the
*fallback* and the per-language translation map is asked first. `LocalizationService.translate`
(`:284-296`) then tries **two keys in order**: `tagTranslationMap.get(tag)`, and failing that
`textTranslationMap.get(text)` — the **English string itself**. Both maps are filled from the
translation file, and which one an entry lands in is decided by the file's own marker (§ *Two
translation routes*).

**[read] A miss is text, not an error.** `getTextFromGroup` (`:496-504`) returns
`"[NotFound] " + tag` when nothing answers, or the bare tag when `legacy` is set. `TextGet`
(`:658-663`) passes `legacy` when `KDToggles.ModCompat` is on and no params were given — so under that
toggle a missing key is indistinguishable from authored text.

**[read] `addTextKey` writes the source map, synchronously.** `Scripts/Text.ts:675-679` appends to
`getGroupManager()` under the **literal** `"default"`. No fetch, no await: a mod's own registrations
are visible the instant the line runs, which is what makes registering at module evaluation safe.

**[counted] The read path is overwhelmingly `TextGet`.** Across the engine's 269 `.ts` files:
`TextGet(` appears **3,005** times, `HasText(` **17**, `addTextKey(` **19**, and
`getTextFromGroup(` **twice** — its definition and the one call above.

---

## Only `default` is read

This is the fact the mod's text surface is built on, and it is worth stating as evidence rather than
as an impression **[read]**:

| Site | What it does |
| --- | --- |
| `Scripts/Text.ts:439` | `getText` → `getTextFromGroup(this.defaultGroupId, …)` |
| `Scripts/Text.ts:449` | `hasText` → `getTextFromGroupStrict(this.defaultGroupId, …)` |
| `Scripts/Text.ts:678` | `addTextKey` → `appendText("default", …)` |
| `Data/Utils.ts:76` | `getOldPronounPairs` → `getGroupManager().getGroup(textProvider.defaultGroupId)` |

`getTextFromGroup(` has exactly **two** occurrences in the engine **[counted]**: its definition, and
that single call, which passes `defaultGroupId`. `Data/Utils.ts:74-87` is the only other place that
reaches into the group manager, and it too passes `defaultGroupId`.

**[inferred] A second group is invisible to the engine, and that is a property rather than an
oversight.** Nothing in the engine iterates groups or accepts a group id from outside, so text a mod
registers under its own id can never reach `TextGet`. Two consequences a text layer has to respect:

1. Anything the **engine** resolves by key — an item name, a tooltip line, a perk label — must be
   registered in `default`, or it reads as `[NotFound] <key>`.
2. A string the **mod** resolves itself may live in its own group, because the mod is the only reader.
   The engine merely displays the value it is handed.

**[read] An unknown group id is not an error.** `TextGroupManager.getGroup` (`Scripts/Text.ts:179-186`)
**creates an empty `Map` on demand**, so every read from a group nobody registered answers
`[NotFound] <tag>` rather than throwing. A typo in a group id therefore fails as missing text, never
as a crash.

**[inferred] `defaultGroupId` and `addTextKey`'s `"default"` are two spellings of one group.** They
agree today (`:387` and `:678`), so nothing is broken; if the engine ever renamed the constant,
`addTextKey` would keep writing to `"default"` and every subsequent registration would land in a group
no reader consults.

---

## The key shapes the engine composes

The engine does not address text by path; it **concatenates a prefix, an identity and sometimes a
suffix**, at the call site, every time. These are the shapes a mod has to match **[read]**:

| Shape | Written by | Read at |
| --- | --- | --- |
| `Restraint<name>`, `+Desc`, `+Desc2` | `base/KDModUtils.ts:487-493` (`KinkyDungeonAddRestraintText`) | `item/KinkyDungeonInventory.ts:1297-1302` |
| `KinkyDungeonInventoryItem<name>`, `+Desc`, `+Desc2` | the same function, reached from `base/KDModUtils.ts:64` | `item/KinkyDungeonInventory.ts:1285-1302`, `item/KinkyDungeonLoot.ts:335` |
| `m_<model>` | `Data/Models.ts:102` (`addTextKey("m_" + str[0], str[1])`) | `Data/Utils.ts:58`, `player/wardrobe/KDWardrobe.ts:1355` |
| `m_<model>_l_<layer>` | — (a mod's or a translator's job) | `Data/Utils.ts:63-67`, `player/wardrobe/KDWardrobe.ts:1369` |
| `c_<category>` | — | `player/wardrobe/KDWardrobe.ts:1355` |
| `KDVarPref<prefix>` / `KDVarSuff<suffix>` | — | `restraint/KinkyDungeonRestraints.ts:7442-7492` (six near-identical sites) |
| `KinkyDungeonStat<id>` | — | `player/KinkyDungeonPerks.ts:1144`, `:1179`, `map/KinkyDungeonShrine.ts:1007`, `base/KinkyDungeon.ts:929` |
| `KDCategory<name>` | — | `player/KinkyDungeonPerks.ts:1218` |

Two of those are worth reading rather than skimming:

- **The item prefix is chosen at the read site**, from the item's type:
  `item/KinkyDungeonInventory.ts:1285-1289` starts at `"KinkyDungeonInventoryItem"` and switches to
  `"Restraint"` when `item.item.type` is `Restraint` or `LooseRestraint`. The same two prefixes appear
  as defaults on the variant-removal helpers (`item/KinkyDungeonInventory.ts:3286`, `:3292`).
- **A category key falls back to a model key** at the read site:
  `player/wardrobe/KDWardrobe.ts:1355` reads
  `HasText("c_" + toplevel) ? TextGet("c_" + toplevel) : TextGet("m_" + toplevel)` — so a `c_` entry is
  optional and the wardrobe's own model name is the fallback.

**[counted] The shipped content agrees with the shapes above.** The engine's own text file carries the
`KDCategory*` and `KDVarPref*`/`KDVarSuff*` families in bulk — e.g.
`Screens/MiniGame/KinkyDungeon/Text_KinkyDungeon.csv:11824-11841` (18 `KDCategory*` rows) and
`:29926-29928` with `:30336-30359` (the variant prefix and suffix tables: `KDVarPrefEnchanted,Enchanted`,
`KDVarSuffPurified,(Purified)`, `KDVarPrefElementalDmg_cold,Shadow`).

---

## `Desc` is flavour, `Desc2` is function

The two description slots are named by their suffixes, and the engine's own writer says which is
which **[read]**:

```
KinkyDungeonAddRestraintText(name, displayName, flavorText, functionText)   base/KDModUtils.ts:487
  addTextKey(`Restraint${name}`,      displayName)
  addTextKey(`Restraint${name}Desc`,  flavorText)      // flavour
  addTextKey(`Restraint${name}Desc2`, functionText)    // function
```

So **`Desc` carries the flavour line and `Desc2` the function line** — the reverse of what a reader
would guess from the names, and the reason a text layer needs the mapping written down. The read side
confirms it is not a private convention: `item/KinkyDungeonInventory.ts:1297-1302` fetches both, each
through `KinkyDungeonWordWrap(...).split('\n')`, so **a value may carry several lines and they are
drawn as separate lines**; that is how a multi-line function block renders.

**[read] There is no third slot.** The tooltip reads exactly these two keys plus the name. A suffix the
engine never reads — `…Flavor`, say — is a key nothing will ever display, which is the defect this
mapping caused while it was guessed at: function text written to `Desc` appears as flavour, and text
written to a `Flavor` suffix appears nowhere.

---

## Two translation routes, and only one of them is the new one

Both live in the engine and both reach the same flat source map, by different doors **[read]**:

**(A) The per-language `LocalizationService`** (`Scripts/Text.ts`, `.txt` files). Registered per group
by `appendTextResource` (`:474-485`) with a `localizationDictionary: language → url`; loaded by
`loadAndSetupTranslationText` (`:581-592`) into `LocalizationService.appendTranslation` (`:255-263`).
It is consulted *inside* the read path (§ *The shape*), so it **overrides the source text** without
touching it. Two key kinds, decided by the file's marker:

| Marker line | Goes into | Matched by |
| --- | --- | --- |
| `- <English text>` | `textTranslationMap` | the **source value**, byte for byte |
| `:: <tag>` | `tagTranslationMap` | the **key** |

**(B) The CSV importer** (`Scripts/Translation.ts:46-104`). `KDLoadTranslations(text1, text2)` parses a
`key,value` CSV — the same shape as the engine's original `.csv` — and then, for every key, calls
`addTextKey(key, translation ?? original)` (`:96-103`). Because `addTextKey` writes the **source** map,
this route **overwrites the English in place** rather than layering over it. It is the older mechanism;
its own doc comment doubts half of it ("*Secondary array to load - this is probably a translation -
This part might not be working?*", `:44`), and `TranslationCache` (`:2`) is declared and never used.

**[inferred] The two routes are not equivalent, and the difference matters to a mod.** Route (A) leaves
the English in place and can be overridden by tag; route (B) destroys it for the session. A mod that
reads the engine's text to mirror it — which is what the mod's declared-source slots do — gets the
*English* only while route (A) is in play; under route (B) the same read returns the translation.

**[read] The shipped files use both markers, and `#` disables a line.** In
`Screens/MiniGame/KinkyDungeon/Text_KinkyDungeon_CN.txt:2121-2126`:

```
# :: KinkyDungeonFilterupcast
- You are able to cast higher level versions of spells.
你能够施放更高等级的法术。
- Light
光
# :: KDBuffName_Light
```

The parser trims leading whitespace and reads only lines that **begin** `-` or `::`
(`Scripts/Text.ts:116-122`), taking the *following* line as the value. A `#`-prefixed line matches
neither and is skipped — so `# :: KDBuffName_Light` is a **disabled** entry, and the pair above it is
the translator's live choice: the same text is keyed by its English (`- Light`) rather than by its tag.
That is exactly why a *text-keyed* translation is fragile, and why a mod that wants a stable override
of an engine string reaches for the tag map instead.

---

## The resource layout, and three lists that disagree

**[read]** `TextResPathGenerator` (`Scripts/Text.ts:4-32`) composes everything from one base and one
prefix, set in `initializeDefaultConfig` (`:408-421`) as `Screens/MiniGame/KinkyDungeon` +
`Text_KinkyDungeon`:

- original: `<base>/<prefix>.csv` (`:14-16`)
- translation: `<base>/<prefix>_<LANG>.txt`, upper-cased (`:18-21`)

On disk that is one `.csv` and **seven** `.txt` files **[counted]** — `CN DE ES JP KR PL RU` — out of
`Screens/MiniGame/KinkyDungeon/`.

Three lists decide which of those can ever be reached, and they do not agree **[read]**, **[counted]**:

| List | Site | Contents |
| --- | --- | --- |
| `AvaliableLanguages` | `Scripts/Text.ts:142` | `EN CN DE ES JP KR RU` (7) |
| `NormalSupportedLanguages` | `Scripts/Text.ts:144-146` | the same **minus `EN`** (6) — the keys of the translation dictionary, so these are the files the provider will fetch |
| `KDLanguages` | `base/KinkyDungeon.ts:101` | `"" CN KR JP RU ES` (6) — the list `GetUserPreferredLanguage` filters the browser locale against |

So **`DE` ships a translation file, is listed as available, and can never be selected by locale**
because it is not in `KDLanguages`; `PL` ships a file and is in neither list.** (The spelling
`AvaliableLanguages` is the engine's.)

**[read] The language is chosen in two places, and only one of them filters.**
`TranslationLoad` (`Scripts/Translation.ts:7-20`) prefers `localStorage` — `LanguageChange == "1"` plus
`BondageClubLanguage` — and only otherwise asks `GetUserPreferredLanguage` (`:22-38`), which scans the
browser locale for a member of `KDLanguages`. A language written to `localStorage` therefore bypasses
the filter and *can* select `DE`; locale detection cannot.

---

## When a mod may read the engine's text

**[read]** The boot order is short and everything in it is asynchronous after the first three lines
(`Scripts/Main.ts:52-61`):

```
window.onload
  TranslationLoad()                      Scripts/Main.ts:59      → sets TranslationLanguage
  CommonSetScreen("MiniGame", "KinkyDungeon")  Scripts/Main.ts:61
    TextLoad()                           Scripts/Common.ts:349
      textProvider.setLanguage(TranslationLanguage)   Scripts/Text.ts:670-672
        per group: translationService.setLanguage(lang) and, if the dictionary has it,
                   loadAndSetupTranslationText(...)     Scripts/Text.ts:609-632
```

`loadAndSetupOriginalText` (`:568-572`) and `loadAndSetupTranslationText` (`:581-592`) both start a
fetch and attach a `.then`; neither is awaited by its caller.

**[read] Nothing ever waits for them.** `TextProvider.readyAll()` (`:639-644`) exists for exactly that
purpose and has **no caller** **[counted]**: the only occurrence of `readyAll` in the engine is its own
definition. So a text read at any moment is a race against the first fetch, and the loser sees
`[NotFound] <tag>` — unless `KDToggles.ModCompat` is on, in which case the loser sees the raw key.

**[read] The mod's own registration is not in that race.** `addTextKey` appends to the source map
synchronously (§ *The shape*), so what the *mod* registers is present immediately; it is the
**engine's** text that may be missing. A slot whose only source is an engine key must therefore be
read late or guarded — `HasText` first, or at the point the engine says the mods are in
(`KinkyDungeonSendEvent("afterLoadMods", {})`, `Scripts/KDMods.ts:554`).

---

## Traps

Each of these cost time to find, and none is visible from one file.

- **[read] `HasText` means "there is non-empty text", not "the key is known".**
  `Scripts/Text.ts:448-450` is `!!getTextFromGroupStrict(...)`, and `:515-535` returns the source value
  unchanged, so a key registered as `''` answers **false**. Registering a deliberate blank is
  therefore invisible to `HasText` — which is exactly why emptying a slot rather than omitting it is a
  different thing from not having one.
- **[read] A text-keyed translation breaks when the English moves.** `translate` falls back to
  `textTranslationMap.get(text)` (`:295`), so `- Light` answers only while the source string is exactly
  `Light`. The shipped files carry 16,084 such entries against 1,494 tag-keyed ones **[counted]**, which
  is the size of the blast radius of an English edit.
- **[read] `Translation.ts:98` and `:101` are no-ops.** Both read
  `parsedkeystranslation[key].slice('\r')`; `String.prototype.slice` coerces `'\r'` to `0`, so this
  returns the whole string. The intended carriage-return strip never happens — the
  `replace(/\r\n?/g, '\n')` earlier in the same function (`:49`, `:71`) is what actually protects the
  values.
- **[read] A malformed translation file throws.** The parser's loop (`Scripts/Text.ts:115-122`) advances
  `i` with `lines[++i]` and calls `.trimStart()` on the result without a bounds check, so a file whose
  **last** line is a marker dereferences `undefined`.
- **[read] `applyTemplate` leaves an unfilled placeholder in place.** `Scripts/Text.ts:646-651`
  replaces `${word}` only when `params[key] !== undefined`, and returns the match otherwise — so
  `${Name}` with no `Name` parameter reaches the player as `${Name}`, and `\w+` means a placeholder
  with a hyphen or a space is never substituted at all.
- **[read] A debug mode prefixes the key.** `:530-532` prepends `${tag}::` when `_debugMode` is set —
  useful to know before reporting "the key is being drawn".
- **[read] The default config is registered before a language exists.**
  `initializeDefaultConfig` (`:408-421`) calls `appendTextResource` from the constructor while
  `currentLanguage` is still `null` (`:389`), so the constructor's translation branch (`:477-484`) is
  skipped and the default group's translation is only loaded when `setLanguage` runs.

---

## How to re-derive this

Every count above came from one of these, run from the repository root. The engine's `node_modules` is
excluded, which matters because it contains a second copy of the world.

```powershell
# The whole read path, and the three hard-wired group sites.
Select-String -Path 'kd-structured\KinkyDungeon\Scripts\Text.ts' -Pattern 'defaultGroupId|appendText\(' -CaseSensitive

# How the engine gets text, by call shape (269 engine .ts files).
$engine = Get-ChildItem kd-structured\KinkyDungeon -Recurse -File -Filter *.ts |
    Where-Object { $_.FullName -notlike '*node_modules*' }
foreach ($pat in 'addTextKey\(', 'TextGet\(', 'HasText\(', 'getTextFromGroup\(', 'readyAll') {
    "$pat -> " + ($engine | Select-String -Pattern $pat -CaseSensitive).Count
}

# The two translation markers, and the file inventory.
$cn = 'kd-structured\KinkyDungeon\Screens\MiniGame\KinkyDungeon\Text_KinkyDungeon_CN.txt'
"dash="  + (Select-String -Path $cn -Pattern '^-'  -CaseSensitive).Count   # text-keyed
"tag="   + (Select-String -Path $cn -Pattern '^::' -CaseSensitive).Count   # tag-keyed
Get-ChildItem 'kd-structured\KinkyDungeon\Screens\MiniGame\KinkyDungeon' -Filter 'Text_KinkyDungeon*' |
    Select-Object -ExpandProperty Name

# The three language lists, side by side.
Select-String -Path 'kd-structured\KinkyDungeon\Scripts\Text.ts' -Pattern 'AvaliableLanguages\s*=' -CaseSensitive
Select-String -Path 'kd-structured\KinkyDungeon\Game\src\base\KinkyDungeon.ts' -Pattern 'KDLanguages\s*=' -CaseSensitive
```

Numbers as they stood when this note was written: `TextGet(` **3,005**; `HasText(` **17**;
`addTextKey(` **19**; `getTextFromGroup(` **2**; `readyAll` **1** (its own definition); the CN file
**55,255** lines, **16,084** `-` and **1,494** `::`; **7** translation files plus the original `.csv`.
A count here is a snapshot of a moving tree — re-run the command rather than trusting the number.

---

## What this note is not

- **Not a decision record.** `design/design-brief.md` is where reasoning about choices lives; this note
  only says what the engine does.
- **Not a substitute for the guide.** `docs/guide/` is hand-written documentation for people working on
  *this mod*; in particular the mod's own text conventions are the guide's business and are not
  restated here, because a second copy of a live design is a copy that drifts.
- **Not a defect register.** Defects the engine ships are tracked in `docs/guide/known-issues.md`. The
  two above that qualify — the `slice('\r')` no-op and the unbounded `lines[++i]` — are noted only
  because a claim in this note needs them.
- **Not exhaustive.** It covers the lookup, the key shapes the mod had to match, the two translation
  routes and the load timing. The engine's own text *content* is not catalogued here — the CN
  translation file alone is 55,255 lines — and neither are the screens that draw text, the word-wrap
  rules, or the font metrics that `KinkyDungeonWordWrap` consults.
