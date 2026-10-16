# Repository traps

> The **host repository's** traps rather than the game's: what a well-meaning change breaks, which
> gate holds each rule, and the two places where the test harness itself can report a pass over code
> it never reached.

Paths in this note are repository paths and are written relative to the repository root. The
shorthand for game sites is in the [phase notes](AGENTS.md).

---

## The gate that governs every change

**[read]** `test/registration-manifest.test.ts` imports the mod's whole module graph against
installed global stubs and records **everything the mod registers** — models, restraints, text keys,
event handlers, the layer table, atlas loads — then compares it against a committed baseline. The
contract, from the file's own header:

> refactoring meant to preserve behaviour must leave the manifest **byte-identical**; a defect fix
> may change it, but only with a reviewed diff.

**[inferred] The practical upshot is that `git status` is a signal.** After a change that was
*supposed* to preserve behaviour, the manifest must not appear. If it does, either the change was not
behaviour-preserving or the baseline is stale — and both are worth stopping for. The failure message
prints which sections changed and writes the new manifest to a `.next.json` file beside it for
inspection, so the diff does not have to be reconstructed by hand.

**A single added `addTextKey` call moves it.** That is a registration, and the manifest counts
registrations. So does adding a handler, a model, or a restraint — the obvious cases — but also the
less obvious ones like a new `const enum` whose members are looked up by the game.

**[read] The baseline's key order is deliberately never sorted.** The harness preserves insertion
order because that order is observable behaviour: it is the order the game sees the registrations in.
A "tidy-up" that sorts a map before it is recorded would be a false failure, and sorting a registry
would be a real one.

**[inferred] A count of the full record is not the same as the gate.** The committed baseline is what
the suite compares against; a mismatch writes a fuller diagnostic file that is **not** tracked. So a
reviewer reading a clean `git status` has learned that the gate passed, not that nothing was written
during the run.

---

## Conventions a new file has to satisfy

**[read] Barrels.** A folder other folders import from has an `index.ts` re-exporting every module in
it; code outside the folder imports the barrel and code inside imports siblings. The convention is
stated in `AGENTS.md`, and a deep import is treated as a bug in the barrel rather than a shortcut.
**[inferred] Two consequences that are easy to trip over:** a new module in an existing folder must be
added to that folder's barrel, and adding one can widen a *published* surface if the folder is
re-exported all the way out — which is a separate baseline, below.

**[read] A new test file must be listed in `test/run-all.ts`.** `test/self-check.test.ts` fails if it
is not, so a suite cannot be silently skipped. The aggregator also imports `./setup/install` first,
and that order matters — the stubs have to exist before any module that reads a game global at import
time is evaluated.

**[read] Variant field order is a save format.** Model and restraint names are
`uuidv5(JSON.stringify(variantKey), baseId)`. Adding, removing, renaming or reordering a field in a
variant literal changes every generated name, so it is a migration decision rather than a cleanup.
The reasoning behind the identity is in the [identifiers note](identifiers.md).

**[read] A `SwapLayerPose` target has to be a layer group the game knows.** The target must be a
member of `LAYERS_BASE`, and the pose mask is a **bitmask tested with `&`**. A group outside the table
does not fail — it renders in an undefined order, which is why the factories that emit these assert
the whole set of targets rather than one entry at a time.

**[read] The entry module's body runs after everything it imports.** `export * as … from …`
declarations are hoisted, so the layer-table block at the top of the entry file executes *after* the
entire registration tree has been evaluated. The textual order is misleading, and moving that block
into a separate imported module changes when the table is populated. **The barrel pattern is what
creates this hazard**: obeying the convention is what makes the hoisting observable.

---

## The two game globals a mod replaces, and who is outermost

**[read]** The mod wraps **two game globals at module evaluation** — the save generator and the load
function — capturing each original on the way. It has to: both are plain module-scope functions, and
assignment is the only seam.

> **[inferred] The ordering consequence is one-directional and worth internalising: a mod that
> patches either function *later* wraps around this one, and a mod that patches before is wrapped
> by it.** The game declares no ordering contract for third-party patches, so which way a given
> pair composes depends on load order rather than on anything either mod states. Both wrappers are
> therefore written to be defensive — the save wrapper completes the object before calling through,
> so an outer wrapper still sees a whole save, and the load wrapper throws nowhere, because an
> exception raised inside the game's loader lands in its own crash-report path.

---

## The harness is not a faithful game, in three specific ways

This is the part that cost the most time, and none of it is visible from the harness's own file
names.

### It records sends; whether it *dispatches* them is a separate decision

**[read]** The harness installs a stub for the game's event bus. A stub that only pushes the send
onto a recorder is a perfectly reasonable-looking mock — and it means **every handler registered on
that bus is unreachable in tests**. A migration collected and never run, an after-load hook never
fired: the suite still reports a pass, because nothing asserted the handler had run.

