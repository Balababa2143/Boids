# Boids — Specification

**Status:** **FROZEN — 2026-10-16.** Normative. This is what `Boids` is. Where this document
and the code disagree, one of them is a bug.

**How a change happens now.** The design is closed, so **this document is not edited to
record an idea.** The route is:

1. **an issue** states the proposed change and its reasoning;
2. the issue is **decided**;
3. the decision lands **here**, and if it is breaking for saves it also needs a slot in the
   **version table** (§4.3) and a step in the **migration chain** (§4.4);
4. the work is scheduled in `design/dev-plan.md`;
5. `design/design-brief.md` gains a dated row in **its Appendix E** naming the issue and the
   change — the brief's reasoning is never rewritten.

> **A step that is implemented but not promoted is still a `[Proposed]`.** Building one never
> settles it: promotion is an edit here, and the markers in §§6–8 are the record of what has
> and has not been promoted.

**Scope:** the specification for `MachinePrime` and the shared infrastructure beneath it.
Other factions are out of scope (see §10).

**Companion documents:**

| Document | Role |
| --- | --- |
| `design/dev-plan.md` | the ordered work programme that implements this spec — **frozen 2026-10-16**, and moved by tracking thereafter |
| `design/design-brief.md` | the design discussion, its evidence, and its open questions — **non-normative and frozen 2026-10-16**; its Appendix E is the change log for this spec |
| `design/codex.md` | the **content and fiction bible** — setting, voice, visuals, script beats and terminology. **Not frozen**; it is for people authoring, and it never overrides this document |
| `README.md`, `AGENTS.md` | the front door, and the operating rules: conventions, commands, build and invariants |

**Conventions used here:**

- **[Existing]** — verified against the base game or this repository, with a citation.
- **[Decided]** — a design decision. Not open for silent revision.
- **[Proposed]** — proposed, not decided. **Building one does not promote it** (§6.7).
- **[TBD]** — deliberately open. Marked where it appears, and listed in §12.
- **[To Be Verified]** — known to be unknown; nothing may be built on it yet.
- **[Goal Post]** — recorded, deliberately out of scope for this delivery.

### Glossary

| Term | Means |
| --- | --- |
| **Host** | the distributed super-consciousness Boids' fiction is about (§9) |
| **seam** | a point the base game lets a handler intervene at: a `calc*` event, an override guard, the action chokepoint, or a declarative field |
| **injection layer** | the part of the Coordinator that applies a constraint to the game. "Inject nothing" means it contributes no effect |
| **subsystem** | one of the three mechanism groups: Sensory, Stats, Behavior (§6.3) |
| **group** | one of the three kinds of demand: Constraint, Substitution, Buff (§5) |
| **dimension** | one separately-constrained value, identified by a `DimensionId` |
| **facet** | a reusable semantic component a dimension composes: `Rate`, `Posture`, `Gate`, `Whitelist` (§6.1) |
| **descriptor** | the code-side record describing a dimension (§6.2) |
| **router** | the layer that resolves which equipment provider wins a dimension (§6.7) |
| **projection layer** | the mechanism by which equipment grows and displays extra parts (§6.7, §8.2). **Not** the engine value map below: only the first of the two is a layer, and they are otherwise unrelated |
| **engine value** | what a dimension's resolved 0..1 becomes **in the engine's own units**, through the map its descriptor declares (§6.2, §6.7). Blindness is an integer ladder capped at 7, a hearing radius a hyperbola that never reaches zero, a slow level an integer whose `>9` is immobility |
| **body-state predicate** | a question the base game asks about the body **as a whole** — `getArmsBound`, `getHandsBound` — answered by a **union of the refusals** among the dimensions that feed it (§6.7). A compatibility shim, not a dimension: there is no dimension that means *"her arms are bound"* |
| **variant key** | the object whose fields and field order determine a generated restraint name (§4.5) |
| **archetype / limiter** | the pre-existing name for what this spec generalises into a dimension |
| **suppression** | a `Rate` facet: how strictly a value is squeezed |
| **servitude progress** | the record of how far the Host has overridden a character (§7.1) |
| **controlled item** | a restraint whose template carries the Boids `shrine` tag (§6.12). The membership test (§6.10) |
| **baseline / Free value** | what a dimension is set to when nothing is imposed: every facet parameter at rest — `Rate.Target = 0`, `Gate.Intent = Free` (§6.5). **An absence of effect, not a stored reading.** `Posture` is the one exception: its `Free` is the **whole ladder**, because an unconstrained body may take any of its poses |
| **intent** | the Host's demand for one dimension: a record whose parameters are **exactly its facets'** (§6.1, §6.5). A composition, not a value |
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
| `Intent` | **composed** | the Host's demand for one dimension: a **merge of the parameter interfaces its facets contribute**, each optional (§6.5). Not a closed set — a dimension's intent is exactly its facets' parameters |
| `GateIntent` | **closed** | the `Gate` facet's three values in §6.4: `Free`, `OverrideForbidden`, `OverrideAllowed`. **A facet's vocabulary, not the type of an intent** (§6.5) |
| `CapabilityKey` | **closed** | the set of abilities equipment may substitute for — the vocabulary of **one** grant channel, `Whitelist` (§6.4). **Membership rule:** a key exists only if the ability has a usable seam; speech, `immobile`-based movement and noise are excluded (§3.2) — the first two have no seam at all, and noise's fires after the decision has been made |
| `PoseKey` | **closed** | the `Posture` facet's vocabulary (§6.13), holding the game's own pose names. Enumerable at run time like `GateIntent`, because a console has to list it and a save has to carry it |
| `StackMode` | **closed** | how a bid stacks: `Max` or `Sum` (§6.7) |
| `BodyStateName` | **closed** | a body-state predicate a dimension may feed: `ArmsBound`, `HandsBound` (§6.7) |
| `Config` | open | per-dimension semantic extra fields, persisted (§6.5). Never live gameplay state |
| `StruggleType` | existing | the base game's own struggle-type identifiers |

---

## 1. What Boids is

A content mod for **Kinky Dungeon**, a browser roguelike. Its subject is **dronification**
and its sub-themes, packaged as a texture/asset set plus a single webpack bundle that the
game evaluates at load time. It registers models, restraints, text keys and event handlers
into the game's globals as a side effect of being imported; the only thing it owns is the
`globalThis.Boids` namespace (`docs/guide/architecture.md`).

**Design priorities, in order:** the kink first, then the gameplay. **[Decided]** Equipment
serves the kink *and* carries real mechanics; neither is decoration for the other.

## 2. Structure: three layers

**[Decided]** Boids is organised in three layers, and they are distinct concerns:

| Layer | Concern | Code |
| --- | --- | --- |
| **Outfit** | art and restraint definitions | `Futuristic` |
| **Mechanism** | what is constrained, how much, and how the constraint reaches the game | `MachinePrime.Coordinator` |
| **Sub-faction** | story, flavour, progression, privileges and their costs | not built |

**[Decided]** Sub-factions share the outfit layer *and* the mechanism layer in full. **[Proposed]**
The consequence — that a new sub-faction is story plus configuration rather than a new art
pass — is the reasoning behind that decision, not a separate decision.

## 3. The base game: what we rely on

**[Existing]** The base-game source is present and readable at
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

**[Existing] Two abilities have no event seam at all.** Speech and `immobile`-based movement:
the game reads the relevant restraint fields inline, with no interception point.

**[Existing] A third, noise, is a different failure mode**: it *has* a seam, but the seam fires
after the decision has already been made, so it cannot change the outcome.

**[Decided]** In both cases the abilities are ungrantable, and therefore:

- they can **never** appear in a `CapabilityKey` set (§6.4);
- the only way to gate them is the action chokepoint;
- they are **not** candidates for a mediated (equipment-granted) version.

> The distinction matters for anyone tempted to try: a seam that exists is more inviting
> than one that does not, and the noise seam in particular looks usable until the ordering
> is checked.

**[Existing] Separately, five values are outside the control model**, for reasons unrelated to
seams:

| Value | Excluded because |
| --- | --- |
| `calcDisplayDamage` | UI only; never affects gameplay |
| `calcBindCrit` | training-related; not a control surface |
| `calcEscapePenalty` | belongs to the **training** record (§7.1) |
| `calcGagRed` | ditto |
| `calcCorsetSPRed` | ditto |

### 3.3 Base-game changes are optional patches, never a dependency
**[Decided]** Boids may benefit from base-game changes, but those ship as a **separate
patching mod** that Boids consumes as an **optional plugin**. Boids must run without it,
and must degrade rather than break when it is absent. Every patched path needs a working
non-patched path.

**[Existing]** The upstream route is open and has precedent: the game ships its source to
modders under the Kinky Contributor License, and `.github/CONTRIBUTING.md` documents a
fork-and-PR workflow.

## 4. Identifiers and versioning

### 4.1 Construction

**[Decided]** Every identifier is derived deterministically:

```ts
uuidv5(`Boids.MachinePrime.Item.Foo${JSON.stringify(variantKey)}`, MOD_ROOT_UUID)
//      └─ the namespaced name is the VALUE ─┘        └─ the root is the NAMESPACE ─┘
```

- The **namespaced name is the value** (the first argument). The variant-key suffix is
  optional.
- `MOD_ROOT_UUID` is the **namespace** (the second argument) and the **version carrier** —
  it is the only place version information lives. No separate version field is serialised.

> **[Existing] Implementation trap, and the argument order is the trap.** `uuid`'s signature is
> `v5(value, namespace)`. The namespace argument must **parse as a UUID**:
> `node_modules/uuid/dist/v35.js:15` calls `parse()`, and `parse.js:3-6` does
> `throw TypeError('Invalid UUID')` for anything else. **So putting the namespaced string
> second throws.** The repository's existing calls have this order already
> (`src/KDExtension/Variant/Common.ts:40`). A well-meant "simplification" that swaps the two
> arguments is the single easiest way to break every identifier in the mod.

### 4.2 What the save stores

**[Decided]** The save stores the **path**, not the derived UUID: the namespaced name, the
variant key, and the `root_uuid` it was minted under. The id is **recomputed at load**.

Consequences, all of which are requirements:

1. Recomputation is a free integrity check — a mismatch means corruption or tampering.
2. The stored path is version-independent, so "what this item was" stays readable forever.
3. **Migrations only handle semantic change** (rename, split, merge); a pure version change
   recomputes by itself.

### 4.3 The version table

**[Decided]** The root → release mapping is a **table in code**, shipped with the mod. The save
records **only `root_uuid`**, which is what localises the release.

**[Existing]** The release key already exists: `Asset/mod.json`'s `modbuild`, stamped by the
build from `package.json`'s `version`.

**[Decided] The rejected alternatives**, recorded because each had a different failure mode:

| Placement | Rejected because |
| --- | --- |
| a `localStorage` table shared by every release | nothing to maintain in code, but it is player-mutable state that can be cleared, and a lost table makes every id unrecomputable |
| a table in code with **no** root in the save | simplest, but a save then cannot say which release wrote it, so the migration chain has no starting point |

The chosen pair — code-side table **plus** `root_uuid` in the save — keeps the table
authoritative and the save self-describing. Note that the save's `root_uuid` is an
**addition** to the path and variant key of §4.2, not a replacement for them.

> **[TBD] A contradiction in the source discussion, recorded rather than resolved.**
> `design/design-brief.md` states in one place that the version table's home is *a follow-up
> decision* and *"the one open piece"*, and in another that it is *resolved: in code*. The
> designer's later and more specific instruction is **in code, with only `root_uuid` in the
> save**, and that is what this section specifies. The brief should be corrected to match.

### 4.4 The migration chain

