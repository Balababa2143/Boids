# Documentation

Two kinds of document live here, and the difference decides where a new one goes.

| Home | Kind | Who writes it |
| --- | --- | --- |
| [`api/`](api/) | **generated** — never edited by hand | `npm run docs:api` (the TypeScript API), `npm run test:update-text` (the text reference) |
| [`guide/`](guide/) | hand-written | a person, when the explanation changes |

## The guide

| Document | Covers |
| --- | --- |
| [`architecture.md`](guide/architecture.md) | the layout, the barrel rule, the dependency arrow, and the published surface |
| [`build.md`](guide/build.md) | the bundle and the global it publishes, the build steps, the staged packages, the four tsconfigs |
| [`testing.md`](guide/testing.md) | the suite, the two tiers of gate, the registration summary, the property tests, and the line-ending rule |
| [`saves.md`](guide/saves.md) | the release record, the migration chain, and why an identifier is derived rather than picked |
| [`control-model.md`](guide/control-model.md) | dimensions, the descriptor registry, the dossier, the router, and the restraint contract |
| [`text.md`](guide/text.md) | the text adapter: what the engine resolves, what the mod resolves, and where the English lives |
| [`modding.md`](guide/modding.md) | using `Boids` from another mod |
| [`invariants.md`](guide/invariants.md) | the things that bite — each entry says what the rule is and what breaks without it |
| [`known-issues.md`](guide/known-issues.md) | the rough edges, tracked as issues rather than fixed where they were found |

## Elsewhere

- [`design/`](../design/) — the frozen design corpus: the brief, the spec, the plan and the codex.
- [`AGENTS.md`](../AGENTS.md) — the operating rules, the command table, and the regeneration
  switches for changing this repository.
- [`README.md`](../README.md) — the front door.
