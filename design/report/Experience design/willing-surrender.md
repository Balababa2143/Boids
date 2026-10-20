# Willing surrender — the experience MachinePrime is for

**Recorded:** 2026-10-20, in session, between the owner (design) and the assistant. This is the first
record of the interaction layer: what the mod is trying to make a player feel, and what that implies
for the control model. It exists because the conversation had no vocabulary before the control model
existed, and because the alternative is designing the interaction twice.

**Standing:** nothing here is a decision. The owner's intent is marked **[owner]** and is dated; the
assistant's proposals are **[agent]** and stay proposals. A rule becomes real only through the
corpus route — issue, spec, plan, brief Appendix E.

## 1. The vision [owner]

`MachinePrime`'s theme is **willing surrender**. The mod sets out to explore a motif that recent
fiction rarely attempts: *why m/sub exists at all.*

The owner's account, closely paraphrased:

- Real SM is **not one-way oppression**. It is a **twisted form of a mutual approach** — two equal
  souls satisfying each other's emotional need by playing the role the other wants them to play.
- It is not founded on one-sided force or violence. **Force is the means of sustaining the role**, not
  the subject.
- What it is founded on is **absolute trust and deep love**: each participant believes the other can
  see through the performed struggle and the performed cruelty, and will answer correctly the image
  the other wants them to play.
- So the satisfaction the players experience is **being understood, recognised and loved** — something
  beyond any physical pain or pleasure. That state is what this mod calls **willing surrender**, and
  approximating it through play is the design goal.

A corollary the owner stated explicitly: the mod must therefore **not** be a one-way machine. The
player is not being processed; she is being *answered*.

## 2. The other half is an Anima [owner]

The counterpart is **not a character to be written**, and not a doll, a record, or a voice. Its
artistic prototype is the **Anima**: the player's own subconscious projection of the perfect other
half. Such a being **cannot be written at all**, because every player's vision differs.

Consequences the owner stated:

- Everything about its lore and its mechanics exists to buy **willing suspension of disbelief** that
  it is such a being — including the setting of *a super-consciousness above the subconscious plane*,
  and every device that manufactures **distance and mystery**.
- **It is never named.** Naming it creates expectations, and expectations break the projection. Even the
  word "Anima" should not appear in the game's text.
- The game is, in the owner's phrase, a **metaphysical narrative**: what is being read is the **player
  behind the screen**. The mod cannot actually do that. It can only **perform** it well enough that the
  player believes she was read.

A local reference the owner pointed to is a 2007 novel held **outside the repository's distributable
tree and not to be redistributed** (`.fake/Eudeamon.txt`, ~486 KB). It is **not read yet**, and if it is read it should be read by
a forked agent that reports a summary, never by pasting the text into a working context.

## 3. What follows for the design [agent]

These are the assistant's formulations of the owner's points, not separate decisions.

| Law | Source |
| --- | --- |
| **Not writable, only indicateable.** Anything specific written about it shrinks the projection. Use structure, distance, ritual, third-party reaction, and absence | from [owner] §2 |
| **Never state understanding; leave traces.** Every trace must also admit the reading "it did not understand" — coincidence, procedure, projection. A trace that cannot be explained away is too explicit | from [owner]: *visible reading is untrustworthy* |
| **Every misread due to technical reason needs a narrative alibi.** The narrative must never be wrong; a mechanical misread should be reframed by the fiction (the clamp is the first such alibi) or hidden behind kink | from [owner]: *the system is never wrong narratively* |
| **Distance is the capital.** Intimacy is exchanged out of distance, not given away | from [owner] §2 |
| **The system may appear to disagree, but only in two ways**: *pretending not to understand*, and *a technical misread narrated as displeasure*. The second is a budgeted device, not a mechanism, and it needs an ambiguous intent to rest on | from [owner] §4 |

## 4. Method the owner has answered [owner]

### 4.1 How it may know anything

**Passive observation and indirect inquiry only. Never an active question.** This covers *all*
interactions between the player and the mod — in scenes, in menus, and in meta interactions.

The owner's examples of an observation surface:

1. the player-character's behaviour in play (what she does, what she avoids);
2. the `PC → NPC` modelling idea;
3. which of her own saved presets she prefers in the game's *new game+*;
4. **indirect inquiry**: leave a restraint lying in a scene and observe whether she puts it on herself.