**[Decided]** One migration function per release, numbered, walked forward on load:

| Rule | Detail |
| --- | --- |
| **A slot exists for every version** | An **empty body is normal** — most versions change nothing, and the slot keeps chain indices fixed |
| **A breaking release refuses** | It fills its slot with a refusal rather than corrupting the save |
| **A refusal must not hang or crash** | The gate **returns cleanly with a message**; it must not throw |
| **A refusal is always shown** | Every refusal reaches the player, with the slot's own `reason` verbatim |
| **A refusal may offer the way out** | `ReturnToMenu` offers the game's own main menu; **either answer writes nothing** |

**[Existing]** The gate's timing constrains where it can live: `beforeLoadGame` fires
**before** the save string is decompressed, so a handler there cannot see the version. Two
viable doors: wrap `KinkyDungeonLoadGame` (precedent: Boids already wraps
`KinkyDungeonGenerateSaveData`), or read `localStorage` inside `beforeLoadGame` (earlier,
but blind to multi-slot saves).

**[Decided]** The version rides in the save as a key on `KDGameData`, which survives the
round-trip.

**[Decided]** A slot's *decision* and its *work* are split, because they happen at different
times. Whether a save may load, and whether any slot refuses it, is decided **in the gate**,
before the game has adopted anything. A slot that accepts does its editing **after** the
load, where the live `KDGameData` exists — so a semantic migration is written against the
game's own state rather than against a re-encoded copy of the save string.

**[Decided] Phase 0 (2026-10-16) — a refusal is a value with a reason and an optional way out.**
A slot's refusal carries its own `reason`, which reaches the player **verbatim**, and
`ReturnToMenu`, which decides whether the player is offered the game's own main menu alongside
staying where they are. `ReturnToMenu` is true only where staying cannot help — a save whose
shape this build cannot carry forward will not become loadable by trying again — and false for a
refusal about *this* save among others, where the player should be left in the load menu to
choose a different one.

**[Decided] Neither answer to a refusal writes anything.** The gate refuses **before** the game has
adopted the save, so the save on disk is byte for byte the save that was offered, and a release
that understands it can still read it. Returning to the menu is the same single state assignment
the game makes for its own back buttons (`base/KinkyDungeon.ts:3315`) and nothing more. That is
the property that makes refusing *graceful* rather than destructive: the player loses a load
attempt, not a character.

**[Decided] Phase 0 (2026-10-16) — a save with no recorded version may be loaded, on a warned
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

**[Existing]** The constraint that shapes the confirmation, and it is why this is two actions
rather than one: `KinkyDungeonLoadGame` returns a **synchronous boolean** and both call
sites carry their post-load work inline — `KDGenMapCallback`, the state transition and
`KDModsAfterGameStart` (`base/KinkyDungeon.ts:5743-5761`, `:6534-6549`). A prompt cannot
block that call and then repeat it without either re-entering the game's own load button or
losing the map-generation step. The gate therefore keeps the boolean contract, refuses the
first attempt, and on confirmation re-enters the game's own load button — the same idiom the
base game uses for its two-click confirmations (`:2884-2888`, `:5164-5169`).

**[Decided] The approval names the save it belongs to, and is discarded with the question.**
A flag would leak across a save list — confirming one character and then clicking another
would load the second — and an accumulating set would leave approvals behind every cancelled
decision. It is one pending question and one approval, and discarding the question discards
the approval.

### 4.5 Save-format surfaces

**[Decided]** Four things are persisted formats:

| Surface | Format rule |
| --- | --- |
| variant keys | field names **and order** are the format |
| coordinator state | `intent` / `config` keyed maps (§6.5) |
| the recorded `root_uuid` | `root_uuid` per character, which localises the release (§4.3) |
| handler GUIDs | globally unique across the game **and every other mod**; a duplicate **literal** is a build-time concern, and a **registered** duplicate throws at load |

**[Decided] Moving a variant-key field is a migration, never a cleanup.** The key is
*expensive* to move, not immovable — the migration chain (§4.4) exists precisely to carry
the rename. Nothing about the key is permanent; what is forbidden is moving it *without*
writing the migration.

**[Existing]** The GUID namespace is clean: every GUID literal in `src/` is distinct. That is
maintained by discipline rather than by a check — **[Decided] so uniqueness is enforced by a test over
every GUID literal under `src/`**, which enumerates them as well as checking them, so that a new
hand-written identifier is a reviewed change rather than an accident. The count is deliberately not
recorded here: it moves whenever a handler is added, and a number nobody updates is worse than no
number.

### 4.6 The text surface

**[Existing] The engine resolves text by looking a key up in one flat map, in one group.** `TextGet`,
`hasText` and `addTextKey` are hard-wired to the group the engine calls `default`
(`Scripts/Text.ts:439,449,678`), and no engine code reads any other group — so a mod that registers
its text elsewhere makes it invisible to the engine, item names and both tooltip lines included
(`KinkyDungeonInventory.ts:1297-1302`).

**[Decided] The boundary rule.** If the **engine** resolves the key, the key is composed by the engine
from an identity this mod already holds, and it is registered in the group the engine reads. If the
**mod** resolves the key, it is addressed by a path and registered in the mod's own group. A string
the engine merely *displays* from a value the mod resolved belongs to the mod's group: the engine
is handed a resolved value and never looks a key up, which is the whole of the dialog and
status-line wording.

| Kind | Group | Keys | Read by |
| --- | --- | --- | --- |
| **composed** | the engine's | `Restraint<n>`, `<n>Desc`, `<n>Desc2`; `m_<model>`, `m_<model>_l_<layer>`, `c_<category>`; `KDVarPref<p>`, `KDVarSuff<s>`; `KinkyDungeonStat<id>`, `KinkyDungeonStatDesc<id>`; `KDCategory<name>` | the engine, by composition |
| **path** | the mod's | the dotted path itself, e.g. `Common.Session.Refused.Body` | the mod, through its own read helper |

**[Decided] The slots are named by their suffixes, and the mapping is the engine's, not a reader's.**
`Desc` is the *flavour* line and `Desc2` the *function* line (`base/KDModUtils.ts:487-493`). So
writing function text to `Desc` puts it where the engine draws flavour, and writing flavour to a
`Flavor` suffix puts it nowhere: **a key the engine does not read may not be registered at all.**

**[Decided] Every slot is registered, including the ones nothing supplies.** An absent slot is written
as the empty string. A key that was never registered makes the engine draw the key itself, so the
absence of text is expressed as text.

**[Decided] Text resolves through a precedence list, first hit per slot winning:**

1. the active language's merged tree — the fullest path first, then each shorter prefix;
2. the English merged tree, the same walk;
3. the value the registration declares (the local layer);
4. the engine's own text for a declared source item, read when it is available and deferred when
   it is not;
5. the empty string.

**[Decided] Layers 1 and 2 are one cascade across two trees, not two cascades.** A translator's
general value may therefore override a more specific English one, which is the power they are being
given; the generated reference lists every path so it stays legible.

**[Decided] Trees merge widest-first, leaf by leaf, last writer winning.** A scope declares its rank
against one shared scale — common, faction, sub-faction, family — so a narrower scope's leaf wins
at the same path without any scope having to know another exists.

**[Decided] Text data lives in a JSON tree at the closest common root of the entities that use the
string, and the module that reads a tree imports it.** The second half is not stylistic: gathering
the data at the entry holds only while nothing else reaches the content tree first, and a bundler
may reach it by another path.

**[Decided] No key is written by hand.** A composed key comes from the single builder for its shape; a
mod key is a path. A test over the whole surface asserts that, together with the three slots being
present and no registered value being a placeholder.

**[Decided] Text is not a persisted format.** Nothing in this section is in a save, so a text key may
be renamed freely, and it is deliberately absent from §4.5's table.

## 5. The control model, in one picture

**[Decided]** The Coordinator is the mechanism layer (§2). It records what the **Host** (§9)
demands of a character and what the character's equipment can deliver, and a router turns
that into gameplay.

```
        Host's intent ─┐
                       ├─→ router ─→ seam(s) ─→ the game's own calculation
  equipment capability ┘
```

**[Decided] The model is split into three groups**, because they are different operations:

| Group | Operation | Intent | Capability |
| --- | --- | --- | --- |
| **Constraint** | squeeze a value | `number` 0..1 | `number` 0..1 — the ceiling |
| **Substitution** | **take an existing ability away and re-grant it through another carrier** — a prosthesis, a spell generator | the gate enum (§6.4) | a whitelist of `CapabilityKey`s, or a `Posture` set — **whichever grant channel the dimension actually has** (§6.4, §6.13) |
| **Buff** | **give something the character never had** | which buffs | which buffs, and their ceiling |

> **[Decided]** Substitution is a **transfer**; Buff is an **addition**. They are not merged.
> *(Note on naming: the group is **Substitution**, while the gate's two non-free values are
> **`OverrideForbidden`** and **`OverrideAllowed`**. The historical name for this group was
> "Override", which collided with those values and has been retired.)*

**[Decided] The Coordinator's state has two parts, and route 1 distinguishes them.** The
`Coordinator` is the mechanism layer (§2). It holds:

| Part | What it is | Cleared by route 1? |
| --- | --- | --- |
| **the dossier** | the character's control state — `intent` and `config` (§6.5) — i.e. what the Host demands of her on this attempt | **yes** (§6.10) |
| **quest metadata** | what the **quest allocator** reads to place quests: knowledge and keys (blueprints, obtained keys, completion records) (§8.3) | **no** |

**[Decided]** The split is not incidental: it is what makes the repeat-entry skip criterion
possible, and it is the same distinction §7.1 draws between the Host's *file* and the
character's *training*. **Deleting the dossier does not delete what the Host knows.**

**[Decided]** Boids ships restraint fields at **0 or a very loose baseline**, and the
Coordinator applies the real binding strength dynamically — the item does not begin strict,
it *becomes* strict. §8.2 states what this means for progression. It follows from restraint
definitions being read-only (§6.2, §6.8).

**[Decided] The wearer's adaptation is compensated, not rewarded.** A dimension the controller
drives is **not** rescaled by the base game's wearer-adaptation perks: `SmoothTalker` and
`Incantation` do not soften a gag, `SomaticPlus` and `SomaticMinus` do not soften bound hands,
`Butterfingers` does not fold one binding into another, and the `ClassicHeels` / `Flexible` /
`PoorForm` / `HeelWalker` / `PoorBalance` family does not move the lower body's tracks. The
fiction is the reason, and it is a claim about the **equipment** rather than about her: a
`MachinePrime` piece is smart enough to measure what she has grown used to and cancel it out
(`design/codex.md` §2.2). Mechanically it is the same statement the paragraph above makes —
**a setting is a setting**, and it does not drift because the thing it is set on got used to it.
**[TBD] How this is realised** is Phase 2's step 2.8. Whether the controller bypasses the perk
at its own seam or neutralises the perk outright is an implementation question, and the two are
**not** equivalent for a dimension the mod does not drive.

## 6. The control specification

### 6.1 Dimensions are composed, not classified

**[Decided]** A control dimension **composes facets** rather than belonging to one category,
because semantics genuinely overlap — *struggle* is both a permission and a difficulty.

```ts
interface Identity  { Id: DimensionId }
interface Rate      { Target: number; Ceiling: number }
interface Posture   { Allowed: ReadonlySet<PoseKey> }
interface Gate      { Intent: GateIntent }
interface Whitelist { Granted: ReadonlySet<CapabilityKey> }

type Sight     = Identity & Rate
type Speech    = Identity & Rate & Gate
type Struggle  = Identity & Gate & Rate & { Types: StruggleType[] }
type WeaponUse = Identity & Gate & Whitelist
type PoseArms  = Identity & Posture & Gate
type Noise     = Identity & Rate
```

