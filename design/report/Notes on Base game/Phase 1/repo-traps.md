# Traps in the host repository

> Research notes, not corpus — see [`AGENTS.md`](AGENTS.md). **This file is about `Boids` rather than
> about Kinky Dungeon**, and it is separated and named so that is obvious. It is here because the
> rediscovery cost is the same kind: each of these cost a debugging session, and each has a symptom that
> does not point at its cause.

What the guide already covers, and this file does not repeat:
[`docs/guide/testing.md`](../../../../docs/guide/testing.md) (the two gates, `run-all.ts`, `ReadText`, the
published surface), [`docs/guide/invariants.md`](../../../../docs/guide/invariants.md) (registration, variant
field order, layer groups, wrapper ordering) and [`AGENTS.md`](../../../../AGENTS.md) (the commands and the
barrel and layering rules). Below is what is in none of them.

## 1. `fromJS(toJS(x))` is not equal to `x` when a plain object is nested

**Symptom.** A round-trip property fails with two *identical* JSON strings printed side by side.

**Cause.** An Immutable `Record`'s equality does not recurse into a **plain object** held in one of its
fields. So a value stored as `{ Target: 1 }` and rebuilt as `{ Target: 1 }` compares unequal — the
serialisation is the same and the identity is not. Worse, `Record.toJS()` does not recurse deeply enough
for a `fromJS` that reads nested fields: the value it produces for a field holding an Immutable `Map` is
**that `Map`**, not a plain object, so a reader expecting `{intent, config}` finds neither and **every
dimension silently reads its baseline**.

**Fix, both directions.** Store the value as the Immutable collection that compares by content, and make
the reader the single conversion point.

- `src/KDExtension/Control/Store.ts:140` — `IntentValue = number | GateIntent | ISet<PoseKey>`, and
  `Intent` is an `IMMap` rather than a plain record, with the reason written at `:149`.
- `:360-361` — *"the coercion is load-bearing, and it is the one trap in this shape"*, and `PlainValue`
  (`:410-411`) flattens with `toJS()` before the reader looks.
- `:500` — why `Allowed` is a `Set` and not an array.

## 2. `assert.equal` on two Immutable collections fails when they are deeply equal

**Symptom.** `Expected ... but got ...` with two visibly identical structures.

**Cause.** `node:assert`'s `equal` is `==`, and two Immutable collections are different objects. The deep
equality is a method, not an operator.

**Fix.** `assert.ok(a.equals(b))`, or `assert.deepEqual` against a plain value, or compare after
converting with `ToIntent({...})`. The property suite does all three, deliberately:
`test/coordinator-state.property.test.ts:109` (`restored.equals(state)`), `:142`, `:204`, `:240`,
`:254-255`, `:265`.

## 3. A property can be vacuously true, and the shrinker will find the vacuous sample

**Symptom.** A property fails intermittently on a sample where both of its inputs are empty, and the
failure is not a real one.

**Cause.** `test/variant-map.property.test.ts` asserted that two derived names differ — a claim that is
**not** true when both halves of the sample are empty, because then neither name exists. The claim was
implicitly conditional and the property stated it unconditionally, so the shrinker drove the input
straight to the degenerate case.

**Fix.** `fc.pre(...)` to discard the case, plus `isDeepStrictEqual` for the emptiness test —
**non-vacuity becomes a fact about the sample rather than an expectation**. `fc.pre` is the right tool;
loosening the assertion is not.

## 4. An arbitrary over an empty registry throws at *construction* time

**Symptom.** A suite crashes with "cannot sample from an empty array" *before* any property runs, and
only when a scratch file is imported in a different order than the real suite.

**Cause.** `fc.constantFrom(...someRegistry)` evaluates its argument immediately, so a module that builds
an arbitrary at import time is reading a registry that may not be populated yet — and registration is a
module-evaluation side effect (`docs/guide/invariants.md`).

**Fix.** Make the arbitrary a **function** and chain lazily, so it is constructed when the property runs
rather than when the module is imported. This is why some arbitraries in `test/` are spelled
`ArbitraryDemand()` rather than `ArbitraryDemand`.

## 5. `test/docs-paths.test.ts` reads every hand-written file, and it will read yours

**Symptom.** A new markdown file fails the suite, naming a path token that "does not exist".

**Cause and rule.** The gate walks `design/**/*.md`, `docs/guide/**/*.md`, `src/**/*.ts`, `test/**/*.ts`,
`webpack/**/*.ts`, `Script/**/*.ts` plus `README.md`, `AGENTS.md`, `docs/README.md` and
`docs/api/README.md`, and asserts that every **backticked** token matching `` `(design|docs)/…` `` resolves
on disk.