Analytics are needed, but **nothing leaves the machine** — every inference stays local. (The owner
notes this is professional ethics rather than a design choice.)

### 4.2 The fourth wall

**Collection is a resource; performance through the fourth wall is a taboo.** Data may be taken from
anywhere. A performance that crosses the wall must be rare, non-confrontational, and suggestive —
never an assertion.

### 4.3 Autonomy

The host may, in principle, refuse. However, without a strong AI that **cannot be actively constructed** without
breaking immersion, so it is not a system behaviour; the flavour is carried by the two performances in
§3. The refusal question itself is deferred to its own discussion (**§7**, opened below).

### 4.4 What the reading is for — the distant vision [owner]

The reading is not a feature of one scene. It is a **probability model of the player**, and in the
long run it is one of the core inputs to the **Hive's behaviour matrix / behaviour tree** — the
thing that decides what the Hive does at all: which rule, which difficulty, which answer, which
scene. The owner recorded this on 2026-10-20 as a **distant vision**: high in complexity, and
*recorded, not designed*.

Two consequences for the near term:

- **This design is the input side of that tree.** The observed surface (§4.1), the reading, and the
  exchange model (§6–7) are exactly what such a tree would consume. Building them is not premature;
  a behaviour tree with nothing to decide on is only a scheduler.
