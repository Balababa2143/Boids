# Boids — Specification

**Status:** **FROZEN — 2026-10-16.** Normative. This is what `Boids` is. Where this document
and the code disagree, one of them is a bug.

**How a change happens now.** The design is closed, so **this document is not edited to
record an idea.** The route is:

1. **an issue** states the proposed change and its reasoning;
2. the issue is **decided**;
3. the decision lands **here**, and if it is breaking for saves it also needs a slot in the
   **version table** (§4.3) and a step in the **migration chain** (§4.4);
4. the work is scheduled in `docs/dev-plan.md`;
5. `docs/design-brief.md` gains a dated row in **its Appendix E** naming the issue and the
   change — the brief's reasoning is never rewritten.

> **A step that is implemented but not promoted is still a `[提议]`.** Building one never
> settles it: promotion is an edit here, and the markers in §§6–8 are the record of what has
> and has not been promoted.

**Scope:** the specification for `MachinePrime` and the shared infrastructure beneath it.
Other factions are out of scope (see §10).

**Companion documents:**

| Document | Role |
| --- | --- |
| `docs/dev-plan.md` | the ordered work programme that implements this spec — **frozen 2026-10-16**, and moved by tracking thereafter |
| `docs/design-brief.md` | the design discussion, its evidence, and its open questions — **non-normative and frozen 2026-10-16**; its Appendix E is the change log for this spec |
| `docs/codex.md` | the **content and fiction bible** — setting, voice, visuals, script beats and terminology. **Not frozen**; it is for people authoring, and it never overrides this document |
| `README.md` | the repository's own conventions, build, and invariants |

**Conventions used here:**

- **[既有]** — verified against the base game or this repository, with a citation.
- **[决定]** — a design decision. Not open for silent revision.
- **[提议]** — proposed, not decided. **Building one does not promote it** (§6.7).
- **[待定]** — deliberately open. Marked where it appears, and listed in §12.
- **[待验证]** — known to be unknown; nothing may be built on it yet.
- **[goal post]** — recorded, deliberately out of scope for this delivery.

### Glossary

| Term | Means |
| --- | --- |
| **Host** | the distributed super-consciousness Boids' fiction is about (§9) |
| **seam** | a point the base game lets a handler intervene at: a `calc*` event, an override guard, the action chokepoint, or a declarative field |
| **injection layer** | the part of the Coordinator that applies a constraint to the game. "Inject nothing" means it contributes no effect |
| **subsystem** | one of the three mechanism groups: Sensory, Stats, Behavior (§6.3) |
| **group** | one of the three kinds of demand: Constraint, Substitution, Buff (§5) |
| **dimension** | one separately-constrained value, identified by a `DimensionId` |
| **facet** | a reusable semantic component a dimension composes: `Rate`, `Gate`, `Whitelist` (§6.1) |
| **descriptor** | the code-side record describing a dimension (§6.2) |
| **router** | the layer that resolves which equipment provider wins a dimension (§6.7) |
| **projection layer** | the mechanism by which equipment grows and displays extra parts (§6.7, §8.2) |
| **variant key** | the object whose fields and field order determine a generated restraint name (§4.5) |
| **archetype / limiter** | the pre-existing name for what this spec generalises into a dimension |
| **suppression** | a `Rate` facet: how strictly a value is squeezed |
| **servitude progress** | the record of how far the Host has overridden a character (§7.1) |
| **controlled item** | a restraint whose template carries the Boids `shrine` tag (§6.12). The membership test (§6.10) |
| **baseline / Free value** | what a dimension is set to when nothing is imposed: `Rate.target = 0`, `Gate.Intent = Free` (§6.5). **An absence of effect, not a stored reading** |
| **Free state** | a dimension's condition once its **last covering item has left the body** — it sits at its Free value (§6.10). Not a body region and not a phase flag |
| **dossier** | the Host's file about a character — the equipment half of the Coordinator's state (§5, §7.1). Route 1 of the final act deletes it (§6.10) |
| **quest metadata** | the other half of the Coordinator's state: knowledge and keys the **quest allocator** reads (§5, §8.3). **Route 1 keeps it** — which is what makes repeat-entry skipping possible |
| **`furniture`** | a **map doodle** — `KDFurnitureDef` — that names a restraint by tag and applies it in the **`ItemDevices`** group. *"Sealed into the `furniture`"* means **sealed into that restraint**, and it is where kind 2's curse attaches (§6.9) |
| **kind-1 curse** | the equipment-permanence curse: unsatisfiable everywhere **except the final room** (§6.9, §6.10) |
| **the lift** | clearing a kind-1 curse. Frictionless, and it **leaves the item worn** — the removal is the separate struggle (§6.10) |
| **kind-2 curse** | the commit curse: applied to the whole worn set and the `furniture`'s restraint in one atomic replacement, with no `condition`, and never liftable (§6.9, §6.10) |
| **decorative lock** | a lock in appearance only — freely applied and removed, never kind 1 or kind 2 (§6.10) |
| **free phase** | the reversible interval in the final room in which equipment and decorative locks may be changed in any order, before either commit (§6.10) |

### Names used in the code blocks

| Name | Status | Where it comes from |
| --- | --- | --- |
| `DimensionId` | open | a derived identifier (§4.1) |
| `GateIntent` | **closed** | the three values in §6.4: `Free`, `OverrideForbidden`, `OverrideAllowed` |
| `CapabilityKey` | **closed** | the set of abilities equipment may substitute for. **Membership rule:** a key exists only if the ability has a usable seam; speech, `immobile`-based movement and noise have none (§3.2) and are therefore excluded by construction |
| `Config` | open | per-dimension semantic extra fields, persisted (§6.5). Never live gameplay state |
| `StruggleType` | existing | the base game's own struggle-type identifiers |

---

## 1. What Boids is

A content mod for **Kinky Dungeon**, a browser roguelike. Its subject is **dronification**
and its sub-themes, packaged as a texture/asset set plus a single webpack bundle that the
game evaluates at load time. It registers models, restraints, text keys and event handlers
into the game's globals as a side effect of being imported; the only thing it owns is the
`globalThis.Boids` namespace (`README.md`).

**Design priorities, in order:** the kink first, then the gameplay. **[决定]** Equipment
serves the kink *and* carries real mechanics; neither is decoration for the other.

## 2. Structure: three layers

**[决定]** Boids is organised in three layers, and they are distinct concerns:

| Layer | Concern | Code |
| --- | --- | --- |
| **Outfit** | art and restraint definitions | `Futuristic` |
| **Mechanism** | what is constrained, how much, and how the constraint reaches the game | `MachinePrime.Coordinator` |
| **Sub-faction** | story, flavour, progression, privileges and their costs | not built |

**[决定]** Sub-factions share the outfit layer *and* the mechanism layer in full. **[提议]**
The consequence — that a new sub-faction is story plus configuration rather than a new art
pass — is the reasoning behind that decision, not a separate decision.

## 3. The base game: what we rely on

**[既有]** The base-game source is present and readable at
`kd-structured/KinkyDungeon/Game/src/` — 158 `.ts` files — not merely generated typings.
Every base-game claim in this spec is read from implementation.

### 3.1 Extension points Boids uses

| Capability | Mechanism |
| --- | --- |
| registration | plain mutation of the game's global registries; throws on duplicate |
| derived numeric values | `calc*` events whose `data` object a handler mutates in place |
| player actions | one chokepoint: `KDSendInput` → `KDInputTypes`, 86 named commands |
| restraint removal | `KDLocks` / `KDCurses` registries |
| persistence | unknown keys on `KDGameData` survive save → load; `localStorage` for cross-character data |
| quests | the `KDQuests` global plus `KDAddQuest` / `KDRemoveQuest` / `KDGetQuestData` / `KDSetQuestData` |
| per-character tags | dispatch of `updatePlayerTags` with a mutable tag map |
| **the one contract they share** | a handler receives a `data` object and **mutates it in place**; the game reads the mutation back and uses it. That is the whole extension idiom, and every seam below relies on it |

### 3.2 What cannot be granted, and what the control model excludes

**[既有] Two abilities have no event seam at all.** Speech and `immobile`-based movement:
the game reads the relevant restraint fields inline, with no interception point.

**[既有] A third, noise, is a different failure mode**: it *has* a seam, but the seam fires
after the decision has already been made, so it cannot change the outcome.

**[决定]** In both cases the abilities are ungrantable, and therefore:

- they can **never** appear in a `CapabilityKey` set (§6.4);
- the only way to gate them is the action chokepoint;
- they are **not** candidates for a mediated (equipment-granted) version.

> The distinction matters for anyone tempted to try: a seam that exists is more inviting
> than one that does not, and the noise seam in particular looks usable until the ordering
> is checked.

