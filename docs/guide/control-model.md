# The control model

> What a dimension is, where it lives, how it is written, and who decides what it resolves to.

The control model is what `MachinePrime`'s mechanism layer is: the Coordinator records what the Host
demands and what the character's equipment can deliver, and a router turns that into an answer. It is
specified in [`design/spec.md`](../../design/spec.md) §6.1–6.7 and §6.12; this page is how the code is
laid out and which invariant holds which part of it.

## The vocabulary, and which word means what

| Word | Means | Where |
| --- | --- | --- |
| **dimension** | one separately-constrained value, addressed by a derived id | `Coordinator/Catalog` |
| **descriptor** | the code-side record describing one dimension | `KDExtension/Control/Descriptor.ts` |
| **facet** | a reusable semantic component a dimension composes: `Rate`, `Posture`, `Gate`, `Whitelist` | `KDExtension/Control/Facet.ts` |
| **dossier** | the persisted state — `intent` and `config`, keyed by dimension | `KDExtension/Control/Store.ts` |
| **intent** | the Host's demand for one dimension: a record of the parameters its facets take | `KDExtension/Control/Store.ts` |
| **router** | the layer that resolves one dimension against what is worn | `KDExtension/Control/Router.ts` |
| **engine value** | what a resolved 0..1 becomes in the engine's own units | `KDExtension/Control/Descriptor.ts` |
| **provider** | an item that declares it can move a dimension | `Coordinator/Provider.ts` |
| **controlled item** | a restraint whose template carries the membership tag in `shrine` | `Coordinator/Membership.ts` |

**Three of these are words the spec uses for different things, and it matters which one you mean**: a
*dimension* is the thing the Host demands something of, a *facet* is one of the ways a dimension can
behave, and an *intent* is the demand itself — a record of the parameters that dimension's facets take. A
dimension composes facets; it does not have a type. And `GateIntent` is a *facet's vocabulary*, never the
type of an intent — `PoseKey` is the same kind of thing for `Posture`.

**Appearance is not one of these words, and it is deliberately absent from the list.** The base game's
`gag` property is one number that drives the mechanics *and* selects the model, so a larger ball there is
necessarily a stricter one. The model separates them by making the look **a function of the intent,
parameterised by the item** (§6.1): an item declares the mapping from the resolved intent to its own
models, and the Host has **no cosmetic parameter** to write. *A small ball on a strict mechanism* is one
item variant whose mapping chooses the small model at a high intent while its bid is high, and its
sibling maps the opposite. **The build has not moved onto that mapping yet**: the muffler still renders
the `AppearanceKey` it declares (`Coordinator/Tag.ts`), and the code half moves with the injector
(2.1/3.1).

## Why the mechanism and the dimensions are in different folders

```
src/KDExtension/Control/     the mechanism: facets, descriptors, the store, the router, the validators
src/FactionMachine/MachinePrime/Coordinator/Catalog/   the dimensions, and which seams they use
```

The layering arrow (`Utilities < KDInterface < KDExtension < Common < FactionMachine`) is what
enforces the split rather than a convention. A mechanism that lived under `FactionMachine` could not
be used by a sibling faction without importing it, and the mechanism is the same whatever the
dimensions are called — so a second faction writes a catalogue and changes nothing in
`KDExtension/Control`.

**Adding a dimension is adding one record.** `Catalog/Name.ts` declares a readable name,
`Catalog/Dimensions.ts` registers a descriptor, and nothing else changes: the store is keyed maps, the
router resolves by descriptor, **the parameters the Host may demand follow from the facets the descriptor
declares**, and the gates walk `AllDimensions()`. A name with no descriptor fails a test, and a descriptor
under an id no name derives fails it too.

## The persisted shape has two keys, and both of them are sparse

```ts
type ControlState = {
    readonly intent: { [D: DimensionId]: Intent }  // the Host's demand; an absent key is the baseline
    readonly config: { [D: DimensionId]: Config }  // sparse; semantic extra fields
}
```

**A demand is a record, not a value.** A dimension composes facets, so what the Host may demand of it is
exactly what those facets take as parameters — merged, each optional:

| Facet | Parameter it contributes | On |
| --- | --- | --- |
| `Rate` | `Target?: number`, 0..1 — **how hard to squeeze** | `Sight`, `Hearing`, `SpellRange`, `Noise`, the stats |
| `Posture` | `Allowed?: PoseKey[]` — **which body configurations** | `PoseArms`, `PoseLegs` |
| `Gate` | `Intent?: GateIntent` — **which permission** | every dimension with a gate, which is most of `Behavior` |
| `Whitelist` | **nothing** — see below | `WeaponUse` |
| several | all of them, together | `Struggle` (rate + gate), `PoseArms` (posture + gate) |

