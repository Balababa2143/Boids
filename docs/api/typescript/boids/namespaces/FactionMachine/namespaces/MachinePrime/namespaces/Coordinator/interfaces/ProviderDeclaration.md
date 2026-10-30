[boids](../../../../../../../../index.md) / [FactionMachine](../../../../../index.md) / [MachinePrime](../../../index.md) / [Coordinator](../index.md) / ProviderDeclaration

# Interface: ProviderDeclaration

Defined in: src/FactionMachine/MachinePrime/Coordinator/Provider.ts:23

One item's declaration that it can move a dimension, written onto its own `item.data` when the
game applies it and read back by `Membership.FindProviders`. `Power` is only ever compared with
another bid, and higher means harder: the dimension being moved is how much restriction applies.
An item's appearance is not a field here — a look moves no dimension.

## Properties

### Allowed?

> `readonly` `optional` **Allowed?**: readonly `PoseKey`[]

Defined in: src/FactionMachine/MachinePrime/Coordinator/Provider.ts:34

The body configurations this item can deliver, when it speaks to a posture dimension. A
second axis rather than a second power: posture providers combine by intersection. An
omission says nothing about body configurations, which is a different statement from "none
are permitted".

***

### Dimension

> `readonly` **Dimension**: `string`

Defined in: src/FactionMachine/MachinePrime/Coordinator/Provider.ts:24

***

### Granted?

> `readonly` `optional` **Granted?**: readonly `never`[]

Defined in: src/FactionMachine/MachinePrime/Coordinator/Provider.ts:39

The abilities this item can re-grant, when it speaks to a `Whitelist` dimension. An omission
says nothing, which is a different statement from "none".

***

### LoserExpresses

> `readonly` **LoserExpresses**: `boolean`

Defined in: src/FactionMachine/MachinePrime/Coordinator/Provider.ts:44

What the item still contributes when it loses the bid: `true` says it changes its model,
appearance or pose regardless.

***

### Power

> `readonly` **Power**: `number`

Defined in: src/FactionMachine/MachinePrime/Coordinator/Provider.ts:25

***

### Stack

> `readonly` **Stack**: `StackMode`

Defined in: src/FactionMachine/MachinePrime/Coordinator/Provider.ts:27

How this bid stacks with the others, when this bid is the one that wins.
