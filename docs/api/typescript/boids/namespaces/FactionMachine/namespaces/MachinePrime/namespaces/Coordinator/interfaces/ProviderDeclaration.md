[boids](../../../../../../../../index.md) / [FactionMachine](../../../../../index.md) / [MachinePrime](../../../index.md) / [Coordinator](../index.md) / ProviderDeclaration

# Interface: ProviderDeclaration

Defined in: src/FactionMachine/MachinePrime/Coordinator/Provider.ts:44

One item's declaration that it can move a dimension.

This is the shape an item writes onto its own `item.data` when the game applies it — the "which
items are providers" half of §6.7's first rule, through the same stamped-event pattern items already
use to reach the coordinator. `Membership.FindProviders` reads it back off the worn set.

`Power` is a bid and nothing else: it is only ever compared with another bid, so a family's number
means what that family decided it means. **Higher is harder**, because the dimension being moved is
how much *restriction* applies.

**An item's appearance is a mapping from the intent, not a field of this record** (§6.12 clause 2,
§6.1). It is not a bid: a look moves no dimension, and a declaration that carried it would make it
look like one. The families still render a declared `AppearanceKey`; moving that mapping onto the
intent is the injector's slice (2.1/3.1).

## Properties

### Allowed?

> `readonly` `optional` **Allowed?**: readonly `PoseKey`[]

Defined in: src/FactionMachine/MachinePrime/Coordinator/Provider.ts:63

The body configurations this item can deliver, when it speaks to a posture dimension.

A second axis rather than a second power, because a posture dimension has no numeric
aggregate: its providers combine by **intersection**, so what a bid says here is what the
item can *draw* rather than how hard it insists (§6.7). An omission says nothing about body
configurations, which is a different statement from *"none are permitted"*.

***

### Dimension

> `readonly` **Dimension**: `string`

Defined in: src/FactionMachine/MachinePrime/Coordinator/Provider.ts:45

***

### Granted?

> `readonly` `optional` **Granted?**: readonly `never`[]

Defined in: src/FactionMachine/MachinePrime/Coordinator/Provider.ts:71

The abilities this item can re-grant, when it speaks to a `Whitelist` dimension.

The grant half of capability, and the same channel distinction the facet makes: a posture
dimension promises poses through `Allowed`, a whitelist dimension promises abilities through
`Granted`. An omission says nothing, which is a different statement from *"none"*.

***

### LoserExpresses

> `readonly` **LoserExpresses**: `boolean`

Defined in: src/FactionMachine/MachinePrime/Coordinator/Provider.ts:79

What the item still contributes when it **loses** the bid.

`false` is the honest answer for an item whose only contribution was the constraint. `true` says
it changes its model, appearance or pose regardless — which is how §6.7's third rule reaches an
item that did not win.

***

### Power

> `readonly` **Power**: `number`

Defined in: src/FactionMachine/MachinePrime/Coordinator/Provider.ts:46

***

### Stack

> `readonly` **Stack**: `StackMode`

Defined in: src/FactionMachine/MachinePrime/Coordinator/Provider.ts:54

How this bid stacks with the others, when this bid is the one that wins.

The base game's own aggregates do not agree with one another — a `gag` is a sum, a blind
level a count and a maximum at once, a deaf level a weighted maximum plus a weighted sum —
so the combining rule cannot be a property of the dimension (§6.7).
