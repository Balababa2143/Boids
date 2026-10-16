# Testing and gates

> The verification suite, the two tiers of gate, and the rules that keep comparisons honest.

## Verifying

```sh
npm run typecheck   # tsc over src/, test/ and webpack/
npm run test        # bundle the suite, then run it with node
npm run verify      # both
npm run verify:full # both, with the audit checks on, then a full mod build
```

`test/` is bundled by `webpack.test.config.ts` — the project's own webpack +
ts-loader pipeline, so tests are compiled by the same toolchain as the mod — and
executed with plain `node`. `fast-check` is the only test dependency.

The mod cannot run outside the game, so the suite installs recording KD global
stubs *before* the module graph is evaluated (`test/setup/install.ts`) and imports
`src/mod.ts`, the same entry the bundle ships.

## Two tiers: the workday gate and the delivery gate

Most of the suite is behaviour and invariants, and runs on every change. A few checks compare a
**generated artifact against a committed copy**, and those force a regeneration whenever the thing
they describe moves — affordable at delivery, a tax on ordinary content work. They run only under
`--audit`, which `npm run verify:full` passes:

| Check | `npm run verify` | `npm run verify:full` |
| --- | --- | --- |
| the registration summary — counts and digests | compared | compared |
| the full registration record | not compared | compared, and written when none is kept |
| `docs/api/text-reference.md` | present, with one row per slot | compared byte for byte |

A demoted check reports as **skipped**, never as a pass, so a run that did not compare the
reference cannot be mistaken for one that did.

## The registration summary

`test/registration-manifest.test.ts` records everything the mod registers — models, restraints,
text keys, event handlers, the layer table, asset loads — and compares two things against
`test/__manifest__/registration-summary.json`: how many entries each section holds, and a digest per
entry. A dropped model, a renamed restraint, or a payload that moved under an existing name all fail
the run, and the failure names the entry.

What it deliberately does not pin is the payload. The baseline used to be the whole record — 437 KB,
16,000 lines — and re-reviewing that on every content change is how a gate becomes a formality. The
record itself is one command away:

```sh
npm run test:audit   # writes registration-manifest.full.json (ignored), and compares it if one is kept
```

Keep a copy at `test/__manifest__/registration-manifest.full.json` and the audit holds the surface
to it byte for byte, which is the right tool for the *next* large rearrangement.

Determinism is enforced across runs by the committed summary. Nothing randomised may be captured:
the coordinator's save slot is asserted absent, and a uuid v7 that decodes to roughly "now" fails
the suite.

Regenerate deliberately — the summary after a change that is *meant* to alter the surface, the
reference before a release:

```sh
npm run test:update-manifest    # registration summary
npm run test:update-api         # published namespace
npm run test:update-text         # text reference
npm run verify:full              # typecheck + suite with audits + full mod build
```

## Property tests

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

## Reading files, and line endings

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