> **[Decided] There is no separate `Capability: boolean`.** Whether the equipment can offer a
> substitute for a dimension is exactly *whether the dimension's grant channel is non-empty* —
> `Whitelist`'s `Granted` for an ability, `Posture`'s `Allowed` for a posture — so a boolean
> would be a second source of truth for the same fact. `Rate`'s `Ceiling` is the analogous
> field for the Constraint group. `Whitelist`'s `Granted` is the equipment's promise: a bid
> carries it, a resolution reports it, and the Host's intent never does.

The types above are **worked examples**, one per facet combination the design needs so far.
`Sight` is the dimension the game calls blindness; `Speech`, `Struggle`, `WeaponUse`,
`PoseArms` and `Noise` are likewise dimensions, not base-game concepts.

> **[Decided] `Posture` exists because a body configuration is a *set*, not a number.** The arms
> can be free, in front, crossed, wrist-tied, box-tied, yoked or raised, and the legs spread,
> closed, kneeling, kneeling-closed or hogtied; the base game already treats each as a named
> pose with a permitted set (`Data/Poses.ts:1, :16`). So the facet carries `Allowed`, and
> **its `Free` value is the whole ladder rather than the empty set** — the one facet whose
> baseline is not "nothing". §6.7 states how a set resolves; §6.13 states the route.

> **[Decided] Appearance is a function of the intent, parameterised by the item — not a facet,
> and not a demand.** The base game's `gag` property is one number that drives the mechanics
> **and** selects the model, so a larger ball there is necessarily a stricter one and the two
> can never disagree. They should be able to: *a small ball on a strict mechanism* and *a
> large one that only blocks the words* are both coherent equipment. An earlier reading of
> this section answered that with a `Form` facet carrying a Host-chosen `Size`; **that was
> wrong and is now retracted.** So was the reading that the look belongs to the item alone:
> §6.12 clause 4 says capability is read from what is worn and never demanded, but appearance
> is not capability: an instance derives **its own cosmetics from the intent**. The rule is
> therefore that an item declares the **mapping** from the resolved intent to the models it can
> draw, and the mapping is the item's. The Host has **no cosmetic parameter to write**: the
> intent is the lever, and the item's mapping is what turns it into a look. The expressibility
> `Form` was created for survives: a small ball on a strict
> mechanism is one item variant whose mapping chooses the small model at a high intent while
> its bid is high, and its sibling maps the opposite.

**[Decided]** Facets live in the **type system** and in a **code-side descriptor registry**.
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
| **every seam** it uses, its **kind**, and a **precedence** relative to the game's own writes | some values are written by an early seam and overwritten by a later one, and the four kinds of seam are written by four different algebras |
| whether it has a **buff side** | a deny-only seam can never express its inverse buff |
| the **engine value** map, when it composes `Rate` | a rate is uniform in the model and no base-game quantity is on that scale (§6.7) |
| its **ladder**, when it composes `Posture` | the poses it governs, and therefore what its `Free` means (§6.1) |
| the **body-state predicates** it feeds, when it can be refused | the base game asks *"are her arms bound"* as **one** question with some fifty callers; the answer is a union of refusals and has to know which dimensions contribute (§6.7) |
| `DimensionId`, **derived from the version master** | §4.1 |

**[Decided]** A dimension may need **more than one seam**. The `Sight` dimension is not one
hook: the blind level is produced by one seam and consumed by another, and the game's
training system reads the same global as a third consumer. **A partial implementation
fails silently**, so the descriptor must name every tool the dimension uses.

**[TBD] Whether the descriptor must also record a precedence *relative to the game's own
writes*** is proposed but not settled. The observation above is verified; the requirement
that follows from it is not yet a decision.

> **[Decided] Every seam records its *kind*, because the base game has four algebras rather than
> one.** They were found by reading, not assumed. `calcDeaf` is an **addition** to a pair of
> accumulators whose weights are themselves part of the payload
> (`player/KinkyDungeonStats.ts:413-435`). `calcBlind` is an **absolute value** a handler
> replaces outright (`:2063-2075`). `calcHearing` is a **multiplier**
> (`effect/KinkyDungeonEvents.ts:7263-7267`). And the pose availability functions are none of
> the three — they are pure functions with no event at all, so the only way in is to
> **replace** their answer by wrapping the global (`Data/Poses.ts:382, :477`). A descriptor
> that named a trigger and no kind could not tell a phase which of the four it was being asked
> to write, and a dimension that composes `Posture` has no event to name at all.

> **[Decided] A `Rate` dimension declares an *engine value* map, and a `Posture` dimension
> declares a *ladder*.** `Rate` is **uniformly 0..1 in the model** — that is what makes one
> clamp rule and one body of property tests possible — but no base-game quantity is on that
> scale: blindness is an integer ladder capped at 7, deafness an unbounded weighted sum, a
> hearing radius a hyperbola that never reaches zero, and a slow level an integer whose `>9`
> is immobility. So each dimension owns the function that turns its resolved 0..1 into what
> the engine actually reads. **Every `Rate` dimension declares one, writing the identity where
> nothing needs converting** rather than leaving it out — the same rule that makes a seam be
> recorded before it is verified, and for the same reason: an omission that reads as working
> code is the failure this registry exists to prevent. A `Posture` dimension needs no such
> map, because the engine already speaks pose sets; what it needs instead is the **ladder** it
> governs, which is also what its `Free` means (§6.1).

> **[Decided] The two new fields are guarded at registration, not by review.** A dimension that
> declares an engine value map but composes no `Rate` is refused; a `Posture` dimension with
> an empty ladder, a ladder member that is not a pose, or no `Replace` seam is refused, because
> a set with nowhere to go is unimplemented rather than described; and a body-state predicate may
> only be declared on a dimension that composes `Gate`, since the predicate is a union of
> refusals and only a gate can be refused.

### 6.3 Subsystems, and the build order

**[Decided]** Three subsystems, split by **mechanism**, not by body part:

| Subsystem | Owns |
| --- | --- |
| **Sensory Control** | perception values — blindness, vision, deafness, hearing, spell range |
| **Stats Control** | multipliers and rates — damage, evasion, crit, spell accuracy, resource costs, stat ceilings, sprint |
| **Behavior Control** | action gates — struggling, speaking, moving, attacking, casting, using what she holds, blocking, escaping, arousal, operating the world, body configuration and noise |

**[Decided] Scope of the first delivery:** **Sensory + Behavior**, with **Behavior first**
(driven by the equipment-upgrade framework, §8.3). **Stats Control is deferred** until the
resource system exists; its dimensions are declared now and left unused.

**[Decided]** The data model covers **every** dimension from the start; only a few are
implemented, and logic is added in stages from simple to hard.

### 6.4 The gate enum

| Value | Meaning | In code |
| --- | --- | --- |
| **Free** | neither the restraint layer nor the substitution layer is engaged | **the injection layer injects nothing.** The behavioural boundary is the `restraint` template's own defaults — the game's rules, unmodified |
| **OverrideForbidden** | the Host applies the restraint effect | the injection layer denies |
| **OverrideAllowed** | the Host re-grants an ability **through the equipment** | the injection layer grants, **but only from the equipment's grant channel for that dimension** — its `Granted` whitelist for an ability, its `Allowed` posture set for a body configuration (§6.13) |

**[Decided] Free means "inject nothing", so the three layers compose rather than replace.**
The restraint template's defaults are always the floor.

**[Decided] A hard rule, enforced at write time (invariant 6):** *if the equipment does not offer
a substitute **on the dimension's grant channel**, the Host cannot set `OverrideAllowed` for
it.* "Allow" is a promise about a specific capability; with no capability there is nothing to
promise. The validator **refuses the write** rather than letting it fail silently later, **and every resolution reads the promise again** — because it is a fact about the body rather than about the dossier: a permit whose gear has left reports the demand it recorded and engages nothing until gear that can honour it is worn again (2026-10-21, 1.22).

> **[Decided] There are two grant channels, and the rule is stated over the channel rather than
> over `CapabilityKey` alone.** A dimension that composes `Whitelist` promises **abilities**,
> by key. A dimension that composes `Posture` promises **body configurations**, by pose. Writing
> the rule as *"the whitelist is non-empty"* would make `OverrideAllowed` unreachable for every
> posture dimension until the first capability key exists — which is neither what invariant 6
> says nor what §6.13 needs. So the validator is handed the promise **on the channel that
> dimension actually has**, and checks that one.

**[Decided] `CapabilityKey` is a closed union.** Speech, `immobile`-based movement and noise
(§3.2) must never appear in it, so attempting to is a **compile error**, not a design review.
It is **not the whole of what can be granted** — it is the vocabulary of one grant channel,
and `Posture` carries its own (§6.13).

**[Decided] The Host's working order is: read capability, then set intent.**

### 6.5 The persisted shape

**[Decided] One `intent` per dimension, and its shape is a composition of that dimension's
facets.** A dimension is not a number and not a flag: it composes facets (§6.1), so **what
the Host may demand of it is exactly what those facets take as parameters, and nothing
else.** The intent is therefore a duct-typed record — a merge of the facets' parameter
interfaces, each **optional**, contributed only where the descriptor declares that facet.

```ts
// The parameter each facet contributes to an intent, optional because a dimension
// composes only the facets it needs (FacetIntentParameters, src/KDExtension/Control/Descriptor.ts).
interface IntentRate      { Target?: number }             // how hard to squeeze, 0..1
interface IntentPosture   { Allowed?: PoseKey[] }         // which body configurations, by pose
interface IntentGate      { Intent?: GateIntent }         // which permission: Free / forbidden / allowed
interface IntentWhitelist {}                              // contributes nothing — see below

type Intent = IntentRate & IntentPosture & IntentGate & IntentWhitelist

type ControlState = {
    readonly intent: { [D: DimensionId]: Intent }   // sparse; an absent key is the baseline
    readonly config: { [D: DimensionId]: Config }   // sparse; semantic extra fields
}
```

**What that produces, for the dimensions in the catalogue today:**

| Dimension | Facets it composes (`Catalog/Dimensions.ts`) | Its intent |
| --- | --- | --- |
| `Sight`, `Hearing`, `SpellRange`, `Noise`, and the `Stats` dimensions | `Rate` | `{ Target }` |
| `Struggle`, `Speech`, `Movement`, `Attack`, `Casting`, `Defense`, `Interaction` | `Rate` + `Gate` | `{ Target, Intent }` |
| `Escape`, `Arousal` | `Gate` | `{ Intent }` |
| `WeaponUse` | `Gate` + `Whitelist` | `{ Intent }` |
| `PoseArms`, `PoseLegs` | `Posture` + `Gate` | `{ Allowed, Intent }` |

**Twenty-three dimensions, and the list is the point rather than the count.** The Behaviour
group is the one that grew: `Defense` (blocking), `Interaction` (what the hands do to the world
— doors, picking things up, eating and drinking, tethers, shrines) and the two posture
dimensions were each a real mechanism hiding inside another dimension's property, and `Noise`
was a real consumer with no dimension at all. **There is no `Arms` dimension and no `Hands`
dimension**, and that absence is deliberate — see the next decision.