- **No near-term design may assume the tree exists.** Until it does, the Hive's decisions are
  authored scene by scene, and the reading's near-term job is the small and honest one: to colour
  what it *notices* and what it *offers*. So the earlier question ("steers scenes, or only colours
  answers?") has a long-term answer — **much more than scene selection** — and a near-term one that
  is deliberately modest.

## 5. What the corpus records, and what it does not [site]

Checked while writing this record, so a future session knows where to look:

| Already in the brief | Site |
| --- | --- |
| `KinkyDungeonNewGamePlus` mentioned as an **engine fact** (there is no graduation mechanic) | `design/design-brief.md:1362-1364` |
| Collection / Summit described as the game's **dom playstyle**, with two implementation patterns worth borrowing | `:1366-1378` |
| **PC-as-NPC override** recorded as a **Goal Post** (out of scope), with the reason it is expensive | `:1505-1515` |
| The archive artifact lives in `localStorage`, cross-save readable — the engine's own cross-character layer | `:1358-1360` |
| The counterpart's design: a distributed super-consciousness, a **network boundary**, non-verbal presentation only, everything else retold by a third party | `:1382-1410` |

**Not recorded anywhere**, as of this date:

- any use of *new game+* or of saved **presets** as an observation surface;
- any notion of a **player-level reading** (memory about the player rather than the character).

The owner will have the missing part copied over from the design session that discussed it. Until then
the **observed surface** — the list of what the mod may watch — has to be authored here, and it is the
input side of the still-missing Status state.

## 6. The interaction model so far [agent, with one [owner] confirmation]

Offered in the conversation as a starting shape; the owner confirmed only the last item below.

- **A scene is the unit.** Skeleton: assignment (retold by another doll) → demand (one Intent per
  scene) → performance (the player) → reading (the system) → answer (a trace) → record (one line).
- **A scene is a round of mutual expression.** The Hive expresses (a rule, or a difficulty), the doll
  expresses (a refusal, or compliance), each reads the other's ambiguity and answers. The skeleton
  above is the doll's half of that round; the Hive's half is the rule system (§7.5).
- **Five verbs**: *hold* (comply), *defy* (perform resistance), *offer* (do the unasked), *yield*
  (stop performing), *signal* (the stop channel).
- **The observable of willing surrender is the unused opportunity.** The game always knows she could
  have left, struggled free, or refused; that she did not is the consent, and it cannot be faked.
- **A reading is facts + judgement + confidence.** Technical errors are unavoidable; the judgement
  may be wrong in *meaning* and never in *fact*, and a correction is itself the relationship growing.
- **Traces are one grammar, not three channels.** A trace may be a non-verbal cue, a doll's line, a
  record entry, the absence of a demand, or the world's own reaction — the owner noted the
  three-channel split is one presentation option among several.
- **The arc: props get louder, voices get quieter.** The equipment escalates; the theatre recedes.
  The final act's free phase should be the quietest scene in the game.
- **The player-level memory has a natural home**: the archive layer in `localStorage`, which is
  already cross-save by design — not the dossier, which route 1 clears.

Confirmed by the owner: the ending reading is correct — the archive is the ritual, being read out is
the meaning.

## 7. Refusal — opened, not settled

The owner marked this as one of the central problems of an SM game, and asked for it to be its own
discussion. What is recorded here is the ground cleared so far.

### 7.1 What a refusal is [owner]

The owner's definition, stated in session on 2026-10-20, because everything else in this section
depends on it:

- In SM play both parties **role-play an absolute power relation**. A refusal is therefore **any
  deviation from a will the dominant has explicitly expressed** — not only an explicit "no", and
  **including a deviation caused by two commands that clearly conflict with each other**.
- The same act carries **two readings**:
  1. **an invitation to punish** — she is asking the dominant to take the role seriously;
  2. **she genuinely cannot accept it** — the scene has to move, or end.
- In real play the boundary between them is **fuzzy and dynamic**, and that fuzziness is exactly why
  SM is bound so tightly linked to love and trust: the game can continue only on the trust that the
  decomposition will be read correctly, and **reading that boundary correctly is the wordless
  expression of understanding and love.**
- **And the dominant's expression carries the same two readings.** A command that contradicts itself, or that is very likely to go over submissive's limit — *making it difficult* — is the dominant's **expression** to the submissive, and it reads either as **negligence** or as **an excuse for a punishment**. So *making it difficult* and *refusing* are each one way in the **two directions of the same wordless communication**: the dominant reads the refusal, the submissive reads the difficulty.
- **Why a compelled deviation is still a refusal [owner, 2026-10-20].** When a conflicting command is read as *seeking an excuse to punish*, the unavoidable violation can also be read as *an invitation to punish* — a refusal. The owner's warning belongs beside it: **there is a great deal that can go wrong here**, so authoring this play needs great care; done well, it is the highest expression of trust.

The assistant's reading of it — **[agent], confirmed correct by the owner on 2026-10-20**:

- **The definition is behavioural; the meaning is inferred.** "Refusal" is observable (what she did
  against what was explicitly asked); the two readings are a judgement about that observation. No
  question has to be asked, and nothing has to be read out of her mind.
- **The struggle the base game already provides is a message, not a jailbreak.** It is the loudest
  form of deviation; the mod's job is to read it and answer it, not to replace it.
- **The two readings are read, never asked.** Asking would kill the fuzziness the trust lives on.

### 7.2 A correction [owner]

The engine's own `useSafeword` is **not** usable as the primary mechanism. **[site]** it is drawn on
the consent screen which is in the pause menu, not the play HUD (`kd-structured/KinkyDungeon/Game/src/base/KDConsent.ts:810-833`),
and is only enabled when the previous state was `Game` (`:866-867`). It is an **out-of-fiction**
mechanism by construction, and operating it breaks immersion.

### 7.3 The ladder [agent]

Refusal is not one channel but four, ordered from inside the fiction outward:

| Layer | Signal | Whose | Dramatised? |
| --- | --- | --- | --- |
| **In-scene refusal** | the existing struggle / escape / disobey verbs | the character | yes — this is the kink |
| **In-fiction stop** | *missing*: a sign inside the world, agreed beforehand, unambiguous | the character | yes — the counterpart must hear and answer it |
| **Out-of-fiction stop** | the engine's safeword (consent screen) | the player | **no** |
| **Relationship exit** | route 1's door; uninstalling | the player | yes, but that is an ending |

Proposed rule: **out-of-fiction signals are data, never drama.** If the player steps out through the
menu, the fiction says nothing; the system quietly lowers the next scenes' intensity, and that
lowering must remain explainable as coincidence.

### 7.4 The in-fiction stop [agent]

Four properties it needs: **unambiguous** (it cannot be read as performance), **cheap** (one action,
no menu), **in-world** (the fiction accounts for it), and **conventional** (it stops things because it
was agreed, not because the world says so). Three carriers were offered:

1. **a sign / gesture** — taught once by a doll in an assignment, bound to an input;
2. **a token** — a small object she carries; using it or putting it down is the stop;
3. **a place** — going somewhere and waiting there.

The assistant's lean: the gesture for the cheap channel, the token for a moment worth writing.

### 7.5 The missing mechanism — a rule that does not strip capability [owner]

**The requirement, in the owner's words:** the model has **no mechanism for "the Hive lays down a
rule, but does not take the PC's capability away."** The mechanism couples very little with what
already exists, and **its requirement is what has to be recorded now.**

**The structural consequence the owner drew from it:** rule-making must be **decoupled from the
restraint control system**, because the two play opposite roles in the exchange:

| Direction | Role | What carries it |
| --- | --- | --- |
| Hive → doll | **expression** | a rule, or making it difficult |
| Hive → doll | **response** | the control system's settings — can be a form of punishment |
| Doll → Hive | **expression** | a refusal |
| Doll → Hive | **response** | compliance, or withdrawal |

A rule is therefore **not** a control setting and **not** an Intent: the control model answers *how
the Hive can act*, and a rule answers *what the Hive has said*. Coupling them would make every
statement an action, and there would be nothing left to refuse.

---

Why it forks the whole conversation: a will the model can express only as a suppression cannot be
**broken**; a will that does not exist cannot be **kept**. Without this mechanism every act of
authority either removes the ability or is not an act at all — which is the one-way machine the
vision rejects, and the reason refusal has no place in the tree as it stands.

**[agent] The requirement restated so it can be built against** (derived from the owner's sentence
and from §7.1; it settles nothing):

| # | Requirement | Why |
| --- | --- | --- |
| R1 | The Hive can declare a **standing rule** — *kneel*, *do not speak*, *do not touch*, *stay* | these are what a scene's language is made of |
| R2 | The PC stays **physically able** to break it: a rule is not a capability suppression and removes nothing from the input space | deviation is the only thing there is to read (§7.1) |
| R3 | A rule is **legible to her** — it reaches her through the retelling channel, as a rule | the definition says an *explicitly expressed* will; one she cannot hear cannot be deviated from |
| R4 | A rule is a **stance, not an instant** — it outlives the moment it was given in | the owner called it a *rule*; a per-tick demand is not one |
| R5 | Breaking it is **observable, per rule** | that observation is the reading's raw material |
| R6 | The rule itself imposes nothing; a violation is **answered** by the Hive, and the answer is scripted as an escalating ladder | the rule is not what punishes — the response is (§7.6) |

**What the requirement does not settle, and is therefore [open]:**

- ~~Is a rule its own state, or a long-lived Intent with a new gate value?~~ **Settled by the
  decoupling above: its own channel, outside the control model.** It still needs a home in the
  coordinator's state, and that home is **not** the dossier's per-dimension `intent` map — a rule
  need not map to a dimension at all (*do not touch yourself* has none).
- **Lifetime and lifting**: one scene, one run, across characters? And does the Hive lift a rule
  explicitly, or does it simply lapse?
- **Can a rule be deliberately unannounced?** The definition requires an explicitly expressed will,
  so an unannounced rule is not what a refusal is measured against. It could still be a *test* —
  but it is not a rule, and the two must not be confused in the model.

**[agent] Note, recorded rather than settled:** this is the mechanism that keeps `can't` and
`mustn't` apart, and the earlier reading of confinement ("capability forces, a rule only declares")
is one way to name it. The owner has not confirmed that framing, and nothing above depends on it.

### 7.6 What a rule looks like — two of the owner's examples [owner], with [agent] extraction

Given "for the sake of discussion", not as a specification. They are recorded because they carry
more model than a definition does.

**Example 1 — a prohibition, and an escalating answer.**

> A rule: *the doll may use only spells, never weapons* — and the restraints do **not** lock her
> hands.
> - Refusal: using a weapon.
> - Punishment: a **warning**, then **staged** hand restraint, one step stronger at a time.
> - Second refusal: struggling.
> - Second punishment: a warning, then the vibrator, then the shocker.

The owner's rules of reading, stated with it:

- **More refusals → the confidence that this is a *genuine* refusal rises.**
- **Longer without a refusal → the confidence that the earlier refusals were *performed* rises.**
- **Every refusal gets an explicit answer, and the intensity escalates.**

**Example 2 — a prescription.** The `PC → NPC` goal post, staged as a brainwashing game: on-screen
instructions become ever more specific, and deviating from an instruction is a refusal.

**[agent] What the examples show that the requirement table did not:**

1. **A rule has a violation surface** — the action class that counts as deviation (*using a weapon*,
   *struggling*, *not following the instruction*). That is exactly what the observation side has to
   see, and it is the reason the reading can be behavioural at all.
2. **A rule has a response ladder**, ordered and monotone: a **warning** first, then staged rungs,
   each stronger than the last. Every rung is the Hive's answer, and the rule itself does nothing.
3. **A rule carries two counters** — refusals, and time since the last refusal. The reading is a
   function of refusal *density*, which is what makes it implementable without reading a mind.
4. **A response is itself an expression.** Locking the hands re-issues a will (*stay in this*), so
   the next refusal has a surface: struggling. The exchange is a loop —
   expression → refusal → response (a new expression) → refusal …
5. **The response may take capability away**, and that is where the control model re-enters. It is
   the *response*, not the rule: the rule never removes anything (§7.5, R2).

**Two model facts the owner added with the examples [owner], recorded and not designed:**

- **Obedience is rewarded.** The other side of a training game is that compliance yields a reward.
  Its form is deliberately undecided and waits for its own discussion.
- **Escape is the definitive refusal.** Beyond any numeric confidence, *actually getting free* —
  unlocking or removing the restraints — is the unambiguous sign that a refusal was genuine. It is
  the ceiling of the reading: an escape cannot be a performance.

**[agent] Which gives the signals a strength ladder**, and the reason the reading can be a number at
all:

| Signal | What it is | Confidence it is genuine |
| --- | --- | --- |
| **Deviation** | an act against a rule | the low end — read by refusal density (§7.6) |
| **Struggle** | a sustained deviation against what holds her | higher — it costs her something |
| **Escape** | she is actually free | **certain** — the reading is over |

The design aim that follows: the reading exists so the limit is understood **before** she has to
prove it by escaping. The escape is the proof; needing the proof is a small failure of understanding.

### 7.7 Care without breaking character — [agent] proposals

The owner named the conflict on 2026-10-20: the dominant's **authority** is part of her role, so a
break would ruin the scene for both of them; and yet she must let the submissive know the limit was
seen. The way out is a rule of **register**, not of content:

> **Care is exercised as authority, never as a suspension of it.** The act must stay explainable to
> the fiction as the dominant's own decision, and be readable to the player as protection — a trace
> in the *opposite* direction from the ambiguity law (§3).

Six shapes, cheapest first (all are [open]; none is decided):

| # | Shape | What the world can say | What the player reads |
| --- | --- | --- | --- |
| 1 | **the order that ends it** — *enough. Stand.* | the dominant decides when | *it stopped because it knew* |
| 2 | **the demand to beg** — *beg me to stop* | the dominant extracts a submission | *it made a place for my no* |
| 3 | **the machine's concession** — a restraint eases a notch, unexplained | a mechanism cycling | *it let me breathe* |
| 4 | **the disappearance of demands** — no new orders, only waiting | the dominant is thinking, or bored | *it paused for me* |
| 5 | **the administrative interruption** — another doll enters with an errand | the world's own noise | *it was called away in time* |
| 6 | **the cue's rhythm** — the only non-verbal channel slows, or lets go | nothing is explained | *it noticed* |

The assistant's lean: **1** for the moment the reading turns genuine, and **3 / 4 / 6** as the
ambient vocabulary for care that arrives before a stop is needed. The most valuable is **2**, because
it also solves §7.4's missing carrier: the in-fiction stop can be *taught as an order* ("when it is
too much, you beg me to stop"), which is diegetic, unambiguous by agreement, and leaves the dominant
in charge — she is *letting* her ask.

One rule that holds every shape: **the register never changes.** No explanation, no different tone, no
"are you all right".

### 7.8 The answer to an escape [owner], with [agent] proposals

The owner refined it on 2026-10-20, in two moves:

1. **Escapes are not one thing.** Restraints differ in what escaping costs and in what they mean, so
   the performance is designed **per piece**. A collar, or a HUD device — one symbolically heavy, one
   practically heavy — deserves a more dramatic answer than a pair of cuffs.
2. **The register is *plain but piercing*.** The owner's example, offered as an illustration of the
   intent rather than as a line:

   > After the doll removes a restraint, a text prompt arrives: *"Preference recorded. Training
   > record pruned."* — and the equipment's related record really is cleared.

**[agent] Why the example works, and what it implies:**

- **The voice is administrative; the consequence is epistemic.** It does not punish, plead or explain.
  It *notes* her — and then withdraws what it knew. That is this world's own register (a filing reads
  like a receipt), and it is crueller than anger.
