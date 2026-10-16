[boids](../../../../../../../../index.md) / [FactionMachine](../../../../../index.md) / [Futuristic](../../../index.md) / [Cuff](../index.md) / CuffKind

# Variable: CuffKind

> `const` **CuffKind**: `object`

Defined in: src/FactionMachine/Futuristic/Cuff/Common.ts:22

The eight collar and cuff items.

**A key is part of a persisted identity.** A restraint's and a model's registered name is
`uuidv5(JSON.stringify(key), baseId)`, so renaming a member of this union renames a saved item —
a migration rather than a cleanup, exactly as a variant-key *field* is.

An object rather than a bare type because the parts tables have to be **total over it and iterated**:
a `Record<CuffKind, …>` gives the totality at compile time, and `CuffKinds` gives the iteration to
whoever has to walk the family.

## Type Declaration

### AnkleCuff

> `readonly` **AnkleCuff**: `"AnkleCuff"` = `'AnkleCuff'`

### ArmCuff

> `readonly` **ArmCuff**: `"ArmCuff"` = `'ArmCuff'`

### ElbowCuff

> `readonly` **ElbowCuff**: `"ElbowCuff"` = `'ElbowCuff'`

### HeavyCollar

> `readonly` **HeavyCollar**: `"HeavyCollar"` = `'HeavyCollar'`

### LightCollar

> `readonly` **LightCollar**: `"LightCollar"` = `'LightCollar'`

### ThighCuff

> `readonly` **ThighCuff**: `"ThighCuff"` = `'ThighCuff'`

### WaistCuff

> `readonly` **WaistCuff**: `"WaistCuff"` = `'WaistCuff'`

### WristCuff

> `readonly` **WristCuff**: `"WristCuff"` = `'WristCuff'`
