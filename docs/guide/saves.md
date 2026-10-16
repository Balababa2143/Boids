# Saves and versioning

> The release record, the migration chain, and the identifier scheme that ties a save to a release.

## Save version, and the migration chain

Four small pieces, and they only make sense together:

* **`src/KDExtension/Release.ts`** names the release (`Version`), holds the **mod
  root UUID**, and is the one place an identifier is derived:
  `uuidv5(name, Release.Root)`. The root's recipe is documented beside it, so the
  literal can be recomputed rather than trusted. `webpack/verify.ts` and
  `test/release.test.ts` both fail if `Release.Version` and `package.json`'s
  `version` disagree.
* **The save carries `KDGameData.BoidsRootUUID`**, stamped on every save by the
  wrapper around `KinkyDungeonGenerateSaveData`. That single value is what
  localises the release a save came from.
* **The release table** maps each root the mod has ever minted to its release. A
  release that does not intend to break saves **keeps its root** and adds no row.
* **The migration chain** has one slot per release. An empty slot is normal; a
  breaking release fills its slot with a refusal, which **returns cleanly with a
  message** rather than throwing — a throw from inside `KinkyDungeonLoadGame` walks
  into the game's own crash-report path.

The load gate wraps `KinkyDungeonLoadGame`, which is the funnel every load goes
through — the current slot, a pasted save code and a database row all arrive
there — and it answers with the synchronous boolean both call sites expect:

| The save | What happens |
| --- | --- |
| carries the current root | loads |
| carries an older root the table knows | loads, then runs the slots after its release |
| carries a root the table does not know | **refused** — a newer release's save, and the prompt says so |
| carries **no root** | **refused once, with a warning prompt**; on *Load anyway* it loads and the coordinator starts from an empty dossier |

A **migration slot can refuse a save**, and its refusal is a value rather than a
throw. The slot decides two things beyond the wording: whether the player is offered
the way back to the game's own main menu, and what reason is shown. Both answers
leave the save on disk untouched, because the gate decides before the game has
adopted anything — which is what makes refusing graceful rather than destructive.
`ReturnToMenu` is for a refusal that trying again cannot fix; a slot that refuses one
corrupt save among many leaves the player in the load menu to pick another.

The last row is the deliberate one. A character written before versioning keeps
the base game's character, map, inventory and training, and loses the **mod's**
record of it — its equipment and control state — because that record cannot be
read. The prompt says so before anything is loaded, and it never loads without an
answer: the approval names the save it belongs to, so confirming one character
cannot silently load another.

The reset happens **after** the game adopts the save, not before, and that is not a
detail: the save still carries whatever the old build wrote under the state key, so a
reset performed in the gate would be read back over by the load handler an instant
later. The gate therefore marks the load, and the handler resets.

## The name registry, and why an id is derived rather than picked

An identifier is `uuidv5(namespacedName, Release.Root)`. The **name is the value**
and the **root is the namespace**, and the argument order is the trap: `uuid`'s
signature is `v5(value, namespace)` and the namespace must parse as a UUID.
Swapping the two throws.

Because the name is the stable half, the name is what must never move — it is a
persisted-format decision exactly as a variant-key field is, and renaming one
mints a different identifier. `test/guid-uniqueness.test.ts` enumerates every GUID
literal under `src/` and fails on a duplicate or an unexplained change, which is
what keeps a "quick new id" from arriving unversioned.

**The literals that remain are the ones that cannot be derived**, and the list shrinks as families
convert: a handler `type`, an item-data key, a colour bank, a `const enum` whose members are a save
format. Everything else — variant bases (`DerivedVariantBase`), dimension ids
(`Control/Identity.ts`), the membership tag (`Coordinator/Tag.ts`) — is recomputed from the root, so
the GUID test's expectation is a record of exceptions rather than of identifiers.

## What a save actually carries of the mod

Two things, both on `KDGameData`:

| Key | What it is |
| --- | --- |
| `BoidsRootUUID` | the release root the save was written under — **metadata about the file**, so route 1 can clear the dossier without disturbing it |
| the coordinator's state key | the **dossier**: `intent` and `config`, keyed by dimension (`docs/guide/control-model.md`) |

**The dossier's values are records, and the format is their parameter names.** A dimension's `intent` is
`{ Target }` where it composes `Rate`, `{ Allowed }` where it composes `Posture`, `{ Intent }` where it
composes `Gate`, and the merge of all of them where it composes several — so a parameter name is part of
the save format, and the reader keeps every parameter it knows how to read rather than narrowing by the
descriptor. **The store holds each demand as a `Map`**, which is what makes a round-tripped demand compare
equal to itself; the plain record is what a caller writes and what `toJS()` produces. `Allowed` is stored
as a set of pose names and written out as an array, because a body configuration is chosen from a ladder
rather than measured and a pose name has to stay readable in the file.

**The equipment is not in there.** Which items are worn is a fact about the game's inventory, read when
a dimension is resolved (`design/spec.md` §6.12 clause 4), so a save cannot carry a stale capability
and there is nothing to invalidate when a piece comes off.