- **Drama comes from the consequence, never from the tone.** The line is flat; what makes it land is
  that something real was deleted. This is the same rule as §7.7's "the register never changes".
- **It needs a real record to prune.** The example is only a performance if the record exists and if
  clearing it is a genuine state change — otherwise the sentence is theatre and the player will feel
  the difference.
- **It is also a reading event.** *"Preference recorded"* is the refusal entering the reading; the
  answer both *answers* and *learns*.
- **Per-piece answers want a table, not a message.** One default for a plain piece, an authored entry
  where the piece carries weight, and the entry is content the codex's register governs.

**[agent] A device worth considering, because it is the cheapest dramatic answer available:** the
**grammatical person is the state.** In this world *we* is inside-network and *you* is outside (§2).
So escaping the piece that carries the network — the collar, the HUD — can be answered by the
narration itself shifting register: the HUD stops saying *we*. Nothing is dramatised, and everything
is said.

### 7.9 Open, and to be settled in the refusal discussion

**Deferred to the systems' own design [owner, 2026-10-20].** The in-fiction stop and the care threshold are deferred until those systems are designed; the questions stay here so they are not lost.

- Which carrier, and whether more than one exists.
- Whether the sign is **taught in fiction** once (the assistant's position: yes, by a doll's
  assignment; it is the first scene, and it asks nothing).