**[inferred] The general rule, which is not specific to this bus:** when a stub stands in for a
dispatch mechanism, a test that does not assert *arrival* is asserting nothing about the code behind
the dispatch. The version that dispatches is the only version that can catch a handler that was never
registered.

### `KDGameData` is one object for the whole process

**[read]** The harness installs a **stable** `KDGameData` object and empties it on reinstall. The
game's own loader *replaces* the reference while the harness's adopts into the existing object, so a
test and the mod can disagree about which object is current — and a key written by an earlier test is
still present for a later one.

> **[inferred] Which produced a test that asserted the wrong thing.** A case whose whole point was
> "a save with no coordinator state leaves the live state alone" failed against a key an earlier case
> had written. The guard under test was fine; the fixture had leaked. Any test about *absence* has to
> establish the absence itself, and the harness provides a reset for exactly that reason.

### A `const` object exported from a module is shared, and mutating it is global

**[read]** Tests import one graph and share one module instance. A collection exported as a `const`
is therefore the same object in every suite, and mutating it — adding a row, swapping a slot — is
visible everywhere until it is restored. Restoring in a `finally` is necessary and not sufficient; see
the concurrency point below.

---

## Test-runner concurrency

**[read]** Node's test runner runs a **suite's sibling cases concurrently by default.**

> **[inferred] This turns any shared mutable test seam into a race, and the failure looks like a bug
> in the code under test.** The symptom observed here was genuinely misleading: one case saw a prompt
> whose owner had already torn down the global the prompt read from, so a refusal appeared to have
> loaded. A suite that mutates module state — a global, a registry, a fake DOM — has to declare
> itself serial, and the declaration is part of the test rather than a preference.

---

## Two ways to spend an hour on a stale artefact

Both were hit, and neither produces an error that says what happened.

### A build command that fails does not stop you reading the *previous* bundle

**[read]** The test command is a chained build-then-run. When the build fails, the run can still
execute the artefact left by the previous successful build.

> **[inferred] So a syntax or type error introduced into a source file shows up as impossible test
> failures rather than as a build error.** The fixes look arbitrary, because they are being applied
> to a bundle nobody is looking at. The check that resolves it — read the build output rather than
> the test output — costs one command, and it is the first thing to do when a failure makes no sense.

### A diagnostic that shadows a global type name fails the build silently

**[read]** An instrumented line of the form
``console.log(`len=${String(value)}`)`` inside a function whose parameter is named `String` does not
call the `String` constructor: it calls the *parameter*, which is a string, and the call is not a
call. The parameter shadowing is deliberate in this codebase (the game's own signature takes a
parameter named `String`), so the hazard is easy to reintroduce.

> **[inferred] This is the same failure as the stale bundle, one level up**: the build broke, the
> old artefact ran, and the resulting failures pointed at the code rather than at the instrument that
> had just been added to it.

---

## What is *not* a trap, though it looks like one

- **A refusal inside a wrapped loader is a return value, not an exception.** An exception raised from
  a function the game calls would land in the game's crash-report path; the wrapper's contract is to
  return the game's own boolean. That is a design decision recorded elsewhere, and it exists because
  of the crash path rather than out of taste.
- **A module registered under two specifiers crashes at load rather than failing a build.** The
  registration helpers throw on a duplicate, at module-evaluation time. That is a *feature* for
  catching an accidental second copy — the failure is loud and immediate — but it means the check
  happens at load, not at build.

---

## How to re-derive this

Read-only, and none of it needs a build.

- **The manifest contract** — read the header of `test/registration-manifest.test.ts` and
  `test/harness/manifest.ts`; the recorded sections are the properties of the object it builds.
- **The two baselines and how they are regenerated** — read the update instructions in
  `test/registration-manifest.test.ts` and `test/public-api.test.ts`. **[inferred]** Both are
  deliberate regenerations rather than automatic ones, which is why each is spelled out in the file
  that fails rather than in a script nobody reads.
- **The barrel rule** — read `AGENTS.md`'s conventions; the two deliberate exceptions are named
  there.
- **The harness's dispatch behaviour** — read the harness's event-bus stub and look for whether it
  invokes the handler map or only records. One property access decides it.
- **The concurrency default** — the failure is reproducible by writing two sibling cases that mutate
  one shared object; the runner's default is in Node's own documentation for the test runner.

## What this note does not cover

- **The mod-facing guidance for any of the above.** `README.md`, `docs/guide/` and `AGENTS.md` are
  where the rules live and are written for people working on the mod. This note is the *why* behind
  the ones Phase 0 learned the hard way, and it decides nothing.
- **The generated artefacts and their regeneration commands.** They exist, they are tracked, and they
  are regenerated deliberately; the current list and the commands belong with the tooling that owns
  them rather than in a retrospective.
