[boids](../../../../../../../../../../index.md) / [FactionMachine](../../../../../../../index.md) / [Futuristic](../../../../../index.md) / [Gag](../../../index.md) / [Common](../index.md) / Variant

# Interface: Variant

Defined in: src/FactionMachine/Futuristic/Gag/Common.ts:149

The four axes that describe one metal gag: what fills the mouth, what holds it
there, what covers it, and what extra hardware is bolted on.

Between them the axes decide the model's layers, the generated model name and the
item's gag strength, so two variants that differ in any one axis are two separate
models rather than one model with options.

## Properties

### Ball

> **Ball**: [`BallKind`](../enumerations/BallKind.md)

Defined in: src/FactionMachine/Futuristic/Gag/Common.ts:150

***

### Component

> **Component**: [`Component`](../enumerations/Component.md)

Defined in: src/FactionMachine/Futuristic/Gag/Common.ts:155

The flag set of `Component`; no flag is required.

***

### Muzzle

> **Muzzle**: [`MuzzleKind`](../enumerations/MuzzleKind.md)

Defined in: src/FactionMachine/Futuristic/Gag/Common.ts:153

***

### Strap

> **Strap**: [`StrapKind`](../type-aliases/StrapKind.md)

Defined in: src/FactionMachine/Futuristic/Gag/Common.ts:152

The strap or harness; the `None` branch carries no `Detail`.