**[既有] Separately, five values are outside the control model**, for reasons unrelated to
seams:

| Value | Excluded because |
| --- | --- |
| `calcDisplayDamage` | UI only; never affects gameplay |
| `calcBindCrit` | training-related; not a control surface |
| `calcEscapePenalty` | belongs to the **training** record (§7.1) |
| `calcGagRed` | ditto |
| `calcCorsetSPRed` | ditto |

### 3.3 Base-game changes are optional patches, never a dependency
**[决定]** Boids may benefit from base-game changes, but those ship as a **separate
patching mod** that Boids consumes as an **optional plugin**. Boids must run without it,
and must degrade rather than break when it is absent. Every patched path needs a working
non-patched path.

**[既有]** The upstream route is open and has precedent: the game ships its source to
modders under the Kinky Contributor License, and `.github/CONTRIBUTING.md` documents a
fork-and-PR workflow.

## 4. Identifiers and versioning

### 4.1 Construction

**[决定]** Every identifier is derived deterministically:

```ts
uuidv5(`Boids.MachinePrime.Item.Foo${JSON.stringify(variantKey)}`, MOD_ROOT_UUID)
//      └─ the namespaced name is the VALUE ─┘        └─ the root is the NAMESPACE ─┘
```

- The **namespaced name is the value** (the first argument). The variant-key suffix is
  optional.
- `MOD_ROOT_UUID` is the **namespace** (the second argument) and the **version carrier** —
  it is the only place version information lives. No separate version field is serialised.

> **[既有] Implementation trap, and the argument order is the trap.** `uuid`'s signature is
> `v5(value, namespace)`. The namespace argument must **parse as a UUID**:
> `node_modules/uuid/dist/v35.js:15` calls `parse()`, and `parse.js:3-6` does
> `throw TypeError('Invalid UUID')` for anything else. **So putting the namespaced string
> second throws.** The repository's existing calls have this order already
> (`src/KDExtension/Variant/Common.ts:40`). A well-meant "simplification" that swaps the two
> arguments is the single easiest way to break every identifier in the mod.

### 4.2 What the save stores

**[决定]** The save stores the **path**, not the derived UUID: the namespaced name, the
variant key, and the `root_uuid` it was minted under. The id is **recomputed at load**.

Consequences, all of which are requirements:

1. Recomputation is a free integrity check — a mismatch means corruption or tampering.
2. The stored path is version-independent, so "what this item was" stays readable forever.
3. **Migrations only handle semantic change** (rename, split, merge); a pure version change
   recomputes by itself.

### 4.3 The version table

**[决定]** The root → release mapping is a **table in code**, shipped with the mod. The save
records **only `root_uuid`**, which is what localises the release.

**[既有]** The release key already exists: `Asset/mod.json`'s `modbuild`, stamped by the
build from `package.json`'s `version`.

**[决定] The rejected alternatives**, recorded because each had a different failure mode:

| Placement | Rejected because |
| --- | --- |
| a `localStorage` table shared by every release | nothing to maintain in code, but it is player-mutable state that can be cleared, and a lost table makes every id unrecomputable |
| a table in code with **no** root in the save | simplest, but a save then cannot say which release wrote it, so the migration chain has no starting point |

The chosen pair — code-side table **plus** `root_uuid` in the save — keeps the table
authoritative and the save self-describing. Note that the save's `root_uuid` is an
**addition** to the path and variant key of §4.2, not a replacement for them.

> **[待定] A contradiction in the source discussion, recorded rather than resolved.**
> `docs/design-brief.md` states in one place that the version table's home is *a follow-up
> decision* and *"the one open piece"*, and in another that it is *resolved: in code*. The
> designer's later and more specific instruction is **in code, with only `root_uuid` in the
> save**, and that is what this section specifies. The brief should be corrected to match.

### 4.4 The migration chain

**[决定]** One migration function per release, numbered, walked forward on load:

| Rule | Detail |
| --- | --- |
| **A slot exists for every version** | An **empty body is normal** — most versions change nothing, and the slot keeps chain indices fixed |
| **A breaking release refuses** | It fills its slot with a refusal rather than corrupting the save |
| **A refusal must not hang or crash** | The gate **returns cleanly with a message**; it must not throw |
| **A refusal is always shown** | Every refusal reaches the player, with the slot's own `reason` verbatim |
| **A refusal may offer the way out** | `ReturnToMenu` offers the game's own main menu; **either answer writes nothing** |

**[既有]** The gate's timing constrains where it can live: `beforeLoadGame` fires
**before** the save string is decompressed, so a handler there cannot see the version. Two
viable doors: wrap `KinkyDungeonLoadGame` (precedent: Boids already wraps
`KinkyDungeonGenerateSaveData`), or read `localStorage` inside `beforeLoadGame` (earlier,
but blind to multi-slot saves).

**[决定]** The version rides in the save as a key on `KDGameData`, which survives the
round-trip.

**[决定]** A slot's *decision* and its *work* are split, because they happen at different
times. Whether a save may load, and whether any slot refuses it, is decided **in the gate**,
before the game has adopted anything. A slot that accepts does its editing **after** the
load, where the live `KDGameData` exists — so a semantic migration is written against the
game's own state rather than against a re-encoded copy of the save string.

**[决定] Phase 0 (2026-10-16) — a refusal is a value with a reason and an optional way out.**
A slot's refusal carries its own `reason`, which reaches the player **verbatim**, and
`ReturnToMenu`, which decides whether the player is offered the game's own main menu alongside
staying where they are. `ReturnToMenu` is true only where staying cannot help — a save whose
shape this build cannot carry forward will not become loadable by trying again — and false for a
refusal about *this* save among others, where the player should be left in the load menu to
choose a different one.

**[决定] Neither answer to a refusal writes anything.** The gate refuses **before** the game has
adopted the save, so the save on disk is byte for byte the save that was offered, and a release
that understands it can still read it. Returning to the menu is the same single state assignment
the game makes for its own back buttons (`base/KinkyDungeon.ts:3315`) and nothing more. That is
the property that makes refusing *graceful* rather than destructive: the player loses a load
attempt, not a character.

**[决定] Phase 0 (2026-10-16) — a save with no recorded version may be loaded, on a warned
confirmation.** The rule above governs a save whose version is *known and refused*. A save
that carries **no** `root_uuid` is a different finding: it is a character written before
versioned identifiers existed, which is not a corruption and not a newer release. It is
therefore **refused once with a warning prompt**, and loading it on the player's
confirmation **initialises the Coordinator as if the character had never had Boids** — a
complete default state at the current root, while the base game's character, map,
inventory and `Training` are untouched. A save that names a root the table does not know is
**not** treated this way: the table carries the whole history, so an unknown root can only
come from a newer release, and that stays a refusal.

| Save | Gate |
| --- | --- |
| no `root_uuid` | refused once, warned, loadable on confirmation with a fresh Boids state |
| `root_uuid` in the table, older than this release | loads, then the slots after its release run |
| `root_uuid` not in the table | refused as a newer release's save |
| `root_uuid` known, its slot filled with a refusal | refused with that slot's message |

**[既有]** The constraint that shapes the confirmation, and it is why this is two actions
rather than one: `KinkyDungeonLoadGame` returns a **synchronous boolean** and both call
sites carry their post-load work inline — `KDGenMapCallback`, the state transition and
`KDModsAfterGameStart` (`base/KinkyDungeon.ts:5743-5761`, `:6534-6549`). A prompt cannot
block that call and then repeat it without either re-entering the game's own load button or
losing the map-generation step. The gate therefore keeps the boolean contract, refuses the
first attempt, and on confirmation re-enters the game's own load button — the same idiom the
base game uses for its two-click confirmations (`:2884-2888`, `:5164-5169`).

**[决定] The approval names the save it belongs to, and is discarded with the question.**
A flag would leak across a save list — confirming one character and then clicking another
would load the second — and an accumulating set would leave approvals behind every cancelled
decision. It is one pending question and one approval, and discarding the question discards
the approval.

### 4.5 Save-format surfaces

**[决定]** Four things are persisted formats:

| Surface | Format rule |
| --- | --- |
| variant keys | field names **and order** are the format |
| coordinator state | `target` / `equipment` / `config` keyed maps (§6.5) |
| the recorded `root_uuid` | `root_uuid` per character, which localises the release (§4.3) |
| handler GUIDs | globally unique across the game **and every other mod**; a duplicate **literal** is a build-time concern, and a **registered** duplicate throws at load |

**[决定] Moving a variant-key field is a migration, never a cleanup.** The key is
*expensive* to move, not immovable — the migration chain (§4.4) exists precisely to carry
the rename. Nothing about the key is permanent; what is forbidden is moving it *without*
writing the migration.

