# Boids — Codex

> **What this is.** The **content and fiction bible** for `Boids`. It is written for the
> people who will **write, draw and author** — not for the people who will implement. Where
> `design/spec.md` says how a mechanism works, this says what it *means*, how it *sounds*, and
> what it should *look like*.
>
> **Status:** companion to the frozen design, and **not frozen itself.** It is a working
> reference: content will be authored straight out of it, and it is expected to grow. It does
> not override `design/spec.md`; if the two disagree, the spec wins and this is out of date.
>
> **The rule of provenance.** Everything here traces to a decision recorded in
> `design/design-brief.md` or `design/spec.md`. Where this document does something they do not —
> it extrapolates a **voice**, a **visual**, or a **script beat** — the extrapolation is
> marked **[⇢]** and is a starting point, not canon. **Nothing invented here outranks a
> `[TBD]`.**

---

## 0. Orientation

| | |
| --- | --- |
| **The mod** | a content mod for **Kinky Dungeon**, a browser roguelike |
| **The subject** | **dronification**, and its sub-kinds |
| **The name** | `Boids` — after the flocking-simulation idea: many simple units, no leader, coherent behaviour |
| **The first faction** | **`MachinePrime`** — the dronification faction proper |
| **The kink order of priority** | **the kink first, then the gameplay.** Equipment is designed as a fetish object *and* as a mechanic; neither is allowed to be an afterthought |
| **The register** | quiet, precise, procedural. **Nothing is ever argued for.** |

### The one-sentence premise

> **Someone is being made into a machine, on purpose, with her own hands, and something
> enormous and patient is keeping the record.**

### Why the reversal matters

The base game's idiom is **involuntary**: something does this *to* you. `Boids`' is
**voluntary**: the player does it to herself, and the mechanic — not the prose — is what
makes that true. Every scene, every line and every visual should preserve the difference.
**[⇢]** A useful test for any text: *would this line still work if she were being forced?* If
yes, it is not yet a `Boids` line.

---

## 1. The setting

### 1.1 The world, as this mod uses it

`Boids` does not build a new world. It occupies **the body-horror / industrial-technical
corner of the base game's own setting** and pushes it toward machinery and procedure. The
things worth knowing:

| Element | In this mod |
| --- | --- |
| **the world map** | a procedurally generated dungeon crawl — the fiction gives it *floors*, *factions*, *jails*, *workshops*, *shrines* |
| **the factions** | the base game has several. `Boids` adds **one at a time**, and the first is `MachinePrime` |
| **the machines** | a `Boids` faction is *machinery*: it has dolls, devices, workshops, and a network |
| **the dungeon** | a place you are *sent into*. It is where the errands happen, not where the meaning happens |

**[⇢] The tonal key.** Everything in this mod should read as **maintained**. Not ruined, not
improvised — **serviced**. The horror, where there is any, is not decay; it is the
cleanliness of a thing that has been *handled correctly*.

### 1.2 The Host

> **The Host** — a **distributed super-consciousness that runs above the consciousness of all
> machinery and all dolls.** It has **no centre**, in the fiction. There is no core, no throne,
> no room it sits in.

This is the most important piece of setting in the mod, and the most restricted. Get it
wrong and every text key drifts.

| Property | Rule |
| --- | --- |
| **shape** | distributed, centreless, above rather than among — but *in* the network, not above the world |
| **name** | **there is no in-fiction name.** See §1.3 |
| **speech** | **none, ever.** See §1.4 |
| **relation to the player** | it does not want her. It **files** her |
| **its register** | administrative. Briefs are *assignments* |

#### The network boundary — the defining property

| Observer | Perceives the Host? | How |
| --- | --- | --- |
| **inside the network** — dolls, machinery | **yes** | **"spiritual sensing"** (圣灵感应) — the designer's term |
| **outside the network** — everyone else | **never directly** | only by **observing the behaviour of network members** and inferring that something is running them |

> **It is not a deity, and this distinction is load-bearing.**
>
> The spiritual sensing is **simply what perceiving a distributed structure feels like from
> inside it**. Writing the Host as a god is a *different design*: a god sits **above** the
> network instead of **in** it, and — the part that ruins it — **a god can be addressed.**
> The boundary exists precisely to forbid that.

**[⇢] What "spiritual sensing" should feel like to write.** Not awe, and not a voice. It is
**the sensation of being part of something that is thinking** — closer to proprioception than
to revelation. A doll does not *hear* the Host. She *notices that she already agrees.*