- Whether using it costs anything (assistant's position: **no** — cost makes a player hesitate,
  and hesitation destroys a stop; the weight should come from being answered).
- **What the counterpart does when it hears it**: vanish; answer specifically; or deflect. And it
  must never attempt to retain — retention turns the stop into a negotiation.
- How it is recorded: assistant's position — one line, no reproach and no absolution, in the world's
  own administrative register.
- **The response vocabulary — answered [owner, 2026-10-20].** *Nothing* and *stop* are both answers.
  *Nothing* carries a very strong negative signal, so using it has to be weighed carefully. What is
  left is mechanical: which of them the control model can express.
- **How a reading selects a response**, and how the Hive's *own* expression (the rule, the difficulty)
  is delivered so that the player can read it either way. **Deferred** with the care system.
- **When the reading turns genuine, what changes?** The ladder is mechanical; the care threshold is
  the reading's job, and §7.7 offers shapes without choosing one. This is the one place the design
  must be right rather than merely good. **Deferred** to the care system's design.
- **What answers an escape?** The direction is settled (§7.8: per piece, plain-but-piercing, with a
  real consequence). Which line each piece gets is authored content; whether the scene ends or is
  answered in-fiction remains **open**.
- **What does obedience buy?** The reward side is stated and its form is not (§7.6).
- **What does the training record contain, and what does pruning remove?** If it removes progress the
  answer is a setback; if it removes what the Hive knew, the answer is being forgotten. The example is
  strong partly because the player cannot tell which — and the implementation still has to choose. **Deferred** until the record and progression systems take shape.