**[既有]** As of this writing the GUID namespace is clean: 117 distinct GUID literals in
`src/`, all distinct. That is maintained by discipline rather than by a check — **[决定]
so uniqueness is enforced by a test over every GUID literal under `src/`.**

## 5. The control model, in one picture

**[决定]** The Coordinator is the mechanism layer (§2). It records what the **Host** (§9)
demands of a character and what the character's equipment can deliver, and a router turns
that into gameplay.

```
        Host's intent ─┐
                       ├─→ router ─→ seam(s) ─→ the game's own calculation
  equipment capability ┘
```

**[决定] The model is split into three groups**, because they are different operations:

| Group | Operation | Intent | Capability |
| --- | --- | --- | --- |
| **Constraint** | squeeze a value | `number` 0..1 | `number` 0..1 — the ceiling |
| **Substitution** | **take an existing ability away and re-grant it through another carrier** — a prosthesis, a spell generator | the gate enum (§6.4) | a whitelist of `CapabilityKey`s |
| **Buff** | **give something the character never had** | which buffs | which buffs, and their ceiling |

> **[决定]** Substitution is a **transfer**; Buff is an **addition**. They are not merged.
> *(Note on naming: the group is **Substitution**, while the gate's two non-free values are
> **`OverrideForbidden`** and **`OverrideAllowed`**. The historical name for this group was
> "Override", which collided with those values and has been retired.)*

**[决定] The Coordinator's state has two parts, and route 1 distinguishes them.** The
`Coordinator` is the mechanism layer (§2). It holds:

| Part | What it is | Cleared by route 1? |
| --- | --- | --- |
| **the dossier** | the character's control state — `intent`, `equipment`, `config` (§6.5) — i.e. what the Host demands of her on this attempt | **yes** (§6.10) |
| **quest metadata** | what the **quest allocator** reads to place quests: knowledge and keys (blueprints, obtained keys, completion records) (§8.3) | **no** |

**[决定]** The split is not incidental: it is what makes the repeat-entry skip criterion
possible, and it is the same distinction §7.1 draws between the Host's *file* and the
character's *training*. **Deleting the dossier does not delete what the Host knows.**

**[决定]** Boids ships restraint fields at **0 or a very loose baseline**, and the
Coordinator applies the real binding strength dynamically — the item does not begin strict,
it *becomes* strict. §8.2 states what this means for progression. It follows from restraint
definitions being read-only (§6.2, §6.8).

## 6. The control specification

### 6.1 Dimensions are composed, not classified

**[决定]** A control dimension **composes facets** rather than belonging to one category,
because semantics genuinely overlap — *struggle* is both a permission and a difficulty.

```ts
interface Identity  { Id: DimensionId }
interface Rate      { Target: number; Ceiling: number }
interface Gate      { Intent: GateIntent }
interface Whitelist { Granted: ReadonlySet<CapabilityKey> }

type Sight     = Identity & Rate
type Speech    = Identity & Gate
type Struggle  = Identity & Gate & Rate & { Types: StruggleType[] }
type WeaponUse = Identity & Gate & Whitelist
```

> **[决定] There is no separate `Capability: boolean`.** Whether the equipment can offer a
> substitute for a dimension is exactly *whether the dimension's `Whitelist` is non-empty*,
> so a boolean would be a second source of truth for the same fact. `Rate`'s `Ceiling` is
> the analogous field for the Constraint group.

The four types above are **worked examples**, one per facet combination the design needs
so far. `Sight` is the dimension the game calls blindness; `Speech`, `Struggle` and
`WeaponUse` are likewise dimensions, not base-game concepts.

**[决定]** Facets live in the **type system** and in a **code-side descriptor registry**.
The persisted shape stays uniform (§6.5). The migration chain is the backstop, not the
everyday mechanism.

### 6.2 The descriptor's fields

A dimension descriptor is a code-side record, not persisted state. It must carry:

| Field | Why it must be recorded |
| --- | --- |
| owning **group** (Constraint / Substitution / Buff) | the three groups are different operations (§5) |
| owning **subsystem** (Sensory / Stats / Behavior) | they ship separately and in a fixed order (§6.3) |
| composed **facets**, and any `config` fields they need | §6.1 |
| **direction**: grant, deny, or both | an ability may be one-way at the seam even when the design wants both |
| **every seam** it uses, with a **precedence** relative to the game's own writes | some values are written by an early seam and overwritten by a later one |
| whether it has a **buff side** | a deny-only seam can never express its inverse buff |
| `DimensionId`, **derived from the version master** | §4.1 |

**[决定]** A dimension may need **more than one seam**. The `Sight` dimension is not one
hook: the blind level is produced by one seam and consumed by another, and the game's
training system reads the same global as a third consumer. **A partial implementation
fails silently**, so the descriptor must name every tool the dimension uses.

**[待定] Whether the descriptor must also record a precedence *relative to the game's own
writes*** is proposed but not settled. The observation above is verified; the requirement
that follows from it is not yet a decision.

### 6.3 Subsystems, and the build order

**[决定]** Three subsystems, split by **mechanism**, not by body part:

| Subsystem | Owns |
| --- | --- |
| **Sensory Control** | perception values — blindness, vision, deafness, hearing, spell range |
| **Stats Control** | multipliers and rates — damage, evasion, crit, spell accuracy, resource costs, stat ceilings, sprint |
| **Behavior Control** | action gates — binding, speech, movement, attack, casting, escaping, arousal |

**[决定] Scope of the first delivery:** **Sensory + Behavior**, with **Behavior first**
(driven by the equipment-upgrade framework, §8.3). **Stats Control is deferred** until the
resource system exists; its dimensions are declared now and left unused.

**[决定]** The data model covers **every** dimension from the start; only a few are
implemented, and logic is added in stages from simple to hard.

### 6.4 The gate enum

| Value | Meaning | In code |
| --- | --- | --- |
| **Free** | neither the restraint layer nor the substitution layer is engaged | **the injection layer injects nothing.** The behavioural boundary is the `restraint` template's own defaults — the game's rules, unmodified |
| **OverrideForbidden** | the Host applies the restraint effect | the injection layer denies |
| **OverrideAllowed** | the Host re-grants an ability **through the equipment** | the injection layer grants, **but only from the equipment's `Granted` whitelist** |

**[决定] Free means "inject nothing", so the three layers compose rather than replace.**
The restraint template's defaults are always the floor.

**[决定] A hard rule, enforced at write time:** *if the equipment does not offer a
substitute capability, the Host cannot set `OverrideAllowed` for it.* "Allow" is a promise
about a specific capability; with no capability there is nothing to promise. The router
**rejects the write** rather than letting it fail silently later.

**[决定] `CapabilityKey` is a closed union.** Speech, `immobile`-based movement and noise
(§3.2) must never appear in it, so attempting to is a **compile error**, not a design review.

**[决定] The Host's working order is: read capability, then set intent.**

### 6.5 The persisted shape

```ts
type ControlState = {
    readonly intent:    { [D: DimensionId]: GateIntent }  // the Host's demand; default `Free`
    readonly equipment: { [D: DimensionId]: number }      // the equipment group's ceiling; 0 = free
    readonly config:    { [D: DimensionId]: Config }      // sparse; semantic extra fields
}
```

**[决定] `intent` is persisted and `target` is not.** `target` — the strength actually
applied — is **derived at runtime** from the intent and the equipment's current capability.
It is a computed value, so persisting it would store the answer to a question that must be
re-derived whenever the worn set changes.

**[决定] The baseline is the `Free` value, and it is not a separate field:** for every
dimension, **`Rate.target = 0` and `Gate.Intent = Free`.** "Nothing is imposed on the
character" is therefore **the absence of an effect, not a stored reading** — which is why
removing equipment *releases* an override instead of having to *restore* a value
(invariant 12), and why route 1's clearance has nothing to preserve.

**[决定]** `config` **is persisted**. It holds **semantics only** — which struggle types a
gate governs, and so on — never live gameplay state. "Which options are currently open"
belongs to progress, not to the controller.

**[决定] `target > equipment` is legal**, and the router takes the stricter value. The
Host's order is capability-then-intent, but an intent may be recorded before the gear that
can honour it exists.

**[决定] The equipment's contribution is never recorded on the item, and the equipment group
is never recorded in the controller.** The current group's capability is **computed at
execution time from what is worn** — §6.12's contract. So a piece of equipment entering or
leaving the body changes the answer immediately, with no cached value to invalidate.

> **[既有] A stored key is a namespaced path plus the character's `root_uuid`**, exactly like
> every other identifier (§4.1–4.2): the key is not a bare UUID, and the `root_uuid` is
> carried once for the character rather than repeated per dimension.

### 6.6 Write validators

Rejection happens at write time, never as a silent runtime failure.