#### What it is not

| Not | Because |
| --- | --- |
| a god | it would be addressable (§1.2) |
| a queen, a boss, a mistress | those are *persons*, and a person can be faced |
| a machine with a core | there is no centre to reach |
| malevolent | nothing about it is cruel; **cruelty is a decision, and it does not decide** |
| benevolent either | it is not on her side. It is **on its own business** |

**[⇢] The cleanest way to think about it:** the Host is not a character. It is a
**bureaucracy with a nervous system**. It has procedures, records, keys and a filing system,
and it treats a doll with the exact, unhurried care that a good archive treats its holdings.

### 1.3 Naming the Host — the hardest rule in the mod

**There is no word for the Host**, and inventing one is the most likely way to break the
fiction. The reasoning, in order:

1. **Inside the network it is not referred to — it is spoken *as*.** There is no otherness
   between the Host and a doll: she is not pointing *at* it, she **is part of** it. So the
   honest grammatical form is the **first-person plural, "we"**, and *naming it would be a
   category error, not a stylistic choice.*
2. **The fewer direct references a text contains, the more distance it has.** Where a passive
   or third-party construction will do, it is not merely preferred — it is **required**.
3. **Therefore every name in the game belongs to an outsider looking in.** Only an outsider
   needs to name what it cannot see — and **it will name it badly**, because it cannot see it.

#### The only two slots, and both are optional

| Constant | Speaker | Why a name is unavoidable |
| --- | --- | --- |
| `HostName_FactionHostile` | hostiles | they are outside, so they must name what they inferred — and they cannot see it |
| `HostName_FactionTechnical` | factions that study or trade with it | same inference, analytic register |

> **[TBD] No word has been chosen for either, and none should be invented in a scene.** The
> constants exist so that the words can be settled **by editing one place each**. If the two
> registers duplicate in practice, **they collapse into one** and the design is no poorer.

#### The four slots that were designed *out*

These all turned out to be **inside-network contexts**, so they take **"we"** and need no
constant at all:

| Context | Was | Now |
| --- | --- | --- |
| the dolls, to each other | `HostName_Doll` | **"we"** |
| a doll addressing an outsider | `HostName_DollToOutsider` | **"we"** |
| the `Being Filed` ceremony | `HostName_Ritual` | **"we"** |
| HUD / status text | `HostName_UI` | **"we"** |

> *(Eight slots were drafted; the passive-voice rule cut them to six; the "we" decision cut
> them to two. **An earlier draft counted this as "four of the eight" and conflated the two
> cuts.** Two is correct.)*

#### What the surviving names must sound like

> **[⇢] The vocabulary's whole job is to sound like something coined by people who cannot see
> what they are naming.**

So the register is **descriptive and slightly wrong** — not devotional, not grandiose.
**[⇢]** Concretely: reach for a **nickname coined in a report**, not a title. A term a
quartermaster would write. Slightly clumsy, slightly presumptuous, and wrong in a way that
reveals the speaker's ignorance.

> **Localisation caveat.** "We" as a collective self-reference **is not the same word in every
> language** — the inclusive/exclusive first-person plural distinction exists in some, and the
> game ships translations. **Strings must make the collective reading explicit** rather than
> relying on English's ambiguity.

### 1.4 The Host never speaks

**[Decided] There is no speech at all.** The model is *Battlefleet Gothic: Armada II*'s
treatment of the Great Devourer: **characterised entirely through how third parties react to
it.**

| Channel | What may appear |
| --- | --- |
| **direct perception** | **non-verbal UI feedback only** — a reinforcement cue, never a message |
| **everything else** | **retold by a third party.** A quest briefing comes from *another doll* conveying "the Host's intent" — never from the Host to the character |
| **HUD / status text** | "we" — institutional voice, no speaker |

**[⇢] Practical consequences for a writer:**
- **There is no line the Host can say.** If a draft has one, the draft is wrong.
- Assignments arrive in the **passive**: *"you have been assigned"*, never *"⟨X⟩ assigns you."*
- A filed doll is simply *"filed"*; **the agent is implied**.
- **Treat every naming slot as guilty until proven useful.** A slot avoidable by a passive
  construction should be avoided.

### 1.5 The dolls

A doll is **inside the network** — a person who has been made into, or is being made into, a
unit. `Boids`' treatment of her:

| Aspect | Treatment |
| --- | --- |
| **her voice** | **"we"**, in anything she says about the collective — including to outsiders |
| **her perception** | she senses the Host (§1.2). Outsiders cannot see what she is part of |
| **her relation to the player** | she is **the one who briefs her.** Another doll delivers intent. Machinery does not talk to people; dolls do |
| **her affect** | **[⇢] not robotic.** A doll is not a person pretending to be a machine, and not a machine pretending to be a person. She is **a person who has stopped having a private opinion** — and is not unhappy about it |
| **what she never does** | she never **argues**, never **seduces**, and never **explains the Host**. She conveys |

**[⇢] The most useful note in this whole document, for character writing.** A doll should
read as **competent and unhurried**. The uncanny part is not that she is strange — it is that
she is **more calm than the situation warrants**, because she is not alone in her own head.

---

## 2. Factions and themes

### 2.1 The shape of a faction

| Layer | What it is | Shared? |
| --- | --- | --- |
| **Outfit layer** | the art and the restraint definitions | **shared across sub-factions** |
| **Mechanism layer** | the abstract controller — what is constrained and how it reaches the game | **shared across sub-factions** |
| **Sub-faction layer** | **story, flavour, progression, which privileges are granted and what they cost** | **per sub-faction** |

- A **main faction** explores **one sub-theme of dronification** and owns a set of mechanics
  that fit it.
- A **sub-faction** explores **a different kind of play and a different relationship
  pattern**.
- **[Decided]** Sub-factions need no in-setting administrative relation to each other. They share
  the outfit and the mechanism; **they do not need to know about one another.**
- **[⇢] The consequence, and the reason the architecture is this way:** a new sub-faction is
  **story plus configuration, not a new art pass.** That is what makes horizontal expansion
  cheap, and it is also a **writing brief**: when the art is shared, the difference between
  two sub-factions is carried almost entirely by **voice, ceremony and what is asked of the
  player.**

### 2.2 `MachinePrime` — the first faction

The dronification faction proper. Its theme is **voluntary assembly into machinery**: a
person is disassembled as an individual and reassembled as a unit — by hand, with ceremony,
with the record kept.