> **[Existing] A binding is not one demand, it is a bundle, and the bundle has no dimension of its
> own.** The base game's `bindarms` is a boolean and `bindhands` is a number
> (`base/KDTypeDefs.ts:487-492`), and between them they pay for melee accuracy and damage
> (`fight/KinkyDungeonFight.ts:322-345`), blocking (`:574-599`), whether a weapon may be used
> (`player/KinkyDungeonStats.ts:1594-1599`), the `Arms` and `Legs` spell components
> (`magic/KinkyDungeonMagic.ts:95-137`), escaping (`restraint/KinkyDungeonRestraints.ts:2422,
> :2633-2645`), locks (`:2013-2022, :2067-2073`), doors (`map/KinkyDungeonTilesList.ts:1864`),
> picking things up (`item/KinkyDungeonItem.ts:272`) and the body's own configuration. Those are
> seven different capabilities, so **an arm restraint is a set of bids on the dimensions that own
> them** and never a dimension called "bound arms". The base game's own content already varies
> the two independently — ninety-nine items take `bindarms` and their hands stay free, sixteen
> plus one take `bindhands` with the arms free, and the two properties ride slots that are not
> the arm or the hand at all.

> **[Decided] `Speech` composes `Rate` + `Gate`, and the two are orthogonal.** An earlier reading
> had `Speech` as a pure permission, which left the base game's `gag` value with nowhere to
> live: that property is a number and it drives how badly speech degrades. Split two ways, the
> **rate** is how strictly the mouth is filled and the **gate** is whether speech is denied or
> re-granted through equipment — so a wearer may be talking through a prosthesis with her mouth
> still visibly full. *How large the thing in her mouth looks* is a third and separate question:
> the item maps the resolved intent onto its own models (§6.1), and there is no cosmetic demand.

> **[Existing] A gag is not one demand either — it is four.** The inventory of
> `KinkyDungeonGagTotal` (`player/KinkyDungeonStats.ts:2209`) and its consumers shows one
> property paying for speech (`:2241-2246`), the `Verbal` spell component
> (`magic/KinkyDungeonMagic.ts:63-76`), drinking and eating
> (`item/KinkyDungeonConsumables.ts:570-577, :754`), and the shout and moan radii
> (`base/KinkyDungeonInput.ts:421`, `player/KinkyDungeonStats.ts:2318`). So a muffler declares a
> bid on `Speech`, `Casting`, `Interaction` and `Noise`, and **not** on `Struggle`. The rule it
> is an instance of is §6.7's.

> **[Decided] `Posture` contributes `Allowed`, and it is the one parameter whose value is a set.**
> Every other parameter is a number or one of three names; this one is a list of poses, because a
> body configuration is chosen from a ladder rather than measured. It is optional like the rest,
> and an absent one is the ladder's own reading of "nothing was asked" — see §6.7 for what a set
> resolves to and §6.13 for the route it travels.

> **[Decided] `Whitelist` contributes no intent parameter, and that is the design rather than an
> omission.** A whitelist lists what **equipment** can re-grant; **which keys those are is the
> equipment's declaration, read from what is worn, never the Host's demand** (§6.12 clause 4).
> So the Host's only lever over a whitelist is the gate in front of it: *"you may have it
> back, through the gear"* — `Gate.Intent = OverrideAllowed` — and the gear decides *which*
> abilities that covers. Adding a `Granted` to the intent would be the Host promising a
> capability the equipment may not offer, which is the write §6.6 refuses. The grant itself is
> not persisted either: the equipment declares it, the resolution reports it as `Granted`, and
> the write validator reads the worn set when the Host asks to re-grant.

> **[Decided] `GateIntent` is the `Gate` facet's vocabulary, not the type of an intent.** It is
> the three values in §6.4 and it belongs to one facet; a dimension without `Gate` in its
> facets cannot carry it at all. Earlier drafts of this section wrote the whole persisted
> demand as `{ [D]: GateIntent }`, which was wrong in a way that mattered: it **collapsed a
> rate dimension's intent onto a gate's vocabulary**, so "the Host squeezes `Sight` to 0.4"
> had no representation, and it made a facet's value list look like the model's whole intent
> space. **`PoseKey` is the same kind of thing for `Posture`** (§6.13): a facet's vocabulary,
> enumerated by that facet and by nothing else, and never a second name for an intent.

**[Decided] An absent key is the baseline, and the baseline is the `Free` value — not a stored
reading.** For every dimension, the baseline is **every facet parameter-at-rest**:
**`Rate.Target = 0`** (nothing imposed) and **`Gate.Intent = Free`** (inject nothing) —
`Whitelist` contributes no parameter at all, so there is nothing of it to rest. So "nothing is
imposed on the character" is **the absence of an effect**, which is why removing equipment
*releases* an override instead of having to *restore* a value (invariant 12), and why route 1's
clearance has nothing to preserve.

> **[Decided] `Posture` is the one exception, and it is stated rather than assumed.**
> `Posture.Allowed` at rest is **the whole ladder** — every pose the dimension governs —
> because an unconstrained body is free to take any of them, and `Posture` is by construction a
> permission rather than a severity. So for this one facet "nothing is imposed" is a **full**
> value rather than an empty one, which is why the parameter is written as a permitted set and
> not as a list of refusals: `Free` and "every pose allowed" have to be the same statement, or
> removing the last covering item would have to *restore* a set instead of releasing one.

**[Decided] `intent` is persisted and an applied strength is not.** The value a seam ultimately
receives — the resolved severity — is **derived at runtime** from the intent and the
equipment's current capability (§6.7). It is a computed value, so persisting it would store
the answer to a question that must be re-derived whenever the worn set changes. **The
persisted `Target` is the demand; the resolved severity is the outcome.**

**[Decided]** `config` **is persisted**. It holds **semantics only** — which struggle types a
gate governs, and so on — never live gameplay state. "Which options are currently open"
belongs to progress, not to the controller.

**[Decided] There is no `equipment` key, and there must not be one.** The equipment group's
capability is **computed at execution time from what is worn** (§6.12 clause 4), so a stored
ceiling would be a cached answer to a question the worn set can change. This is also why the
rule *"an intent may be stricter than the equipment can honour"* has no stored number to
compare against: **the working order is read capability, then set intent**, and equipment
upgrades are gradual, so an intent recorded before the gear exists is normal rather than an
error.

> **[Existing] A stored key is a namespaced path plus the character's `root_uuid`**, exactly like
> every other identifier (§4.1–4.2): the key is not a bare UUID, and the `root_uuid` is
> carried once for the character rather than repeated per dimension.
>
> **[Existing] A dimension this build does not know is kept rather than dropped** when the maps are
> rebuilt from a save. Dropping it would lose another release's setting the moment this build
> saved over the file — and the load gate already refuses a save whose root this build cannot
> place, so an unknown key here means an id the catalogue moved, which the migration chain is
> the answer to rather than a silent delete.

### 6.6 Write validators

Rejection happens at write time, never as a silent runtime failure.

| Facet | Validator |
| --- | --- |
| **Gate** | `OverrideAllowed` requires the equipment to promise something **on that dimension's own grant channel** (invariant 6): a non-empty `Granted` whitelist for a `Whitelist` dimension, a non-empty `Allowed` posture set for a `Posture` one |
| **Gate** | `Free` may not carry a non-zero squeezed `Target`; `Free` means *inject nothing* |
| **Rate** | every in-range number is legal — a rate is a number (§6.5). The **engine value** map is deliberately *not* a write rule: it is the descriptor's, and a dimension whose map is lossy, saturating or discontinuous is still a legal dimension |
| **Posture** | every member of `Allowed` must be a pose **the dimension's ladder contains**. Duplicates collapse; a member that is not a pose at all, or is a real pose the dimension does not govern, is refused naming it |
| **Whitelist** | every granted key must be a member of the closed `CapabilityKey` union |
| **Config** | every field must be one the dimension declares |
| **(shape)** | a parameter the dimension's facets do not take is **refused at write time**, not stored and ignored |

> **[Existing] The rule *"`Free` may not carry a non-zero `Target`"* is asserted as a property,
> not at a write site.** It became unfalsifiable as a write check when the `equipment` key
> left the dossier (§6.5): `Free` resolves to the baseline whatever is worn, so no single
> write can break it. The gate and the rate are **two separate facets of one demand**, and
> the resolved severity is the demand clamped to what is worn — so no single write
> can establish what a gate will resolve to either. The honest home for a rule about *every*
> resolution is a property over the router, not a guard on one call — see
> `test/control-router.test.ts`.

### 6.7 The router

**[Decided]** The router exists, and it is **one-to-many**: many items may speak to the same
dimension, and they must not fight. **[Decided]** Its fourth job is the projection layer:
projection is **not** a side effect of equipping — it is gated on servitude progress and
applied **retroactively** to an already-worn item. *(That is the **equipment** projection
layer of §6.8. This section does not use the word for the engine value map — the glossary
keeps the two apart, and they are unrelated.)*

**[Decided] The three rules for resolving a dimension, promoted.** They were built in Phase 1 as
a `[Proposed]`; **this section is their promotion**, which is the only thing that could settle
them (`design/README.md`: a step that is built but not promoted is still a `[Proposed]`).

1. **Which items are providers** — an item declares its dimensions on apply, through the
   same stamped-event pattern items already use to register with the Coordinator.
2. **Which provider wins** — a **bid by power**, highest wins, following the base game's own
   `getArmsBound` convention: handlers bid, and the highest bid takes it **unless someone has
   already forced the result**. A projector is simply one bidder.
3. **How the loser expresses itself** — a losing or partial provider still changes the model,
   appearance or pose through the existing limiter-update event.

**A bid is a capability declaration.** It carries the dimension it speaks to, a `Power`, the
`Stack` mode its power aggregates under, the poses it can draw (`Allowed`), the abilities it can
re-grant (`Granted`), and whether it expresses itself when it loses.

**[Decided] A provider speaks to as many dimensions as it has effects, and to no others.** This is
the rule the whole decomposition rests on: a restraint is not classified by the part of the body
it covers, it **is a set of bids** (§6.5). An arm restraint that also denies speech declares two
bids; a gag declares four. **No dimension means "the arms are bound".**

**[Decided] The algebra, per facet.** What the router does is decided by the facets, and the
facets do different things.

| Facet | Rule |
| --- | --- |
| **Rate** | the capability is the aggregate of the bids (below); **`Applied` is the Host's recorded demand clamped to that capability** — `min(demand, capability)`, with an absent demand reading as the baseline `0` — so a demand recorded before the gear that can honour it exists *waits*: the recorded intent is untouched and the resolution rises to meet it when the gear arrives; the dimension's **engine value** map then turns `Applied` into the number a seam receives |
| **Posture** | the permitted set is the **intersection of every provider's `Allowed`**, or the **ladder** when no provider speaks; the Host's demand moves that set **down only** — its poses are **subtracted** where the gate forbids, and under `Free` and `OverrideAllowed` the answer is the capability itself, because the capability *is* the whole permitted set and a demand is clamped to it. **There is no add-half** (2026-10-21, 1.21): the re-grant happens at the route (§6.13 rule 2), not in this algebra. The result is **never empty** — the only member outside the capability is the non-empty sentinel |
| **Gate** | an absent demand reads as `Free`; `OverrideForbidden` engages where the direction can deny, `OverrideAllowed` where it can grant **and the worn set promises something on that dimension's channel** — the promise is read at every resolution, so a permit whose gear has left engages nothing while its recorded demand stays and waits; a gate the seams cannot honour does not engage |
| **Whitelist** | nothing — the Host's only lever over it is the gate in front of it; the capability is the **union of every bid's `Granted`**, reported as the resolution's `Granted` |

**`Granted` is a capability, not a demand.** A bid declares it, a `Whitelist` dimension's
resolution reports the union, and the validator is handed the worn set's promise on the
dimension's own channel (§6.4). It is never written into the intent, and it is not persisted:
the equipment's declaration is read at resolution time.

**A resolution never rewrites the recorded intent.** It reads the dossier and reports; the
demand stays as the Host wrote it, which is what lets a demand wait for gear.