| Facet | Validator |
| --- | --- |
| **Gate** | `OverrideAllowed` requires the equipment's `Whitelist.Granted` to **contain every key the dimension needs** |
| **Gate** | `Free` may not carry a non-zero derived `target` |
| **Whitelist** | every granted key must be a member of the closed `CapabilityKey` union |
| **Rate** | *nothing* — `target > ceiling` is legal by §6.5 |

### 6.7 The router

**[决定]** The router exists, and it is **one-to-many**: many items may speak to the same
dimension, and they must not fight. **[决定]** Its fourth job is the projection layer:
projection is **not** a side effect of equipping — it is gated on servitude progress and
applied **retroactively** to an already-worn item.

**[提议] The three rules for resolving a dimension are proposed, not yet decided.** They may
be implemented as written; the designer wants implementation experience before settling them.
**Do not treat agreement to build them as a decision** — a `[提议]` that has been built is
still a `[提议]` until it is explicitly promoted.

1. **Which items are providers** — an item declares its dimensions on apply, through the
   same stamped-event pattern items already use to register with the Coordinator.
2. **Which provider wins** — a **bid by power**, highest wins, following the base game's own
   `getArmsBound` convention: handlers bid, and the highest bid takes it **unless someone has
   already forced the result**. A projector is simply one bidder.
3. **How the loser expresses itself** — a losing or partial provider still changes the model,
   appearance or pose through the existing limiter-update event.

> **[既有] The bid convention is copied from working code, and it is a bid on *power*, not on
> a generic priority.** The base game's restraint handlers compute a power and raise the bid
> only while they are winning, guarded by a separate "has anyone forced this" check. Copying
> the shape means the forcing rule comes along with it.

**[决定]** The router must be drivable from the console before any UI exists. The
Coordinator's state accessors already are.

### 6.8 Living with a read-only restraint form

**[既有]** A restraint is one model per name and nearly stateless: a variant is a name plus
a small delta and all physical properties delegate to a shared template; per-item state
lives only in `item.data` and progress counters.

**[既有]** Three morphing routes exist, and two are workarounds:

| Route | Status |
| --- | --- |
| `KDMorphToInventoryVariant` | **workaround** — it mints a **random variant name** on every morph, and its fallback branch briefly unbinds the player |
| injected dynamic layer filter | **workaround** — rendering only; no new name, no unbinding |
| socketed sub-item | **workaround, and unfinished** — projects on apply with one hard-coded sub-item |

> **[goal post] Consolidating these three into one projection layer is deferred, not
> required.** The target is stated in §6.7, and the variants it mints should use derived ids
> — but this is a **standing invitation to do better**, not a decision the current work
> depends on. Neither the projector's progress gating nor the derived-id change is required
> for the first delivery; what *is* required is that new code does not add a **fourth**
> workaround.

### 6.9 Lock versus curse

| | Lock | Curse |
| --- | --- | --- |
| what it is | an object with rules about its own removal | a **condition** the wearer must satisfy |
| pick / key / hack | possible unless the lock forbids that method | **all barred** |
| force destruction | the restraint may still allow it | **barred** |
| display | a lock icon | a curse icon |
| scaling a restraint's power | `lockmult` | `powerMult` / `powerBoost` |

**[既有]** `lockmult` does **not** gate escape — it feeds the restraint's perceived power.
It is therefore usable as a **strictness dial** independent of removal rules.

**[决定] "Permanent" always means a curse**, never an unbreakable lock.

**[决定] There are two curse *kinds*, and they are a division of labour, not two copies of
one thing.** Their `condition`s and their liftability differ:

| Curse kind | Role | `condition` | Liftable? |
| --- | --- | --- | --- |
| **kind 1** — equipment permanence | the equipment's lock tier is finished | unsatisfiable **everywhere except the final room** | **only in the final room** |
| **kind 2** — the commit | the character is filed | none | **never** |

| Curse kind | Applies to | Carries |
| --- | --- | --- |
| **kind 1** | the worn item | the item is sealed; the character can still act and still leave |
| **kind 2** | **every worn item *and* the `furniture`, in one atomic replacement** | the character is stored; there is no longer anything to act with |

**[既有] The `furniture` is a restraint, and this is why kind 2 has a carrier at all.** The
base game's `furniture` is a **map doodle** — `KDFurnitureDef`
(`restraint/KinkyDungeonFurniture.ts:4-16`) carries `restraintTag`, `restraintSetTags`,
`lockType`, a `sprite` and a `tickFunction`, and has **no `curse` field**. The binding effect
is implemented elsewhere: **a furniture with a binding effect is a wearables restraint**,
resolved by tag and applied as an ordinary restraint in the **`ItemDevices`** group. So
"the `furniture` is curse-locked" means **the restraint it applies is curse-locked**, and
kind 2 needs **no new curse carrier**.

**[决定] And because the furniture's restraint is an ordinary worn item, kind 2 needs no
special case.** It is simply one more item in the set the atomic replacement covers; the
`ItemDevices` group's own semantics are what make being in it a commitment, and the curse is
what makes it permanent. **Any additional "she cannot be extracted" constraint is the room's
business, not a second mechanism.**

> **[既有] The verified chain, for implementation:** a furniture tile names a restraint via
> `restraintTag` (`KinkyDungeonFurniture.ts:22` and every other entry); the tag is resolved
> through `KinkyDungeonGetRestraint({tags: [furn.restraintTag]}, …)`
> (`prison/KinkyDungeonJail.ts:2740-2748`, `:2759-2769`); the applied restraint sits in the
> **`ItemDevices`** group (`restraint/KinkyDungeonRestraintsList.ts`, 42 entries), which the
> jail code treats as the device slot; and the furniture's optional `lockType` is passed
> straight through as the lock (`map/KinkyDungeonSetpiece.ts:935`). **[决定]** So the shape is
> **`furniture` (map definition) → restraint (applied, worn) → curse (kind 2)** — two
> indirections, and the curse goes on the last one.

**[既有]** The mechanism carries this directly: a curse is an entry in the `KDCurses`
registry with its own `condition`, `remove`, `events`, `customIcon_*`, `altIcon`,
`unlockText`, `powerMult` and `powerBoost`, so two kinds are two registry entries with no
shared state. **[决定] The two kinds must not share a `condition` by accident** — if both
evaluate identically the game cannot tell them apart and the flavour text has nowhere to
attach.

**[既有] And a curse is a single value per item, not a set.** `KDGetCurse` returns
`item?.curse || KDRestraint(item)?.curse` (`restraint/KinkyDungeonRestraints.ts:768-770`), so
**the two kinds are alternatives at one slot, never simultaneous** on the same item. This is
why kind 1 sealing the equipment and kind 2 sealing the character are separate states of the
same field rather than two seals stacked on one item.

**[决定] Kind 1 must supply a `remove` hook, and the hook must return `false`.** The base
`remove` is what `KinkyDungeonCurseUnlock` consults to decide whether to take the item off,
and the base game's own path takes it off — while kind 1 must leave it **worn** so that
removal can be a struggle (§6.10). **[既有]** `KDCursedDef.remove` is
`(item, host, specialMethod, index?) => boolean | void`, documented as *"Can return a
boolean. True means the item is removed, if unlocked"* (`base/KDTypeDefs.ts:3965-3966`), so
the whole override is the return value.

**[决定] Kind 2 has no individual application step.** It is applied to the whole worn set and
the `furniture` in **one atomic replacement**, so there is no reachable state in which some
items are sealed and others are not.

> **[既有] That a curse is *mechanically* liftable is not a design statement.** The
> distinction above is design semantics: **kind 1 is not liftable anywhere in the world**,
> because its `condition` cannot be satisfied outside the final room, and the room is the
> key.

**[决定] Reversibility, the two exit routes, and the final room's sequence are specified in
§6.10**, because they are the inverse of the progression §8.2 defines and must be designed
with it rather than beside it.

### 6.10 Reversibility and the two exit routes

**[决定] Before either point of commit executes, everything is reversible.** This is the
mechanical form of the mod's subject: descent is voluntary only while leaving is still
possible.

**[决定] Progression may only ever make leaving *harder*, never impossible.** Effort, cost
and time may all rise without bound; **a refusal may not.** The single exception is the two
commits below, which are irreversible by definition.

**[决定] The final act has a fixed sequence:**

