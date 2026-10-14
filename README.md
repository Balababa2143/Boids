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
| `src/mod.ts` | The bundle entry: imports the surface, then publishes it as `globalThis.Boids`. |
| `src/Api.ts` | The published surface — everything under `src/Boids/`, and nothing else. |
| `src/Boids/` | The mod: `index.ts` is its barrel, and importing it runs the registration tree. |
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
import, because a deep import is the one spelling a reader cannot predict. The
single deliberate exception is spelled out where it happens: the glass visor
barrel exports `Variant` by name rather than as a namespace, because consumers use
it as a type as well as a value.

## The bundle and its global

`webpack.config.ts` builds one classic script, `Bundle/main.bundle.js`, which the
game evaluates. It is an **async module**: `kd-structured` is a promise external,
resolved at runtime through the import map that mod publishes, so nothing here runs
until it exists. `src/mod.ts` is the entry that finishes the job, assigning the
namespace to `globalThis.Boids`.

That assignment is the whole interface. The name is either absent — the load has
not finished — or the namespace exported by `src/Api.ts`; it is never a promise, so
`Boids.MachinePrime.Debug.SetBlindStrength(0.5)` works from the console as written,
and `(await Boids).X` also works because awaiting a non-thenable returns it. A load
that fails leaves no global at all rather than a rejected promise, and the loader
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

    Boids.MachinePrime.Debug.SetBlindStrength(0.5)
})().catch(error => console.error('my mod failed:', error))
```

The surface is `Boids.Futuristic`, `Boids.MachinePrime` and `Boids.DebugStart`.
Everything else — the variant infrastructure in `src/KDExtension`, the utilities,
the mod's own manifest — is internal for now, and `test/public-api.test.ts` fails if
that changes without the baseline being regenerated.

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
round-trip, and the mitten layer factories. Where current behaviour is deliberate
but surprising, a property pins it, so changing it is a visible edit to a test
rather than a side effect of tidying up. If a test's expectation looks wrong,
that is the comment to read.

A new `*.test.ts` must also be added to `test/run-all.ts`; `self-check.test.ts`
fails if it is not, so a suite cannot be silently skipped.

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

`src/Boids/index.ts` swaps two entries of `LAYERS_BASE` and rebuilds `ModelLayers`
at the top of the file, but `export * as … from …` declarations are hoisted, so
every dependency — that is, the entire registration tree — is evaluated *first*.
The textual order is misleading, and moving that block into a separate imported
module changes when `ModelLayers` is populated. Models are registered into
`ModelDefs` before it runs, which works only because layer priorities are resolved
by name at render time.

`src/mod.ts` leans on the same rule twice: it imports `./Api` — which is what runs
the registration tree — and assigns the global in its own body, so the namespace is
complete by the time anything can read it.

### Time advances from inside the game's tick dispatch

`MachinePrime/Debug.ts` registers a `tick` handler that calls
`SetLimiterStrength`, which ends with `KinkyDungeonAdvanceTime(1)` and
re-enters the game's event bus via `KinkyDungeonSendEvent`. Every morph handler
chains off that. It is the current prototype's only input to the sensory limiters,
which is why it lives in an explicitly-named debug module instead of being deleted
— see #19 and #40.

## Known rough edges

Tracked as issues rather than fixed here:

* **#48** — the coordinator writes its save data to `KDGameDataBase` and reads it
  back from `KDGameData`; whether those alias at runtime is unverified.

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