**Twenty-three dimensions in the catalogue**, and the composition rule is what keeps the list honest:
`Behavior` alone holds thirteen, because `Defense` (blocking), `Interaction` (what the hands do to the
world) and the two posture dimensions were each a real mechanism hiding inside another dimension's
property, and `Noise` was a real consumer with no dimension at all. **There is no `Arms` dimension and no
`Hands` dimension**: the base game's `bindarms` and `bindhands` pay for seven different capabilities, so a
binding is a **set of bids** on the dimensions that own them rather than a dimension of its own.

`GateIntent` is one facet's *vocabulary*, not the type of a demand. Writing the whole persisted demand as
`{ [D]: GateIntent }` — which this code did until it was corrected — **collapses a rate dimension's
demand onto a gate's vocabulary**: `Sight` could be `Free` or forbidden and nothing in between, so *"the
Host squeezes sight to 0.4"* had no representation at all. `FacetIntentParameters`
(`KDExtension/Control/Descriptor.ts`) is the table that derives the parameters from the facets, so the
write validator's **(shape)** rule is a rule about the descriptor rather than a list to maintain.

**`Posture` is the one parameter whose value is a set, and the one facet whose baseline is full.** The arms
can be free, in front, crossed, wrist-tied, box-tied, yoked or raised and the legs spread, closed, kneeling,
kneeling-closed or hogtied — the base game already treats each as a named pose with a permitted set
(`Data/Poses.ts:1, :16`) — so `Allowed` holds poses and an absent one means **the dimension's whole
ladder**, because an unconstrained body may take any of them. That is why it is written as a permitted set
rather than a list of refusals: `Free` and *"every pose allowed"* have to be the same statement, or removing
the last covering item would have to *restore* a set instead of releasing one.

**A `Whitelist` contributes no parameter, and that is the design.** Which keys equipment can re-grant is
the *equipment's* declaration, read from what is worn and never the Host's (§6.12 clause 4), so the Host's
only lever over a whitelist is the gate in front of it — *"you may have it back, through the gear"* — and
the gear decides which abilities that covers.

**There is no `equipment` key, and there must not be one.** The equipment's capability is computed at
execution time from what is worn, so a stored ceiling would be a cached answer to a question the worn set
can change.

**A dimension with no entry is at its baseline** — every facet parameter at rest: `Target = 0`,
`Intent = Free`, and `Allowed` the whole ladder. The baseline is the *absence of an effect*, not a stored
reading, which is what makes removing equipment **release** a demand instead of restoring a value (§6.12,
invariant 12).

**The maps are sparse on purpose**, so a save written by a build that knew fewer dimensions loads into
one that knows more and the new dimensions simply read their baseline. That is why the descriptors are
code-side.

**The store holds a `Map`, and a caller writes a record.** `SetIntent` takes the plain record §6.5
states, and `ToIntent` is the single conversion point; `ReadIntent` reads it back at the save boundary,
where the value is checked rather than trusted and an unusable one is dropped rather than clamped.
Holding a `Map` rather than a plain object is what makes a demand survive `fromJS(toJS(x))` as an *equal*
value: a plain object nested in an Immutable record does not compare by content, so a round-tripped
demand would differ from itself.

## The three gate values, and why `Free` is not `0`

| Value | In code |
| --- | --- |
| `Free` | **the injection layer injects nothing at all** — the restraint template's own defaults are the floor |
| `OverrideForbidden` | the Host applies the restriction, and the injection layer denies |
| `OverrideAllowed` | the Host re-grants an ability **through the equipment**, and only from what it can grant |

`Free` means *the controller contributes no effect*, which is a different statement from *the value is
zero*. A worn blindfold is still a blindfold — its template's own defaults are what remains, and the
corpus requires those to be a loose baseline (2.6) — but the controller adds nothing until the Host
records an intent.

§6.6's *"`Free` may not carry a non-zero squeezed `Target`"* is a **property** in
`test/control-router.test.ts` rather than a write validator, and that is the honest home for it: the gate
and the rate are different facets of one demand, and the resolved severity is the demand clamped to what
is worn — so no single write can establish what a gate will resolve to, but no resolution may contradict
it either.