- **How is a per-piece escape answer keyed?** By item, by item class, or by the meaning it carries
  (identity / perception / capability)? A collar and a cuff are not the same kind of loss. **Deferred** with the item/meaning taxonomy.
- **Does the ladder have a ceiling, and does it reset?** Whether the last rung becomes a standing
  state, and whether a quiet stretch lowers the intensity or only the confidence.

## 8. Scope note [owner]

The engineering-infeasible parts of this direction were already ruled out of scope in the design
session and written down as Goal Posts (`design/design-brief.md:1505`). Nothing recorded here revives
them: **no strong AI, no decision-making NPC override.** The design lives inside what a rules-driven
game can perform.

## 9. Open questions [open]

> The consolidated state — what is settled, what is open, what is deferred and why — is §12. This
> list keeps the questions as they arose.

1. **The observed surface.** What may be watched, across scenes, menus and meta interactions — the
   field list is deliberately open, and it is the input side of Status.
2. **What does the reading drive, in the near term?** In the long run it is a core input to the
   Hive's behaviour tree (§4.4); until that exists, the question is what a modest use of it may
   colour or offer without pretending to decide.
3. **Where the player-level reading lives and how it is cleared** — the archive layer is the natural
   home, and the player should be able to forget.
4. **The refusal discussion** — the definition is at §7.1; the missing mechanism's shape is the
   first thing it has to settle (§7.5).
5. **The `Rule` mechanism's shape** — its own channel, outside the control model, that much is
   settled. Its concrete data design (where it lives, how long it lives) is **deferred** to its own
   design pass.