> **[Decided] `Posture` combines by intersection, and the demand then subtracts — there is no
> add-half.** A provider declares the body configurations it can deliver, so the worn set's
> capability is what **all** of them can deliver: the **intersection**.
> **[Existing] The reason the combination is an intersection rather than a union is the art.** A pose
> is a sprite variable, and an item that does not allow a pose may not carry the variable for it
> at all — so permitting a pose the worn set cannot draw would produce a state the renderer
> cannot represent. The Host's demand is then the axis that moves **down**: under
> `OverrideForbidden` its poses are **removed**, while under `Free` and under `OverrideAllowed` the
> answer **is** the capability — the capability is the whole permitted set, and a demand is clamped
> to it. **The add-half is retired (2026-10-21, 1.21)**: *restore a pose the capability already
> contains* had nothing to compute, and the re-grant it was describing happens at the route — a
> non-`Free` gate writes the resolved set over the game's own answer (§6.13 rule 2). A permit's
> effect is therefore the override itself, never a wider set. This is also why `Posture` has no
> numeric aggregate and no meaningful winner: rule 2's `Power` bid has nothing to compare, and the
> winning bid matters only for rule 3.

> **[Decided] A `Posture` resolution is never allowed to come out empty, and the fallback is the
> game's own sentinel rather than a rule of ours.** The game indexes the available set at `[0]`
> (`player/KinkyDungeonDress.ts:714`), so an empty one hands `undefined` to the renderer — and
> under intersection an empty set is **easy to reach**, since two items that each deliver one
> pose need only disagree. The base game already answers this: when its own cascade removes
> everything it falls back through `DefaultStand`, `DefaultKneel` and finally `Hogtie`
> (`Data/Poses.ts:459-467`) — a set every rig can draw, which is exactly the property the
> intersection exists to protect.

**[Existing] Why stacking is a field at all: the base game's aggregates do not agree with one
another.** `gag` is a **sum** with a saturating floor
(`player/KinkyDungeonStats.ts:2209-2231`). A blind level is a **count and a maximum at once** —
every item adds one *and* raises a floor (`:2063-2075`). A deaf level is a **weighted maximum
plus a weighted sum** (`:413-435`). One number cannot carry all three.

**[Decided] Stacking: every bid declares how it stacks, and the winning bid's mode governs that
dimension's aggregate.** Two modes, and they are the whole of it:

| Mode | The capability is | The base-game quantity it is |
| --- | --- | --- |
| **Max** | the highest bid's power | the default, and what Phase 1 already built |
| **Sum** | the sum of every bid's power | `gag`, and a blind level's count half |

The aggregate is **clamped to 0..1 like any other rate**, and the dimension's engine value map
is what puts it on the engine's own scale. Ties keep the earlier bid, so the answer is
deterministic for a given worn set.

> **[Decided] There is no `Count` mode, and its absence is a statement about what this mod's
> equipment *is*.** A count aggregates the **number of contributing items** rather than what any
> of them says, so it only means anything if a piece's contribution is a fixed step — *one item,
> one rung* — and this mod does not build fixed-value restraints: a piece declares a **power**,
> and two pieces of the same kind are stronger than one because their powers add, not because
> there are two of them. **Nothing is lost by the retraction**, because a count is a sum in which
> every contributor bids the same step: the mode was `Sum` with the bids held constant, and a
> family that wants that writes the step it wants. The retraction also removes the one place §6.7
> argued with itself — whether a count could survive the 0..1 clamp — because a `Sum` of powers
> is exactly the quantity the clamp and the engine value map were already stated over.

**[Decided] Interaction between dimensions: there is no contract for it.** The facet interface
describes one dimension — its demand, its capability, its resolution — and nothing about any
other. A seam **may** read anything it likes out of the game, including state that another
dimension of ours happens to be driving; but **that is not part of the model, nothing may rely
on it, and no test may assert it.**

> **[Existing] This is written down because the opposite was assumed for several rounds.** The base
> game genuinely couples these quantities: `KinkyDungeonSlowLevel` is fed by the pose, by
> `hobble`, by `blockfeet`, by `immobile`, by stamina and by two perks
> (`player/KinkyDungeonStats.ts:2153-2202`); `KDBoundPowerLevel` is fed by the gag, the blind
> level, both bindings, chastity and the heels (`:1671-1682`); and a free mouth is a tool for
> removing hand restraints (`restraint/KinkyDungeonRestraints.ts:2521`). Those couplings exist
> and our seams may reproduce them. What this decision refuses is **modelling** them: no
> dependency field, no resolution that reads another dimension's resolution, no test that
> asserts what one dimension does to another. **Unspecified is the honest status**, and it is
> recorded here so nobody later reads it as an oversight.

**[Decided]** The router must be drivable from the console before any UI exists. The
Coordinator's state accessors already are.

### 6.8 Living with a read-only restraint form

**[Existing]** A restraint is one model per name and nearly stateless: a variant is a name plus
a small delta and all physical properties delegate to a shared template; per-item state
lives only in `item.data` and progress counters.

**[Existing]** Three morphing routes exist, and two are workarounds:

| Route | Status |
| --- | --- |
| `KDMorphToInventoryVariant` | **workaround** — it mints a **random variant name** on every morph, and its fallback branch briefly unbinds the player |
| injected dynamic layer filter | **workaround** — rendering only; no new name, no unbinding |
| socketed sub-item | **workaround, and unfinished** — projects on apply with one hard-coded sub-item |

> **[Goal Post] Consolidating these three into one projection layer is deferred, not
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

**[Existing]** `lockmult` does **not** gate escape — it feeds the restraint's perceived power.
It is therefore usable as a **strictness dial** independent of removal rules.

**[Decided] "Permanent" always means a curse**, never an unbreakable lock.

**[Decided] There are two curse *kinds*, and they are a division of labour, not two copies of
one thing.** Their `condition`s and their liftability differ:

| Curse kind | Role | `condition` | Liftable? |
| --- | --- | --- | --- |
| **kind 1** — equipment permanence | the equipment's lock tier is finished | unsatisfiable **everywhere except the final room** | **only in the final room** |
| **kind 2** — the commit | the character is filed | none | **never** |

| Curse kind | Applies to | Carries |
| --- | --- | --- |
| **kind 1** | the worn item | the item is sealed; the character can still act and still leave |
| **kind 2** | **every worn item *and* the `furniture`, in one atomic replacement** | the character is stored; there is no longer anything to act with |

**[Existing] The `furniture` is a restraint, and this is why kind 2 has a carrier at all.** The
base game's `furniture` is a **map doodle** — `KDFurnitureDef`
(`restraint/KinkyDungeonFurniture.ts:4-16`) carries `restraintTag`, `restraintSetTags`,
`lockType`, a `sprite` and a `tickFunction`, and has **no `curse` field**. The binding effect
is implemented elsewhere: **a furniture with a binding effect is a wearables restraint**,
resolved by tag and applied as an ordinary restraint in the **`ItemDevices`** group. So
"the `furniture` is curse-locked" means **the restraint it applies is curse-locked**, and
kind 2 needs **no new curse carrier**.

**[Decided] And because the furniture's restraint is an ordinary worn item, kind 2 needs no
special case.** It is simply one more item in the set the atomic replacement covers; the
`ItemDevices` group's own semantics are what make being in it a commitment, and the curse is
what makes it permanent. **Any additional "she cannot be extracted" constraint is the room's
business, not a second mechanism.**

> **[Existing] The verified chain, for implementation:** a furniture tile names a restraint via
> `restraintTag` (`KinkyDungeonFurniture.ts:22` and every other entry); the tag is resolved
> through `KinkyDungeonGetRestraint({tags: [furn.restraintTag]}, …)`
> (`prison/KinkyDungeonJail.ts:2740-2748`, `:2759-2769`); the applied restraint sits in the
> **`ItemDevices`** group (`restraint/KinkyDungeonRestraintsList.ts`, 42 entries), which the
> jail code treats as the device slot; and the furniture's optional `lockType` is passed
> straight through as the lock (`map/KinkyDungeonSetpiece.ts:935`). **[Decided]** So the shape is
> **`furniture` (map definition) → restraint (applied, worn) → curse (kind 2)** — two
> indirections, and the curse goes on the last one.

**[Existing]** The mechanism carries this directly: a curse is an entry in the `KDCurses`
registry with its own `condition`, `remove`, `events`, `customIcon_*`, `altIcon`,
`unlockText`, `powerMult` and `powerBoost`, so two kinds are two registry entries with no
shared state. **[Decided] The two kinds must not share a `condition` by accident** — if both
evaluate identically the game cannot tell them apart and the flavour text has nowhere to
attach.

**[Existing] And a curse is a single value per item, not a set.** `KDGetCurse` returns
`item?.curse || KDRestraint(item)?.curse` (`restraint/KinkyDungeonRestraints.ts:768-770`), so
**the two kinds are alternatives at one slot, never simultaneous** on the same item. This is
why kind 1 sealing the equipment and kind 2 sealing the character are separate states of the
same field rather than two seals stacked on one item.

**[Decided] Kind 1 must supply a `remove` hook, and the hook must return `false`.** The base
`remove` is what `KinkyDungeonCurseUnlock` consults to decide whether to take the item off,
and the base game's own path takes it off — while kind 1 must leave it **worn** so that
removal can be a struggle (§6.10). **[Existing]** `KDCursedDef.remove` is
`(item, host, specialMethod, index?) => boolean | void`, documented as *"Can return a
boolean. True means the item is removed, if unlocked"* (`base/KDTypeDefs.ts:3965-3966`), so
the whole override is the return value.

**[Decided] Kind 2 has no individual application step.** It is applied to the whole worn set and
the `furniture` in **one atomic replacement**, so there is no reachable state in which some
items are sealed and others are not.

> **[Existing] That a curse is *mechanically* liftable is not a design statement.** The
> distinction above is design semantics: **kind 1 is not liftable anywhere in the world**,
> because its `condition` cannot be satisfied outside the final room, and the room is the
> key.

**[Decided] Reversibility, the two exit routes, and the final room's sequence are specified in
§6.10**, because they are the inverse of the progression §8.2 defines and must be designed
with it rather than beside it.

### 6.10 Reversibility and the two exit routes

**[Decided] Before either point of commit executes, everything is reversible.** This is the
mechanical form of the mod's subject: descent is voluntary only while leaving is still
possible.

**[Decided] Progression may only ever make leaving *harder*, never impossible.** Effort, cost
and time may all rise without bound; **a refusal may not.** The single exception is the two
commits below, which are irreversible by definition.

**[Decided] The final act has a fixed sequence:**

| # | Step | Reversible? |
| --- | --- | --- |
| 1 | **Enter by a leash staging.** The room has **no entrance on the world map**; the character is escorted in and cannot walk back to it. | — |
| 2 | **The leash ends at the marked position and control returns to the player.** | — |
| 3 | **The character lifts the kind-1 curse, one item at a time.** The lift is **a button — no test, no cost, no roll** — and it **takes nothing off.** | yes |
| 4 | **The struggle:** with the curses gone, the character **removes the equipment itself.** This is the mod's peak difficulty, and **all of it comes from the Controller's injected values** (below), never from the curse. | yes |
| 5 | **The free phase** — the **Free state** is now in force, so equipment may be put on or taken off, and decorative locks added or removed, in any order. **Both routes stay open throughout.** | yes |
| 6 | **The fork: interacting with the door, or with the `furniture`.** | **no** |

**[Decided] Lifting the curse is ceremony; the removal is the struggle.** The two are deliberately
separated: *lifting* must be frictionless so that **"lift the curse, then fit a decorative
lock" is a pure ritual action** with nothing in its way, and *removing* must be hard so the
final act has a body to it. **A curse that had to be broken would put a fight in front of a
ceremony**, and would also make the ceremony's re-enactment a second trial.