## The router answers for one dimension; selection answers for a set

`Resolve(dimension, dossier, bids)` is pure: it takes the bids it is handed and answers **per facet** —
`Demand`, `Applied`, `Ceiling` and `Projected` only where the dimension composes `Rate`, `PostureDemand`,
`PostureCeiling` and `Posture` only where it composes `Posture`, and `Gate` and `Engaged` only where it
composes `Gate`, plus the winning bid, the losers and the config. **Nothing in `KDExtension/Control` reads
the game**, which is what lets the property suite cover it.

| Facet | What the router does |
| --- | --- |
| `Rate` | the capability is the aggregate of the bids under **the winning bid's stacking mode**; **`Applied` is the Host's `Demand` clamped to that capability**, with an absent demand at 0; `Projected` is `Applied` through the dimension's **engine value** map |
| `Posture` | the capability is the **intersection of every provider's `Allowed`**, or the **ladder** when none speaks; subtract the Host's demand where the gate forbids; where the gate allows, restore only a pose the capability already contains; **allow wins**, and the result is **never empty** — the sentinel is the one member allowed outside the capability |
| `Gate` | an absent demand reads as `Free`; `OverrideForbidden` engages where the direction can deny, `OverrideAllowed` where it can grant |
| `Whitelist` | nothing — the gate in front of it is the Host's only lever; the capability is the **union of every bid's `Granted`**, reported as the resolution's `Granted` |

**`Rate` is uniformly 0..1 in the model, and the engine value map is where that stops.** No base-game
quantity is on that scale — blindness is an integer ladder capped at 7, deafness an unbounded weighted sum,
a hearing radius a hyperbola that never reaches zero, a slow level an integer whose `>9` is immobility — so
every `Rate` dimension declares the function that turns its resolved value into what the engine actually
reads, **writing the identity where nothing needs converting** rather than leaving it out. A seam reads
`Projected`; a reader that wants the model's answer reads `Applied`.

**Stacking is a field on the bid, because the base game's own aggregates do not agree with one another.** A
`gag` is a *sum* with a saturating floor, a blind level a *count and a maximum at once*, a deaf level a
weighted maximum plus a weighted sum. So a bid declares `Max` or `Sum`, the **winning bid's** mode governs
the dimension's aggregate, and the aggregate is clamped to 0..1 like any other rate.

**There is no `Count` mode, and its absence says what this mod's equipment is.** A count aggregates the
*number* of contributing items rather than what any of them says, so it only means anything for a
fixed-value restraint — *one item, one rung* — and a piece here declares a **power**: two pieces of a kind
are stronger because their powers add, not because there are two of them. Nothing is lost, because a count
is a sum in which every contributor bids the same step.

**A posture dimension's bids combine by intersection rather than by power, and the reason is the art.** A
pose is a sprite variable, and an item that cannot deliver one may not carry the variable for it at all — so
permitting a pose the worn set cannot draw would produce a state the renderer cannot represent. Two items
that each deliver one pose need only disagree for the intersection to be **empty**, and the game indexes the
available set at `[0]` (`player/KinkyDungeonDress.ts:714`) — so the router falls back to the **ladder's own
first member**, which is the pose the game's own cascade reaches for first (`Data/Poses.ts:459-467`). That
is invariant 23.

**A persisted parameter is the demand; the resolved value is the outcome.** Keeping them apart is what
lets a demand recorded before the gear that can deliver it exists *wait* rather than be discarded: it is
remembered and applies nothing while it waits, and the moment gear arrives that reaches it, the outcome
rises to meet it.

**There is no contract between dimensions.** The facet interface describes one dimension and nothing about
any other. A seam may read anything it likes out of the game, including state another dimension of ours
happens to be driving — the legs' pose answer is also read as `legBondage`, for instance — but that is
**not part of the model, nothing may rely on it, and no test may assert it** (§6.7). It is written down so
nobody later reads it as an oversight.

**A body-state predicate is a compatibility shim, not a dimension.**
`KDExtension/Control/BodyState.ts` answers the base game's *"are her arms bound"* — one question with some
fifty callers — as a **union of the refusals** among the dimensions that declared they feed it
(`Descriptor.Feeds`). It is declared and **not bound**: the seam that answers the game is the `forceResult`
guard, and that is Phase 2.1's.

Which item to *wear* is a different question — it is about a set of dimensions at once — so it lives
beside the router as `SelectProvider`/`WhichQualify` (`Coordinator/Public/Selection.ts`). The router
**reports** the losers rather than instructing them, because how a family expresses a loss is the
family's business.