| # | Step | Reversible? |
| --- | --- | --- |
| 1 | **Enter by a leash staging.** The room has **no entrance on the world map**; the character is escorted in and cannot walk back to it. | — |
| 2 | **The leash ends at the marked position and control returns to the player.** | — |
| 3 | **The character lifts the kind-1 curse, one item at a time.** The lift is **a button — no test, no cost, no roll** — and it **takes nothing off.** | yes |
| 4 | **The struggle:** with the curses gone, the character **removes the equipment itself.** This is the mod's peak difficulty, and **all of it comes from the Controller's injected values** (below), never from the curse. | yes |
| 5 | **The free phase** — the **Free state** is now in force, so equipment may be put on or taken off, and decorative locks added or removed, in any order. **Both routes stay open throughout.** | yes |
| 6 | **The fork: interacting with the door, or with the `furniture`.** | **no** |

**[决定] Lifting the curse is ceremony; the removal is the struggle.** The two are deliberately
separated: *lifting* must be frictionless so that **"lift the curse, then fit a decorative
lock" is a pure ritual action** with nothing in its way, and *removing* must be hard so the
final act has a body to it. **A curse that had to be broken would put a fight in front of a
ceremony**, and would also make the ceremony's re-enactment a second trial.

**[既有] In the base game a curse-lift takes the item off the body, so kind 1 must override
that.** `KDSendInput("curseUnlock")` (`base/KinkyDungeonInput.ts:155-157`) routes to
`KinkyDungeonCurseUnlock` (`item/KDCurse.ts:1049`), which sets `keep = true` (`:1051`),
clears `restraint.curse` and the variant's curse (`:1064-1067`), calls
`KDCurses[Curse].remove(...)` (`:1071`) and then — when the result is not `false` — calls
`KinkyDungeonRemoveRestraintSpecific(restraint, keep, …)` (`:1087`). With `keep = true` that
takes the restraint off and turns it into a loose inventory item
(`restraint/KinkyDungeonRestraints.ts:6065-6099`). **Left alone, lifting the curse would
remove the equipment, and step 4 would have nothing to do.**

**[决定] The override is a `remove` hook that returns `false`, and it is cheap.** `KDCursedDef`
declares `remove: (item, host, specialMethod, index?) => boolean | void` with the comment
*"Can return a boolean. True means the item is removed, if unlocked"*
(`base/KDTypeDefs.ts:3965-3966`). **So kind 1's `remove` returns `false`:** the curse is
cleared and the equipment **stays worn**, which produces exactly the state step 4 needs.
Returning `false` is what `unlock` is bound to in `KinkyDungeonCurseUnlock`, so no other
machinery has to be intercepted.

> **[决定] The consequence is stated once, because it is what makes step 4 real: after the
> lift, the item is worn, uncursed, and still on the body.** It is now removable only by the
> game's ordinary struggle path — which is the peak. **And it is removable**, because
> invariant 13 forbids a refusal.
>
> **[既有] Two strings come along with the base path and want overriding**: the escape status
> line `KDSendStatus('escape', …, "Curse")` and the text key
> `"KinkyDungeonCurseUnlock" + Curse` (`item/KDCurse.ts:1085-1086`), both of which read as
> *"you are free"*. A kind-1 lift leaves the item on, so the text must say **the curse is
> gone and the equipment is still there** — otherwise the UI contradicts the mechanics.

**[既有] Curse and lock are mutually exclusive in the base game**, so the ritual is
necessarily **two actions, not one**:

| Evidence | Where |
| --- | --- |
| `KDLockableRestraints` **excludes locked items** | `restraint/KinkyDungeonRestraints.ts:1264-1267` — `if ((!item.lock \|\| …) && !KDGetCurse(item) && …)` |
| applying a curse and applying a lock are **two disjoint branches**, each requiring the other to be absent | `:5016-5018`, `:5192-5194` |

**So a decorative lock cannot be fitted to a locked or cursed item.** The order is therefore
*lift → lock*, per item, and route 2's condition can only be assembled that way.

> **[既有] And a curse is a single value, not a set.** `KDGetCurse` returns
> `item?.curse || KDRestraint(item)?.curse` (`:768-770`) — **one curse per item**. A design
> that needs two curses on the same item at the same time is not expressible; two kinds must
> be *alternatives at the same slot*, which is what §6.9 specifies.

**[决定] The difficulty is the Controller's injected ceiling.** While any controlled item is
worn, the Controller drives the dimensions it covers as high as they can go **without closing
the exit**. Nothing else supplies the resistance:

- **Suppression and prohibition reach that ceiling** — **the highest value that still leaves
  removal possible.** Invariant 13 forbids a refusal, so the ceiling is *hard*, not *closed*:
  a ceiling that zeroed the escape chance would be a wall, not a peak.
- **The Free state is per dimension, and it is a value, not a region.** When the **last
  controlled item covering a controller facet leaves the body**, that facet's setting drops
  to its **`Free` value** (§6.5 — `Rate.target = 0`, `Gate.Intent = Free`). *"The last
  restraint covering a facet comes off"* and *"the facet is freed"* are the same event, and
  there is no anatomical grouping in the mechanism at all.
- **Granularity is per dimension, and it follows from the dynamic capability computation**
  (§6.5, §6.12): the group's contribution is recomputed from what is worn, so when an item
  leaves, the dimensions it was the last cover for fall to `Free` with no bookkeeping.
  **Removing an arm restraint frees the arm's dimensions — not because arms are a region,
  but because those dimensions now have no provider.**
- **The Free state is the mechanism, not a mercy.** It is what makes step 5 possible and
  what makes "the Host lets her have her own limbs back" a diegetic event rather than a
  scripted one.

> **[决定] The design has no invented curve.** There is no bespoke struggle formula to
> author: the base game's own escape, struggle and destruction calculations supply it, and
> the Controller's ceiling is the only dial. **The work is calibration, not construction**
> — the peak must be hard enough to be the mod's hardest moment and still winnable, and the
> safety valve below is what keeps an over-tuned peak from becoming a refusal.

> **[决定] The standing safety valve: a player who cannot break free may still descend.**
> Route 2's requirement is *decorative locks on every worn item*. **Lifting a kind-1 curse is
> frictionless and leaves the item worn uncursed (above), so the state a losing player is
> already in can be turned into route 2's condition one item at a time** — lift, fit, repeat —
> and the character may then walk to the `furniture` and commit. This is deliberate: the
> failure of the attempt is not a dead end, it is a fork, and it resolves into the ending
> rather than into a stall. **It is also why the ceiling may be tuned hard.**

**[决定] No mechanism acts on the character in the final act.** Nothing presses anything on
her that is not her own equipment. The author supplies the room, the `furniture` and the
decorative-lock interaction; **staying requires the player's own hands.** There is no captor
and no machine to fight.

**[决定] A decorative lock is a lock in appearance and nothing in substance.** It shows a
lock icon, it may be applied and removed freely, and it is neither kind 1 nor kind 2.

**[决定] The decorative lock is implemented by intercepting the game's own self-lock
feature, and it needs no item.** The base game's self-lock is the player-cast `Lockdown`
spell (`magic/KinkyDungeonMagicCode.ts:651-681`): it collects `KDLockableRestraints()`
(`restraint/KinkyDungeonRestraints.ts:1258-1273`) and calls `KinkyDungeonLock(item, "Purple")`
on each. Three verified facts make it the right seam:

| Fact | Where | Why it matters |
| --- | --- | --- |
| the handler table is a **plain mutable record** | `magic/KinkyDungeonMagicCode.ts:19` — `let KinkyDungeonSpellSpecials: Record<string, KDSpellSpecialCode>` | the handler may be **wrapped or replaced outright**, so Boids' own logic can run when the room is active |
| the **lock type is a parameter**, not baked into the restraint | `restraint/KinkyDungeonRestraints.ts:709-717` — `KinkyDungeonLock` sets `item.lock = lock`, and `KDLocks[lock].doLock` is optional | a Boids-registered `"Decorative"` entry in `KDLocks` is a complete lock with **no restraint behaviour** |
| the base handler **refuses when every item is cursed** | `:1264-1267` — `KDLockableRestraints` skips any item with `KDGetCurse(item)` | the base implementation **cannot** be used as-is in this room, because every controlled item carries a kind-1 curse at entry. The interception is required, not merely convenient |

**[决定] How it presents:** the same interaction, re-labelled. **Inside the room, on a
controlled item, the element carries the decorative lock's icon and text** instead of the
base game's; outside the room it behaves as it always did.

> **[既有] Two mechanical conditions the decorative lock must satisfy**, both from base-game
> code rather than taste:
>
> 1. **The restraint must be *lockable*** — `KinkyDungeonIsLockable`
>    (`restraint/KinkyDungeonRestraints.ts:697-700`) requires the template to declare
>    `escapeChance.Pick` or `escapeChance.Unlock`. **A controlled item that declares neither
>    cannot receive a decorative lock at all**, so route 2's condition must be reachable for
>    every piece in the set.
> 2. **It must not defeat removal.** The decorative lock exists to be applied and lifted
>    freely; if it gated escape, route 1 would become unreachable for a bookkeeping reason.