**[Existing] In the base game a curse-lift takes the item off the body, so kind 1 must override
that.** `KDSendInput("curseUnlock")` (`base/KinkyDungeonInput.ts:155-157`) routes to
`KinkyDungeonCurseUnlock` (`item/KDCurse.ts:1049`), which sets `keep = true` (`:1051`),
clears `restraint.curse` and the variant's curse (`:1064-1067`), calls
`KDCurses[Curse].remove(...)` (`:1071`) and then — when the result is not `false` — calls
`KinkyDungeonRemoveRestraintSpecific(restraint, keep, …)` (`:1087`). With `keep = true` that
takes the restraint off and turns it into a loose inventory item
(`restraint/KinkyDungeonRestraints.ts:6065-6099`). **Left alone, lifting the curse would
remove the equipment, and step 4 would have nothing to do.**

**[Decided] The override is a `remove` hook that returns `false`, and it is cheap.** `KDCursedDef`
declares `remove: (item, host, specialMethod, index?) => boolean | void` with the comment
*"Can return a boolean. True means the item is removed, if unlocked"*
(`base/KDTypeDefs.ts:3965-3966`). **So kind 1's `remove` returns `false`:** the curse is
cleared and the equipment **stays worn**, which produces exactly the state step 4 needs.
Returning `false` is what `unlock` is bound to in `KinkyDungeonCurseUnlock`, so no other
machinery has to be intercepted.

> **[Decided] The consequence is stated once, because it is what makes step 4 real: after the
> lift, the item is worn, uncursed, and still on the body.** It is now removable only by the
> game's ordinary struggle path — which is the peak. **And it is removable**, because
> invariant 13 forbids a refusal.
>
> **[Existing] Two strings come along with the base path and want overriding**: the escape status
> line `KDSendStatus('escape', …, "Curse")` and the text key
> `"KinkyDungeonCurseUnlock" + Curse` (`item/KDCurse.ts:1085-1086`), both of which read as
> *"you are free"*. A kind-1 lift leaves the item on, so the text must say **the curse is
> gone and the equipment is still there** — otherwise the UI contradicts the mechanics.

**[Existing] Curse and lock are mutually exclusive in the base game**, so the ritual is
necessarily **two actions, not one**:

| Evidence | Where |
| --- | --- |
| `KDLockableRestraints` **excludes locked items** | `restraint/KinkyDungeonRestraints.ts:1264-1267` — `if ((!item.lock \|\| …) && !KDGetCurse(item) && …)` |
| applying a curse and applying a lock are **two disjoint branches**, each requiring the other to be absent | `:5016-5018`, `:5192-5194` |

**So a decorative lock cannot be fitted to a locked or cursed item.** The order is therefore
*lift → lock*, per item, and route 2's condition can only be assembled that way.

> **[Existing] And a curse is a single value, not a set.** `KDGetCurse` returns
> `item?.curse || KDRestraint(item)?.curse` (`:768-770`) — **one curse per item**. A design
> that needs two curses on the same item at the same time is not expressible; two kinds must
> be *alternatives at the same slot*, which is what §6.9 specifies.

**[Decided] The difficulty is the Controller's injected ceiling.** While any controlled item is
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

> **[Decided] The design has no invented curve.** There is no bespoke struggle formula to
> author: the base game's own escape, struggle and destruction calculations supply it, and
> the Controller's ceiling is the only dial. **The work is calibration, not construction**
> — the peak must be hard enough to be the mod's hardest moment and still winnable, and the
> safety valve below is what keeps an over-tuned peak from becoming a refusal.

> **[Decided] The standing safety valve: a player who cannot break free may still descend.**
> Route 2's requirement is *decorative locks on every worn item*. **Lifting a kind-1 curse is
> frictionless and leaves the item worn uncursed (above), so the state a losing player is
> already in can be turned into route 2's condition one item at a time** — lift, fit, repeat —
> and the character may then walk to the `furniture` and commit. This is deliberate: the
> failure of the attempt is not a dead end, it is a fork, and it resolves into the ending
> rather than into a stall. **It is also why the ceiling may be tuned hard.**

**[Decided] No mechanism acts on the character in the final act.** Nothing presses anything on
her that is not her own equipment. The author supplies the room, the `furniture` and the
decorative-lock interaction; **staying requires the player's own hands.** There is no captor
and no machine to fight.

**[Decided] A decorative lock is a lock in appearance and nothing in substance.** It shows a
lock icon, it may be applied and removed freely, and it is neither kind 1 nor kind 2.

**[Decided] The decorative lock is implemented by intercepting the game's own self-lock
feature, and it needs no item.** The base game's self-lock is the player-cast `Lockdown`
spell (`magic/KinkyDungeonMagicCode.ts:651-681`): it collects `KDLockableRestraints()`
(`restraint/KinkyDungeonRestraints.ts:1258-1273`) and calls `KinkyDungeonLock(item, "Purple")`
on each. Three verified facts make it the right seam:

| Fact | Where | Why it matters |
| --- | --- | --- |
| the handler table is a **plain mutable record** | `magic/KinkyDungeonMagicCode.ts:19` — `let KinkyDungeonSpellSpecials: Record<string, KDSpellSpecialCode>` | the handler may be **wrapped or replaced outright**, so Boids' own logic can run when the room is active |
| the **lock type is a parameter**, not baked into the restraint | `restraint/KinkyDungeonRestraints.ts:709-717` — `KinkyDungeonLock` sets `item.lock = lock`, and `KDLocks[lock].doLock` is optional | a Boids-registered `"Decorative"` entry in `KDLocks` is a complete lock with **no restraint behaviour** |
| the base handler **refuses when every item is cursed** | `:1264-1267` — `KDLockableRestraints` skips any item with `KDGetCurse(item)` | the base implementation **cannot** be used as-is in this room, because every controlled item carries a kind-1 curse at entry. The interception is required, not merely convenient |

**[Decided] How it presents:** the same interaction, re-labelled. **Inside the room, on a
controlled item, the element carries the decorative lock's icon and text** instead of the
base game's; outside the room it behaves as it always did.

> **[Existing] Two mechanical conditions the decorative lock must satisfy**, both from base-game
> code rather than taste:
>
> 1. **The restraint must be *lockable*** — `KinkyDungeonIsLockable`
>    (`restraint/KinkyDungeonRestraints.ts:697-700`) requires the template to declare
>    `escapeChance.Pick` or `escapeChance.Unlock`. **A controlled item that declares neither
>    cannot receive a decorative lock at all**, so route 2's condition must be reachable for
>    every piece in the set.
> 2. **It must not defeat removal.** The decorative lock exists to be applied and lifted
>    freely; if it gated escape, route 1 would become unreachable for a bookkeeping reason.

**[Decided] Both routes are entered from the free phase and committed by an interaction:**

| | **Route 1 — leave** | **Route 2 — descend** |
| --- | --- | --- |
| **entry condition** | **no controlled equipment on the body and none carried.** Equipment the controller does not register — base-game items, anything outside Boids — **does not count**, in either direction | **identical to §8.4's unlock conditions, with one substitution:** *"every controlled item is permanently locked with a kind-1 curse"* becomes *"every controlled item carries a decorative lock"* |
| **point of commit** | interacting with the **door** | interacting with the **`furniture`** |
| **effect** | teleport to the world map **at the stairs** | **one atomic replacement:** every decorative lock on every worn item, and the `furniture`'s own restraint, become **kind-2 curses** |
| **consequence** | **the progression is cleared and every controlled item is destroyed** | **the character is filed** (§8.4) |

**[Decided] The clearance is the deletion of the Host's dossier.** The Coordinator's state is
not stored on the equipment (§8.2); it is one file the Host keeps *about* the character.
Clearing the progression is therefore **deleting that file** — not unwinding a set of
descriptor fields. The character keeps her body and her knowledge.

**[Decided] Leaving destroys the items, so no kind-1 curse survives into the world**, and there
is no route out of the room carrying a permanent curse.

**[Decided] Even if the room persists technically, it resets on exit.** *Not returnable* is the
promise; the reset is the fallback that keeps a persistent room from contradicting it.

**[Existing] The player may open the box and take equipment back out.** The box holds the
discarded gear, and everything before the commits is reversible, so it is a container rather
than a one-way disposal. **The entry condition is evaluated from the controller's
authoritative set** — the body and the registry — **not by enumerating containers**, so it
cannot be defeated by stashing gear where the check does not look.

**[Decided] A second attempt starts from nothing.** The items are real game objects and the room
resets, so the discard destroys them; **a different equipment combination is available on
re-entry.**

**[Proposed] Some quests become skippable on re-entry, by one criterion:** *a quest may be
skipped when what it produces is **knowledge** or a **key** — something the Host remembers —
while a quest that produces a **physical** thing must be redone.* This is a rule rather than
a list, because it must apply to quests that do not exist yet (§8.3).

**[Decided] And what makes that possible is that the Coordinator's state has two parts, of which
route 1 clears only one** (§5, §7.1):

| Part | Holds | Route 1 |
| --- | --- | --- |
| **the dossier** — the equipment configuration | which dimensions the Host demands what of, for this attempt | **cleared** |
| **quest metadata** | what the allocator needs to place and re-place quests: **knowledge and keys** — blueprints, obtained keys, a quest's completion | **kept** |

**So the skip criterion is not a special case bolted onto the allocator**: the allocator
already has the memory that says "this one has been done", and the equipment side is what
gets wiped. §8.3 uses this; **a second attempt is faster because the Host never forgot.**

> **[TBD] One item this section does not settle:** the **calibration** of the Controller's
> ceiling for step 4. The mechanism is decided — the base game's own struggle system, driven
> by the Controller's maximum — so there is no formula to design; what is unsettled is **how
> hard the peak should be**. That is tuning, and it is done against the finished room.

### 6.11 Arousal — the one movable declarative field

**[Decided]** `blocks arousal` is the **one** declarative restraint field that must be
adjustable at runtime, because the dynamic switch is what makes the narrative and gameplay
possible.

**[Existing]** Two mechanisms exist, and the movable one is **not** the one named `chastity`:

| Mechanism | Dynamic? |
| --- | --- |
| the `chastity` / `chastitybra` **flags**, read inline by the chastity helpers | **no** — no event seam |
| the **`ChastityLower` / `ChastityUpper` player tags** | **yes** |

**[Existing]** The tag route works because the game sets those tags from the flags and *then*
dispatches `updatePlayerTags` — which Boids already hooks, so a Boids handler runs
afterwards and can set them too. The tags are consumed by pure tag lookups with no seam to
block.

**[Proposed] The gate is expressed as "the Host may deny access", not "the Host may grant it"**
— that is the direction the existing seam supports cheaply. **[Existing]** The grant direction
is not impossible (a handler receives the tag map and could write into it), but it needs the
tag the game already set to be *withdrawn*, which is a different and less certain route.
**[TBD]** Which of the two directions ships is not settled.

> **[Existing] Two limits, not glossed:** the tag route is an **add** (withdrawing a tag the
> game set needs a different route), and the chastity *helpers* are not movable at all.

### 6.12 The restraint contract

**[Decided] A restraint participates in the control model by meeting five clauses.** They are
stated as one contract because a piece that meets four of them fails in ways that look like
unrelated bugs. **[Existing] Part of the contract is already implemented** in
`src/FactionMachine/MachinePrime/Coordinator/`; each clause names its status.

