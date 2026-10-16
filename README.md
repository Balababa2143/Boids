# Boids

A dronification-themed mod for **Kinky Dungeon**, packaged as a texture/asset set
plus a single webpack bundle that the game evaluates at load time.

The mod registers models, restraints, text keys and event handlers into the game's
globals as a side effect of being imported. There is no plugin API to hook into and
no runtime to own — by the time anything can ask this mod a question, all of its
content already exists in the game.

One thing it does own is a global: when the bundle's body has run, `Boids` is the
namespace `src/Api.ts` exports. See [The bundle and its global](#the-bundle-and-its-global).

## Layout

| Path | What it is |
| --- | --- |
| `src/mod.ts` | The bundle entry: imports the surface, builds the layer table and requests the atlases, then publishes it as `globalThis.Boids`. |
| `src/Api.ts` | The published surface — the faction namespace and `CommonUI`, and nothing else. |
| `src/FactionMachine/` | The machine major faction: `Futuristic` (the outfit), `MachinePrime` (its first sub-faction) and `DebugStart`. |
| `src/Common/` | What the mod shares across factions: the warning dialog and the item-event builders. |
| `src/KDExtension/` | Registration helpers and the variant-map builders (the "new infrastructure"). |
| `src/KDInterface/` | Types that describe the game's event map and text keys. |
| `src/Utilities/` | Small generic helpers. |
| `Asset/` | Shipped assets: `mod.json`, audio, item sprites, texture atlases. |
| `webpack/` | Build tooling shared by the two webpack configs: paths, ts-loader, staging, checks. |
| `test/` | The verification suite (see below). |
| `kd-structured/` | Submodule (`KDInterface`). Owns the generated KD typings and drops `kd-structured.zip`, a separate mod this one loads through an import map. |
| `Bundle/`, `Deploy/`, `Declaration/`, `Generated/`, `.fake/` | Build output. All gitignored. |

### Barrels

A folder that other folders import from has an `index.ts`, and it re-exports every
module in that folder: flat (`export * from './X'`) when the module is the folder's
public surface, as a namespace (`export * as X from './X'`) when the module name
carries meaning at the call site. Code outside a folder imports its barrel; code
inside it imports its siblings.

A module missing from its barrel is a bug in the barrel, not a licence for a deep
import, because a deep import is the one spelling a reader cannot predict. Two
deliberate exceptions are spelled out where they happen: the glass visor barrel
exports `Variant` by name rather than as a namespace, because consumers use it as a
type as well as a value; and `src/Api.ts` reaches into `src/Common/CommonUI` rather
than importing `src/Common`, because the published surface is a subset of that folder
and the barrel would publish `CommonEvent` along with it.

### Layering

Dependencies point one way, and `test/layering.test.ts` fails if one points back:

```
Utilities  <  KDInterface  <  KDExtension  <  Common  <  FactionMachine
```

`Utilities` is generic helpers, `KDInterface` describes the game's own surface,
`KDExtension` is the mod's infrastructure, `Common` is what the mod shares across
factions, and `FactionMachine` is one faction's content. A file may import from its own
layer or from a layer to its left; `src/Api.ts`, `src/mod.ts` and the promise loader sit
above them all. A second faction is where this pays: it uses `Common` and `KDExtension`
unchanged, and nothing below it has to learn its name.

### Text

Every string the mod shows is registered through one place, `src/KDExtension/Text/`, and the rule
that decides where it lives is **who resolves the key**:

- if the **engine** resolves it, the engine composes it from an identity the mod already holds —
  `Restraint<name>` and its `Desc`/`Desc2` suffixes, `m_<model>`, `KDVarPref<p>`,
  `KinkyDungeonStat<id>`, `KDCategory<name>` — and it is registered in the group the engine reads;
- if the **mod** resolves it, it is addressed by a dotted path and registered in the mod's own
  group. A string the engine merely *displays* from a value the mod has already resolved is on this
  side too, which is all of the dialog and status-line wording.

`Text/Slot.ts` holds every composed key shape, so no call site spells one, and
`test/text-registry.test.ts` fails if a key matches neither kind, if a restraint the mod names is
missing one of the three lines the engine draws, or if a registered value is a placeholder rather
than text.

**Where the English lives.** Text data sits in JSON trees at the closest common root of the entities
that use it — `…/<Family>/Data/en.json` for a line a family's variants share, and a faction or
common folder once something is shared more widely. Each slot resolves through a precedence list,
first hit winning:

1. the active language's merged tree, the fullest path first and then each shorter prefix;
2. the English tree, the same walk;
3. the value the registration declares;
4. the engine's own text for a declared source item;
5. blank.

So a family authors a shared line **once** and each variant overrides only what differs, and a
translator may override any path — including a shorter one, which then covers everything beneath it.
A tree is imported by the module that **reads** it, never by the entry: a bundler may reach the
content tree by more than one path, and the first attempt at this failed for exactly that reason.

**Two limits, stated rather than discovered.** A string is translatable once it has a path, and the
hand-written item families do not have one yet — `docs/localization/text-reference.md` marks them.
And English on the mod's own side is still authored beside the code that renders it, because a
string only one module uses belongs to that module; the wider `Data/` folders appear when there is
prose for them to hold.

## The bundle and its global

`webpack.config.ts` builds one classic script, `Bundle/main.bundle.js`, which the
game evaluates. It is an **async module**: `kd-structured` is a promise external,
resolved at runtime through the import map that mod publishes, so nothing here runs
until it exists. `src/mod.ts` is the entry that finishes the job, assigning the
namespace to `globalThis.Boids`.

That assignment is the whole interface. The name is either absent — the load has
not finished — or the namespace exported by `src/Api.ts`; it is never a promise, so
`Boids.FactionMachine.MachinePrime.Debug.SetBlindStrength(0.5)` works from the console
as written, and `(await Boids).X` also works because awaiting a non-thenable returns it.
A load that fails leaves no global at all rather than a rejected promise, and the loader
logs it.

The two mods are ordered by `priority` (higher first) and the game awaits each file,
so **kd-structured (20) finishes before Boids (10) starts**. That is the handshake:
the late binding is what lets either mod be installed on its own, and the priority
gap is what makes the dependency present by the time it is needed. `mod.json` names
`kd-structured` in `dependencies` for the reader's sake — the game declares that
field UNIMPLEMENTED and ignores it.

Two properties of this mode are deliberate rather than accidental. The bundle is
eval'd, not imported, so webpack keeps ownership of import resolution and of any
`import()` it might transpile; a chunked build would emit files that have to be
listed in `fileorder`, with `output.publicPath` pointing somewhere the game can
fetch — the build refuses to ship a bundle that loads a chunk, so that decision
cannot be made by accident.

## Using Boids from another mod

Mods load in descending `priority` and the game awaits each file it evaluates, so a
mod that declares a lower priority than Boids' `10` finds `globalThis.Boids` ready
and needs none of the below. If you cannot arrange that, poll for it.

```js
// A mod file is eval'd as a classic script, and the game awaits what the eval
// returns before starting the next mod. Two consequences: never reject, and never
// wait forever, or loading stalls with nothing in the log to explain it.
;(async () => {
    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

    const waitFor = async (name, read, timeoutMs = 30_000) => {
        const deadline = Date.now() + timeoutMs
        for (;;) {
            const value = read()
            if (typeof value !== 'undefined') return value
            if (Date.now() > deadline) {
                console.error(`${name} did not load within ${timeoutMs} ms; skipping`)
                return undefined
            }
            await sleep(50)
        }
    }

    // `Boids` is never a promise, so this is a plain property read. If you also
    // need kd-structured, see its README: it is reached by import, not by a global.
    const Boids = await waitFor('Boids', () => globalThis.Boids)
    if (!Boids) return

    Boids.FactionMachine.MachinePrime.Debug.SetBlindStrength(0.5)
})().catch(error => console.error('my mod failed:', error))
```

The surface is two namespaces: `Boids.FactionMachine`, one level per major faction, and
`Boids.CommonUI`. The faction holds `Boids.FactionMachine.Futuristic`,
`Boids.FactionMachine.MachinePrime` and `Boids.FactionMachine.DebugStart`; a second
faction is a sibling of `src/FactionMachine/` rather than a fourth name here. Everything
else — the variant infrastructure in `src/KDExtension`, the utilities, the mod's own
manifest — is internal for now, and `test/public-api.test.ts` fails if that changes
without the baseline being regenerated.

`CommonUI` is the one that exists for other mods rather than for content: a
compatibility warning has the same problem Boids' own does, and
`Boids.CommonUI.Prompt.ShowPrompt` is the dialog that solves it — a title, some
paragraphs, and buttons whose actions the caller supplies. It carries **no text of
its own**, so reusing it costs a caller nothing but the wording.

> **Three spellings, one word.** `Boids` is the published global and `Boids.X` is a path
> into it; `src/FactionMachine/` is a folder; and `Boids/` inside
> `Futuristic/Common/Constant.ModelSetRootDir` is the **asset namespace** the packed
> atlases name their frames by. None of the three is any other, and only the folder moved.
> A fourth is the `Boids.` prefix on a variant base name in `src/KDExtension/Release.ts`,
> which is **frozen save format** — read the note beside `VariantBaseNames` before
> "correcting" any of them.

## Building

```sh
npm install
npm run "Webpack Bundle: Debug"      # -> Bundle/main.bundle.js + Deploy/Boids.zip
npm run "Webpack Watch: Debug"
npm run "Webpack Bundle: Production"
```

The build also stages the published type package (`Deploy/types/`,
`Declaration/Boids-types.zip`) and copies `kd-structured/Deploy/kd-structured.zip`
into `Deploy/`. That submodule has to be built first; `npm install` alone does not
produce it, and the build names it when the archive is missing.

`package.json`'s `version` is the single source for the mod's `modbuild` and for the
types package's `version`; both staged files are stamped from it.

Nothing is archived until the staged bundle passes its own checks
(`webpack/verify.ts`): every `fileorder` entry exists in the bundle, the emitted
script assigns `globalThis.Boids` and carries no UMD wrapper, the late binding and
the single-file bundle survive, and the staged types package still points at
`src/Api.ts` and declares the global. A failure names the file it is unhappy about
and no archive is written.

Four tsconfigs, named for their jobs rather than their order:

| File | Consumed by | Purpose |
| --- | --- | --- |
| `tsconfig.json` | ts-loader in `webpack.config.ts` | the mod build; emits declarations into `Generated/@type/boids` |
| `tsconfig.webpack-test.json` | ts-loader in `webpack.test.config.ts` | the test bundle; declarations off, root widened to reach `test/` |
| `tsconfig.test.json` | `npm run typecheck` | no-emit check over `src/`, `test/` and `webpack/` |
| `kd-structured/Generated/tsconfig.json` | the submodule's own build | its generated bindings |

## Verifying

```sh
npm run typecheck   # tsc over src/, test/ and webpack/
npm run test        # bundle the suite, then run it with node
npm run verify      # both
npm run verify:full # both, then a full mod build
```

`test/` is bundled by `webpack.test.config.ts` — the project's own webpack +
ts-loader pipeline, so tests are compiled by the same toolchain as the mod — and
executed with plain `node`. `fast-check` is the only test dependency.

The mod cannot run outside the game, so the suite installs recording KD global
stubs *before* the module graph is evaluated (`test/setup/install.ts`) and imports
`src/mod.ts`, the same entry the bundle ships.

### The registration manifest

`test/registration-manifest.test.ts` is the equivalence gate. It records
everything the mod registers — models, restraints, text keys, event handlers, the
layer table, asset loads — and compares it against
`test/__manifest__/registration-manifest.json`.

The contract for any change to `src/`:

* refactoring that is meant to preserve behaviour **must leave the manifest
  byte-identical**; and
* a defect fix may change it, but only with a reviewed diff.

That makes `git status` a useful signal: after a behaviour-preserving change, the
manifest should not appear. If it does, the test prints which entries changed and
writes the new manifest to `registration-manifest.next.json` for inspection.

Determinism is enforced across runs by the committed baseline. Nothing randomised
may be captured: the coordinator's save slot is asserted absent, and a uuid v7 that
decodes to roughly "now" fails the suite.

Regenerate deliberately:

```sh
UPDATE_REGISTRATION_MANIFEST=1 npm test
```

### The published surface

`src/Api.ts` is what the bundle publishes as `globalThis.Boids`, and
`PackageAsset/package.json` maps its `types` and `exports` at the same file, so the
runtime and the typings cannot describe different things and deep paths into
`@type/**` do not resolve for a consumer.

`test/public-api.test.ts` pins the exported names as a committed baseline, asserts
that the global really is that namespace, and fails if an internal name reappears.
Widening or narrowing the surface is a one-line edit plus one reviewed diff:

```sh
UPDATE_PUBLIC_API=1 npm test
```

### Property tests

`fast-check` covers what load-time registration cannot reach: the
`VariantMapBuilder` deep-merge contract (template preservation, last-writer-wins,
`Set` union versus `List` concatenation), variant-key identity including its
field-order sensitivity, receiver semantics, the coordinator's `toJS`/`fromJS`
round-trip, the coordinator's **whole-round-trip through the game's save path**,
and the mitten layer factories. Where current behaviour is deliberate
but surprising, a property pins it, so changing it is a visible edit to a test
rather than a side effect of tidying up. If a test's expectation looks wrong,
that is the comment to read.

A new `*.test.ts` must also be added to `test/run-all.ts`; `self-check.test.ts`
fails if it is not, so a suite cannot be silently skipped.

### Save version, and the migration chain

Four small pieces, and they only make sense together:

* **`src/KDExtension/Release.ts`** names the release (`Version`), holds the **mod
  root UUID**, and is the one place an identifier is derived:
  `uuidv5(name, Release.Root)`. The root's recipe is documented beside it, so the
  literal can be recomputed rather than trusted. `webpack/verify.ts` and
  `test/release.test.ts` both fail if `Release.Version` and `package.json`'s
  `version` disagree.
* **The save carries `KDGameData.BoidsRootUUID`**, stamped on every save by the
  wrapper around `KinkyDungeonGenerateSaveData`. That single value is what
  localises the release a save came from.
* **The release table** maps each root the mod has ever minted to its release. A
  release that does not intend to break saves **keeps its root** and adds no row.
* **The migration chain** has one slot per release. An empty slot is normal; a
  breaking release fills its slot with a refusal, which **returns cleanly with a
  message** rather than throwing — a throw from inside `KinkyDungeonLoadGame` walks
  into the game's own crash-report path.

The load gate wraps `KinkyDungeonLoadGame`, which is the funnel every load goes
through — the current slot, a pasted save code and a database row all arrive
there — and it answers with the synchronous boolean both call sites expect:

| The save | What happens |
| --- | --- |
| carries the current root | loads |
| carries an older root the table knows | loads, then runs the slots after its release |
| carries a root the table does not know | **refused** — a newer release's save, and the prompt says so |
| carries **no root** | **refused once, with a warning prompt**; on *Load anyway* it loads and the coordinator starts from an empty dossier |

A **migration slot can refuse a save**, and its refusal is a value rather than a
throw. The slot decides two things beyond the wording: whether the player is offered
the way back to the game's own main menu, and what reason is shown. Both answers
leave the save on disk untouched, because the gate decides before the game has
adopted anything — which is what makes refusing graceful rather than destructive.
`ReturnToMenu` is for a refusal that trying again cannot fix; a slot that refuses one
corrupt save among many leaves the player in the load menu to pick another.

The last row is the deliberate one. A character written before versioning keeps
the base game's character, map, inventory and training, and loses the **mod's**
record of it — its equipment and control state — because that record cannot be
read. The prompt says so before anything is loaded, and it never loads without an
answer: the approval names the save it belongs to, so confirming one character
cannot silently load another.

The reset happens **after** the game adopts the save, not before, and that is not a
detail: the save still carries whatever the old build wrote under the state key, so a
reset performed in the gate would be read back over by the load handler an instant
later. The gate therefore marks the load, and the handler resets.

### The name registry, and why an id is derived rather than picked

An identifier is `uuidv5(namespacedName, Release.Root)`. The **name is the value**
and the **root is the namespace**, and the argument order is the trap: `uuid`'s
signature is `v5(value, namespace)` and the namespace must parse as a UUID.
Swapping the two throws.

Because the name is the stable half, the name is what must never move — it is a
persisted-format decision exactly as a variant-key field is, and renaming one
mints a different identifier. `test/guid-uniqueness.test.ts` enumerates every GUID
literal under `src/` and fails on a duplicate or an unexplained change, which is
what keeps a "quick new id" from arriving unversioned.

### Reading files, and line endings

The suite compares generated text against committed text, which is a comparison between
**content** and content-plus-a-carriage-return: git stores LF in the index and checks the working
copy out as CRLF on Windows, so a byte comparison passes on the machine that has just written the
file and fails on every other one. The generated text reference shipped broken exactly that way.

So there is one reader, `test/harness/text.ts`: every file the suite reads goes through it, and it
hands back LF. `test/self-check.test.ts` fails if any file under `test/` reads a file itself,
because the rule that depends on remembering is the one that already broke.

A hash is a comparison too, so `CanonicalJson` in `test/harness/manifest.ts` normalises what it
serialises. That covers the registration manifest's comparison *and* every digest in it with one
definition of "the same content", rather than a normalisation at each call site that the next call
site can forget. `webpack/verify.ts` normalises its own reads for the same reason; it cannot share
the reader, because the build config runs without a TypeScript transform.

## Invariants to respect

These are the things that bite. None of them are obvious from reading a single
file.

### Registration is a one-shot, throw-on-duplicate side effect

`AddModelWithText`, `AddRestraintWithText` and `AddEventHandler` all throw on a
duplicate, and they run at module-evaluation time. The practical consequences:

* anything that makes a registration module reachable under two specifiers, or
  copies one, crashes the mod at load rather than failing a build;
* event handler `type` GUIDs must be unique across the game *and every other mod*;
* handler registration happens at load, not at first use, so a refactor that
  defers it changes when the game can dispatch to it.

### Variant field order *is* the save format

Model and restraint names are `uuidv5(JSON.stringify(variantKey), baseId)`, with
the key's fields in literal insertion order. Renaming, adding, removing or
reordering a field in a variant literal changes every generated name, so existing
saves stop resolving their items. Two keys with the same fields in a different
order are different variants.

The **`baseId`** half is derived from `Release.Root` rather than written by hand
(`DerivedVariantBase`), which is what gives the name a version to be reasoned
about. It also means a root bump renames every generated name — the reason the
release table exists, and the reason a release that does not intend to break
saves keeps its root.

This is pinned by a property test rather than left as folklore. If a variant
literal has to change, that is a save-migration decision, not a cleanup.

### A `SwapLayerPose` target has to be a layer group the game knows

`SwapLayerPose` swaps a layer's *sorting group* per pose, not its sprite: in the
crossed pose a mitten band sorts with `CrossMitten<suffix>`, in the front pose with
`ForeMitten<suffix>`, and every one of those names has to be a member of
`LAYERS_BASE`. The game's own `KDCheckForMissingModelLayers` reports the ones that
are not — and a group that is not in the table renders in an undefined order rather
than failing, which is why the mitten factories assert the whole set of targets
rather than one entry at a time.

The mask is a bitmask of the poses a layer swaps in, tested with `&`. An unset bit
means the layer keeps the group it declares.

### The entry module's body runs after everything it imports

`src/mod.ts` rebuilds `ModelLayers` from `LAYERS_BASE` in its body, after the import of
`./Api`; but `export * as … from …` declarations are hoisted, so every dependency — that
is, the entire registration tree — is evaluated *first*. The textual order is misleading,
and moving that block into a separate imported module changes when `ModelLayers` is
populated. Models are registered into `ModelDefs` before it runs, which works only because
layer priorities are resolved by name at render time. (The block writes back exactly the
priorities `InitLayers(LAYERS_BASE)` produced at boot, so it is a no-op today; removing it
would empty the registration manifest's `initLayersArgs` and `modelLayers` sections, which
is why it is still here.)

`src/mod.ts` leans on the same rule twice more: the import that runs the registration tree
and the assignment of the global are both its own body, so the namespace is complete by the
time anything can read it.

### Two game globals are wrapped at module evaluation, and order decides who is outermost

`StateStorage.ts` replaces both `KinkyDungeonGenerateSaveData` and
`KinkyDungeonLoadGame`, capturing each original on the way. Because that happens
when the module is evaluated, **a mod that patches either one later wraps around
Boids rather than under it** — and the game declares no ordering contract for
third-party patches, so that is a hazard to know about rather than one to rely on.

Both wrappers are defensive on purpose. The save wrapper writes the release root and
the coordinator state onto `KDGameData` and then calls through, so a later wrapper
still sees a complete save. The load gate answers with the game's own synchronous
boolean and **throws nowhere** — a refusal is a value and a message, never an
exception, because an exception here lands in the game's crash-report path.

### Time advances from inside the game's tick dispatch

`MachinePrime/Debug.ts` registers a `tick` handler that calls
`SetLimiterStrength`, which ends with `KinkyDungeonAdvanceTime(1)` and
re-enters the game's event bus via `KinkyDungeonSendEvent`. Every morph handler
chains off that. It is the current prototype's only input to the sensory limiters,
which is why it lives in an explicitly-named debug module instead of being deleted
— see #19 and #40.

## Known rough edges

Tracked as issues rather than fixed here:

* **The link families derive their names with no persisted variant key**, so the
  recomputation check in `Coordinator/Internal/Integrity.ts` can recompute only
  the visor families — the ones that store `VariantInfo` on the item. Giving the
  links the same record is a persisted-format change, and it belongs with the
  variant work rather than beside it. Until then that is a gap in the check, not a
  clean bill of health for the links.

**#48** is **closed by Phase 0**: the write and the read now both name
`KDGameData`, and `save-round-trip.property.test.ts` closes the loop through the
game's own save path rather than in memory — because a round-trip that never
leaves one object is exactly the bug #48 was.

**#47** was the second and is closed: webpack's `library` option published the async
entry's promise as the `Boids` global, so nothing could use it without `await`. The
option is gone and `src/mod.ts` assigns the namespace instead, which is the only
writer; `webpack/verify.ts` fails the build if a UMD wrapper ever comes back.

**#49** was the third and is closed: `MakeSwapLayerPose` tested its pose mask with
`|`, which is true for every mask, so every mitten band emitted both swap entries
whatever it passed — and the front-pose target was `FrontMitten<suffix>`, a group
that is in no layer table. The mask is a bit test again, the front-pose target is
`ForeMitten<suffix>` as the base game's own mitten models have it, and the mitten
factories assert both.

Also part of Phase 0, and not an issue because it never had a mechanism behind it:
the mod used to swap two entries of the game's own `LAYERS_BASE` at load. It was a
personal preference with no functional contribution, so it is gone, and the layer
table is now consumed exactly as the game ships it.
