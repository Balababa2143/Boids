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

## Time advances from inside the game's tick dispatch

`MachinePrime/Debug.ts` registers a `tick` handler that calls
`SetLimiterStrength`, which ends with `KinkyDungeonAdvanceTime(1)` and
re-enters the game's event bus via `KinkyDungeonSendEvent`. Every morph handler
chains off that. It is the current prototype's only input to the sensory limiters,
which is why it lives in an explicitly-named debug module instead of being deleted
— see #19 and #40.