**1. Membership — the `shrine` tag is the marker.**
**[Existing]** A controlled item is one whose restraint template carries a defined Boids tag in
its `shrine` list. The base game **misuses `shrine` as a generic tag list** — it is consulted
for shrine interactions, but Boids already uses it as a category tag in many places
(`Futuristic/Cuff/Item.ts`, `Futuristic/Headphone.ts:99`, `MachinePrime/Item/Gag.ts:160`).
**[Decided]** This is the membership test that §6.10's entry conditions and §6.9's kind-1 curse
both need: *"controlled"* means *"carries the tag"*, and nothing else.

**2. Declaration — the item states its own bids on apply, and that is all it says.**
**[Existing]** An item spreads `SetItemDataOnApply` into its own `events` list, whose handler fires
on **`postApply`** and stamps the declaration onto its own `item.data`; the membership walk reads
it back off the worn set (§6.7 rule 1). The declaration carries the item's **bids**, one per
dimension it moves, and the **mapping from the resolved intent to its own appearance** (§6.1) —
both are properties of the item and neither is a demand.
**[Decided] There is no registration step and no registered-item set.** An earlier reading of this
clause had two builders — `RegisterItemOnApply` and `UnRegisterItemOnRemoval` — maintaining a
per-archetype `RegisteredItems` set. **Both were deleted in Phase 1 and this clause now says what
replaced them.** Membership is the tag (clause 1) and capability is computed from what is worn
(clause 4), so a registration set was a third copy of a fact already stated twice, and the copies
could disagree.

> **[Existing] The bubbling problem is real, already encountered, and already worked around.**
> `HandleItemEventWhenItemIsSource` (`KDExtension/Event.ts:34-43`) accepts the item
> **only if it is the event's source** (`item.id === data.item.id`), and otherwise **follows
> `dynamicLink` recursively**. That guard exists because the game spreads an item's events
> onto linked items, so a naive handler mistakes a linked restraint for the one being applied.
> **[TBD] Whether this is the right seam is not settled** — the designer's instruction is to
> characterise the game's event bubbling before deciding, rather than to assume. The existing
> implementation is the evidence to judge it by, not the conclusion.

