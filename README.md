# Boids

A **dronification-themed content mod for Kinky Dungeon**. It adds factions, outfits and mechanics:
a piece of equipment is a fetish object *and* a mechanism, not one with the other bolted on. The
name is the flocking idea — many simple units, no leader, coherent behaviour — and the mod's first
faction, `MachinePrime`, is the dronification faction proper.

The mod ships as a texture/asset set plus one webpack bundle the game evaluates at load time. It
registers its models, restraints, text keys and event handlers into the game's globals as a side
effect of being imported, and publishes exactly one global — `Boids` — for other mods to read.

## Where to read

| Home | What it is |
| --- | --- |
| [`docs/api/typescript/index.md`](docs/api/typescript/index.md) | the generated API reference, from the source docblocks |
| [`docs/api/text-reference.md`](docs/api/text-reference.md) | every registered game string, generated |
| [`AGENTS.md`](AGENTS.md) | how to change the repository: rules, commands, invariants |

## Install

```powershell
npm install
npm run "Webpack Bundle: Production"
```

The bundle is written to Bundle/main.bundle.js and the shippable archive to Deploy/Boids.zip; drop
the zip into the game's mod folder. `npm install` does not build the `kd-structured` submodule — a
full build needs it built first.

## Checks

| Command | Does |
| --- | --- |
| `npm run typecheck` | `tsc` over src, test and webpack |
| `npm run test` | bundle the suite and run it |
| `npm run verify` | both — the workday gate |
| `npm run verify:full` | both with the artifact audits, then a full build — the delivery gate |

## Issues

This repository tracks **behaviour**: the symptom, the reproduction, the save impact and the
version it was seen in. Design questions, content plans and anything that would need a decision
about *what the mod is* are not tracked here — an issue about intent would be a conversation the
repository cannot host.

## License

MIT — see [`LICENSE`](LICENSE).