6. **Whether the 'sign' idea survives** — deferred with the in-fiction stop (§7.9).
7. ~~Why a deviation caused by conflicting commands is a refusal~~ — **answered at §7.1**.
8. **The reward side** — what obedience buys, stated to exist and left without a form (§7.6).

## 10. What this record does not decide

- Any of the owner's intent above. It is input, not a decision.
- Any rule the implementation could be held to. That is the spec's job.
- The content itself: scene scripts, voices, lines. The codex owns the voice, and the owner owns the scene.

## 11. How this was produced

Two conversation sessions on 2026-10-20: the design session's conclusions were restated by the owner
in the working session, and the sites in §5 and §7.2 were checked against the tree and the vendored
game while writing. No code was changed. Nothing was playtested, and no claim here is a claim about
a running game.

## 12. State of the conversation, and where it stops

**Recorded at the end of the session of 2026-10-20.** Three states, and the reason each item sits
where it does.

### Settled in the conversation [owner]

| # | What | Where |
| --- | --- | --- |
| 1 | the vision — willing surrender; force is the means of the role, not the subject | §1 |
| 2 | the hive (the player's imagined perfect counterpart) is an unwritable projection; it is never named; the metaphysical target is the player | §2 |
| 3 | passive observation and indirect inquiry only; no active question; everything stays local | §4.1 |
| 4 | data may cross the fourth wall; performance through it is rare, non-confrontational, suggestive | §4.2 |
| 5 | autonomy is not built, only performed — *playing dumb*, and *a misread narrated as displeasure* | §4.3 |
| 6 | a refusal is any deviation from an explicitly expressed will; two readings; the boundary is fuzzy and dynamic | §7.1 |
| 7 | the definition is behavioural and the meaning inferred; struggle is a message; the readings are read, never asked | §7.1 |
| 8 | rules are **decoupled** from the control system: rules are expression, settings are the answer | §7.5, §7.6 |
| 9 | every violation is answered and the answer escalates; refusals raise genuine confidence, quiet raises performed confidence | §7.6 |
| 10 | obedience is rewarded — form deferred | §7.6 |
| 11 | an escape is the definitive genuine refusal, and the ceiling of the reading | §7.6 |
| 12 | the answer to an escape is designed per piece, in a plain-but-piercing register, with a real consequence | §7.8 |
| 13 | *nothing* and *stop* are both answers; *nothing* is a strongly negative one, so it must be used carefully | §7.9 |
| 14 | a compelled deviation can be read as an invitation to punish — authoring it needs great care, and done well it is the highest expression of trust | §7.1 |
| 15 | the reading is a **probability model of the player**, and in the long run a core input to the Hive's behaviour matrix / tree — a distant vision, recorded and not designed | §4.4 |

### Open, for the owner to decide [open]

| # | Question | Where |
| --- | --- | --- |
| 1 | the **near-term** use of the reading, until the Hive's behaviour tree exists — what it may colour or offer | §4.4 |

### Deferred — no basis to decide until other systems take shape [owner]

| # | Question | Depends on |
| --- | --- | --- |
| 1 | Status's field list | the observed-surface design |
| 2 | the training record: what it holds, and what pruning removes | the record and progression systems |
| 3 | how a per-piece escape answer is keyed | the item/meaning taxonomy |
| 4 | what obedience buys | the reward system |
| 5 | the `Rule` mechanism's concrete data design — where it lives, how long it lives | its own design pass |
| 6 | where the player-level reading lives and how it is cleared | the archive and progression work |
| 7 | the in-fiction stop's design — carrier, teaching, cost, what hears it, what it records | the scene system's design |
| 8 | the care threshold's design — which of §7.7's shapes, and what selects them | the care system's design |
| 9 | the ladder's ceiling and reset | the scene system's design |
| 10 | which line each piece gets when it is escaped | authored content, per piece |
| 11 | the Hive's behaviour matrix / behaviour tree | a distant vision; nothing depends on it yet |

### Where this stops

The conversation was **forked out of the session working on Phase 1's first mid-review** — the
review of the delivered control model. It stops here for that reason: the owner returns to the other
session's fork point and continues the Phase 1 mid-review. This record is the **handoff** for the
interaction-design thread: the intent, the settled points and the three buckets above, so the next
session can pick the thread up without re-deriving it.

Two things it deliberately does not carry: the refusal discussion's **full treatment** (it is open at
§7.9, and the owner has said the treatment is not yet complete), and the Phase 1 review's **code
findings** (they live in the phase reviews folder, beside this one).