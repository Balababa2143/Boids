# Boids

A **dronification-themed content mod for Kinky Dungeon**.

`Boids` adds factions, outfits and mechanics to the base game. The kink comes first and the
gameplay is designed alongside it, so a piece of equipment is a fetish object *and* a mechanism
rather than one with the other bolted on. The name is the flocking idea — many simple units, no
leader, coherent behaviour — and the mod's first faction, `MachinePrime`, is the dronification
faction proper.

The mod ships as a texture/asset set plus one webpack bundle the game evaluates at load time. It
registers its models, restraints, text keys and event handlers into the game's globals as a side
effect of being imported, and publishes exactly one global — `Boids` — for other mods to read.

## Status

**The design is frozen** (2026-10-16). The frozen corpus lives in [`design/`](design/), and it is
delivered as milestone **[v0.5.0: Machine Prime (mvp)](https://github.com/Balababa2143/Boids/milestone/3)** —
`design/dev-plan.md` Phases 1–5, plus the playtest calibration of the ending.

Shipped today: the `Futuristic` outfit on the variant infrastructure, `MachinePrime`'s visor and gag
families, and the Coordinator that holds control state across save and load. The rest of the
mechanism layer is in progress; the milestone and the issues are where that work is tracked.

## Requirements

- **Kinky Dungeon 5.5.x** — `Asset/mod.json` declares `gamemajor` 5 and `gameminor` 5.
- **`kd-structured`**, installed alongside Boids. Boids declares `priority` 10 and `kd-structured`
  20 and the game awaits each file, so `kd-structured` finishes before Boids starts.
- **Node.js ≥ 24** to build — the webpack configs run on Node's native TypeScript support.

## Install

The game loads mods from its `Mods` folder; the game's own README has the details under *Mod
support*. Put `kd-structured.zip` and `Boids.zip` there. Load order is decided by each mod's
declared `priority`, not by anything about the files.

To build it yourself:

```sh
npm install
npm run "Webpack Bundle: Debug"      # -> Bundle/main.bundle.js + Deploy/Boids.zip
```

`kd-structured` has to be built first: `npm install` alone does not produce its archive, and the
build names it when the archive is missing.

## Verify

```sh
npm run verify        # typecheck + the suite            (the workday gate)
npm run verify:full   # the same with the artifact audits, then a full mod build (the delivery gate)
```

`test/` is the project's own webpack + ts-loader pipeline executed with plain `node`, so the suite
is compiled by the same toolchain as the mod. [`docs/guide/testing.md`](docs/guide/testing.md) has
the two tiers, the registration summary, and the line-ending rule.

## Documentation

| Where | What |
| --- | --- |
| [`design/`](design/) | the frozen design: the brief, the spec, the work programme, and the content codex |
| [`docs/guide/`](docs/guide/) | architecture, build, testing, saves, text, modding, invariants, known issues |
| [`docs/api/`](docs/api/) | generated: the TypeScript reference for the published surface, and the text reference |
| [`AGENTS.md`](AGENTS.md) | the operating rules, the command table and the invariants, for contributors and agents |

## Using Boids from another mod

Mods load in descending `priority` and the game awaits each file it evaluates, so a mod declaring a
lower priority than Boids' `10` finds `globalThis.Boids` ready and needs none of the below. If you
cannot arrange that, poll for it:

```js
// A mod file is eval'd as a classic script and the game awaits what the eval returns before
// starting the next mod. Two consequences: never reject, and never wait forever, or loading
// stalls with nothing in the log to explain it.
;(async () => {
    const deadline = Date.now() + 30_000
    while (typeof globalThis.Boids === 'undefined' && Date.now() < deadline) {
        await new Promise(resolve => setTimeout(resolve, 50))
    }
    if (!globalThis.Boids) return console.error('Boids did not load in time; skipping')

    globalThis.Boids.FactionMachine.MachinePrime.Debug.SetBlindStrength(0.5)
})().catch(error => console.error('my mod failed:', error))
```

`globalThis.Boids` is never a promise, so that read is a plain property read. The surface is two
namespaces — `Boids.FactionMachine` and `Boids.CommonUI` — and `Boids.CommonUI.Prompt.ShowPrompt`
is a warning dialog that carries no text of its own, so reusing it costs a caller nothing but the
wording. The full story, including what to do about `kd-structured`, is in
[`docs/guide/modding.md`](docs/guide/modding.md).

## Contributing

The design is closed, so **a design change goes to an issue first**: it is decided there, lands in
`design/spec.md`, is scheduled in `design/dev-plan.md`, and is recorded as a dated row in
`design/design-brief.md`'s Appendix E. Infrastructure and content work is welcome through the
issues and the milestone.

Read [`AGENTS.md`](AGENTS.md) before changing anything — it has the command table, the gates and
the invariants that bite.

## License

MIT. See [`LICENSE`](LICENSE).