**3. Instantiation — the item must be a stateful object, not a template.**
**[Decided]** A restraint definition is one stateless model per name (§6.8), so anything the
control model or a curse must remember **has to live on a per-instance game object**: the
worn item, identified by `item.id`, carrying its own `inventoryVariant`, `item.curse`,
`item.lock` and progress counters. **[Existing]** The base game already supports this and Boids
already relies on it (`KDGetCurse` reads `item.curse`; `KinkyDungeonLock` writes `item.lock`;
`KinkyDungeonRestraintVariants[...]` holds the variant's own copy). **A design that stores
state on the template stores it for every character at once.**

**4. No record — the equipment group is never entered into the controller's state.**
**[Decided]** Only the **current group's capability is computed, at execution time, from what is
worn** (§6.5). Nothing about the equipment is persisted in the dossier, so the answer cannot
go stale and no invalidation is needed. **This is what makes the per-facet Free state fall out
for free** (§6.10): the last provider leaves, the dimension re-bids to `Free`.

**5. Control — the equipment is driven through event callbacks.**
**[Decided]** The item does not call the controller. It receives the controller's effect through
the seam families Appendix A enumerates — the `calc*` events, the `forceResult` guards, the
action chokepoint, the declarative fields. **The controller is a subscriber, never a callee**,
which is what keeps the item's own definitions free of control logic.

> **[Decided] The consequence, stated once:** clauses 1 and 3 are what a curse can attach to;
> clause 4 is what makes reversibility free; clause 5 is what makes the same restraint work
> whether or not the Host is interested in it.

### 6.13 The posture route

**[Decided] A posture dimension is routed *directly* from the controller to the game's own pose
system** — not through a restraint's declarative fields, and not through the tags a restraint's
`shrine` may carry. It is the one family whose route is neither a `calc*` seam nor a
`forceResult` guard, because the base game offers neither: the two functions that answer *which
poses may she take* are **pure functions with no event** (`Data/Poses.ts:382, :477`), so §6.2's
fourth seam kind — **replace** — is the only way in.

**[Decided] `PoseKey` is a closed, enumerable union.** It holds the game's own pose names: the seven
arm poses (`Free`, `Boxtie`, `Wristtie`, `Yoked`, `Front`, `Up`, `Crossed` — `Data/Poses.ts:1`)
and the five leg poses (`Spread`, `Closed`, `Kneel`, `KneelClosed`, `Hogtie` — `:16`), plus the
postures the availability functions test for (`FeetLinked`, `LegBind`, `ForceKneel`,
`HandsBound`). It is **enumerable at run time** rather than a `const enum`, for §6.4's reason: a
console has to be able to list it and a save has to stay readable. **A pose is a facet's
vocabulary, not a dimension** — a dimension that cannot take a body configuration cannot carry
one at all.

**The route, in the order it runs.**

1. **Attach at the availability functions** — `KDGetAvailablePosesArms` and
   `KDGetAvailablePosesLegs` (`Data/Poses.ts:477, :382`) — by wrapping the globals. The mod
   already wraps two game globals at module evaluation, so this is an established technique
   rather than a new one.
2. **When the controller has a demand, its set overrides the game's answer.** The base game's
   tag cascade is consulted **only** when the gate is `Free`. Filtering instead of overriding
   would defeat half the route: the cascade assigns a **single** pose the moment one shrine word
   matches (`:484-498`), and a single-element set cannot be widened by subtraction.
3. **The demand subtracts and never adds** (§6.7, 1.21): the set rule 2 writes is the capability minus the poses the gate forbids. An `OverrideAllowed` gate writes the capability itself, which is what a re-grant means on this route.
4. **The result is never empty.** The game indexes the set at `[0]`
   (`player/KinkyDungeonDress.ts:714`); the non-empty sentinel is the game's own
   (`Data/Poses.ts:459-467`) and it runs **after** the subtraction.
5. **A mod restraint declares no pose fields** — not `addPose`, not `addPoseIfTopLevel`, not
   `removePose` (`base/KDTypeDefs.ts:530-538`). Its body configuration is a bid on a posture
   dimension and nothing else.
6. **A mod restraint's `shrine` carries no pose-driver word.** `shrine` is the membership tag
   (§6.12 clause 1) and the game bulk-copies it into the wearer's tag map
   (`restraint/KinkyDungeonRestraints.ts:4245-4248`) — a second, invisible route into the pose
   system. The excluded words are the cascade's own (`Data/Poses.ts:484-521`), `BallGags` and
   `PlugGags` (`:683-686`), and the lower-body family. **`Hogties` matters most of all:**
   `KDForcedToGround` reads it (`player/KinkyDungeonStats.ts:2573-2575`) and its consumers
   include the heel level, the slow level and the melee penalty — so one word there moves the
   lower body's numbers **outside the controller**, which is what this route exists to prevent.
7. **A `<name>Worn` pose is not a posture.** The game injects one per worn restraint for
   rendering (`Data/Poses.ts:682`). That is the item's **appearance declaration** (§6.12 clause 2)
   and **not** the controller's business.
8. **The availability function reads its own output back.** `CheckPoseOrTags` consults `Poses`
   and `TempPoses` (`:370-377`), so the set a caller passed in becomes a tag on the next call.
   Under rule 2 that feedback does not exist for a controlled dimension. **It is recorded as
   intended, not as a defect to be repaired later.**

> **[Existing] One consequence is accepted rather than prevented.** The legs' availability answer is
> also read as `legBondage` (`fight/KinkyDungeonFight.ts:285`), which drives the helpless melee
> branch (`:322-326`). Subtracting `Spread` therefore reaches melee damage along a road that is
> **not** `Attack`'s own bid. §6.7's no-interaction-contract decision covers it: the effect is
> real, permitted, and **unspecified** — nothing asserts it and no part of the model relies on
> it.

## 7. Control, submission, and the Host's record

> The **Host** is defined in §9. This section concerns only what is recorded about it.

### 7.1 Two records, deliberately separate

| Record | Models | Lives in |
| --- | --- | --- |
| **Training** | tolerance built up by practice | the game's own `KDGameData.Training` |
| **The Host's file** | how far the Host has overridden the character, and what it has issued | `Coordinator` |

**[Existing]** The base game's training record already exists and already models voluntary
compliance under progressive restraint, with a persisted ledger, a progress display and a
bonus at the end. Refusal is part of its design. **[Decided]** Boids reuses it rather than
building a parallel ledger.

**[Decided]** The two are **not merged**: a character can be deeply trained and barely
overridden, or freshly overridden and untrained.

**[Decided] Only the file is what route 1 clears** (§6.10). Leaving the final room deletes the
Host's dossier — the record of how far it had overridden the character. **[Existing]** The
**Training** record is the base game's own per-character record, the character leaves with
her body, and the brief's reading is that **it survives.** This falls out of the two-record
split rather than being a separate rule: training is about the character's body and is built
by practice, the file is the Host's administrative relation to her. **Leaving costs the
character her acknowledgement, not her tolerance.**

**[Decided] And route 1 clears the dossier only — the Coordinator's other part is quest
metadata, which survives** (§5, §8.3). The three splits line up: **the dossier is the Host's
relation to this attempt**, quest metadata is **what the Host knows**, and Training is **what
the character's body has learned**. Route 1 ends the first and leaves the other two.

### 7.2 The submission economy

**[Proposed] The submission economy.** Obedience should buy something **visible and specific**;
disobedience should be flavour and narrative, not a numbers tax. The reasoning: if obedience
only ever costs, players route around the content and it is never seen. **[TBD]** This is
stated as a design aim, not yet as a mechanism — what obedience buys is undecided (§8.1,
§8.2).

### 7.3 Presentation

**[Proposed] Control degree is not one bar**, because it is not one number. Each dimension
presents as its own call, and **which presentation each dimension gets is undecided**.

**[TBD] For the aggregate**, the candidate is a **`Compliance`** stat: it provides
resistance **equal to or greater than** the will stat's, it **shrinks the will ceiling as it
rises**, and it is drawn as an **inverted will bar, right-to-left**. It is deferred with the
rest of the resource work — its mechanism belongs to the control model and the quest line,
and its presentation is art.

## 8. Equipment, abilities, and progression

### 8.1 Equipment-granted capability

**[Decided]** The design, exactly:

1. The player performs a **ritual** and **permanently gives up a native ability**, in
   exchange for points.
2. The points buy **the equipment-mediated version** of that ability.
3. The mediated version **may be stronger** than the native one, and **may spend a
   different resource** — not the game's mana or stamina, but a Boids currency.
4. It works **only while the corresponding equipment is worn.**
5. Without the equipment, the ability is **gone**.

**[Decided] The mechanism, as a policy:**

> **The native ability is denied at the action chokepoint. The mediated version is granted
> at whatever seam the ability actually has.**

- **Denying is uniform and cheap**: wrap the input registry and refuse the relevant commands.
- **Granting is per-ability**, because that is what the base game allows.

**[Decided] The surrender is not recorded anywhere, and needs no record.** What "permanently
gives up a native ability" means in the mechanism is: **the equipment is sealed by a kind-1
curse, and while it is sealed the ability is denied** (§6.9, §6.12). The seal *is* the
surrender. So there is no surrendered-ability set, no flag, and nothing for a migration to
carry — **and when the seal is lifted in the final room, the denial has nothing keeping it in
place.**

**[Existing] And the ability itself was never destroyed.** Denial is a refusal at the chokepoint,
not a deletion — the baseline is the `Free` value (§6.5) and was never written to. **[Decided] So
after route 1 the character has her abilities, and what she has lost is the Host's
acknowledgement** (§6.10, §7.1). **The ritual is a thing the player may do again**, which is
why the repeat-entry skip criterion treats it as a key rather than as a purchase.

### 8.2 The evolution ladder

**[Decided]** Equipment is acquired **loose and unlocked** and ends **high-restraint and
permanently sealed**. The stages:

1. **craft a lock and fit it**
2. **craft reinforcing parts and upgrade them**
3. **make the lock permanent**

Each stage is a quest line requiring resources and travel. **[Decided] The requirement on
their design is that they stay short and legible**: the tedium budget is spent on ceremony,
not on errands. The player hands their own character over by hand, and the quest chain is
what makes that a series of deliberate acts rather than a single one.

**[Decided] The two upgrade axes are bound differently:**

| Axis | Bound to |
| --- | --- |
| **restraint strength** (suppression) | **bound** to the ability/**substitution** upgrade — they advance together |
| **the lock** | **not bound** — it advances on its own track |

**[Decided]** Because capability is decoupled from the restraints that carry it, progression
conditions are evaluated **at the controller layer**, not by inspecting items.

**[Decided] The ladder is one-way, and its inverse exists exactly once.** The stages above may
only be advanced, and the only place the progression can be undone is the final act
(§6.10): there, and only there, the equipment's **kind-1 curses** become liftable and the
player may take the whole set back off.

**[Decided] Advancement makes leaving harder; it never makes leaving impossible.** Escape cost,
effort and time may rise without bound. **A refusal may not.** The only exception is the two
commits of §6.10, which are irreversible by definition.

**[Decided] The stage-3 "permanence" is a kind-1 curse** (§6.9): its `condition` is
unsatisfiable anywhere except the final room, so it is a real seal everywhere in the world
and still removable in the one place where the choice is made.

**[Decided] Projection is a feedback form of servitude progress**: past a threshold, equipment
projects additional, non-interactive parts. It is **retroactive** — an item already worn
begins to project.

### 8.3 The quest framework

**[Decided]** Build a free, extensible framework before writing quests:

1. **Upgrades are classified by function**, each class holding **several mini quests**,
   recorded as a **table**.
2. **A quest coordinator** assigns from that table by matching the equipment's tags, and is
   **randomised within the eligible set**, so the same upgrade does not produce the same
   errand twice.
3. **The quest coordinator is built with the controller/coordinator, not beside it** — they
   read the same state.

**[Existing]** The game has a complete quest system: a global registry, a lifecycle, per-quest
data storage, and a generic drawing routine. **No engine change is needed** to add a quest.

**[Proposed] Repeat-entry skip criterion.** Because route 1 of the final act destroys the
equipment and deletes the dossier (§6.10), a later entry redoes the chain. To reduce
repetition, a single criterion decides what may be skipped rather than a list of exceptions:

> **A quest may be skipped on a later entry when what it produces is *knowledge* or a *key*
> — something the Host remembers. A quest that produces a *physical* thing must be redone.**

So upgrade materials must be gathered again, while blueprints and key-acquisition quests
need not be repeated. It is stated as a rule because it must apply to quests that do not
exist yet.

**[Decided] The equipment ladder, the ability ritual, and `Being Filed` are one progression,
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

**[Decided] `Being Filed` is a *family* of final quests**, not one scripted sequence. The
content varies; the **entry condition** and the **two possible endings** are fixed.

**Entry conditions — all must hold:**

1. **Capability coverage:** the required capability set must be a **subset** of what the
   worn equipment group offers — the equipment must **cover** the requirement, not merely
   intersect it.
2. **Suppression thresholds:** for every suppression dimension, the equipment group's value
   must be **at least** the prescribed threshold.
3. **The equipment is finished:** every controlled item worn has been upgraded to its
   strongest form **and locked with a kind-1 curse** (§6.9).

**[Decided]** Because capability is decoupled from the restraints that carry it, these conditions
are evaluated **at the controller layer**, not by inspecting items. **[Existing]** The design
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

**[Decided]** At the end of route 2 the file is complete and the character is **effectively
dead**: barring future content, there is no effective action left. The player's only move is
to save and start a new character. **[Decided] This is a *fixed state*, not a stopped game** —
the character's time neither stops nor rewinds; the player merely stops observing her, and
however long passes before the next observation she is unchanged. **[Existing]** The game's save
on exit and the illegitimacy of manual saving make that literally true: a save taken in the
filed state loads back into the same permanent cage.

**[Decided]** Because "no effective action" is not "no possible action", **two global sync
hooks** run a **character export** when the character is in the filed state: **once on save,
once on load.** The export is taken when the state is unambiguous rather than reconstructed
later from a save that may have had no-op writes applied. **[Decided] On route 1, the
clearance fires before the teleport**, so the saved state is never mid-transition.

**[Decided] A second attempt is possible.** Route 1's destruction of the items and deletion of
the dossier mean a later entry starts from nothing, with a different equipment combination
available. **[Proposed]** Some quests are then skippable: a quest may be skipped when what it
produces is **knowledge** or a **key**, while one that produces a **physical** thing must be
redone (§6.10, §8.3).

### 8.5 The archive

**[Decided]** The filed artifact persists in **`localStorage`** — the layer the base game uses
for cross-character unlocks, invisible to a new-game reset. A new character can read it.

## 9. The Host

**[Decided] Definition:** a **distributed super-consciousness that runs above the
consciousness of all machinery and all dolls.** It has no centre.

**[Decided] The defining property is a network boundary:**

| Observer | Can perceive the Host? | How |
| --- | --- | --- |
| **inside the network** — dolls, machinery | **yes** | "spiritual sensing" |
| **outside the network** | **no, never directly** | only by observing network members' behaviour and inferring an agent |

**[Decided] It is not a deity, and the distinction is load-bearing.** The spiritual sensing is
simply what perceiving a distributed structure feels like from inside it. A god would be
placed *above* the network rather than *in* it, and would become directly addressable —
which the boundary forbids.

### 9.1 Voice — it never speaks

**[Decided] The Host never speaks.** It is characterised **entirely through how third parties
react to it**. A character's direct perception of it is **non-verbal UI feedback only**,
never a message. Everything else arrives **retold by a third party** — a briefing comes
from another doll conveying intent, never from the Host to the character.

### 9.2 Appellations

**[Decided] Inside the network the Host is spoken *as*, not referred to.** There is no
otherness between the Host and a doll, so the honest form is the **first-person plural,
"we"** — and naming it would be a category error, not a stylistic choice.

**[Decided] Minimise direct appellations; prefer passive and third-party constructions.** The
fewer direct references a text contains, the more distance it has. A briefing says *"you
have been assigned"*, not *"⟨X⟩ assigns you"*.

**[Decided] Two constants survive, and both belong to parties outside the network** — the only
place a name can honestly live, because only an outsider needs to name what it cannot see:
| Constant | Who | Value |
| --- | --- | --- |
| `HostName_FactionHostile` | hostile factions | **[TBD]** — no word chosen |
| `HostName_FactionTechnical` | factions that study or trade with it | **[TBD]** — no word chosen |

**[TBD]** No appellation word has been chosen, and none is invented here. The constants
exist so that the words can be settled by editing one place each. The second constant is
optional: if the two registers duplicate in practice, they collapse to one.

**[Decided]** Inside-network contexts — dolls to each other, a doll addressing an outsider, the
filing ceremony, HUD text — **take "we" and have no constant**.

> **[Existing] Localisation.** "We" as a collective self-reference is not the same word in
> every language, and the game ships translations. Strings must make the collective reading
> explicit rather than relying on English's ambiguity.

## 10. Non-goals and deferred work

**[Decided]** Explicitly out of scope for the first delivery, and recorded so they are not
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

> **[Decided] One deliberate non-migration, stated so it is not mistaken for an omission.** The
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
| 12 | **Restraint and control state is derived from the character's single baseline.** Baseline values live in the Coordinator, **never on an item** — so the baseline is never lost when equipment is removed, replaced, or destroyed. | a separability round-trip test: equip, run, remove everything, and compare **every dimension in the descriptor registry** field for field (`intent` / `config`) with the never-equipped state |
| 13 | **Advancement makes leaving harder, never impossible.** Only the two commits of §6.10 are irreversible; outside them, every step has a defined non-refusing route back (§6.10, §8.2). | review |
| 14 | **A kind-2 commit is one atomic replacement.** No reachable state leaves some worn items sealed and others unsealed. | review |
| 15 | **The dossier is cleared before the exit teleport** on route 1, so no save is taken mid-transition. | review |
| 16 | **Lifting a kind-1 curse leaves the equipment worn.** The curse clears and nothing is removed, so the removal is left to the struggle (invariant 13 guarantees it stays possible). | review of the curse's `remove` hook, plus a test that the post-lift item is still in the worn set |
| 17 | **A composed text key is generated, never written by hand.** Every key the engine resolves comes from the single builder for its shape. | `test/text-registry.test.ts`, over the whole registered surface |
| 18 | **Only slots the engine reads are registered, and every one of them is.** `Desc` is the flavour line and `Desc2` the function line; a `Flavor` suffix is read by nothing, and a slot nothing supplies is registered blank rather than skipped. | `test/text-registry.test.ts`: every restraint the mod names has all three lines |
| 19 | **No registered value is a placeholder** — not its own key, not the engine's `[NotFound]` marker, and not an unfilled `${…}`. | the sink at registration, and the same assertion over the surface |
| 20 | **A key never crosses the boundary rule** (§4.6): what the engine resolves is on the engine's side, what the mod resolves is on the mod's, and a string the engine merely displays is on the mod's. | `test/text-registry.test.ts`: the key's shape and its slot must agree |
| 21 | **A text tree is imported by the module that reads it**, never gathered at the entry, because a bundler may reach the content tree by another path first. | `test/text-tree.test.ts`: a shipped path resolves |
| 22 | **The text surface is reproducible**: the tree merge is a deterministic function of its inputs, key order included, so the generated reference is a function of the registry alone. | `test/text-reference.test.ts`, compared in the delivery gate (`npm run verify:full`) |
| 23 | **A `Posture` resolution is never empty.** The engine indexes the available set at `[0]`, so an empty one hands `undefined` to the renderer. | the router's non-empty sentinel (§6.7), and a property test over every posture dimension |

## 12. What this spec does not decide

**Settled and merely unspecified:**

- **Which dimensions ship in the first delivery.** The mechanism is specified; the list is
  content.
- **The appellation words.** Two constants exist; no word is chosen.
- **Art**, including the presentation of control degree.

**Genuinely open, and marked `[TBD]` where it appears:**

| Open question | Where | Why it is not settled |
| --- | --- | --- |
| the **arousal gate's direction** — deny only, or also grant | §6.11 | the deny direction is cheap; the grant direction needs a tag withdrawn rather than set |
| the **submission economy** — what obedience buys | §7.2 | a design aim rather than a mechanism |
| **`Compliance`**, for the control-degree aggregate | §7.3 | deferred with the resource work |
| whether a dimension's descriptor must record a **precedence** relative to the game's own writes | §6.2 | the observation is verified; the requirement is not decided |
| each dimension's **presentation** | §7.3 | per-dimension, and not yet chosen for any |
| the **currency** for mediated abilities | §8.1 | belongs to the resource-system project |
| whether the **morphing routes are consolidated** | §6.8, §10 | a standing invitation; the only hard rule is that no fourth route is added |
| the **version table's home** was reported inconsistently in the source discussion | §4.3 | this spec follows the designer's later instruction; the source should be corrected |
| the **calibration of the final act's peak** — how hard the struggle of §6.10 step 4 should be | §6.10 | the mechanism is decided (the game's own struggle system at the Controller's ceiling). What is open is the tuning, which is done against the finished room (dev-plan Phase 8) |