**[决定] Both routes are entered from the free phase and committed by an interaction:**

| | **Route 1 — leave** | **Route 2 — descend** |
| --- | --- | --- |
| **entry condition** | **no controlled equipment on the body and none carried.** Equipment the controller does not register — base-game items, anything outside Boids — **does not count**, in either direction | **identical to §8.4's unlock conditions, with one substitution:** *"every controlled item is permanently locked with a kind-1 curse"* becomes *"every controlled item carries a decorative lock"* |
| **point of commit** | interacting with the **door** | interacting with the **`furniture`** |
| **effect** | teleport to the world map **at the stairs** | **one atomic replacement:** every decorative lock on every worn item, and the `furniture`'s own restraint, become **kind-2 curses** |
| **consequence** | **the progression is cleared and every controlled item is destroyed** | **the character is filed** (§8.4) |

**[决定] The clearance is the deletion of the Host's dossier.** The Coordinator's state is
not stored on the equipment (§8.2); it is one file the Host keeps *about* the character.
Clearing the progression is therefore **deleting that file** — not unwinding a set of
descriptor fields. The character keeps her body and her knowledge.

**[决定] Leaving destroys the items, so no kind-1 curse survives into the world**, and there
is no route out of the room carrying a permanent curse.

**[决定] Even if the room persists technically, it resets on exit.** *Not returnable* is the
promise; the reset is the fallback that keeps a persistent room from contradicting it.

**[既有] The player may open the box and take equipment back out.** The box holds the
discarded gear, and everything before the commits is reversible, so it is a container rather
than a one-way disposal. **The entry condition is evaluated from the controller's
authoritative set** — the body and the registry — **not by enumerating containers**, so it
cannot be defeated by stashing gear where the check does not look.

**[决定] A second attempt starts from nothing.** The items are real game objects and the room
resets, so the discard destroys them; **a different equipment combination is available on
re-entry.**

**[提议] Some quests become skippable on re-entry, by one criterion:** *a quest may be
skipped when what it produces is **knowledge** or a **key** — something the Host remembers —
while a quest that produces a **physical** thing must be redone.* This is a rule rather than
a list, because it must apply to quests that do not exist yet (§8.3).

**[决定] And what makes that possible is that the Coordinator's state has two parts, of which
route 1 clears only one** (§5, §7.1):

| Part | Holds | Route 1 |
| --- | --- | --- |
| **the dossier** — the equipment configuration | which dimensions the Host demands what of, for this attempt | **cleared** |
| **quest metadata** | what the allocator needs to place and re-place quests: **knowledge and keys** — blueprints, obtained keys, a quest's completion | **kept** |

**So the skip criterion is not a special case bolted onto the allocator**: the allocator
already has the memory that says "this one has been done", and the equipment side is what
gets wiped. §8.3 uses this; **a second attempt is faster because the Host never forgot.**

> **[待定] One item this section does not settle:** the **calibration** of the Controller's
> ceiling for step 4. The mechanism is decided — the base game's own struggle system, driven
> by the Controller's maximum — so there is no formula to design; what is unsettled is **how
> hard the peak should be**. That is tuning, and it is done against the finished room.

### 6.11 Arousal — the one movable declarative field

**[决定]** `blocks arousal` is the **one** declarative restraint field that must be
adjustable at runtime, because the dynamic switch is what makes the narrative and gameplay
possible.

**[既有]** Two mechanisms exist, and the movable one is **not** the one named `chastity`:

| Mechanism | Dynamic? |
| --- | --- |
| the `chastity` / `chastitybra` **flags**, read inline by the chastity helpers | **no** — no event seam |
| the **`ChastityLower` / `ChastityUpper` player tags** | **yes** |

**[既有]** The tag route works because the game sets those tags from the flags and *then*
dispatches `updatePlayerTags` — which Boids already hooks, so a Boids handler runs
afterwards and can set them too. The tags are consumed by pure tag lookups with no seam to
block.

**[提议] The gate is expressed as "the Host may deny access", not "the Host may grant it"**
— that is the direction the existing seam supports cheaply. **[既有]** The grant direction
is not impossible (a handler receives the tag map and could write into it), but it needs the
tag the game already set to be *withdrawn*, which is a different and less certain route.
**[待定]** Which of the two directions ships is not settled.

> **[既有] Two limits, not glossed:** the tag route is an **add** (withdrawing a tag the
> game set needs a different route), and the chastity *helpers* are not movable at all.

### 6.12 The restraint contract

**[决定] A restraint participates in the control model by meeting five clauses.** They are
stated as one contract because a piece that meets four of them fails in ways that look like
unrelated bugs. **[既有] Part of the contract is already implemented** in
`src/Boids/MachinePrime/Coordinator/`; each clause names its status.

**1. Membership — the `shrine` tag is the marker.**
**[既有]** A controlled item is one whose restraint template carries a defined Boids tag in
its `shrine` list. The base game **misuses `shrine` as a generic tag list** — it is consulted
for shrine interactions, but Boids already uses it as a category tag in many places
(`Futuristic/Cuff/Item.ts`, `Futuristic/Headphone.ts:99`, `MachinePrime/Item/Gag.ts:160`).
**[决定]** This is the membership test that §6.10's entry conditions and §6.9's kind-1 curse
both need: *"controlled"* means *"carries the tag"*, and nothing else.

**2. Registration — the coordinator learns the item exists through the game's event routing.**
**[既有]** Implemented as two event builders in `Coordinator/Public/Event.ts`: an item spreads
`RegisterItemOnApply` into its own `events` list, whose handler fires on **`postApply`** and
adds the item's name to `RegisteredItems`; `UnRegisterItemOnRemoval` mirrors it on
**`postRemoval`**. **One handler per archetype, stamped per variant** — not one per item.

> **[既有] The bubbling problem is real, already encountered, and already worked around.**
> `HandleItemEventWhenItemIsSource` (`KDExtension/Event.ts:34-43`) accepts the item
> **only if it is the event's source** (`item.id === data.item.id`), and otherwise **follows
> `dynamicLink` recursively**. That guard exists because the game spreads an item's events
> onto linked items, so a naive handler mistakes a linked restraint for the one being applied.
> **[待定] Whether this is the right seam is not settled** — the designer's instruction is to
> characterise the game's event bubbling before deciding, rather than to assume. The existing
> implementation is the evidence to judge it by, not the conclusion.