**[⇢] Its aesthetic and its subjects, drawn from what has actually been built:** the
**hard-light restraint set** (§3), **the visor and its HUD** (information fed directly into
her, over her sight), **the links** (limbs bound to each other and to a collar by energy
rather than chain), **the posture states** (the set reads her binding and reconfigures), and
**the record** (the Host's file on her).

**The three things `MachinePrime` does, in fiction:**

| In game terms | In fiction |
| --- | --- |
| **equipment-granted capability** | she gives up an ability she was born with, and buys back a version of it that **only works while the machine is on her** |
| **control and the proof of submission** | the restraint is **earned**. She proves she wants it, and then she wears it |
| **the abstract controller** | **something is deciding what she is allowed to do** — and she is inside it, so she cannot see it |
| **the equipment adapts, she does not** | a `MachinePrime` restraint **measures what she has grown used to and cancels it out**, so training, tolerance and accommodation buy her nothing while it is on |

**[⇢] The fourth row has a mechanical consequence, so it is stated twice.** The base game
rewards a wearer who adapts: `SmoothTalker` and `Incantation` soften a gag, `SomaticPlus` and
`SomaticMinus` soften bound hands, `ClassicHeels` and `HeelWalker` soften heels, and `PoorForm`
and `PoorBalance` are their mirror. **A `MachinePrime` piece is smart enough to compensate for
all of it**, which is why the control model declares that a dimension it drives is **not**
rescaled by the wearer's adaptation (`spec` §5). The fiction comes first and the rule second: the
machine is not punishing her for being unaccustomed, it is **holding a setting** — and a setting
does not drift because the thing it is set on got used to it.

### 2.3 Sub-factions — the recorded targets

**[Goal Post]** These are on record as eventual targets. **They are not in scope for the
current delivery**, and the mechanism layer ships first.

| Sub-faction | The play it explores | Notes |
| --- | --- | --- |
| **the battery** | forced play; **humanoid-as-power-cell** | the base game's natural home is the prison-type machinery — a *stay-and-be-processed* space rather than a target to fight. **The cheapest of the three** |
| **the sadist-doll** | dolls that **reprogram restraints to capture others** | closest to the base game's existing hostile factions, and therefore mechanically cheap — but it is the most confrontational in tone |
| **the charm / hypnosis / marionette** | being **moved** rather than being bound; suggestion, trance, being played | the original author has already built part of this: a doll shop, doll storage, dollmaker content, a `Doll` start perk, a mirror curse, and a `Hypno_Doll` stat |

**[⇢] What separates them in writing, given the shared art.** The battery is
**infrastructure**, the sadist-doll is **predation**, the marionette is **performance**. Three
different answers to "what is a doll *for*."

### 2.4 Loose ideas

**[Goal Post]** Mentioned but never written down. **Not lost — just not yet recorded.**
Anyone picking one up should treat it as un-designed.

---

## 3. Visual language

### 3.1 What the set actually is

The built art is the **`Futuristic`** set, and it is a **hard-light restraint rig**. Its parts,
read out of the shipped assets:

| Family | Assets | What it reads as |
| --- | --- | --- |
| **Visor** | `Visor/GogglesLight1-4`, `GogglesDark1-4`, `MaskLight1-4`, `MaskDark1-4` | **sixteen variants in four bands.** Light and dark tones, four steps each, as a visor and as a mask. **This is the face of the set** |
| **Links** | `Link/BetweenElbowCuff`, `BetweenWristCuff`, `BetweenAnkleCuff`, `BetweenThighCuff`, `WristToCollar` | **limbs bound to each other, and to the collar** — by **glowing** link and glow pairs |
| **Cuffs** | `Cuff/WaistCuffPort/PortBase`, `PortGlow` | the **port**: the socket a link attaches to. **Drawn, in the atlas, and no code references them yet** |
| **Earphone** | `EarplugElfLongBack/Front`, `EarplugElfStandard`, `EarplugHuman` | ear plugs, **shaped for elf and human ears** — the audio channel |
| **Posture states** | `LinkFree`, `LinkYoked`, `LinkUp`, `LinkSpread`, and their glow twins | **the art reconfigures to the binding.** Four postures, plus front-facing wrist variants (`LeftLinkFront`, `RightLinkFront`, `TieLinkFront`) |

### 3.2 The visual laws

**[⇢]** These are extrapolations from what exists. Treat them as the default, and depart
deliberately.

1. **Energy, not cordage.** The links are **glow and hard light**, not rope, not chain, not
   leather. **Nothing about this set is improvised or organic.**
2. **The silhouette is precise, not bulky.** The set *fits*. It is engineered, so it has
   **no slack, no knots, no loose ends.**
3. **Glow is the live channel.** Where something glows, it is **working** — a link carrying,
   a port active. **Dark means dark, not decorative.**
4. **The face is the focus.** The visor and mask carry **sixteen of the forty-six shipped
   frames**, more than any other family. **The set is about what she can see and what is fed
   into her.**
5. **The set responds to her.** Posture states are not variants for variety's sake — the rig
   **knows how she is bound** and shows it. **[⇢]** This is a strong visual law to keep: *the
   equipment is aware of her state.*

### 3.3 The progression, visually

The equipment ladder (§4.2) has a visual arc, and it should be **legible without text**:

| Stage | What the player sees |
| --- | --- |
| **loose and unlocked** | the set is present but **open** — no lock icon, the links slack or absent |
| **a lock is fitted** | the **lock icon** appears. Tier is readable at a glance |
| **reinforcing parts** | the silhouette **grows**. This is where the projection layer earns its keep |
| **the lock made permanent** | the icon becomes a **curse** icon — a different shape, not a recoloured lock |
| **projection** | **[Decided]** past a threshold the equipment begins to project **additional, non-interactive parts** — **retroactively**, on an item already worn. The player **notices something has always been there** |

> **[⇢] The projection idea worth writing toward, from the brief.** The strongest version is
> not a thing that *appears*. It is **a thing the player notices has always been there** — and
> paired with **a line where someone says it was always part of the item**, while her own
> equipment contradicts the explanation. **The "voluntary" fantasy is doing the work.**

### 3.4 UI as fiction

The game's own UI is an in-fiction channel, and the mod should **use it as one** rather than
adding text:

| Signal | Reads as |
| --- | --- |
| **a lock icon** | *someone has decided something about this* |
| **a curse icon** | *that decision was not yours* |
| **a different curse icon** | *a different decision, by a different hand* |
| **the Host's direct perception** | **non-verbal cue only** — reinforcement, never a sentence |
| **suggestion buttons** (the base game's hypnosis idiom) | **[⇢]** *an option you did not think of, offered politely* |

### 3.5 What this set is not

**[⇢]** Deliberately not-rejected, but not the current direction: leather, rope, silk, fur,
feathers, metal chains. Those belong to the base game and to other factions. **`MachinePrime`'
s identity is that the restraint is a *device*, and devices are clean.**

---

## 4. Scripted content

### 4.1 The procedural backbone

Before any scene, the shape it hangs on:

| Beat | In game terms | In fiction |
| --- | --- | --- |
| **you prove you want it** | the base game's training ledger — *tolerance built by practice*, with refusal as a designed outcome | she is **credited for wanting it.** The record is the point |
| **you earn the restraint** | the equipment-upgrade quest framework | the lock is **not given**. She **crafts** it, **fits** it, and **reinforces** it |
| **the errands** | a **table of interchangeable mini quests** per upgrade class, assigned by **matching equipment tags** and randomised | repetitive by design — and the brief's warning is explicit: **do not let the quest line become tedious** |
| **the tedium budget** | — | **[Decided] spend it on *ceremony*, not on *errands*.** Stages stay **short and legible** |
| **the filing** | the final quest family | the ending (§4.5) |

> **[Decided] The design goal, in the designer's own words: the player hands her own character
> over, by hand, with ceremony.** Every authored stage should be a **deliberate act**, not a
> step in a chain.

### 4.2 The ladder — three stages, then a fourth and fifth

**[Decided]** Equipment is **acquired loose and unlocked**, and ends **high-restraint and
permanently sealed**.

1. **Craft a lock and fit it.**
2. **Craft reinforcing parts and upgrade them.**
3. **Make the lock permanent.**

Each stage is a quest line requiring **resources, travel, and a specific place**.

> **[⇢] And the ladder generalises past the three, because a restraint can carry several
> locks' worth of meaning over its life:**
>
> 4. **a degradation or crisis stage** — something **fails** and must be re-sealed, at a cost.
> 5. **an integration stage** — the item **stops being equipment and becomes part of the
>    character.** This is where the ability ritual and the filing attach.

**[⇢] The emotional shape of the ladder.** Not "getting deeper into bondage" — **the slow
conversion of an object into a body part.** Stage 5 is the one that should land: the moment
it is no longer *hers*, in the sense that she can put it down.

### 4.3 The final act — the room

**The whole sequence, from the leash to the seal.** This is the best-developed script in the
mod, and it is worth understanding *why* before changing a beat.

**Entry:** a **leash staging** — she is **escorted**, not teleported, so the moment is
**witnessed**. **The room has no entrance on the world map.** She cannot walk back to it.

**Then:**

| # | Beat | Plays as |
| --- | --- | --- |
| 1 | **The leash ends at the marked position, and control returns to the player** | the moment she is handed back her own hands, in the room |
| 2 | **She lifts the curse on each piece, one at a time** | **frictionless. A button. No test, no cost, no roll** |
| 3 | **The struggle** — with the curses gone, the equipment itself must come off | **the hardest passage in the mod.** She is pinned under her own strongest set and must break free |
| 4 | **The free phase** | **anything may be done, in any order.** Put things on, take them off, fit decorative locks, remove them. **Both routes are open, and "I have changed my mind" is allowed** |
| 5 | **The fork** | the only two irreversible acts in the mod |

> **[Decided] Why the curse-lift must be frictionless.** *"Lift the curse, then fit a decorative
> lock"* has to be **a pure ritual action** with nothing in its way. **A curse that had to be
> broken would put a fight in front of a ceremony** — and worse, it would make the ceremony's
> **re-enactment a second trial**, so the player would be fighting the ritual instead of
> performing it.

> **[Decided] And the whole act has no captor in it.** From the leash to the seal, **nothing acts
> on her that is not her own equipment.** The equipment is hers, the decorative locks are
> hers, and **she is the one who applies them.** The author supplies the room and the chair.
> **The only way to stay is to do it by hand.** There is no machine to fight — which is what
> *voluntary* has to mean if it is to mean anything.

### 4.4 The two endings

Both are entered from the free phase. **Neither is a failure state.**

#### Route 1 — leave

| | |
| --- | --- |
| **how** | **no controlled equipment on her body and none carried**, then **interact with the door** |
| **the beat** | she **takes everything off, puts it in the box, and walks out** |
| **what it costs** | **the Host deletes her dossier**, and the controlled items are **destroyed** |
| **where she goes** | back to the world map, **at the stairs** — where she came in |

> **[Decided] What she does *not* lose.** Her body, her knowledge, and **her abilities** — the
> surrender was a seal, not a deletion, and the seal was on the equipment. **What she loses
> is that the Host ever acknowledged her.** And **she may do it all again**, with a different
> set of equipment: the second attempt starts from nothing, and the Host's memory of *what it
> knows* is what makes the retread shorter.

**The thing to write:** leaving is **not relief and not defeat.** She has been **taken apart
and put back together by hand**, and then she **declined to stay**. **The declined ceremony is
the ending.**

#### Route 2 — descend

| | |
| --- | --- |
| **how** | **every controlled item wears a decorative lock**, then **interact with the chair** |
| **the beat** | she **puts everything back on, locks it one piece at a time, and sits down** |
| **the commit** | in **one instant**, every decorative lock and the chair's own restraint become a **permanent curse** |
| **the outcome** | **archived.** She is effectively dead |

> **[Decided] And the decorative locks are *hers to apply*, one at a time.** Their only purpose
> is to make *"one at a time"* something the player **performs** — **attaching them one by
> one, and then watching them all become real at once.**

**The thing to write:** the last locking is **the same motion as every earlier one.** She has
done it to herself before. **This is the one that counts, and she is still the one doing it.**

### 4.5 The archive — "the dead save"

**[Decided] This is the mod's most unusual piece of writing, and it is an artistic decision
rather than a technical one.**

When a character is filed, **the game keeps running and she has nothing meaningful left to
do.** Waiting and futile struggling. If the player saves, and comes back a year later, she is
**in the same chair.**

> **[Decided] The reading that ships: her time does not stop, and does not rewind. The player
> merely stops observing her. Her state has been made constant — however long passes before
> the next observation, she is unchanged.**

**[⇢] How to write toward it.**
- **Not death.** Death is an event. This is **a condition**.
- **Not a pause.** Nothing is suspended; it simply **no longer changes.**
- **Not cruelty.** Nobody is keeping her there as punishment. She is **held**, correctly,
  because she was **filed** correctly.
- **The image to protect: the archive is warm, quiet, and *maintained*.** The horror, if the
  player feels any, comes from **how little there is to object to.**

### 4.6 Playable beats — the reusable scene shapes

**[⇢]** Extrapolated from the above. These are the shapes content should be authored *into*.

| Beat | Shape | Where it repeats |
| --- | --- | --- |
| **the fitting** | the player **performs a stage of the ladder by hand.** Crafting, fitting, locking | every ladder stage, every attempt |
| **the briefing** | **another doll** conveys intent. Never the Host, never a text box from nowhere | before any errand |
| **the offer** | **a suggestion she did not think of**, offered politely and non-verbally — accepting costs control | anywhere the machine is being helpful |
| **the titration** | the equipment **does something she did not ask for**, and it is **not explained** | escalating with the ladder |
| **the retroactive notice** | text and visuals **refuse to frame a change as new** | projection thresholds |
| **the refusal** | she says no, and **nothing punishes her for it** — the record simply reflects it | any point in the training ledger |
| **the escort** | she is **moved through a space while watched** | the final act's entry; reusable for any transfer |
| **the last lock** | **the same motion, one more time, and this one counts** | the finale, and any "one more stage" beat before it |

---

## 5. Writing guide

### 5.1 Voice rules — the ones that can be checked

| Rule | Do | Don't |
| --- | --- | --- |
| **The Host never speaks** | *"you have been assigned"* | *"the Host assigns you"* |
| **Prefer the passive** | *"it has been filed"* | *"we filed it"* — unless the speaker is **inside** |
| **Never name the Host** | *"they call it something, badly"* | inventing a word for it |
| **"We" is inside-network only** | a doll says *"we"* | an outsider says *"we"* |
| **Assignments, not invitations** | *"report to the workshop"* | *"would you like to…"* |
| **No argument, no seduction** | things are **stated** | things are **sold** |
| **Never explain the Host** | a doll **conveys** | a doll **explains** |
| **The agent is implied** | *"filed"* | *"the machine filed her"* |

> **The single most likely mistake:** writing the Host a line. **There is no line it can
> say.** Everything it wants arrives **retold by a doll**, and the doll's own certainty is the
> characterisation.

### 5.2 Register

- **Quiet, precise, procedural.** The vocabulary of **maintenance**, **records**, **keys**,
  **inventory**, **specification**.
- **[⇢] The tension to aim for:** the language is **domestic and administrative** while the
  events are **extreme**. A filing ceremony should read like a **receipt**.
- **No exclamation, no pleading, no threats.** None of it is needed and all of it breaks the
  spell.
- **[⇢] Humour, if any, is dry and structural** — it comes from **someone being wrong about
  what is happening to them**, never from mockery.

### 5.3 Tone calibration — the three registers

| Register | Who | Sounds like |
| --- | --- | --- |
| **inside** | dolls, HUD, the ceremony | **"we."** Certain, unhurried, no hedging |
| **outside, hostile** | factions that fear it | a **nickname, coined badly**, and the speaker's ignorance is audible |
| **outside, technical** | factions that study or trade | the same ignorance, in an **analytic** register |

**[⇢] A cheap and reliable test:** read the line aloud. If it would survive being said by a
**priest**, it is inside. If it would survive being said by a **quartermaster who has never
seen the thing**, it is outside. **If it needs a name, it is outside — and the name should be
slightly wrong.**

### 5.4 The kink-and-gameplay balance, as a writing rule

**[Decided] The kink is the priority, and the gameplay must not be an afterthought either.**
Written as an instruction for content:

> **Every piece of equipment must be worth looking at, and worth wearing mechanically.** If a
> piece is only one of those, it is not finished.

**[⇢] And the corollary that protects the player's experience:** *if obedience only ever
costs, players route around the content and it is never seen.* So **obedience must buy
something visible and specific**, and **disobedience should be flavour and narrative, not a
numbers tax.**

---

### 5.5 Where a new line goes

**[⇢] A string is data, and its home says who reads it.** If the engine resolves the key — an item
name, a tooltip line, a perk's name — it is composed from an identity the mod already holds and
registered beside the thing it describes. If the mod resolves it, it is addressed by a dotted path
and lives in the `Data/` folder at the **closest common root of the entities that use it**: a line
one module renders stays in that module, and a line a family's variants share is authored once, in
that family's tree.

That distinction is also the translation unit. Anything with a path can be overridden without
touching code; anything without one is a line a translator cannot reach yet, and
`docs/api/text-reference.md` lists which is which.

**[⇢] Keep a line whole.** A text entry is one line, and a paragraph in a dialog is a separate entry
rather than a break inside one, because a browser collapses a break where the engine's own tooltip
does not. Where a line is shared and only a word differs, put the shared sentence at the general
path and the difference in the variant, rather than writing the sentence out twice.

---

## 6. Terminology — the in-fiction glossary

**Canonical spelling and usage.** `spec`'s glossary defines these *mechanically*; this says
how to **use** them.

| Term | Use | Never |
| --- | --- | --- |
| **the Host** | capitalised; the centreless super-consciousness | *the Master*, *the Hive*, *the Overmind* — **[TBD]** no word exists, so none may be used |
| **a doll** | a person inside the network | *drone* in prose — **[⇢]** *drone* is the **mod's** frame, not the fiction's. In-fiction it is **doll** |
| **our / we** | inside-network, collective | as a substitute for the Host's name in **outside** dialogue |
| **filed** | the terminal state. *"She is filed."* Passive, agentless | *converted*, *ascended*, *graduated* |
| **the archive** | where filed characters persist | *the collection* — that is the base game's dom-playstyle system, not this |
| **the room** | the final act's space. Nameless by design | giving it a proper name — **[⇢]** it is a place on no map, and naming it makes it findable |
| **the chair** / **the furniture** | the thing she is sealed into | *the throne* — too grand, and grandeur is the wrong register |
| **the dossier** | the Host's file on her | — |
| **controlled equipment** | equipment that belongs to the Host's inventory of her | — |
| **a decorative lock** | a lock that means nothing **yet** | *fake lock* — it is not fake, it is **not yet real** |
| **the lift** | clearing the equipment's permanent curse, in the room | *unlocking*, *breaking* — it is neither |
| **the struggle** | taking the equipment off, against the machine's resistance | *escaping* — **[Decided]** it is not an escape. It is a **removal**, and she is meant to be able to fail it |
| **ceremony** | the authored beats of the ladder and the finale | *cutscene* |
| **errand** | a repeatable mini quest | *grind* — in prose, at least |

> **[⇢] On "drone" vs "doll".** The mod is *about* dronification, but the **fiction's** word is
> **doll** — a doll is kept, dressed and posed, and the machinery is the **kit**. **Drone** is
> the **outside** word, and if a hostile faction uses it, that is characterisation: **they see
> a drone; the network sees a doll.**

---

## 7. Canon status — what is settled and what is not

**Read this before authoring anything.**

### Settled — write freely

- the Host's nature, boundary, silence, and the "we" rule
- that there is **no name** for the Host, and the two outside slots are **empty**
- the ladder's three stages and its two endings
- the final act's beats, including the frictionless lift and the struggle
- the two commits being **the only irreversible acts**
- the archive's "constant state" reading
- the kink-first priority, and obedience paying out
- the "no captor in the final act" property

### **[TBD] Open — do not settle it in a scene**

| Open | Note |
| --- | --- |
| **the appellation words** | two constants, **no word chosen**. Editing one place each settles it |
| **which dimensions ship first** | a content decision, not a writing one |
| **art for control degree** | and the aggregate's presentation |
| **the currency** for mediated abilities | belongs to the resource-system project |
| **what a filed character leaves behind** | deliberately undecided, along with the currency |
| **the peak's difficulty** | calibration, by playtest |

### **[Goal Post]** Recorded, deliberately not now

- the three sub-factions (§2.3)
- the resource-system expansion and the pleasure split — **its own project, comparable in
  size to the control system**
- behaviour-tree / neural-net template recording
- PC-as-NPC override
- consolidating the morphing routes
- **loose ideas** mentioned in discussion and **not written down**

### Held to a higher bar

- **Do not add a fourth morphing route.** The only hard rule in an otherwise open area.
- **Do not invent a name for the Host**, and do not use a name in place of "we" inside the
  network.
- **Do not write the Host a line.**
- **Do not give the room a proper name.**

---

## 8. Authoring notes — the practical list

**[⇢] A checklist for anyone writing or drawing a piece of content:**

1. **Whose side is this text on?** Inside (we) or outside (a wrong name)? There is no third.
2. **Is the kink doing work, and is the mechanic doing work?** If only one, it is unfinished.
3. **Would this line survive if she were being forced?** If yes, rewrite — it is the base
   game's idiom, not this one.
4. **Is anything being argued for?** Cut it. Assignments do not persuade.
5. **Is the equipment aware of her state?** The set responds; the visuals should too.
6. **Is the register clinical while the event is extreme?** That gap is the mod's voice.
7. **If this is a ladder stage: is it a deliberate act, or an errand?** Ceremony, not tedium.
8. **If this is the finale: is there a captor in the scene?** There must not be. **Only her
   own hands.**
9. **If she can fail here, does failing lead somewhere?** Failure must resolve into a fork,
   never into a stall.
10. **Is leaving still possible?** Until the two commits, **it must be** — and if a text
    quietly forecloses it, the text has broken the mod's subject.

---

## Appendix — Where anything here came from

| Topic | Source of record |
| --- | --- |
| the Host, its boundary, its silence, the "we" rule, the name slots | `design/spec.md` §9; `design/design-brief.md` §6.3 |
| the vision, the faction layers, the kink-first priority | `design/design-brief.md` §1 |
| the ladder's stages and the design goal | `design/spec.md` §8.2; `design/design-brief.md` §D.4 |
| the final act's sequence, the two routes, reversibility | `design/spec.md` §6.10, §8.4; `design/design-brief.md` §6.0, §6.2 |
| the archive and the "constant state" reading | `design/spec.md` §8.4–8.5; `design/design-brief.md` §6.2 |
| the projection idea, and the "always been there" framing | `design/design-brief.md` §D.5 |
| the quest framework and the tedium warning | `design/spec.md` §8.3; `design/design-brief.md` §6.4, §D.4 |
| the sub-factions | `design/design-brief.md` §7; `design/spec.md` §10 |
| the kink/gameplay balance and the submission economy | `design/design-brief.md` §4, §8.3 |
| the built art this document describes | `Asset/TextureAtlas/BoidsAsset0.json`, `BoidsAsset1.json` |

> **If a decision changes**, it changes in `design/spec.md` first (see its header for the
> route), and this document is corrected to match. **This one is not frozen** — it is meant to
> be lived in.
