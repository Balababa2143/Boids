# Build and the bundle

> The bundle the game evaluates, the global it publishes, and how it is produced.

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
