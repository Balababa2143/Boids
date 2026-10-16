[boids](../../../../../../../../index.md) / [FactionMachine](../../../../../index.md) / [MachinePrime](../../../index.md) / [Coordinator](../index.md) / ProviderDeclaration

# Interface: ProviderDeclaration

Defined in: src/FactionMachine/MachinePrime/Coordinator/Provider.ts:36

One item's declaration that it can move a dimension.

This is the shape an item writes onto its own `item.data` when the game applies it — the "which
items are providers" half of §6.7's first rule, through the same stamped-event pattern items already
use to reach the coordinator. `Membership.FindProviders` reads it back off the worn set.

`Power` is a bid and nothing else: it is only ever compared with another bid, so a family's number
means what that family decided it means. **Higher is harder**, because the dimension being moved is
how much *restriction* applies.

**An item declares its own appearance as well as its bids** (§6.12 clause 2, §6.1). It is not a
field of this record because it is not a bid: a look moves no dimension, and a declaration that
carried it would make it look like one.

## Properties

### Allowed?

> `readonly` `optional` **Allowed?**: readonly `PoseKey`[]

Defined in: src/FactionMachine/MachinePrime/Coordinator/Provider.ts:55

The body configurations this item can deliver, when it speaks to a posture dimension.

A second axis rather than a second power, because a posture dimension has no numeric
aggregate: its providers combine by **intersection**, so what a bid says here is what the
item can *draw* rather than how hard it insists (§6.7). An omission says nothing about body
configurations, which is a different statement from *"none are permitted"*.

***

### Dimension

> `readonly` **Dimension**: `string`

Defined in: src/FactionMachine/MachinePrime/Coordinator/Provider.ts:37

***

### LoserExpresses

> `readonly` **LoserExpresses**: `boolean`

Defined in: src/FactionMachine/MachinePrime/Coordinator/Provider.ts:63

What the item still contributes when it **loses** the bid.

`false` is the honest answer for an item whose only contribution was the constraint. `true` says
it changes its model, appearance or pose regardless — which is how §6.7's third rule reaches an
item that did not win.

***

### Power

> `readonly` **Power**: `number`

Defined in: src/FactionMachine/MachinePrime/Coordinator/Provider.ts:38

***

### Stack

> `readonly` **Stack**: `StackMode`

Defined in: src/FactionMachine/MachinePrime/Coordinator/Provider.ts:46

How this bid stacks with the others, when this bid is the one that wins.

The base game's own aggregates do not agree with one another — a `gag` is a sum, a blind
level a count and a maximum at once, a deaf level a weighted maximum plus a weighted sum —
so the combining rule cannot be a property of the dimension (§6.7).