**3. Instantiation — the item must be a stateful object, not a template.**
**[决定]** A restraint definition is one stateless model per name (§6.8), so anything the
control model or a curse must remember **has to live on a per-instance game object**: the
worn item, identified by `item.id`, carrying its own `inventoryVariant`, `item.curse`,
`item.lock` and progress counters. **[既有]** The base game already supports this and Boids
already relies on it (`KDGetCurse` reads `item.curse`; `KinkyDungeonLock` writes `item.lock`;
`KinkyDungeonRestraintVariants[...]` holds the variant's own copy). **A design that stores
state on the template stores it for every character at once.**

**4. No record — the equipment group is never entered into the controller's state.**
**[决定]** Only the **current group's capability is computed, at execution time, from what is
worn** (§6.5). Nothing about the equipment is persisted in the dossier, so the answer cannot
go stale and no invalidation is needed. **This is what makes the per-facet Free state fall out
for free** (§6.10): the last provider leaves, the dimension re-bids to `Free`.

**5. Control — the equipment is driven through event callbacks.**
**[决定]** The item does not call the controller. It receives the controller's effect through
the seam families Appendix A enumerates — the `calc*` events, the `forceResult` guards, the
action chokepoint, the declarative fields. **The controller is a subscriber, never a callee**,
which is what keeps the item's own definitions free of control logic.

> **[决定] The consequence, stated once:** clauses 1 and 3 are what a curse can attach to;
> clause 4 is what makes reversibility free; clause 5 is what makes the same restraint work
> whether or not the Host is interested in it.

## 7. Control, submission, and the Host's record

> The **Host** is defined in §9. This section concerns only what is recorded about it.

### 7.1 Two records, deliberately separate

| Record | Models | Lives in |
| --- | --- | --- |
| **Training** | tolerance built up by practice | the game's own `KDGameData.Training` |
| **The Host's file** | how far the Host has overridden the character, and what it has issued | `Coordinator` |

**[既有]** The base game's training record already exists and already models voluntary
compliance under progressive restraint, with a persisted ledger, a progress display and a
bonus at the end. Refusal is part of its design. **[决定]** Boids reuses it rather than
building a parallel ledger.

**[决定]** The two are **not merged**: a character can be deeply trained and barely
overridden, or freshly overridden and untrained.

**[决定] Only the file is what route 1 clears** (§6.10). Leaving the final room deletes the
Host's dossier — the record of how far it had overridden the character. **[既有]** The
**Training** record is the base game's own per-character record, the character leaves with
her body, and the brief's reading is that **it survives.** This falls out of the two-record
split rather than being a separate rule: training is about the character's body and is built
by practice, the file is the Host's administrative relation to her. **Leaving costs the
character her acknowledgement, not her tolerance.**

**[决定] And route 1 clears the dossier only — the Coordinator's other part is quest
metadata, which survives** (§5, §8.3). The three splits line up: **the dossier is the Host's
relation to this attempt**, quest metadata is **what the Host knows**, and Training is **what
the character's body has learned**. Route 1 ends the first and leaves the other two.

### 7.2 The submission economy

**[提议] The submission economy.** Obedience should buy something **visible and specific**;
disobedience should be flavour and narrative, not a numbers tax. The reasoning: if obedience
only ever costs, players route around the content and it is never seen. **[待定]** This is
stated as a design aim, not yet as a mechanism — what obedience buys is undecided (§8.1,
§8.2).

### 7.3 Presentation

**[提议] Control degree is not one bar**, because it is not one number. Each dimension
presents as its own call, and **which presentation each dimension gets is undecided**.

**[待定] For the aggregate**, the candidate is a **`Compliance`** stat: it provides
resistance **equal to or greater than** the will stat's, it **shrinks the will ceiling as it
rises**, and it is drawn as an **inverted will bar, right-to-left**. It is deferred with the
rest of the resource work — its mechanism belongs to the control model and the quest line,
and its presentation is art.

## 8. Equipment, abilities, and progression

### 8.1 Equipment-granted capability

**[决定]** The design, exactly:

1. The player performs a **ritual** and **permanently gives up a native ability**, in
   exchange for points.
2. The points buy **the equipment-mediated version** of that ability.
3. The mediated version **may be stronger** than the native one, and **may spend a
   different resource** — not the game's mana or stamina, but a Boids currency.
4. It works **only while the corresponding equipment is worn.**
5. Without the equipment, the ability is **gone**.

**[决定] The mechanism, as a policy:**

> **The native ability is denied at the action chokepoint. The mediated version is granted
> at whatever seam the ability actually has.**

- **Denying is uniform and cheap**: wrap the input registry and refuse the relevant commands.
- **Granting is per-ability**, because that is what the base game allows.

**[决定] The surrender is not recorded anywhere, and needs no record.** What "permanently
gives up a native ability" means in the mechanism is: **the equipment is sealed by a kind-1
curse, and while it is sealed the ability is denied** (§6.9, §6.12). The seal *is* the
surrender. So there is no surrendered-ability set, no flag, and nothing for a migration to
carry — **and when the seal is lifted in the final room, the denial has nothing keeping it in
place.**

**[既有] And the ability itself was never destroyed.** Denial is a refusal at the chokepoint,
not a deletion — the baseline is the `Free` value (§6.5) and was never written to. **[决定] So
after route 1 the character has her abilities, and what she has lost is the Host's
acknowledgement** (§6.10, §7.1). **The ritual is a thing the player may do again**, which is
why the repeat-entry skip criterion treats it as a key rather than as a purchase.

### 8.2 The evolution ladder

**[决定]** Equipment is acquired **loose and unlocked** and ends **high-restraint and
permanently sealed**. The stages:

1. **craft a lock and fit it**
2. **craft reinforcing parts and upgrade them**
3. **make the lock permanent**

Each stage is a quest line requiring resources and travel. **[决定] The requirement on
their design is that they stay short and legible**: the tedium budget is spent on ceremony,
not on errands. The player hands their own character over by hand, and the quest chain is
what makes that a series of deliberate acts rather than a single one.

**[决定] The two upgrade axes are bound differently:**

| Axis | Bound to |
| --- | --- |
| **restraint strength** (suppression) | **bound** to the ability/**substitution** upgrade — they advance together |
| **the lock** | **not bound** — it advances on its own track |

**[决定]** Because capability is decoupled from the restraints that carry it, progression
conditions are evaluated **at the controller layer**, not by inspecting items.

**[决定] The ladder is one-way, and its inverse exists exactly once.** The stages above may
only be advanced, and the only place the progression can be undone is the final act
(§6.10): there, and only there, the equipment's **kind-1 curses** become liftable and the
player may take the whole set back off.

**[决定] Advancement makes leaving harder; it never makes leaving impossible.** Escape cost,
effort and time may rise without bound. **A refusal may not.** The only exception is the two
commits of §6.10, which are irreversible by definition.

**[决定] The stage-3 "permanence" is a kind-1 curse** (§6.9): its `condition` is
unsatisfiable anywhere except the final room, so it is a real seal everywhere in the world
and still removable in the one place where the choice is made.

**[决定] Projection is a feedback form of servitude progress**: past a threshold, equipment
projects additional, non-interactive parts. It is **retroactive** — an item already worn
begins to project.

### 8.3 The quest framework

**[决定]** Build a free, extensible framework before writing quests:

1. **Upgrades are classified by function**, each class holding **several mini quests**,
   recorded as a **table**.
2. **A quest coordinator** assigns from that table by matching the equipment's tags, and is
   **randomised within the eligible set**, so the same upgrade does not produce the same
   errand twice.
3. **The quest coordinator is built with the controller/coordinator, not beside it** — they
   read the same state.

**[既有]** The game has a complete quest system: a global registry, a lifecycle, per-quest
data storage, and a generic drawing routine. **No engine change is needed** to add a quest.

**[提议] Repeat-entry skip criterion.** Because route 1 of the final act destroys the
equipment and deletes the dossier (§6.10), a later entry redoes the chain. To reduce
repetition, a single criterion decides what may be skipped rather than a list of exceptions:

> **A quest may be skipped on a later entry when what it produces is *knowledge* or a *key*
> — something the Host remembers. A quest that produces a *physical* thing must be redone.**

So upgrade materials must be gathered again, while blueprints and key-acquisition quests
need not be repeated. It is stated as a rule because it must apply to quests that do not
exist yet.

**[决定] The equipment ladder, the ability ritual, and `Being Filed` are one progression,
viewed from three sides**, and must be designed as one chain rather than three that happen
to interlock:

| View | Section |
| --- | --- |
| from the **item's** side: it grows stricter and ends sealed | §8.2 |
| from the **character's** side: it gives up an ability and buys the mediated version | §8.1 |
| from the **Host's** side: the character is eventually filed | §8.4 |

They share a single set of triggers: **the point at which the character can no longer go
back** is the same moment in all three, and the three must not each invent their own test
for it.

### 8.4 `Being Filed`

**[决定] `Being Filed` is a *family* of final quests**, not one scripted sequence. The
content varies; the **entry condition** and the **two possible endings** are fixed.

**Entry conditions — all must hold:**

1. **Capability coverage:** the required capability set must be a **subset** of what the
   worn equipment group offers — the equipment must **cover** the requirement, not merely
   intersect it.
2. **Suppression thresholds:** for every suppression dimension, the equipment group's value
   must be **at least** the prescribed threshold.
3. **The equipment is finished:** every controlled item worn has been upgraded to its
   strongest form **and locked with a kind-1 curse** (§6.9).

**[决定]** Because capability is decoupled from the restraints that carry it, these conditions
are evaluated **at the controller layer**, not by inspecting items. **[既有]** The design
already treats the equipment group as authoritative regardless of whether the pieces are
worn at any given moment, so *"the equipment is finished"* asks the controller what it
believes about the character rather than what an item's fields happen to say.

**The sequence, fixed** — the first three steps are shared; step 4 forks (§6.10):

1. a staging performance modelled on the game's own escort-to-prison sequence (**a leash
   staging**), with **no entrance to the room on the world map**;
2. transport to a **small warehouse-shaped map**;
3. ritual beats — the character breaks free of the equipment's **kind-1 curses piece by
   piece**, then the **free phase**;
4. **the fork:**
   - **route 1** — interact with the **door**: the progression is cleared, every controlled
     item is destroyed, and the character is teleported to the world map **at the stairs**;
   - **route 2** — interact with the **`furniture`**: in **one atomic replacement**, every
     decorative lock on every worn item and the `furniture`'s own restraint become **kind-2
     curses**, and the character is **sealed into the `furniture`**.

**[决定]** At the end of route 2 the file is complete and the character is **effectively
dead**: barring future content, there is no effective action left. The player's only move is
to save and start a new character. **[决定] This is a *fixed state*, not a stopped game** —
the character's time neither stops nor rewinds; the player merely stops observing her, and
however long passes before the next observation she is unchanged. **[既有]** The game's save
on exit and the illegitimacy of manual saving make that literally true: a save taken in the
filed state loads back into the same permanent cage.

**[决定]** Because "no effective action" is not "no possible action", **two global sync
hooks** run a **character export** when the character is in the filed state: **once on save,
once on load.** The export is taken when the state is unambiguous rather than reconstructed
later from a save that may have had no-op writes applied. **[决定] On route 1, the
clearance fires before the teleport**, so the saved state is never mid-transition.

**[决定] A second attempt is possible.** Route 1's destruction of the items and deletion of
the dossier mean a later entry starts from nothing, with a different equipment combination
available. **[提议]** Some quests are then skippable: a quest may be skipped when what it
produces is **knowledge** or a **key**, while one that produces a **physical** thing must be
redone (§6.10, §8.3).

### 8.5 The archive

**[决定]** The filed artifact persists in **`localStorage`** — the layer the base game uses
for cross-character unlocks, invisible to a new-game reset. A new character can read it.

## 9. The Host

**[决定] Definition:** a **distributed super-consciousness that runs above the
consciousness of all machinery and all dolls.** It has no centre.

**[决定] The defining property is a network boundary:**

| Observer | Can perceive the Host? | How |
| --- | --- | --- |
| **inside the network** — dolls, machinery | **yes** | "spiritual sensing" |
| **outside the network** | **no, never directly** | only by observing network members' behaviour and inferring an agent |

**[决定] It is not a deity, and the distinction is load-bearing.** The spiritual sensing is
simply what perceiving a distributed structure feels like from inside it. A god would be
placed *above* the network rather than *in* it, and would become directly addressable —
which the boundary forbids.

### 9.1 Voice — it never speaks

**[决定] The Host never speaks.** It is characterised **entirely through how third parties
react to it**. A character's direct perception of it is **non-verbal UI feedback only**,
never a message. Everything else arrives **retold by a third party** — a briefing comes
from another doll conveying intent, never from the Host to the character.

### 9.2 Appellations

**[决定] Inside the network the Host is spoken *as*, not referred to.** There is no
otherness between the Host and a doll, so the honest form is the **first-person plural,
"we"** — and naming it would be a category error, not a stylistic choice.

**[决定] Minimise direct appellations; prefer passive and third-party constructions.** The
fewer direct references a text contains, the more distance it has. A briefing says *"you
have been assigned"*, not *"⟨X⟩ assigns you"*.

**[决定] Two constants survive, and both belong to parties outside the network** — the only
place a name can honestly live, because only an outsider needs to name what it cannot see:
| Constant | Who | Value |
| --- | --- | --- |
| `HostName_FactionHostile` | hostile factions | **[待定]** — no word chosen |
| `HostName_FactionTechnical` | factions that study or trade with it | **[待定]** — no word chosen |

**[待定]** No appellation word has been chosen, and none is invented here. The constants
exist so that the words can be settled by editing one place each. The second constant is
optional: if the two registers duplicate in practice, they collapse to one.

**[决定]** Inside-network contexts — dolls to each other, a doll addressing an outsider, the
filing ceremony, HUD text — **take "we" and have no constant**.

> **[既有] Localisation.** "We" as a collective self-reference is not the same word in
> every language, and the game ships translations. Strings must make the collective reading
> explicit rather than relying on English's ambiguity.

## 10. Non-goals and deferred work

**[决定]** Explicitly out of scope for the first delivery, and recorded so they are not
rediscovered:

| Deferred | Why |
| --- | --- |
| **behavior-tree / neural-net template recording** | a research project wearing a game feature's clothes; a hand-authored template plus §8.1 delivers the fantasy |
| **PC-as-NPC override via the enemy AI** | the base game's AI loop decides *and* executes, with a module-level singleton; there is no player AI to reuse. The honest cheap version is the existing non-verbal suggestion UI |
| **Stats Control** | resource arithmetic; designing it before the resource system means designing it twice |
| **the resource-system expansion and the pleasure split** | its own project, comparable in size to the control system |
| **new sub-factions** | the mechanism layer ships first |
| **a weapon-side lock** | a genuine gap; the right shape is an optional base-game patch (§3.3) |
| **consolidating the three morphing routes** into one projection layer | a standing invitation to do better, not a dependency of the current work (§6.8). The one hard rule is that new code may not add a fourth route |
| **the `Compliance` aggregate's presentation** | the mechanism belongs to the control model; the presentation is art |
| **the `Being Filed` reward for obedience** | what a filed character leaves behind is undecided, along with the currency |

> **[决定] One deliberate non-migration, stated so it is not mistaken for an omission.** The
> Coordinator's old three-slot state shape is **not** migrated. No released build ever wrote
> it, so a migration would be written for a format nobody has. **From the first release
> onward, every shape change goes through the chain** (§4.4).

## 11. Invariants

Rules a change must not break. **Enforcement is named where it exists**; the rest are
maintained by review.

| # | Invariant | Enforced by |
| --- | --- | --- |
| 1 | **A variant key's field names and order are a persisted format.** Moving one is a migration, never a cleanup. | a property test over the key's field-order sensitivity |
| 2 | **A handler GUID is globally unique** across the game and every other mod. | a load-time throw on a duplicate registration |
| 3 | **Registration is a one-shot side effect** at module evaluation; deferring it changes when the game can dispatch. | review |
| 4 | **No variant-key field may be added for a dimension.** A dimension is not an identity. | review |
| 5 | **`CapabilityKey` is closed**; ungrantable abilities must not appear in it. | the type system (a closed union) |
| 6 | **`OverrideAllowed` requires equipment capability.** The write is refused otherwise. | the write validator (§6.6) |
| 7 | **A layer sorting group is a load-time decision**, not a per-item one. | review; the game reports missing layer groups |
| 8 | **New code may not add a fourth morphing route.** Where one *is* added, it mints derived ids rather than random ones. | review, and the GUID-uniqueness test |
| 9 | **The two curse *kinds* must not share a `condition`.** The equipment-permanence curse and the commit curse must be distinguishable by the game, or their flavour text has nowhere to attach (§6.9). | review |
| 10 | **The save stores paths and semantics**, never types or live gameplay state. | the round-trip property test |
| 11 | **Boids must run without any base-game patch**, degrading rather than breaking. | review; every patched path names its fallback |
| 12 | **Restraint and control state is derived from the character's single baseline.** Baseline values live in the Coordinator, **never on an item** — so the baseline is never lost when equipment is removed, replaced, or destroyed. | a separability round-trip test: equip, run, remove everything, and compare **every dimension in the descriptor registry** field for field (`target` / `equipment` / `config`) with the never-equipped state |
| 13 | **Advancement makes leaving harder, never impossible.** Only the two commits of §6.10 are irreversible; outside them, every step has a defined non-refusing route back (§6.10, §8.2). | review |
| 14 | **A kind-2 commit is one atomic replacement.** No reachable state leaves some worn items sealed and others unsealed. | review |
| 15 | **The dossier is cleared before the exit teleport** on route 1, so no save is taken mid-transition. | review |
| 16 | **Lifting a kind-1 curse leaves the equipment worn.** The curse clears and nothing is removed, so the removal is left to the struggle (invariant 13 guarantees it stays possible). | review of the curse's `remove` hook, plus a test that the post-lift item is still in the worn set |

## 12. What this spec does not decide

**Settled and merely unspecified:**

- **Which dimensions ship in the first delivery.** The mechanism is specified; the list is
  content.
- **The appellation words.** Two constants exist; no word is chosen.
- **Art**, including the presentation of control degree.

**Genuinely open, and marked `[待定]` where it appears:**

| Open question | Where | Why it is not settled |
| --- | --- | --- |
| the **router's three resolution rules** | §6.7 | proposed, and the designer wants implementation experience before deciding |
| the **arousal gate's direction** — deny only, or also grant | §6.11 | the deny direction is cheap; the grant direction needs a tag withdrawn rather than set |
| the **submission economy** — what obedience buys | §7.2 | a design aim rather than a mechanism |
| **`Compliance`**, for the control-degree aggregate | §7.3 | deferred with the resource work |
| whether a dimension's descriptor must record a **precedence** relative to the game's own writes | §6.2 | the observation is verified; the requirement is not decided |
| each dimension's **presentation** | §7.3 | per-dimension, and not yet chosen for any |
| the **currency** for mediated abilities | §8.1 | belongs to the resource-system project |
| whether the **morphing routes are consolidated** | §6.8, §10 | a standing invitation; the only hard rule is that no fourth route is added |
| the **version table's home** was reported inconsistently in the source discussion | §4.3 | this spec follows the designer's later instruction; the source should be corrected |
| the **calibration of the final act's peak** — how hard the struggle of §6.10 step 4 should be | §6.10 | the mechanism is decided (the game's own struggle system at the Controller's ceiling). What is open is the tuning, which is done against the finished room (dev-plan Phase 8) |