Two consequences worth knowing before writing documentation:

- **Only those two prefixes are checked.** A backticked `restraint/KinkyDungeonRestraints.ts:1745` is not a
  repository path and is never validated — which is exactly why a wrong citation can survive for months.
  See [`AGENTS.md`](AGENTS.md) for the convention this folder uses to make such a citation resolvable by
  a human.
- **A historical citation must be prose, not a token.** The test's own docblock says so: a path that no
  longer exists is written as words rather than as something a reader would paste into a shell.

## 6. Tooling, where each of these has produced a wrong answer

| Trap | What happens | What to do |
| --- | --- | --- |
| **`Select-String` is case-insensitive by default** | a search for `gag:` also matches `Filters: { Gag: … }`, inflating a count from 81 to 87 | always `-CaseSensitive` |
| **`Select-String -Path` does not accept `-Recurse`** | the parameter is rejected and the command fails outright | `Get-ChildItem -Recurse -Filter *.ts "$dir" \| Select-String -Pattern …` |
| **`Measure-Object -Line` does not count blank lines** | reported a 2,774-line file as 2,399, and a table of file sizes was wrong | `@(Get-Content $f).Count` |
| **No heredoc in PowerShell** | `git commit -F - <<'MSG'` is a parser error, not a shell error | a here-string `@'…'@` written to a temp file, then `-F $path` |
| **A pattern anchored at `^\s*` still matches nested fields** | a `Group:` tracker picked up `Group:` inside `factionFilters` blocks and produced group values like `"Leather"` | anchor to the record-field indentation (`^\t\t`) **and reset the tracker on each record**, or an absent field inherits its neighbour's |
| **Constrained language mode** | `[Math]::Max`, `Add-Type`, `New-Object` and .NET static calls fail with *"only core types are supported"* | cmdlets, `Sort-Object { [double]$_.Name }`, `Group-Object`, and `[double]`/`[string]` casts |

## 7. Committing in this environment

**`gpg` fails.** A signed commit dies with
`gpg: *** fatal error: NtCreateDirectoryObject(\BaseNamedObjects\msys-2.0S5-…) : 0xC0000022`, which is an
environment problem rather than a key problem. Commits are therefore made with an explicit identity and
no signing:

```powershell
git -c user.name="<name>" commit --no-gpg-sign -F $messagePath
```

**No configuration is changed to achieve this** — it is a per-invocation flag, so the repository's own
settings are left alone.

Also, from [`AGENTS.md`](../../../../AGENTS.md) and worth repeating because it is easy to get wrong under
pressure: **stage explicit paths, never `git add -A`**, and regenerate a tracked artifact only when its
surface is *meant* to move — committing it beside the change that moved it, with the diff read first.

## 8. A demoted check reports as *skipped*, not as a pass

The registration manifest, the public API, and the text reference are compared only under the delivery
gate. In the workday gate they report as **skipped** — so a green workday run is not evidence that a
generated artifact still matches. `npm run test` printing `skipped 2` means two comparisons did not
happen, and the report of the run is the only place that says so.

`test/harness/flags.ts` is where that reporting lives, and it exists because the alternative — a check
that quietly stops running and reads as a pass — is worse than having no check.

## How to re-derive this

```powershell
# The two documentation-shape gates this file depends on.
Select-String -Path 'test/docs-paths.test.ts' -Pattern 'Walk\(|Backticked|HandWrittenFiles' -CaseSensitive
Select-String -Path 'test/run-all.ts' -Pattern '^import' -CaseSensitive

# The round-trip trap, in the code and in the property that pins it.
Select-String -Path 'src/KDExtension/Control/Store.ts' -Pattern 'fromJS\(toJS|IntentValue =|new Set<PoseKey>' -CaseSensitive
Select-String -Path 'test/coordinator-state.property.test.ts' -Pattern 'fromJS\(state.toJS\(\)\)' -CaseSensitive

# The immutability-aware assertions.
Select-String -Path 'test/coordinator-state.property.test.ts' -Pattern '\.equals\(|deepEqual' -CaseSensitive

# The vacuity guard.
Select-String -Path 'test/variant-map.property.test.ts' -Pattern 'fc\.pre|isDeepStrictEqual' -CaseSensitive

# The signed-commit failure, without changing any configuration.
git -c user.name="probe" commit --no-gpg-sign --dry-run -m probe
```
