# Generated references

**Nothing in this folder is edited by hand.** Two generators write here, and both are reproducible
from the source:

| Path | Written by | What it is |
| --- | --- | --- |
| [`typescript/`](typescript/) | `npm run docs:api` | the TypeDoc reference for the published surface — `src/Api.ts`, which is what the bundle assigns to `globalThis.Boids`, and what the types package maps its `exports` at |
| [`text-reference.md`](text-reference.md) | `npm run test:update-text` | every string the mod can put in front of a player, with the address a translation overrides it at |

`text-reference.md` is compared byte for byte in the delivery gate (`npm run verify:full`), so a
stale copy fails the run rather than shipping. The TypeScript reference has no such comparison: it
is regenerated when the published surface moves, and `test/public-api.test.ts` is the tripwire that
says when that has happened — its failure message names `npm run docs:api`.

TypeDoc writes into `typescript/` rather than into this folder on purpose: it cleans its output
directory on every run, so pointing it at `api/` itself would delete its sibling document.