`Resolve` walks the worn set itself when it is handed no bids. `Public.Control.FindProviders` publishes
that enumeration, so a console caller — or the seam layer that resolves several dimensions per event —
can walk the body **once** and pass the same bids to each resolution.

`test/control-router.test.ts` holds the resolution rules and the write refusals;
`test/control-pose.test.ts` holds the pose vocabulary and invariant 23;
`test/control-descriptor.test.ts` holds the registry's shape; `test/control-baseline.property.test.ts`
holds invariant 12; `test/control-facade.test.ts` holds the grant path through `SetIntent` and the
published enumeration; `test/debug-driver.test.ts` holds the retired tick handler and the console
drivers.

## The posture route, declared and not bound

A posture dimension is routed **directly from the controller to the game's own pose system** — not through
a restraint's declarative fields and not through the tags a restraint's `shrine` may carry. It is the one
family whose route is neither a `calc*` seam nor a `forceResult` guard, because the base game offers
neither: `KDGetAvailablePosesArms` and `KDGetAvailablePosesLegs` are **pure functions with no event**, so
the only way in is the fourth seam kind — **replace** — by wrapping the global.

`Coordinator/PoseRoute.ts` holds the **declaration**: the two globals, the pose-driver words a mod
restraint may not put in its `shrine` (a second, invisible route into the pose system, of which `Hogties`
reaches furthest — `KDForcedToGround` reads it, and its consumers include the heel level, the slow level and
the melee penalty), and the sentinel. It **wraps nothing**: `PoseRouteBound` is `false`, so a caller can ask
whether the route is live without reading the source, and the phase that binds the wrap replaces it with
`true` in the same commit.

## The restraint contract

A restraint takes part by meeting five clauses (§6.12). **One of them is a tag and the rest are
consequences**, which is why the whole thing is short:

1. **Membership — the `shrine` tag.** The base game uses `shrine` as a generic tag list, so a mod tag
   in it is the engine's own idiom. `ControlledTag` is derived from the release root
   (`Coordinator/Tag.ts`), because a tag is persisted and compared by value.
2. **Registration — gone.** The participants are whatever is worn, so there is no set to maintain and
   nothing to unregister. This is the deletion that makes clause 4 possible.
3. **Instantiation — the game's own.** One template per name, per-instance state on the worn object.
4. **No record — the equipment group is never entered into the controller's state.** `FindProviders`
   enumerates `KinkyDungeonAllRestraintDynamic()` and reads what each item declares, so adding or
   removing an item changes the answer with nothing to invalidate. The per-facet **Free state** falls
   out of this rather than being tracked.
5. **Control — the controller is a subscriber, never a callee.** An item declares itself a provider
   through the shared `SetItemDataOnApply` builder; it never calls the coordinator.

`test/restraint-contract.test.ts` holds clauses 1 and 4; 2 is gone, 3 is the game's, and 5 is a
property of the import graph that `test/layering.test.ts` and review hold.

## The harness, and the one thing it has to get right

`FindProviders` asks the game what is **on the body** (`KinkyDungeonAllRestraintDynamic`) and resolves
each item's template through `KDRestraint`, which is **variant-aware**. The harness stubs both, and
its `KDRestraint` follows the variant indirection — so a test's worn item is a variant pointing at a
template, exactly as the mod's own items are. A stub that read the item's own name would find no
template and report every provider missing.

`test/harness/equipment.ts` is where a case builds a body and a dossier, and `test/harness/world.ts`
explains why a suite clears the world rather than reinstalling the globals.

## What this delivery does not do

**No dimension is bound to a game seam.** `Seam.Verified` says whether a descriptor's trigger has been
read out of the engine or is still a hope, and `test/control-descriptor.test.ts` fails if the whole
catalogue ever claims verified. Binding happens in the phase that owns the subsystem — the `forceResult`
guards and the action chokepoint in Phase 2.1, the posture route's wrap in 2.7, the sensory limiter layer
in Phase 3.1. The random tick driver was retired by the Phase 1 re-delivery; 3.1 replaces the console
drivers as the only writer.

**And the eleven defects the route inherits are recorded rather than repaired.** They are in the base
game, they are named with their sites in [`known-issues.md`](known-issues.md), and none of them is this
mod's to fix: an inherited defect that a phase silently works around is a defect nobody can find later.
