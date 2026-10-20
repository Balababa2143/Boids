# Invariants to respect

> The rules that are not obvious from reading any single file, and what each one breaks.

These are the things that bite. None of them are obvious from reading a single
file.

## Registration is a one-shot, throw-on-duplicate side effect

`AddModelWithText`, `AddRestraintWithText` and `AddEventHandler` all throw on a
duplicate, and they run at module-evaluation time. The practical consequences:

* anything that makes a registration module reachable under two specifiers, or
  copies one, crashes the mod at load rather than failing a build;
* event handler `type` GUIDs must be unique across the game *and every other mod*;
* handler registration happens at load, not at first use, so a refactor that
  defers it changes when the game can dispatch to it.

## Variant field order *is* the save format

Model and restraint names are `uuidv5(JSON.stringify(variantKey), baseId)`, with
the key's fields in literal insertion order. Renaming, adding, removing or
reordering a field in a variant literal changes every generated name, so existing
saves stop resolving their items. Two keys with the same fields in a different
order are different variants.

The **`baseId`** half is derived from `Release.Root` rather than written by hand
(`DerivedVariantBase`), which is what gives the name a version to be reasoned
about. It also means a root bump renames every generated name — the reason the
release table exists, and the reason a release that does not intend to break
saves keeps its root.

This is pinned by a property test rather than left as folklore. If a variant
literal has to change, that is a save-migration decision, not a cleanup.

## A `SwapLayerPose` target has to be a layer group the game knows

`SwapLayerPose` swaps a layer's *sorting group* per pose, not its sprite: in the
crossed pose a mitten band sorts with `CrossMitten<suffix>`, in the front pose with
`ForeMitten<suffix>`, and every one of those names has to be a member of
`LAYERS_BASE`. The game's own `KDCheckForMissingModelLayers` reports the ones that
are not — and a group that is not in the table renders in an undefined order rather
than failing, which is why the mitten factories assert the whole set of targets
rather than one entry at a time.

The mask is a bitmask of the poses a layer swaps in, tested with `&`. An unset bit
means the layer keeps the group it declares.

## The entry module's body runs after everything it imports

`src/mod.ts` rebuilds `ModelLayers` from `LAYERS_BASE` in its body, after the import of
`./Api`; but `export * as … from …` declarations are hoisted, so every dependency — that
is, the entire registration tree — is evaluated *first*. The textual order is misleading,
and moving that block into a separate imported module changes when `ModelLayers` is
populated. Models are registered into `ModelDefs` before it runs, which works only because
layer priorities are resolved by name at render time. (The block writes back exactly the
priorities `InitLayers(LAYERS_BASE)` produced at boot, so it is a no-op today; removing it
would empty the registration summary's `initLayersArgs` and `modelLayers` sections, which
is why it is still here.)

`src/mod.ts` leans on the same rule twice more: the import that runs the registration tree
and the assignment of the global are both its own body, so the namespace is complete by the
time anything can read it.

## Two game globals are wrapped at module evaluation, and order decides who is outermost

`StateStorage.ts` replaces both `KinkyDungeonGenerateSaveData` and
`KinkyDungeonLoadGame`, capturing each original on the way. Because that happens
when the module is evaluated, **a mod that patches either one later wraps around
Boids rather than under it** — and the game declares no ordering contract for
third-party patches, so that is a hazard to know about rather than one to rely on.

Both wrappers are defensive on purpose. The save wrapper writes the release root and
the coordinator state onto `KDGameData` and then calls through, so a later wrapper
still sees a complete save. The load gate answers with the game's own synchronous
boolean and **throws nowhere** — a refusal is a value and a message, never an
exception, because an exception here lands in the game's crash-report path.

## A restraint's control state derives from one baseline the Coordinator holds

**Never store a baseline value on an item.** Removing equipment must **release** an override, never
**restore** a value the removal destroyed — so the baseline lives in the Coordinator, and the applied
value is *derived* from it plus what is worn (`design/spec.md` §6.5, invariant 12).

Two consequences that are easy to get backwards:

* **The dossier holds no equipment.** Not a capability, not a ceiling, not a registered-item set.
  Which items are worn is read from the game when a dimension is resolved, so the answer cannot go
  stale and there is nothing to invalidate when a piece leaves the body. That is what makes the
  per-facet **Free state** fall out rather than being tracked.
* **A dimension with no entry is at its baseline**, not at a stored default — *every facet parameter at
  rest*: `Target = 0`, `Intent = Free`, and `Allowed` the dimension's whole ladder. The baseline is the
  *absence of an effect*, so an absent entry and an explicitly empty one are the same statement, and only
  one of them is worth writing down. `Posture` is the one facet whose baseline is a **full** value rather
  than an empty one, because an unconstrained body may take any of its poses.
* **The demand is persisted; the severity is not.** The recorded `Target` is what the Host asked for, and
  the resolved severity is that demand **clamped to** what the worn set can impose. Storing the resolved
  number would cache an answer the worn set can change with nothing to invalidate it.

`test/control-baseline.property.test.ts` is the enforcement: equip, touch every dimension, remove
everything, and compare the dossier and every resolution field for field with the never-equipped
state. See [`control-model.md`](control-model.md).

## A posture resolution is never empty

**The engine indexes the available set at `[0]`** (`player/KinkyDungeonDress.ts:714`), so an empty one
hands `undefined` to the renderer. An empty set is **easy to reach** rather than a corner: a posture
dimension's capability is an **intersection**, so two items that each deliver one pose need only disagree —
and the Host's demand is a set to subtract on top of that (`design/spec.md` §6.7, invariant 23).

Two nets, deliberately:

* **The router's sentinel.** When the algebra empties the set the router answers with the **ladder's own
  first member** — so every ladder in the catalogue is ordered with the pose every rig can draw at its
  head (`Free` for the arms, the game's `DefaultStand` reading for the legs).
* **The game's own sentinel**, which §6.13 rule 4 runs after both operations, falling back through
  `DefaultStand`, `DefaultKneel` and finally `Hogtie` (`Data/Poses.ts:459-467`). The two agree because the
  ladders are ordered for it.

`test/control-pose.test.ts` is the enforcement: a property over **every** posture dimension, every demand
that is any subset of its ladder, every gate and up to four worn sets — because the empty set is reachable
from the intersection *and* from the subtraction, and a sampler that missed one of the two roads would call
the invariant enforced on half its cases.

## A membership tag is a persisted identifier, so it is derived

A tag that goes into a restraint template's `shrine` list is written into every template that
carries it and compared by value — so it gets the same treatment as every other identifier: the
readable name is the stable half, the value is derived from the release root, and renaming one is a
versioned decision rather than two spellings drifting apart (`Coordinator/Tag.ts`).

The same goes for a dimension's id, which is a **key in the dossier**: renaming one renames a saved
key, so it is a migration rather than a cleanup.

## AnnounceRate advances time, so it must not run inside a tick

`Coordinator.SensoryControl.AnnounceRate` ends with `KinkyDungeonAdvanceTime(1)` and re-enters the game's
event bus via `KinkyDungeonSendEvent`. Every morph handler chains off that. The random `tick` handler that
used to call it from inside the game's own dispatch was retired by the Phase 1 re-delivery (#82); the
console driver is its only caller until 3.1 replaces it. **Never call `AnnounceRate` from inside a tick
handler**: that is the re-entry the retirement exists to remove.
