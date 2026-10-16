# Architecture

> The shape of the tree, the two rules that keep it navigable, and what the mod publishes as a global.

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
| `test/` | The verification suite (see [testing.md](testing.md)). |
| `kd-structured/` | Submodule (`KDInterface`). Owns the generated KD typings and drops `kd-structured.zip`, a separate mod this one loads through an import map. |
| `Bundle/`, `Deploy/`, `Declaration/`, `Generated/`, `.fake/` | Build output. All gitignored. |

## Barrels

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

## Layering

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

## The published surface

`src/Api.ts` is what the bundle publishes as `globalThis.Boids`, and
`PackageAsset/package.json` maps its `types` and `exports` at the same file, so the
runtime and the typings cannot describe different things and deep paths into
`@type/**` do not resolve for a consumer.

`test/public-api.test.ts` pins the exported names as a committed baseline, asserts
that the global really is that namespace, and fails if an internal name reappears.
Widening or narrowing the surface is a one-line edit plus one reviewed diff:

```sh
npm run test:update-api
```
